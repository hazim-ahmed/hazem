import '../core/network/api_client.dart';
import '../core/storage/cache_service.dart';
import '../core/utils/response_helpers.dart';
import '../models/transaction_model.dart';

class ExpenseService {
  final ApiClient api;

  ExpenseService(this.api);

  Future<Map<String, dynamic>> fetchTodayData() async {
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

    // If today's journal has 0 transactions, fallback to fetch from the latest active/closed journal
    if (txListRaw.isEmpty) {
      try {
        final journalsRes = await api.get('/journals');
        final journalsList = asList(responseData(journalsRes));
        if (journalsList.isNotEmpty) {
          final latestJournalId = journalsList.first['id'];
          if (latestJournalId != null) {
            final latestJournalRes = await api.get('/journals/$latestJournalId');
            final latestJournalData = asMap(responseData(latestJournalRes));
            final pastTx = asList(latestJournalData['transactions']);
            if (pastTx.isNotEmpty) {
              txListRaw = pastTx;
              if (journal.isEmpty || journal['transactionsCount'] == 0) {
                journal = latestJournalData;
              }
            }
          }
        }
      } catch (_) {}
    }

    final transactions = txListRaw.map((e) => ExpenseTransactionModel.fromJson(e)).toList();

    await CacheService.saveCachedData('today_data', {
      'journal': journal,
      'transactions': txListRaw,
    });

    return {
      'journal': journal,
      'transactions': transactions,
    };
  }

  Future<void> createExpense({
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
  }) async {
    await api.post('/today/transactions', {
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
    });
  }
}
