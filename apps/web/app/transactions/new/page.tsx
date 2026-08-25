'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { Save, AlertCircle, ArrowRight, Calendar, PlusCircle } from 'lucide-react';

export default function NewTransactionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [manualVoucherNumber, setManualVoucherNumber] = useState('');
  const [beneficiaryId, setBeneficiaryId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
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

  // Create Transaction Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/today/transactions', payload);
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

    if (isProjectRequired && !projectId) {
      setErrorMessage('اختيار المشروع إجباري حسب إعدادات النظام الحالية');
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
      paymentMethodId: parseInt(paymentMethodId, 10),
      paymentReference: paymentReference.trim() || null,
      amount: parseFloat(amount),
      description: description.trim(),
      invoiceNumber: invoiceNumber.trim() || null,
      notes: notes.trim() || null,
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
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

        <form onSubmit={handleSubmit} className="form-card">
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
              <label className="form-label">
                المشروع {isProjectRequired ? '*' : '(اختياري)'}
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className={isProjectRequired ? '!border-cyan-400' : ''}
              >
                <option value="">{isProjectRequired ? 'اختر المشروع (إجباري حالياً)...' : 'بدون مشروع (اختياري)...'}</option>
                {projects.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName} (كود: {p.projectCode})
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

            <div>
              <label className="form-label">رقم الفاتورة (إن وجدت)</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="مثال: INV-9912"
              />
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

            <div className="md:col-span-2">
              <label className="form-label">التفاصيل / بيان المصروف *</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مثال: شراء مواد عزل لمشروع الملقا"
              />
            </div>

            <div className="md:col-span-2">
              <label className="form-label">ملاحظات إضافية</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي توضيح يساعد المحاسب عند وجود أمر مبهم أو استثناء..."
              />
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
              <span>{createMutation.isPending ? 'جاري التسجيل...' : 'حفظ المصروف في يومية اليوم'}</span>
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
