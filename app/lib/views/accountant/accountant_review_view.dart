import 'package:flutter/material.dart';
import '../../core/network/api_client.dart';
import '../../core/utils/formatters.dart';
import '../../models/master_models.dart';
import '../../models/transaction_model.dart';
import '../../services/expense_service.dart';
import '../../services/master_data_service.dart';

class AccountantReviewView extends StatefulWidget {
  final ApiClient api;
  final VoidCallback? onNavigateToNew;

  const AccountantReviewView({
    super.key,
    required this.api,
    this.onNavigateToNew,
  });

  @override
  State<AccountantReviewView> createState() => AccountantReviewViewState();
}

class AccountantReviewViewState extends State<AccountantReviewView> {
  late final ExpenseService _expenseService;
  late final MasterDataService _masterService;

  bool _loading = true;
  String? _error;
  List<ExpenseTransactionModel> _transactions = [];
  Map<String, dynamic> _journal = {};

  // Master data for quick editing/assigning
  List<MasterItem> _projects = [];

  // Filter & Search states
  String _selectedFilter = 'ALL'; // ALL, PENDING, APPROVED, REJECTED, UNASSIGNED_PROJECT, PENDING_INVOICE
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  // Multi-selection for bulk operations
  bool _isSelectionMode = false;
  final Set<int> _selectedTxIds = {};

  @override
  void initState() {
    super.initState();
    _expenseService = ExpenseService(widget.api);
    _masterService = MasterDataService(widget.api);
    _loadData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final res = await _expenseService.fetchTodayData();
      final master = await _masterService.fetchMasterData();

      if (!mounted) return;
      setState(() {
        _journal = res['journal'] ?? {};
        _transactions = (res['transactions'] as List<ExpenseTransactionModel>?) ?? [];
        _projects = master['projects'] ?? [];
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = 'تعذر تحميل بيانات المراجعة: $e';
        _loading = false;
      });
    }
  }

  void reload() => _loadData();

  // Filters logic
  List<ExpenseTransactionModel> get _filteredTransactions {
    return _transactions.where((tx) {
      // 1. Status Filter
      if (_selectedFilter == 'PENDING' && !tx.isPending) return false;
      if (_selectedFilter == 'APPROVED' && !tx.isApproved) return false;
      if (_selectedFilter == 'REJECTED' && !tx.isRejected) return false;
      if (_selectedFilter == 'UNASSIGNED_PROJECT' && tx.isAssignedToProject) return false;
      if (_selectedFilter == 'PENDING_INVOICE' && !tx.isInvoicePending) return false;

      // 2. Search Query
      if (_searchQuery.trim().isNotEmpty) {
        final q = _searchQuery.trim().toLowerCase();
        final ref = tx.systemReference.toLowerCase();
        final desc = tx.description.toLowerCase();
        final ben = (tx.beneficiaryName ?? '').toLowerCase();
        final cat = (tx.categoryName ?? '').toLowerCase();
        final prj = (tx.projectName ?? '').toLowerCase();
        final creator = (tx.createdByName ?? '').toLowerCase();
        final voucher = (tx.manualVoucherNumber ?? '').toLowerCase();

        return ref.contains(q) ||
            desc.contains(q) ||
            ben.contains(q) ||
            cat.contains(q) ||
            prj.contains(q) ||
            creator.contains(q) ||
            voucher.contains(q);
      }

      return true;
    }).toList();
  }

  // Quick Action: Approve Transaction
  Future<void> _handleApprove(ExpenseTransactionModel tx) async {
    final TextEditingController commentCtrl = TextEditingController();
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 24),
            ),
            const SizedBox(width: 10),
            const Text('اعتماد سند الصرف', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('هل أنت متأكد من اعتماد السند (${tx.systemReference}) بمبلغ ${Formatters.currency(tx.amount)}؟'),
            const SizedBox(height: 16),
            TextField(
              controller: commentCtrl,
              decoration: InputDecoration(
                labelText: 'ملاحظات الاعتماد (اختياري)',
                hintText: 'مثال: تمت المراجعة ومطابقة الفاتورة',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                prefixIcon: const Icon(Icons.note_alt_outlined),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
          FilledButton.icon(
            onPressed: () => Navigator.pop(ctx, true),
            icon: const Icon(Icons.check),
            label: const Text('اعتماد الآن'),
            style: FilledButton.styleFrom(backgroundColor: const Color(0xFF0F766E)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      await _expenseService.approveTransaction(tx.id, comments: commentCtrl.text);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✅ تم اعتماد السند ${tx.systemReference} بنجاح'),
          backgroundColor: const Color(0xFF0F766E),
          behavior: SnackBarBehavior.floating,
        ),
      );
      _loadData();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('❌ تعذر اعتماد السند: $e'),
          backgroundColor: const Color(0xFFE11D48),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  // Quick Action: Reject Transaction
  Future<void> _handleReject(ExpenseTransactionModel tx) async {
    final TextEditingController reasonCtrl = TextEditingController();
    final formKey = GlobalKey<FormState>();

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFE11D48).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.cancel_rounded, color: Color(0xFFE11D48), size: 24),
            ),
            const SizedBox(width: 10),
            const Text('رفض سند الصرف', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
          ],
        ),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('يرجى توضيح سبب رفض السند (${tx.systemReference}) ليتم إشعار مدخل المصروف به:'),
              const SizedBox(height: 16),
              TextFormField(
                controller: reasonCtrl,
                maxLines: 3,
                validator: (val) => (val == null || val.trim().isEmpty) ? 'سبب الرفض إجباري' : null,
                decoration: InputDecoration(
                  labelText: 'سبب الرفض *',
                  hintText: 'مثال: الفاتورة غير واضحة / السند مسجل على مشروع خاطئ',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  alignLabelWithHint: true,
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
          FilledButton.icon(
            onPressed: () {
              if (formKey.currentState?.validate() == true) {
                Navigator.pop(ctx, true);
              }
            },
            icon: const Icon(Icons.close_rounded),
            label: const Text('تأكيد الرفض'),
            style: FilledButton.styleFrom(backgroundColor: const Color(0xFFE11D48)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      await _expenseService.rejectTransaction(tx.id, reason: reasonCtrl.text);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('⚠️ تم رفض السند ${tx.systemReference} وإشعار المدخل'),
          backgroundColor: const Color(0xFFE11D48),
          behavior: SnackBarBehavior.floating,
        ),
      );
      _loadData();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('❌ تعذر رفض السند: $e'),
          backgroundColor: const Color(0xFFE11D48),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  // Quick Action: Assign Project & Unit Dialog
  Future<void> _handleAssignProject(ExpenseTransactionModel tx) async {
    int? selectedProjectId = tx.projectId;
    int? selectedUnitId = tx.projectUnitId;
    List<ProjectUnitItem> units = [];
    bool loadingUnits = false;

    if (selectedProjectId != null) {
      try {
        units = await _masterService.fetchUnitsForProject(selectedProjectId);
      } catch (_) {}
    }

    if (!mounted) return;

    final updated = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDlgState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF2563EB).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.apartment_rounded, color: Color(0xFF2563EB), size: 24),
              ),
              const SizedBox(width: 10),
              const Text('توجيه وربط المشروع والوحدة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('تحديد مركز التكلفة للمصروف (${tx.systemReference}):', style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
              const SizedBox(height: 16),
              DropdownButtonFormField<int?>(
                initialValue: selectedProjectId,
                isExpanded: true,
                decoration: InputDecoration(
                  labelText: 'المشروع التابع له المصروف',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  prefixIcon: const Icon(Icons.business_center_outlined),
                ),
                items: [
                  const DropdownMenuItem<int?>(
                    value: null,
                    child: Text('بدون مشروع (مصروف عام / إداري)'),
                  ),
                  ..._projects.map(
                    (p) => DropdownMenuItem<int?>(
                      value: p.id,
                      child: Text('${p.name} ${p.subtitle != null ? "(${p.subtitle})" : ""}'),
                    ),
                  ),
                ],
                onChanged: (val) async {
                  setDlgState(() {
                    selectedProjectId = val;
                    selectedUnitId = null;
                    units = [];
                    loadingUnits = val != null;
                  });

                  if (val != null) {
                    final fetched = await _masterService.fetchUnitsForProject(val);
                    setDlgState(() {
                      units = fetched;
                      loadingUnits = false;
                    });
                  }
                },
              ),
              if (selectedProjectId != null) ...[
                const SizedBox(height: 12),
                if (loadingUnits)
                  const Center(child: Padding(padding: EdgeInsets.all(8.0), child: CircularProgressIndicator()))
                else
                  DropdownButtonFormField<int?>(
                    initialValue: selectedUnitId,
                    isExpanded: true,
                    decoration: InputDecoration(
                      labelText: 'الوحدة العقارية (اختياري)',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      prefixIcon: const Icon(Icons.home_work_outlined),
                    ),
                    items: [
                      const DropdownMenuItem<int?>(
                        value: null,
                        child: Text('كامل المشروع (بدون وحدة محددة)'),
                      ),
                      ...units.map(
                        (u) => DropdownMenuItem<int?>(
                          value: u.id,
                          child: Text('وحدة: ${u.unitNumber} ${u.unitType != null ? "(${u.unitType})" : ""}'),
                        ),
                      ),
                    ],
                    onChanged: (val) => setDlgState(() => selectedUnitId = val),
                  ),
              ],
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
            FilledButton(
              onPressed: () => Navigator.pop(ctx, true),
              style: FilledButton.styleFrom(backgroundColor: const Color(0xFF2563EB)),
              child: const Text('حفظ التعديل'),
            ),
          ],
        ),
      ),
    );

    if (updated != true) return;

    try {
      await _expenseService.updateTransactionDetails(tx.id, {
        'projectId': selectedProjectId,
        'projectUnitId': selectedUnitId,
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✅ تم تحديث مركز التكلفة وربط المشروع بنجاح'),
          backgroundColor: Color(0xFF0F766E),
          behavior: SnackBarBehavior.floating,
        ),
      );
      _loadData();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('❌ تعذر تحديث المشروع: $e'),
          backgroundColor: const Color(0xFFE11D48),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  // Bulk Approval
  Future<void> _handleBulkApprove() async {
    if (_selectedTxIds.isEmpty) return;

    final count = _selectedTxIds.length;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('اعتماد جماعي للمصروفات', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Text('هل أنت متأكد من اعتماد $count سند مصروف محدد دفعة واحدة؟'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
          FilledButton.icon(
            onPressed: () => Navigator.pop(ctx, true),
            icon: const Icon(Icons.done_all_rounded),
            label: Text('اعتماد $count سند'),
            style: FilledButton.styleFrom(backgroundColor: const Color(0xFF0F766E)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    int successCount = 0;
    for (final id in _selectedTxIds) {
      try {
        await _expenseService.approveTransaction(id);
        successCount++;
      } catch (_) {}
    }

    if (!mounted) return;
    setState(() {
      _selectedTxIds.clear();
      _isSelectionMode = false;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('✅ تم اعتماد $successCount من أصل $count سند بنجاح'),
        backgroundColor: const Color(0xFF0F766E),
        behavior: SnackBarBehavior.floating,
      ),
    );
    _loadData();
  }

  // Bulk Project Assignment
  Future<void> _handleBulkAssignProject() async {
    if (_selectedTxIds.isEmpty) return;

    int? targetProjectId;
    final updated = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDlgState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text('ربط ${_selectedTxIds.length} سند بمشروع', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('اختر المشروع المراد توجيه السندات المحددة إليه:'),
              const SizedBox(height: 16),
              DropdownButtonFormField<int>(
                initialValue: targetProjectId,
                isExpanded: true,
                decoration: InputDecoration(
                  labelText: 'المشروع المستهدف *',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
                items: _projects.map(
                  (p) => DropdownMenuItem<int>(
                    value: p.id,
                    child: Text('${p.name} (${p.subtitle ?? ""})'),
                  ),
                ).toList(),
                onChanged: (val) => setDlgState(() => targetProjectId = val),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
            FilledButton(
              onPressed: targetProjectId == null ? null : () => Navigator.pop(ctx, true),
              style: FilledButton.styleFrom(backgroundColor: const Color(0xFF2563EB)),
              child: const Text('تطبيق الربط'),
            ),
          ],
        ),
      ),
    );

    if (updated != true || targetProjectId == null) return;

    try {
      await _expenseService.bulkAssignProject(_selectedTxIds.toList(), targetProjectId!);
      if (!mounted) return;
      setState(() {
        _selectedTxIds.clear();
        _isSelectionMode = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✅ تم الربط الجماعي بالمشروع بنجاح'),
          backgroundColor: Color(0xFF0F766E),
          behavior: SnackBarBehavior.floating,
        ),
      );
      _loadData();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('❌ تعذر الربط الجماعي: $e'),
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
            Text('جاري تحميل سندات الصرف للمراجعة والتدقيق...', style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
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
                onPressed: _loadData,
                icon: const Icon(Icons.refresh),
                label: const Text('إعادة المحاولة'),
                style: FilledButton.styleFrom(backgroundColor: const Color(0xFF0F766E)),
              ),
            ],
          ),
        ),
      );
    }

    // Stats calculations
    final pendingCount = _transactions.where((t) => t.isPending).length;
    final pendingSum = _transactions.where((t) => t.isPending).fold<double>(0.0, (s, t) => s + t.amount);
    final approvedCount = _transactions.where((t) => t.isApproved).length;
    final approvedSum = _transactions.where((t) => t.isApproved).fold<double>(0.0, (s, t) => s + t.amount);
    final unassignedCount = _transactions.where((t) => !t.isAssignedToProject).length;
    final pendingInvoiceCount = _transactions.where((t) => t.isInvoicePending).length;

    final filteredList = _filteredTransactions;

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _loadData,
        color: const Color(0xFF0F766E),
        child: CustomScrollView(
          slivers: [
            // 1. Audit Dashboard KPI Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header title & selection toggle
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'لوحة تدقيق ومراجعة المصروفات',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'يومية ${_journal['journalNumber'] ?? 'اليوم'} • إجمالي: ${Formatters.currency(pendingSum + approvedSum)}',
                              style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                            ),
                          ],
                        ),
                        FilledButton.tonalIcon(
                          onPressed: () {
                            setState(() {
                              _isSelectionMode = !_isSelectionMode;
                              if (!_isSelectionMode) _selectedTxIds.clear();
                            });
                          },
                          icon: Icon(_isSelectionMode ? Icons.close : Icons.checklist_rounded, size: 18),
                          label: Text(_isSelectionMode ? 'إلغاء التحديد' : 'تحديد جماعي', style: const TextStyle(fontSize: 12)),
                          style: FilledButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            visualDensity: VisualDensity.compact,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Quick Audit KPI Cards Carousel / Grid
                    Row(
                      children: [
                        Expanded(
                          child: _buildKpiCard(
                            title: 'في انتظار التدقيق',
                            count: '$pendingCount سند',
                            amount: Formatters.currency(pendingSum),
                            icon: Icons.hourglass_top_rounded,
                            color: const Color(0xFFD97706),
                            bgColor: const Color(0xFFFFFBEB),
                            isSelected: _selectedFilter == 'PENDING',
                            onTap: () => setState(() => _selectedFilter = _selectedFilter == 'PENDING' ? 'ALL' : 'PENDING'),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _buildKpiCard(
                            title: 'معتمدة ومكتملة',
                            count: '$approvedCount سند',
                            amount: Formatters.currency(approvedSum),
                            icon: Icons.verified_rounded,
                            color: const Color(0xFF059669),
                            bgColor: const Color(0xFFECFDF5),
                            isSelected: _selectedFilter == 'APPROVED',
                            onTap: () => setState(() => _selectedFilter = _selectedFilter == 'APPROVED' ? 'ALL' : 'APPROVED'),
                          ),
                        ),
                      ],
                    ),

                    if (unassignedCount > 0 || pendingInvoiceCount > 0) ...[
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          if (unassignedCount > 0)
                            Expanded(
                              child: InkWell(
                                onTap: () => setState(() => _selectedFilter = _selectedFilter == 'UNASSIGNED_PROJECT' ? 'ALL' : 'UNASSIGNED_PROJECT'),
                                borderRadius: BorderRadius.circular(10),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                  decoration: BoxDecoration(
                                    color: _selectedFilter == 'UNASSIGNED_PROJECT' ? const Color(0xFFEFF6FF) : const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(
                                      color: _selectedFilter == 'UNASSIGNED_PROJECT' ? const Color(0xFF3B82F6) : const Color(0xFFE2E8F0),
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.warning_amber_rounded, size: 16, color: Color(0xFF2563EB)),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        child: Text(
                                          '$unassignedCount بدون مشروع',
                                          style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFF1E3A8A)),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          if (unassignedCount > 0 && pendingInvoiceCount > 0) const SizedBox(width: 8),
                          if (pendingInvoiceCount > 0)
                            Expanded(
                              child: InkWell(
                                onTap: () => setState(() => _selectedFilter = _selectedFilter == 'PENDING_INVOICE' ? 'ALL' : 'PENDING_INVOICE'),
                                borderRadius: BorderRadius.circular(10),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                  decoration: BoxDecoration(
                                    color: _selectedFilter == 'PENDING_INVOICE' ? const Color(0xFFFFF1F2) : const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(
                                      color: _selectedFilter == 'PENDING_INVOICE' ? const Color(0xFFE11D48) : const Color(0xFFE2E8F0),
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.receipt_long_outlined, size: 16, color: Color(0xFFE11D48)),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        child: Text(
                                          '$pendingInvoiceCount فواتير معلقة',
                                          style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFF881337)),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ],

                    const SizedBox(height: 14),

                    // Search Input
                    TextField(
                      controller: _searchController,
                      onChanged: (val) => setState(() => _searchQuery = val),
                      decoration: InputDecoration(
                        hintText: 'بحث بالرقم المرجعي، المستفيد، المشروع، أو المدخل...',
                        hintStyle: const TextStyle(fontSize: 12.5, color: Color(0xFF94A3B8)),
                        prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF64748B), size: 20),
                        suffixIcon: _searchQuery.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear, size: 18),
                                onPressed: () {
                                  _searchController.clear();
                                  setState(() => _searchQuery = '');
                                },
                              )
                            : null,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Filter Chips Bar
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          _buildFilterChip('الكل (${_transactions.length})', 'ALL'),
                          const SizedBox(width: 6),
                          _buildFilterChip('بانتظار التدقيق ($pendingCount)', 'PENDING', color: const Color(0xFFD97706)),
                          const SizedBox(width: 6),
                          _buildFilterChip('المعتمدة ($approvedCount)', 'APPROVED', color: const Color(0xFF059669)),
                          const SizedBox(width: 6),
                          _buildFilterChip('المرفوضة (${_transactions.where((t) => t.isRejected).length})', 'REJECTED', color: const Color(0xFFE11D48)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // 2. Transactions List / Empty State
            if (filteredList.isEmpty)
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
                          child: const Icon(Icons.rule_folder_outlined, size: 48, color: Color(0xFF94A3B8)),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'لا توجد سندات مصروفات مطابقة للفلتر',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF334155)),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'تمت مراجعة وتدقيق جميع السندات أو قم بتغيير خيارات البحث',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Color(0xFF64748B), fontSize: 12.5),
                        ),
                      ],
                    ),
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 90),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final tx = filteredList[index];
                      final isSelected = _selectedTxIds.contains(tx.id);

                      return _buildAccountantCard(tx, isSelected: isSelected);
                    },
                    childCount: filteredList.length,
                  ),
                ),
              ),
          ],
        ),
      ),

      // Bottom Bulk Actions Bar (if items selected)
      bottomSheet: _isSelectionMode && _selectedTxIds.isNotEmpty
          ? Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 16,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: SafeArea(
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F766E).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '${_selectedTxIds.length} محدد',
                        style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F766E)),
                      ),
                    ),
                    const Spacer(),
                    OutlinedButton.icon(
                      onPressed: _handleBulkAssignProject,
                      icon: const Icon(Icons.business_outlined, size: 18),
                      label: const Text('ربط بمشروع', style: TextStyle(fontSize: 12)),
                    ),
                    const SizedBox(width: 8),
                    FilledButton.icon(
                      onPressed: _handleBulkApprove,
                      icon: const Icon(Icons.done_all_rounded, size: 18),
                      label: const Text('اعتماد المحدد', style: TextStyle(fontSize: 12)),
                      style: FilledButton.styleFrom(backgroundColor: const Color(0xFF0F766E)),
                    ),
                  ],
                ),
              ),
            )
          : null,
    );
  }

  // Widget helper: KPI Card
  Widget _buildKpiCard({
    required String title,
    required String count,
    required String amount,
    required IconData icon,
    required Color color,
    required Color bgColor,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? color : color.withValues(alpha: 0.2),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: color)),
                Icon(icon, size: 18, color: color),
              ],
            ),
            const SizedBox(height: 6),
            Text(amount, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: color)),
            const SizedBox(height: 2),
            Text(count, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: color.withValues(alpha: 0.8))),
          ],
        ),
      ),
    );
  }

  // Widget helper: Filter chip
  Widget _buildFilterChip(String label, String value, {Color? color}) {
    final active = _selectedFilter == value;
    final baseColor = color ?? const Color(0xFF0F766E);

    return InkWell(
      onTap: () => setState(() => _selectedFilter = value),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
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

  // Widget helper: Accountant Review Card
  Widget _buildAccountantCard(ExpenseTransactionModel tx, {required bool isSelected}) {
    Color statusColor;
    String statusText;
    IconData statusIcon;

    if (tx.isApproved) {
      statusColor = const Color(0xFF059669);
      statusText = 'معتمد ✅';
      statusIcon = Icons.check_circle_outline_rounded;
    } else if (tx.isRejected) {
      statusColor = const Color(0xFFE11D48);
      statusText = 'مرفوض ❌';
      statusIcon = Icons.highlight_off_rounded;
    } else {
      statusColor = const Color(0xFFD97706);
      statusText = 'بانتظار التدقيق ⏳';
      statusIcon = Icons.pending_actions_rounded;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isSelected ? const Color(0xFF0F766E) : const Color(0xFFE2E8F0),
          width: isSelected ? 2 : 1,
        ),
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
          // Card Header with selection & status
          Container(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
            decoration: BoxDecoration(
              color: statusColor.withValues(alpha: 0.05),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
              border: Border(bottom: BorderSide(color: statusColor.withValues(alpha: 0.1))),
            ),
            child: Row(
              children: [
                if (_isSelectionMode)
                  Checkbox(
                    value: isSelected,
                    activeColor: const Color(0xFF0F766E),
                    onChanged: (val) {
                      setState(() {
                        if (val == true) {
                          _selectedTxIds.add(tx.id);
                        } else {
                          _selectedTxIds.remove(tx.id);
                        }
                      });
                    },
                  ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            tx.systemReference,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B)),
                          ),
                          if (tx.manualVoucherNumber != null && tx.manualVoucherNumber!.isNotEmpty) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFE2E8F0),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                'سند: ${tx.manualVoucherNumber}',
                                style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
                              ),
                            ),
                          ],
                        ],
                      ),
                      if (tx.createdByName != null)
                        Text(
                          'بواسطة: ${tx.createdByName}',
                          style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                        ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(statusIcon, size: 14, color: statusColor),
                      const SizedBox(width: 4),
                      Text(
                        statusText,
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: statusColor),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Card Body
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Amount & Beneficiary
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            tx.beneficiaryName ?? 'غير محدد',
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: Color(0xFF0F172A)),
                          ),
                          if (tx.categoryName != null)
                            Text(
                              tx.categoryName!,
                              style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                            ),
                        ],
                      ),
                    ),
                    Text(
                      Formatters.currency(tx.amount),
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF0F766E),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 8),
                Text(
                  tx.description,
                  style: const TextStyle(fontSize: 13, color: Color(0xFF334155), height: 1.4),
                ),

                if (tx.notes != null && tx.notes!.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.sticky_note_2_outlined, size: 14, color: Color(0xFF64748B)),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            tx.notes!,
                            style: const TextStyle(fontSize: 11.5, color: Color(0xFF475569)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                if (tx.rejectionReason != null && tx.rejectionReason!.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF1F2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFFECDD3)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline_rounded, size: 14, color: Color(0xFFE11D48)),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            'سبب الرفض: ${tx.rejectionReason!}',
                            style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: Color(0xFFBE123C)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 12),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                const SizedBox(height: 10),

                // Project & Invoice Badges
                Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  children: [
                    // Project Badge
                    InkWell(
                      onTap: () => _handleAssignProject(tx),
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: tx.isAssignedToProject ? const Color(0xFFEFF6FF) : const Color(0xFFFFFBEB),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: tx.isAssignedToProject ? const Color(0xFFBFDBFE) : const Color(0xFFFDE68A),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              tx.isAssignedToProject ? Icons.apartment_rounded : Icons.add_business_rounded,
                              size: 13,
                              color: tx.isAssignedToProject ? const Color(0xFF2563EB) : const Color(0xFFD97706),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              tx.isAssignedToProject
                                  ? '${tx.projectName}${tx.unitNumber != null ? " (وحدة ${tx.unitNumber})" : ""}'
                                  : 'تعيين مشروع ➕',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: tx.isAssignedToProject ? const Color(0xFF1E40AF) : const Color(0xFFB45309),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Invoice Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: tx.hasInvoice
                            ? const Color(0xFFECFDF5)
                            : tx.isInvoicePending
                                ? const Color(0xFFFFF1F2)
                                : const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: tx.hasInvoice
                              ? const Color(0xFFA7F3D0)
                              : tx.isInvoicePending
                                  ? const Color(0xFFFECDD3)
                                  : const Color(0xFFE2E8F0),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            tx.hasInvoice ? Icons.receipt_rounded : Icons.receipt_long_outlined,
                            size: 13,
                            color: tx.hasInvoice
                                ? const Color(0xFF059669)
                                : tx.isInvoicePending
                                    ? const Color(0xFFE11D48)
                                    : const Color(0xFF64748B),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            tx.hasInvoice
                                ? 'فاتورة: ${tx.invoiceNumber ?? "متوفرة"}'
                                : tx.isInvoicePending
                                    ? 'فاتورة معلقة'
                                    : 'بدون فاتورة',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: tx.hasInvoice
                                  ? const Color(0xFF065F46)
                                  : tx.isInvoicePending
                                      ? const Color(0xFF9F1239)
                                      : const Color(0xFF475569),
                            ),
                          ),
                        ],
                      ),
                    ),

                    if (tx.paymentMethodName != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.payment_rounded, size: 13, color: Color(0xFF64748B)),
                            const SizedBox(width: 4),
                            Text(
                              tx.paymentMethodName!,
                              style: const TextStyle(fontSize: 11, color: Color(0xFF475569)),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),

          // Card Action Buttons (Approve, Reject, Assign, Attachments)
          Container(
            padding: const EdgeInsets.fromLTRB(14, 8, 14, 12),
            decoration: const BoxDecoration(
              color: Color(0xFFFAFAFA),
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(15)),
            ),
            child: Row(
              children: [
                // Quick Project Assignment Button
                IconButton(
                  tooltip: 'توجيه لمركز تكلفة / مشروع',
                  icon: const Icon(Icons.apartment_rounded, color: Color(0xFF2563EB), size: 20),
                  onPressed: () => _handleAssignProject(tx),
                ),
                const Spacer(),

                // Reject Button
                if (!tx.isRejected) ...[
                  OutlinedButton.icon(
                    onPressed: () => _handleReject(tx),
                    icon: const Icon(Icons.close_rounded, size: 16, color: Color(0xFFE11D48)),
                    label: const Text('رفض', style: TextStyle(color: Color(0xFFE11D48), fontSize: 12, fontWeight: FontWeight.bold)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFFFECDD3)),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    ),
                  ),
                  const SizedBox(width: 8),
                ],

                // Approve Button
                if (!tx.isApproved)
                  FilledButton.icon(
                    onPressed: () => _handleApprove(tx),
                    icon: const Icon(Icons.check_rounded, size: 16),
                    label: const Text('اعتماد السند', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFF0F766E),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    ),
                  )
                else
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.verified_rounded, size: 16, color: Color(0xFF059669)),
                        SizedBox(width: 4),
                        Text('تم الاعتماد', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF059669))),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
