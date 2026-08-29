'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { Save, AlertCircle, ArrowRight, Calendar, Paperclip, Building2, Receipt } from 'lucide-react';

export default function NewTransactionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [manualVoucherNumber, setManualVoucherNumber] = useState('');
  const [beneficiaryId, setBeneficiaryId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projectUnitId, setProjectUnitId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  // Invoice fields
  const [invoiceStatus, setInvoiceStatus] = useState('NOT_REQUIRED');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [isCustomBeneficiary, setIsCustomBeneficiary] = useState(false);
  const [customBeneficiaryName, setCustomBeneficiaryName] = useState('');

  // Quick Add Beneficiary Modal State
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
  const [newBeneficiaryName, setNewBeneficiaryName] = useState('');

  // Fetch system date & today's journal overview
  const { data: todayOverview } = useQuery({
    queryKey: ['today-overview'],
    queryFn: async () => (await api.get('/today')).data.data,
  });

  // Fetch Master Data
  const { data: beneficiaries = [] } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: async () => (await api.get('/beneficiaries')).data.data,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/expense-categories')).data.data,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', true],
    queryFn: async () => (await api.get('/projects', { params: { activeOnly: true } })).data.data,
  });

  // Fetch Units when Project is selected
  const { data: units = [] } = useQuery({
    queryKey: ['project-units', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await api.get(`/projects/${projectId}/units`);
      return res.data.data || [];
    },
    enabled: Boolean(projectId),
  });

  // Reset unit if project changed
  useEffect(() => {
    setProjectUnitId('');
  }, [projectId]);

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => (await api.get('/payment-methods')).data.data,
  });

  const { data: systemSettings = [] } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => (await api.get('/system-settings')).data.data,
  });

  const projectRequirementSetting = systemSettings.find((s: any) => s.key === 'expenses.project_requirement_mode');
  const isProjectRequired = projectRequirementSetting?.value === 'REQUIRED_ON_CREATE';
  const selectedPaymentMethod = paymentMethods.find((pm: any) => pm.id.toString() === paymentMethodId);

  // Auto-set invoice status when invoice number is filled
  useEffect(() => {
    if (invoiceNumber.trim() && invoiceStatus === 'NOT_REQUIRED') {
      setInvoiceStatus('PROVIDED');
    }
  }, [invoiceNumber]);

  // Create Transaction Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/today/transactions', payload);
      const createdTx = res.data.data;

      // If attachment is selected, upload it
      if (attachmentFile && createdTx?.id) {
        const formData = new FormData();
        formData.append('file', attachmentFile);
        formData.append('attachmentType', 'INVOICE');
        try {
          await api.post(`/expense-transactions/${createdTx.id}/attachments`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch (uploadErr) {
          console.error('Attachment upload failed:', uploadErr);
        }
      }

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-overview'] });
      queryClient.invalidateQueries({ queryKey: ['today-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      router.push('/dashboard');
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'تعذر إضافة المصروف. تحقق من البيانات المدخلة');
    },
  });

  // Create Beneficiary Mutation
  const createBeneficiaryMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await api.post('/beneficiaries', { name, beneficiaryType: 'COMPANY' });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      setBeneficiaryId(data.data.id.toString());
      setShowAddBeneficiary(false);
      setNewBeneficiaryName('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (isCustomBeneficiary) {
      if (!customBeneficiaryName.trim()) {
        setErrorMessage('يرجى كتابة اسم المستفيد');
        return;
      }
    } else {
      if (!beneficiaryId) {
        setErrorMessage('يرجى اختيار المستفيد من القائمة');
        return;
      }
    }

    if (!categoryId) {
      setErrorMessage('يرجى اختيار نوع المصروف');
      return;
    }

    if (!projectId) {
      setErrorMessage('يرجى اختيار المشروع (ربط المصروف بمشروع إجباري)');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage('المبلغ يجب أن يكون أكبر من صفر');
      return;
    }

    if (!paymentMethodId) {
      setErrorMessage('يرجى تحديد طريقة الدفع: كاش أو بنك');
      return;
    }

    if (selectedPaymentMethod?.requiresReference && !paymentReference.trim()) {
      setErrorMessage('يرجى إدخال مرجع الدفع أو رقم التحويل لطريقة الدفع المحددة');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('تفاصيل المصروف مطلوبة');
      return;
    }

    createMutation.mutate({
      manualVoucherNumber: manualVoucherNumber.trim() || null,
      beneficiaryId: isCustomBeneficiary ? null : parseInt(beneficiaryId, 10),
      beneficiaryName: isCustomBeneficiary ? customBeneficiaryName.trim() : null,
      categoryId: parseInt(categoryId, 10),
      projectId: projectId ? parseInt(projectId, 10) : null,
      projectUnitId: projectUnitId ? parseInt(projectUnitId, 10) : null,
      paymentMethodId: parseInt(paymentMethodId, 10),
      paymentReference: paymentReference.trim() || null,
      amount: parseFloat(amount),
      description: description.trim(),
      invoiceStatus,
      invoiceNumber: invoiceNumber.trim() || null,
      invoiceDate: invoiceDate || null,
      invoiceAmount: invoiceAmount ? parseFloat(invoiceAmount) : null,
      notes: notes.trim() || null,
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Banner - Automatic Journal Date Notice */}
        <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-700 dark:from-[#0b1329] dark:via-cyan-950 dark:to-[#070d19] border border-cyan-400/30 rounded-2xl p-5 text-white shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-cyan-200 dark:text-cyan-300 block font-black uppercase tracking-wider">تحديد اليومية التلقائية</span>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                يتم تسجيل العملية في يومية اليوم: {todayOverview?.systemDate || '...'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-black bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl text-white transition border border-white/10"
          >
            <ArrowRight className="w-4 h-4" />
            <span>رجوع</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-card space-y-6">
          {/* القسم الأول: البيانات الأساسية */}
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
              1. البيانات المالية والطرف المستفيد
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="form-label">رقم السند اليدوي الورقي</label>
                <input
                  type="text"
                  value={manualVoucherNumber}
                  onChange={(e) => setManualVoucherNumber(e.target.value)}
                  placeholder="إجباري عند وجود سند ورقي (مثال: 125)"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="form-label mb-0">المستفيد *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomBeneficiary(!isCustomBeneficiary);
                      setBeneficiaryId('');
                      setCustomBeneficiaryName('');
                    }}
                    className="text-xs text-cyan-600 dark:text-cyan-400 font-black flex items-center gap-1 hover:underline"
                  >
                    {isCustomBeneficiary ? 'اختر من القائمة' : '+ كتابة اسم جديد'}
                  </button>
                </div>

                {isCustomBeneficiary ? (
                  <input
                    type="text"
                    required
                    value={customBeneficiaryName}
                    onChange={(e) => setCustomBeneficiaryName(e.target.value)}
                    placeholder="اكتب اسم المستفيد/الشركة مباشرة..."
                  />
                ) : (
                  <select
                    required
                    value={beneficiaryId}
                    onChange={(e) => setBeneficiaryId(e.target.value)}
                  >
                    <option value="">اختر المستفيد...</option>
                    {beneficiaries.map((b: any) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="form-label">نوع المصروف (التصنيف) *</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">اختر تصنيف المصروف...</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">المبلغ (ر.س) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="!text-base !font-black text-cyan-600 dark:text-cyan-400 font-mono-num"
                />
              </div>

              <div>
                <label className="form-label">طريقة الدفع *</label>
                <select
                  required
                  value={paymentMethodId}
                  onChange={(e) => {
                    setPaymentMethodId(e.target.value);
                    setPaymentReference('');
                  }}
                >
                  <option value="">اختر طريقة الدفع...</option>
                  {paymentMethods.map((pm: any) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPaymentMethod?.requiresReference && (
                <div>
                  <label className="form-label">مرجع الدفع / رقم التحويل *</label>
                  <input
                    type="text"
                    required
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="مثال: رقم الحوالة أو العملية البنكية"
                  />
                </div>
              )}
            </div>
          </div>

          {/* القسم الثاني: ربط المشروع والوحدة العقارية */}
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-500" />
              <span>2. ربط المشروع والوحدة العقارية</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="form-label">
                  المشروع * (إجباري)
                </label>
                <select
                  required
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="!border-cyan-400"
                >
                  <option value="">اختر المشروع (إجباري)...</option>
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.projectName} (كود: {p.projectCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">الوحدة العقارية (اختياري)</label>
                <select
                  value={projectUnitId}
                  onChange={(e) => setProjectUnitId(e.target.value)}
                  disabled={!projectId || units.length === 0}
                >
                  <option value="">
                    {!projectId ? 'اختر المشروع أولاً...' : units.length === 0 ? 'لا توجد وحدات مسجلة للمشروع' : 'اختر الوحدة العقارية...'}
                  </option>
                  {units.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      وحدة {u.unitNumber} {u.unitType ? `(${u.unitType})` : ''} {u.buildingNumber ? `- مبنى ${u.buildingNumber}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* القسم الثالث: الفاتورة والمرفقات */}
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-cyan-500" />
              <span>3. بيانات الفاتورة والمرفقات</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="form-label">حالة الفاتورة</label>
                <select
                  value={invoiceStatus}
                  onChange={(e) => setInvoiceStatus(e.target.value)}
                >
                  <option value="NOT_REQUIRED">غير مطلوبة (مصروف عام)</option>
                  <option value="PROVIDED">مرفقة مع السند</option>
                  <option value="PENDING">معلقة (سيتم إحضارها لاحقاً)</option>
                  <option value="NOT_AVAILABLE">غير متوفرة</option>
                </select>
              </div>

              <div>
                <label className="form-label">رقم الفاتورة</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="مثال: INV-2026-001"
                />
              </div>

              <div>
                <label className="form-label">تاريخ الفاتورة</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">مبلغ الفاتورة (ر.س)</label>
                <input
                  type="number"
                  step="0.01"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="form-label flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-cyan-500" />
                  <span>رفع ملف الفاتورة / السند المرفق (PDF أو صورة JPG/PNG)</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/jpg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAttachmentFile(e.target.files[0]);
                    } else {
                      setAttachmentFile(null);
                    }
                  }}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-cyan-500/10 file:text-cyan-600 dark:file:text-cyan-400 hover:file:bg-cyan-500/20 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* القسم الرابع: البيان والملاحظات */}
          <div>
            <div className="space-y-4">
              <div>
                <label className="form-label">التفاصيل / بيان المصروف *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مثال: شراء مواد عزل لمشروع الملقا"
                />
              </div>

              <div>
                <label className="form-label">ملاحظات إضافية</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي توضيح يساعد المحاسب عند وجود أمر مبهم أو استثناء..."
                />
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary-cancel"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-cyan-primary"
            >
              <Save className="w-5 h-5" />
              <span>{createMutation.isPending ? 'جاري التسجيل والرفع...' : 'حفظ المصروف في يومية اليوم'}</span>
            </button>
          </div>
        </form>

        {/* Quick Add Beneficiary Modal */}
        {showAddBeneficiary && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">إضافة مستفيد جديد</h3>
              <input
                type="text"
                value={newBeneficiaryName}
                onChange={(e) => setNewBeneficiaryName(e.target.value)}
                placeholder="اسم المستفيد الجديد..."
              />

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (newBeneficiaryName.trim()) {
                      createBeneficiaryMutation.mutate(newBeneficiaryName.trim());
                    }
                  }}
                  disabled={createBeneficiaryMutation.isPending}
                  className="btn-cyan-primary flex-1"
                >
                  إضافة وإختيار
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBeneficiary(false)}
                  className="btn-secondary-cancel"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
