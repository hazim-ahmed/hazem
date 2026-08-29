import 'dart:async';
import '../core/network/api_client.dart';
import '../core/network/api_exception.dart';
import '../core/storage/cache_service.dart';
import '../core/storage/offline_queue_service.dart';
import '../core/utils/response_helpers.dart';
import '../models/transaction_model.dart';

class OfflineSavedException implements Exception {
  final String message;
  OfflineSavedException(this.message);
}

class ExpenseService {
  final ApiClient api;

  ExpenseService(this.api);

  /// Auto-syncs any pending offline expenses first, then fetches today's journal & transactions
  Future<Map<String, dynamic>> fetchTodayData() async {
    // Attempt automatic background sync of offline items first
    await syncPendingOfflineExpenses();

    Map<String, dynamic> journal = {};
    List<dynamic> txListRaw = [];

    try {
      final overviewRes = await api.get('/today');
      journal = asMap(responseData(overviewRes));
    } catch (_) {}

    try {
      final txRes = await api.get('/today/transactions');
      txListRaw = asList(responseData(txRes));
    } catch (_) {}

    // Fallback: If cache exists when network is completely offline
    if (txListRaw.isEmpty) {
      final cached = await CacheService.getCachedData('today_data');
      if (cached != null && cached is Map) {
        journal = asMap(cached['journal']);
        txListRaw = asList(cached['transactions']);
      }
    }

    final List<ExpenseTransactionModel> transactions =
        txListRaw.map((e) => ExpenseTransactionModel.fromJson(e)).toList();

    // Insert any pending offline expenses at the top for immediate local display
    final pendingOffline = await OfflineQueueService.getPendingExpenses();
    for (final item in pendingOffline) {
      transactions.insert(0, ExpenseTransactionModel.fromOfflineJson(item));
    }

    if (txListRaw.isNotEmpty) {
      await CacheService.saveCachedData('today_data', {
        'journal': journal,
        'transactions': txListRaw,
      });
    }

    return {
      'journal': journal,
      'transactions': transactions,
    };
  }

  /// Creates expense online, or queues locally if offline/network fails
  Future<bool> createExpense({
    required double amount,
    required String description,
    int? beneficiaryId,
    int? categoryId,
    int? projectId,
    int? projectUnitId,
    int? paymentMethodId,
    String? paymentReference,
    String? manualVoucherNumber,
    required String invoiceStatus,
    String? invoiceNumber,
    double? invoiceAmount,
    String? notes,
    String? idempotencyKey,
  }) async {
    final String key = idempotencyKey ??
        'OFFLINE-${DateTime.now().millisecondsSinceEpoch}-${amount.toStringAsFixed(0)}';

    final payload = {
      'idempotencyKey': key,
      'amount': amount,
      'description': description.trim(),
      'beneficiaryId': beneficiaryId,
      'categoryId': categoryId,
      'projectId': projectId,
      'projectUnitId': projectUnitId,
      'paymentMethodId': paymentMethodId,
      'paymentReference': paymentReference?.trim().isEmpty == true ? null : paymentReference?.trim(),
      'manualVoucherNumber': manualVoucherNumber?.trim().isEmpty == true ? null : manualVoucherNumber?.trim(),
      'invoiceStatus': invoiceStatus,
      'invoiceNumber': invoiceNumber?.trim().isEmpty == true ? null : invoiceNumber?.trim(),
      'invoiceAmount': invoiceAmount,
      'notes': notes?.trim().isEmpty == true ? null : notes?.trim(),
    };

    try {
      await api.post('/today/transactions', payload);
      return true; // Sent online successfully
    } catch (e) {
      // Save locally if offline or network failure occurs
      await OfflineQueueService.addPendingExpense(payload);
      throw OfflineSavedException('تم حفظ المصروف محلياً لعدم توفر الاتصال 📡 وسوف يتناقل بالسيرفر فور عودة النت.');
    }
  }

  /// Syncs all pending offline queued expenses with server
  Future<Map<String, dynamic>> syncPendingOfflineExpenses() async {
    final pending = await OfflineQueueService.getPendingExpenses();
    if (pending.isEmpty) {
      return {'synced': 0, 'remaining': 0, 'lastError': null};
    }

    int syncedCount = 0;
    String? lastError;

    for (final item in List<Map<String, dynamic>>.from(pending)) {
      final String key = item['idempotencyKey']?.toString() ?? '';
      final cleanPayload = Map<String, dynamic>.from(item);
      cleanPayload.remove('offlineCreatedAt');

      try {
        await api.post('/today/transactions', cleanPayload);
        if (key.isNotEmpty) {
          await OfflineQueueService.removePendingExpense(key);
        }
        syncedCount++;
      } catch (e) {
        lastError = e.toString();
        // If error is duplicate or already recorded on server, remove from queue safely
        if (lastError.contains('موجود مسبقاً') ||
            lastError.contains('Duplicate') ||
            lastError.contains('APPROVED') ||
            lastError.contains('200') ||
            lastError.contains('201')) {
          if (key.isNotEmpty) {
            await OfflineQueueService.removePendingExpense(key);
          }
          syncedCount++;
        } else if (e is ApiException && e.statusCode == 0) {
          // No active connection, stop queue to retry when online
          break;
        } else {
          // Other client error (e.g. invalid category), don't get stuck forever
          break;
        }
      }
    }

    final remaining = await OfflineQueueService.getPendingCount();
    return {
      'synced': syncedCount,
      'remaining': remaining,
      'lastError': lastError,
    };
  }

  /// Approves an expense transaction
  Future<bool> approveTransaction(int id, {String? comments}) async {
    final Map<String, dynamic> payload = comments != null && comments.trim().isNotEmpty
        ? {'comments': comments.trim()}
        : <String, dynamic>{};
    await api.post('/expense-transactions/$id/approve', payload);
    return true;
  }

  /// Rejects an expense transaction with mandatory/optional reason
  Future<bool> rejectTransaction(int id, {required String reason}) async {
    await api.post('/expense-transactions/$id/reject', {
      'reason': reason.trim(),
    });
    return true;
  }

  /// Updates transaction details (e.g., assigning project, unit, category, notes)
  Future<bool> updateTransactionDetails(int id, Map<String, dynamic> data) async {
    await api.patch('/expense-transactions/$id', data);
    return true;
  }

  /// Assigns multiple transactions to a project in bulk
  Future<Map<String, dynamic>> bulkAssignProject(
    List<int> transactionIds,
    int projectId, {
    String? reason,
  }) async {
    final res = await api.patch('/expense-transactions/bulk-assign-project', {
      'transactionIds': transactionIds,
      'projectId': projectId,
      'reason': reason?.trim().isNotEmpty == true ? reason?.trim() : 'ربط جماعي بواسطة المحاسب',
    });
    return asMap(responseData(res));
  }

  /// Fetches all daily journals list for audit and closing
  Future<List<Map<String, dynamic>>> fetchJournalsList() async {
    try {
      final res = await api.get('/journals');
      final list = asList(responseData(res));
      return list.map((e) => asMap(e)).toList();
    } catch (_) {
      return [];
    }
  }

  /// Approves a complete journal
  Future<bool> approveJournal(int journalId) async {
    await api.post('/journals/$journalId/approve', {});
    return true;
  }

  /// Closes a journal
  Future<bool> closeJournal(int journalId) async {
    await api.post('/journals/$journalId/close', {});
    return true;
  }

  /// Fetches attachments for a transaction
  Future<List<Map<String, dynamic>>> fetchAttachments(int transactionId) async {
    try {
      final res = await api.get('/expense-transactions/$transactionId/attachments');
      final list = asList(responseData(res));
      return list.map((e) => asMap(e)).toList();
    } catch (_) {
      return [];
    }
  }
}
