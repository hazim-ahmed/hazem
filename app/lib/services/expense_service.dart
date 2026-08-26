import '../core/network/api_client.dart';
import '../core/storage/cache_service.dart';
import '../core/utils/response_helpers.dart';
import '../models/transaction_model.dart';

class ExpenseService {
  final ApiClient api;

  ExpenseService(this.api);

  Future<Map<String, dynamic>> fetchTodayData() async {
    final results = await Future.wait([
      api.get('/today/journal'),
      api.get('/today/transactions'),
    ]);

    final journal = asMap(responseData(results[0]));
    final txListRaw = asList(responseData(results[1]));
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
