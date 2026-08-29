import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class OfflineQueueService {
  static const String _keyPendingExpenses = 'pending_offline_expenses';

  /// Add an expense payload to the local offline queue
  static Future<void> addPendingExpense(Map<String, dynamic> expenseData) async {
    final prefs = await SharedPreferences.getInstance();
    final List<Map<String, dynamic>> queue = await getPendingExpenses();

    // Ensure idempotencyKey exists
    if (!expenseData.containsKey('idempotencyKey') || expenseData['idempotencyKey'] == null) {
      expenseData['idempotencyKey'] = 'OFFLINE-${DateTime.now().millisecondsSinceEpoch}-${expenseData['amount']}';
    }

    expenseData['offlineCreatedAt'] = DateTime.now().toIso8601String();
    queue.add(expenseData);

    final encodedList = queue.map((e) => jsonEncode(e)).toList();
    await prefs.setStringList(_keyPendingExpenses, encodedList);
  }

  /// Get all pending offline expenses
  static Future<List<Map<String, dynamic>>> getPendingExpenses() async {
    final prefs = await SharedPreferences.getInstance();
    final List<String>? rawList = prefs.getStringList(_keyPendingExpenses);

    if (rawList == null || rawList.isEmpty) return [];

    final List<Map<String, dynamic>> result = [];
    for (final itemStr in rawList) {
      try {
        final decoded = jsonDecode(itemStr);
        if (decoded is Map<String, dynamic>) {
          result.add(decoded);
        }
      } catch (_) {}
    }
    return result;
  }

  /// Remove a specific pending expense by idempotencyKey
  static Future<void> removePendingExpense(String idempotencyKey) async {
    final prefs = await SharedPreferences.getInstance();
    final List<Map<String, dynamic>> queue = await getPendingExpenses();

    queue.removeWhere((item) => item['idempotencyKey'] == idempotencyKey);

    final encodedList = queue.map((e) => jsonEncode(e)).toList();
    await prefs.setStringList(_keyPendingExpenses, encodedList);
  }

  /// Get total pending offline items count
  static Future<int> getPendingCount() async {
    final items = await getPendingExpenses();
    return items.length;
  }
}
