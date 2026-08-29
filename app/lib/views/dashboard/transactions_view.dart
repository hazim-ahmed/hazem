import 'package:flutter/material.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/cache_service.dart';
import '../../core/storage/offline_queue_service.dart';
import '../../core/utils/response_helpers.dart';
import '../../models/transaction_model.dart';
import '../../services/expense_service.dart';
import 'widgets/summary_card.dart';
import 'widgets/transaction_card.dart';

class TransactionsView extends StatefulWidget {
  final ApiClient api;
  final VoidCallback onNavigateToNew;

  const TransactionsView({
    super.key,
    required this.api,
    required this.onNavigateToNew,
  });

  @override
  State<TransactionsView> createState() => TransactionsViewState();
}

class TransactionsViewState extends State<TransactionsView> {
  late ExpenseService _expenseService;
  bool _loading = true;
  bool _syncing = false;
  int _pendingCount = 0;
  Map<String, dynamic>? _todayJournal;
  List<ExpenseTransactionModel> _transactions = [];
  String _filterStatus = 'ALL';
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _expenseService = ExpenseService(widget.api);
    _loadCachedThenNetwork();
  }

  void reload() => _fetchData();

  Future<void> _loadCachedThenNetwork() async {
    _pendingCount = await OfflineQueueService.getPendingCount();
    final cached = await CacheService.getCachedData('today_data');
    if (cached != null && mounted) {
      final txListRaw = asList(cached['transactions']);
      setState(() {
        _todayJournal = asMap(cached['journal']);
        _transactions = txListRaw.map((e) => ExpenseTransactionModel.fromJson(e)).toList();
        _loading = false;
      });
    }
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final syncResult = await _expenseService.syncPendingOfflineExpenses();
      final data = await _expenseService.fetchTodayData();
      final pendingAfter = await OfflineQueueService.getPendingCount();

      if (mounted) {
        setState(() {
          _todayJournal = data['journal'];
          _transactions = data['transactions'];
          _pendingCount = pendingAfter;
          _loading = false;
        });

        if (syncResult['synced'] != null && syncResult['synced'] > 0) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('تمت مزامنة ${syncResult['synced']} مصروفات مع السيرفر بنجاح! 🎉',
                  style: const TextStyle(fontWeight: FontWeight.bold)),
              backgroundColor: const Color(0xFF0F766E),
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('تنبيه: $e'),
            backgroundColor: const Color(0xFFE11D48),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    }
  }

  Future<void> _triggerManualSync() async {
    setState(() => _syncing = true);
    try {
      final res = await _expenseService.syncPendingOfflineExpenses();
      final synced = res['synced'] ?? 0;
      final remaining = res['remaining'] ?? 0;
      final lastErr = res['lastError'];

      await _fetchData();

      if (!mounted) return;
      if (synced > 0) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('تمت مزامنة $synced مصروفات بنجاح! 🎉'),
            backgroundColor: const Color(0xFF0F766E),
            behavior: SnackBarBehavior.floating,
          ),
        );
      } else if (lastErr != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('نتيجة المزامنة: $lastErr'),
            backgroundColor: const Color(0xFFD97706),
            behavior: SnackBarBehavior.floating,
          ),
        );
      } else if (remaining == 0) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('جميع المصروفات متطابقة مع السيرفر ومزامنة 100% ✅'),
            backgroundColor: Color(0xFF0F766E),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('فشل الاتصال: $e'),
            backgroundColor: const Color(0xFFE11D48),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _syncing = false);
    }
  }

  List<ExpenseTransactionModel> get _filteredTransactions {
    return _transactions.where((tx) {
      final matchesStatus = _filterStatus == 'ALL' || tx.status == _filterStatus;
      if (!matchesStatus) return false;

      if (_searchQuery.trim().isEmpty) return true;
      final q = _searchQuery.toLowerCase();
      final desc = tx.description.toLowerCase();
      final ref = tx.systemReference.toLowerCase();
      final ben = tx.beneficiaryName?.toLowerCase() ?? '';
      return desc.contains(q) || ref.contains(q) || ben.contains(q);
    }).toList();
  }

  double get _totalSpent {
    return _transactions.fold(0.0, (sum, tx) => sum + tx.amount);
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _filteredTransactions;

    return RefreshIndicator(
      onRefresh: _fetchData,
      color: const Color(0xFF0F766E),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // 0. Offline Pending Sync Banner
          if (_pendingCount > 0) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFFFFBEB),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFFDE68A)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.cloud_upload_outlined, color: Color(0xFFD97706), size: 24),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'يوجد $_pendingCount مصروفات معلقة محلياً 📡',
                          style: const TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 13,
                            color: Color(0xFF92400E),
                          ),
                        ),
                        const Text(
                          'اضغط لمزامنتها مع السيرفر الرئيسي فور توفر النت',
                          style: TextStyle(fontSize: 11, color: Color(0xFFB45309)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  FilledButton(
                    onPressed: _syncing ? null : _triggerManualSync,
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFFD97706),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: _syncing
                        ? const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Text('مزامنة 🔄', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
          ],

          // 1. Summary Card
          SummaryCard(
            journal: _todayJournal,
            totalSpent: _totalSpent,
            transactionCount: _transactions.length,
          ),
          const SizedBox(height: 16),

          // 2. Search Box
          TextField(
            onChanged: (v) => setState(() => _searchQuery = v),
            decoration: const InputDecoration(
              hintText: 'بحث في المصروفات أو المستفيدين...',
              prefixIcon: Icon(Icons.search_rounded, size: 20),
              contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              fillColor: Colors.white,
            ),
          ),
          const SizedBox(height: 10),

          // 3. Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _filterChip('ALL', 'الكل (${_transactions.length})'),
                _filterChip('OFFLINE_PENDING', 'معلق أوفلاين ($_pendingCount)'),
                _filterChip('APPROVED', 'معتمد'),
                _filterChip('PENDING_REVIEW', 'قيد المراجعة'),
                _filterChip('REJECTED', 'مرفوض'),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // 4. Transactions List
          if (_loading)
            const Padding(
              padding: EdgeInsets.all(40),
              child: Center(child: CircularProgressIndicator()),
            )
          else if (filtered.isEmpty)
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  Icon(Icons.inbox_outlined, size: 48, color: Colors.grey.shade400),
                  const SizedBox(height: 12),
                  const Text(
                    'لا توجد عمليات صرف مسجلة مطابقة.',
                    style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: widget.onNavigateToNew,
                    icon: const Icon(Icons.add_rounded),
                    label: const Text('تسجيل أول مصروف الآن'),
                    style: FilledButton.styleFrom(backgroundColor: const Color(0xFF0F766E)),
                  ),
                ],
              ),
            )
          else
            ...filtered.map((tx) => TransactionCard(tx: tx)),
        ],
      ),
    );
  }

  Widget _filterChip(String status, String label) {
    final isSelected = _filterStatus == status;
    return Padding(
      padding: const EdgeInsets.only(left: 6),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        selectedColor: const Color(0xFF0F766E),
        labelStyle: TextStyle(
          color: isSelected ? Colors.white : const Color(0xFF334155),
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
        backgroundColor: Colors.white,
        side: BorderSide(color: isSelected ? const Color(0xFF0F766E) : const Color(0xFFCBD5E1)),
        onSelected: (_) => setState(() => _filterStatus = status),
      ),
    );
  }
}
