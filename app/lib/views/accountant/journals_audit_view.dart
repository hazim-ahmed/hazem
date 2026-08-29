import 'package:flutter/material.dart';
import '../../core/network/api_client.dart';
import '../../core/utils/formatters.dart';
import '../../services/expense_service.dart';

class JournalsAuditView extends StatefulWidget {
  final ApiClient api;

  const JournalsAuditView({super.key, required this.api});

  @override
  State<JournalsAuditView> createState() => JournalsAuditViewState();
}

class JournalsAuditViewState extends State<JournalsAuditView> {
  late final ExpenseService _expenseService;
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _journals = [];
  String _selectedStatus = 'ALL'; // ALL, OPEN, APPROVED, CLOSED

  @override
  void initState() {
    super.initState();
    _expenseService = ExpenseService(widget.api);
    _loadJournals();
  }

  Future<void> _loadJournals() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final list = await _expenseService.fetchJournalsList();
      if (!mounted) return;
      setState(() {
        _journals = list;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = 'تعذر جلب قائمة اليوميات: $e';
        _loading = false;
      });
    }
  }

  void reload() => _loadJournals();

  List<Map<String, dynamic>> get _filteredJournals {
    if (_selectedStatus == 'ALL') return _journals;
    return _journals.where((j) => (j['status']?.toString().toUpperCase() ?? '') == _selectedStatus).toList();
  }

  Future<void> _handleApproveJournal(Map<String, dynamic> journal) async {
    final journalId = journal['id'];
    final journalNumber = journal['journalNumber'] ?? 'اليومية';

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.verified_rounded, color: Color(0xFF0F766E), size: 24),
            SizedBox(width: 8),
            Text('اعتماد اليومية بالكامل', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ],
        ),
        content: Text('هل أنت متأكد من اعتماد اليومية ($journalNumber) وترحيل جميع سنداتها؟'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(backgroundColor: const Color(0xFF0F766E)),
            child: const Text('تأكيد الاعتماد'),
          ),
        ],
      ),
    );

    if (confirm != true || journalId == null) return;

    try {
      await _expenseService.approveJournal(int.parse(journalId.toString()));
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✅ تم اعتماد اليومية $journalNumber بنجاح'),
          backgroundColor: const Color(0xFF0F766E),
          behavior: SnackBarBehavior.floating,
        ),
      );
      _loadJournals();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('❌ تعذر اعتماد اليومية: $e'),
          backgroundColor: const Color(0xFFE11D48),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> _handleCloseJournal(Map<String, dynamic> journal) async {
    final journalId = journal['id'];
    final journalNumber = journal['journalNumber'] ?? 'اليومية';

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.lock_clock_rounded, color: Color(0xFF475569), size: 24),
            SizedBox(width: 8),
            Text('إغلاق اليومية', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ],
        ),
        content: Text('هل أنت متأكد من إغلاق اليومية ($journalNumber)؟ لن يتمكن الكاشير من إضافة مصروفات جديدة عليها.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(backgroundColor: const Color(0xFF475569)),
            child: const Text('إغلاق اليومية'),
          ),
        ],
      ),
    );

    if (confirm != true || journalId == null) return;

    try {
      await _expenseService.closeJournal(int.parse(journalId.toString()));
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('🔒 تم إغلاق اليومية $journalNumber بنجاح'),
          backgroundColor: const Color(0xFF475569),
          behavior: SnackBarBehavior.floating,
        ),
      );
      _loadJournals();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('❌ تعذر إغلاق اليومية: $e'),
          backgroundColor: const Color(0xFFE11D48),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(color: Color(0xFF0F766E)),
            SizedBox(height: 16),
            Text('جاري تحميل دفاتر وسجلات اليوميات...', style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
          ],
        ),
      );
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline_rounded, color: Color(0xFFE11D48), size: 48),
              const SizedBox(height: 12),
              Text(_error!, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: _loadJournals,
                icon: const Icon(Icons.refresh),
                label: const Text('إعادة المحاولة'),
                style: FilledButton.styleFrom(backgroundColor: const Color(0xFF0F766E)),
              ),
            ],
          ),
        ),
      );
    }

    final filtered = _filteredJournals;

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _loadJournals,
        color: const Color(0xFF0F766E),
        child: CustomScrollView(
          slivers: [
            // Top Bar
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'دفاتر وسجلات اليوميات المالية',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'متابعة حالة الإغلاق والاعتماد المالي لكافة دفاتر الصندوق',
                      style: TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                    ),
                    const SizedBox(height: 12),

                    // Filter tabs
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          _buildStatusTab('الكل (${_journals.length})', 'ALL'),
                          const SizedBox(width: 6),
                          _buildStatusTab(
                            'مفتوحة (${_journals.where((j) => (j['status'] ?? '').toString().toUpperCase() == 'OPEN').length})',
                            'OPEN',
                            color: const Color(0xFF0F766E),
                          ),
                          const SizedBox(width: 6),
                          _buildStatusTab(
                            'معتمدة (${_journals.where((j) => (j['status'] ?? '').toString().toUpperCase() == 'APPROVED').length})',
                            'APPROVED',
                            color: const Color(0xFF059669),
                          ),
                          const SizedBox(width: 6),
                          _buildStatusTab(
                            'مغلقة (${_journals.where((j) => (j['status'] ?? '').toString().toUpperCase() == 'CLOSED').length})',
                            'CLOSED',
                            color: const Color(0xFF475569),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            if (filtered.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: const BoxDecoration(
                            color: Color(0xFFF1F5F9),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.book_outlined, size: 48, color: Color(0xFF94A3B8)),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'لا توجد يوميات مسجلة بهذه الحالة',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF334155)),
                        ),
                      ],
                    ),
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 80),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final journal = filtered[index];
                      return _buildJournalCard(journal);
                    },
                    childCount: filtered.length,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusTab(String label, String status, {Color? color}) {
    final active = _selectedStatus == status;
    final baseColor = color ?? const Color(0xFF0F766E);

    return InkWell(
      onTap: () => setState(() => _selectedStatus = status),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: active ? baseColor : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: active ? FontWeight.bold : FontWeight.w500,
            color: active ? Colors.white : const Color(0xFF475569),
          ),
        ),
      ),
    );
  }

  Widget _buildJournalCard(Map<String, dynamic> journal) {
    final status = (journal['status'] ?? 'OPEN').toString().toUpperCase();
    final journalNumber = journal['journalNumber']?.toString() ?? '-';
    final journalDate = journal['journalDate']?.toString().split('T').first ?? '-';
    final totalAmount = num.tryParse(journal['totalAmount']?.toString() ?? '')?.toDouble() ?? 0.0;
    final txCount = journal['transactionsCount'] ?? (journal['transactions'] as List?)?.length ?? 0;
    final cashbox = journal['cashbox'] is Map ? journal['cashbox'] : {};
    final cashboxName = cashbox['name']?.toString() ?? 'الصندوق الرئيسي';

    Color statusColor;
    String statusLabel;
    IconData statusIcon;

    if (status == 'APPROVED') {
      statusColor = const Color(0xFF059669);
      statusLabel = 'معتمدة بالكامل ✅';
      statusIcon = Icons.verified_rounded;
    } else if (status == 'CLOSED') {
      statusColor = const Color(0xFF475569);
      statusLabel = 'مغلقة 🔒';
      statusIcon = Icons.lock_outline_rounded;
    } else {
      statusColor = const Color(0xFF0F766E);
      statusLabel = 'مفتوحة وجارية 🟢';
      statusIcon = Icons.lock_open_rounded;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: statusColor.withValues(alpha: 0.06),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
              border: Border(bottom: BorderSide(color: statusColor.withValues(alpha: 0.1))),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(statusIcon, size: 16, color: statusColor),
                    const SizedBox(width: 6),
                    Text(
                      journalNumber,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    statusLabel,
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: statusColor),
                  ),
                ),
              ],
            ),
          ),

          // Body
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('تاريخ اليومية: $journalDate', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
                        const SizedBox(height: 2),
                        Text('$cashboxName • $txCount سند مصروف', style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B))),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        const Text('إجمالي المصروفات', style: TextStyle(fontSize: 10.5, color: Color(0xFF64748B))),
                        Text(
                          Formatters.currency(totalAmount),
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F766E)),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Actions
          if (status != 'APPROVED') ...[
            Container(
              padding: const EdgeInsets.fromLTRB(14, 8, 14, 10),
              decoration: const BoxDecoration(
                color: Color(0xFFFAFAFA),
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(15)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  if (status == 'OPEN') ...[
                    OutlinedButton.icon(
                      onPressed: () => _handleCloseJournal(journal),
                      icon: const Icon(Icons.lock_outline_rounded, size: 16),
                      label: const Text('إغلاق اليومية', style: TextStyle(fontSize: 12)),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF475569),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      ),
                    ),
                    const SizedBox(width: 8),
                  ],
                  FilledButton.icon(
                    onPressed: () => _handleApproveJournal(journal),
                    icon: const Icon(Icons.verified_rounded, size: 16),
                    label: const Text('اعتماد اليومية بالكامل', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFF0F766E),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
