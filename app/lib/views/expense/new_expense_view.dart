import 'package:flutter/material.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/cache_service.dart';
import '../../core/utils/response_helpers.dart';
import '../../models/master_models.dart';
import '../../services/expense_service.dart';
import '../../services/master_data_service.dart';
import 'widgets/custom_dropdown.dart';

class NewExpenseView extends StatefulWidget {
  final ApiClient api;
  final VoidCallback onSaved;

  const NewExpenseView({super.key, required this.api, required this.onSaved});

  @override
  State<NewExpenseView> createState() => NewExpenseViewState();
}

class NewExpenseViewState extends State<NewExpenseView> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _notesController = TextEditingController();
  final _manualVoucherController = TextEditingController();
  final _paymentReferenceController = TextEditingController();
  final _invoiceNumberController = TextEditingController();
  final _invoiceAmountController = TextEditingController();

  late ExpenseService _expenseService;
  late MasterDataService _masterDataService;

  List<MasterItem> _beneficiaries = [];
  List<MasterItem> _categories = [];
  List<MasterItem> _projects = [];
  List<ProjectUnitItem> _projectUnits = [];
  List<MasterItem> _paymentMethods = [];

  int? _beneficiaryId;
  int? _categoryId;
  int? _projectId;
  int? _projectUnitId;
  int? _paymentMethodId;
  String _invoiceStatus = 'NOT_REQUIRED';
  bool _loadingUnits = false;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _expenseService = ExpenseService(widget.api);
    _masterDataService = MasterDataService(widget.api);
    reloadMasterData();
  }

  @override
  void dispose() {
    _amountController.dispose();
    _descriptionController.dispose();
    _notesController.dispose();
    _manualVoucherController.dispose();
    _paymentReferenceController.dispose();
    _invoiceNumberController.dispose();
    _invoiceAmountController.dispose();
    super.dispose();
  }

  Future<void> reloadMasterData() async {
    final cached = await CacheService.getCachedData('master_data_raw');
    if (cached != null && mounted) {
      _applyRawMasterData(cached);
    }

    try {
      final data = await _masterDataService.fetchMasterData();
      if (mounted) {
        setState(() {
          _beneficiaries = data['beneficiaries'] ?? [];
          _categories = data['categories'] ?? [];
          _projects = data['projects'] ?? [];
          _paymentMethods = data['paymentMethods'] ?? [];

          _beneficiaryId ??= _beneficiaries.firstOrNull?.id;
          _categoryId ??= _categories.firstOrNull?.id;
          _paymentMethodId ??= _paymentMethods.firstOrNull?.id;
        });
      }
    } catch (_) {}
  }

  void _applyRawMasterData(Map<String, dynamic> raw) {
    setState(() {
      _beneficiaries = asList(raw['beneficiaries']).map((e) => MasterItem(id: e['id'], name: e['name'] ?? '')).toList();
      _categories = asList(raw['categories']).map((e) => MasterItem(id: e['id'], name: e['name'] ?? '')).toList();
      _projects = asList(raw['projects']).map((e) => MasterItem(id: e['id'], name: e['projectName'] ?? e['name'] ?? '', subtitle: e['projectCode'])).toList();
      _paymentMethods = asList(raw['paymentMethods']).map((e) => MasterItem(id: e['id'], name: e['name'] ?? '')).toList();

      _beneficiaryId ??= _beneficiaries.firstOrNull?.id;
      _categoryId ??= _categories.firstOrNull?.id;
      _paymentMethodId ??= _paymentMethods.firstOrNull?.id;
    });
  }

  Future<void> _fetchUnitsForProject(int? projectId) async {
    if (projectId == null) {
      setState(() {
        _projectUnits = [];
        _projectUnitId = null;
      });
      return;
    }

    setState(() => _loadingUnits = true);
    try {
      final units = await _masterDataService.fetchUnitsForProject(projectId);
      if (mounted) {
        setState(() {
          _projectUnits = units;
          _projectUnitId = null;
          _loadingUnits = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loadingUnits = false);
    }
  }

  Future<void> _submitExpense() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);

    try {
      await _expenseService.createExpense(
        amount: double.parse(_amountController.text.trim()),
        description: _descriptionController.text.trim(),
        beneficiaryId: _beneficiaryId,
        categoryId: _categoryId,
        projectId: _projectId,
        projectUnitId: _projectUnitId,
        paymentMethodId: _paymentMethodId,
        paymentReference: _paymentReferenceController.text,
        manualVoucherNumber: _manualVoucherController.text,
        invoiceStatus: _invoiceStatus,
        invoiceNumber: _invoiceNumberController.text,
        invoiceAmount: double.tryParse(_invoiceAmountController.text.trim()),
        notes: _notesController.text,
      );

      _amountController.clear();
      _descriptionController.clear();
      _notesController.clear();
      _manualVoucherController.clear();
      _paymentReferenceController.clear();
      _invoiceNumberController.clear();
      _invoiceAmountController.clear();

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('تم تسجيل سند الصرف بنجاح! 🎉', style: TextStyle(fontWeight: FontWeight.bold)),
          backgroundColor: const Color(0xFF0F766E),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );

      widget.onSaved();
    } on OfflineSavedException catch (e) {
      _amountController.clear();
      _descriptionController.clear();
      _notesController.clear();
      _manualVoucherController.clear();
      _paymentReferenceController.clear();
      _invoiceNumberController.clear();
      _invoiceAmountController.clear();

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.message, style: const TextStyle(fontWeight: FontWeight.bold)),
          backgroundColor: const Color(0xFFD97706),
          duration: const Duration(seconds: 4),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      widget.onSaved();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString()),
          backgroundColor: const Color(0xFFE11D48),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.02),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Amount
              TextFormField(
                controller: _amountController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF0F766E), fontFamily: 'monospace'),
                decoration: const InputDecoration(
                  labelText: 'المبلغ (ريال سعودي) *',
                  prefixIcon: Icon(Icons.payments_rounded, color: Color(0xFF0F766E)),
                ),
                validator: (v) {
                  final n = double.tryParse(v?.trim() ?? '');
                  if (n == null || n <= 0) return 'أدخل مبلغاً صحيحاً أكبر من صفر';
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // 2. Description
              TextFormField(
                controller: _descriptionController,
                minLines: 2,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'البيان / وصف المصروف *',
                  prefixIcon: Icon(Icons.description_rounded, color: Color(0xFF0F766E)),
                ),
                validator: (v) => v == null || v.trim().length < 3 ? 'يرجى كتابة بيان واضح للمصروف' : null,
              ),
              const SizedBox(height: 16),

              // 3. Beneficiary & Category
              CustomDropdownField(
                label: 'المستفيد *',
                icon: Icons.person_rounded,
                value: _beneficiaryId,
                items: _beneficiaries,
                onChanged: (id) => setState(() => _beneficiaryId = id),
                validator: (v) => v == null ? 'اختر المستفيد' : null,
              ),
              const SizedBox(height: 16),

              CustomDropdownField(
                label: 'تصنيف المصروف *',
                icon: Icons.category_rounded,
                value: _categoryId,
                items: _categories,
                onChanged: (id) => setState(() => _categoryId = id),
                validator: (v) => v == null ? 'اختر تصنيف المصروف' : null,
              ),
              const SizedBox(height: 16),

              // 4. Project & Unit
              CustomDropdownField(
                label: 'المشروع (اختياري / حسب النظام)',
                icon: Icons.business_rounded,
                value: _projectId,
                items: _projects,
                includeNullOption: true,
                onChanged: (id) {
                  setState(() => _projectId = id);
                  _fetchUnitsForProject(id);
                },
              ),
              if (_projectId != null) ...[
                const SizedBox(height: 16),
                _loadingUnits
                    ? const Center(child: Padding(padding: EdgeInsets.all(8), child: CircularProgressIndicator()))
                    : DropdownButtonFormField<int?>(
                        initialValue: _projectUnitId,
                        isExpanded: true,
                        decoration: const InputDecoration(
                          labelText: 'الوحدة العقارية التابعة للمشروع',
                          prefixIcon: Icon(Icons.apartment_rounded, color: Color(0xFF0F766E)),
                        ),
                        items: [
                          const DropdownMenuItem<int?>(
                            value: null,
                            child: Text('— بدون تحديد وحدة —', style: TextStyle(color: Colors.grey)),
                          ),
                          ..._projectUnits.map((u) => DropdownMenuItem<int?>(
                                value: u.id,
                                child: Text('وحدة: ${u.unitNumber} (${u.unitType ?? "عام"})'),
                              )),
                        ],
                        onChanged: (id) => setState(() => _projectUnitId = id),
                      ),
              ],
              const SizedBox(height: 16),

              // 5. Payment Method & Reference
              CustomDropdownField(
                label: 'طريقة الدفع *',
                icon: Icons.account_balance_wallet_rounded,
                value: _paymentMethodId,
                items: _paymentMethods,
                onChanged: (id) => setState(() => _paymentMethodId = id),
                validator: (v) => v == null ? 'اختر طريقة الدفع' : null,
              ),
              const SizedBox(height: 16),

              TextFormField(
                controller: _paymentReferenceController,
                decoration: const InputDecoration(
                  labelText: 'مرجع الدفع (رقم الحوالة/الشيك)',
                  prefixIcon: Icon(Icons.receipt_rounded),
                ),
              ),
              const SizedBox(height: 16),

              TextFormField(
                controller: _manualVoucherController,
                decoration: const InputDecoration(
                  labelText: 'رقم السند الورقي / اليدوي',
                  prefixIcon: Icon(Icons.tag_rounded),
                ),
              ),
              const SizedBox(height: 16),

              // 6. Invoice Fields
              DropdownButtonFormField<String>(
                initialValue: _invoiceStatus,
                decoration: const InputDecoration(
                  labelText: 'حالة الفاتورة',
                  prefixIcon: Icon(Icons.receipt_long_rounded),
                ),
                items: const [
                  DropdownMenuItem(value: 'NOT_REQUIRED', child: Text('غير مطلوبة')),
                  DropdownMenuItem(value: 'ATTACHED', child: Text('مرفقة')),
                  DropdownMenuItem(value: 'PENDING', child: Text('معلقة')),
                  DropdownMenuItem(value: 'NOT_AVAILABLE', child: Text('غير متوفرة')),
                ],
                onChanged: (v) => setState(() => _invoiceStatus = v ?? 'NOT_REQUIRED'),
              ),
              if (_invoiceStatus == 'ATTACHED') ...[
                const SizedBox(height: 16),
                TextFormField(
                  controller: _invoiceNumberController,
                  decoration: const InputDecoration(
                    labelText: 'رقم الفاتورة الضريبية',
                    prefixIcon: Icon(Icons.numbers_rounded),
                  ),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _invoiceAmountController,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(
                    labelText: 'مبلغ الفاتورة',
                    prefixIcon: Icon(Icons.attach_money_rounded),
                  ),
                ),
              ],
              const SizedBox(height: 16),

              TextFormField(
                controller: _notesController,
                minLines: 2,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'ملاحظات إضافية',
                  prefixIcon: Icon(Icons.edit_note_rounded),
                ),
              ),
              const SizedBox(height: 24),

              FilledButton.icon(
                onPressed: _saving ? null : _submitExpense,
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFF0F766E),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 2,
                ),
                icon: _saving
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                    : const Icon(Icons.save_rounded),
                label: Text(
                  _saving ? 'جاري حفظ السند...' : 'حفظ وتسجيل المصروف',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
