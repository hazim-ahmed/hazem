'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import { Plus, Calendar, DollarSign, Receipt, Edit, Trash2, ArrowUpRight, CheckCircle2, Lock, Unlock } from 'lucide-react';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [editingTx, setEditingTx] = useState<any>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editVoucher, setEditVoucher] = useState('');

  // Fetch today's summary & auto journal status
  const { data: todaySummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['today-overview'],
    queryFn: async () => {
      const res = await api.get('/today');
      return res.data?.data || null;
    },
  });

  // Fetch today's transactions
  const { data: transactionsRaw, isLoading: txLoading } = useQuery({
    queryKey: ['today-transactions'],
    queryFn: async () => {
      const res = await api.get('/today/transactions');
      return res.data?.data || [];
    },
  });

  const transactions = Array.isArray(transactionsRaw) ? transactionsRaw : [];

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
      const res = await api.patch(`/today/transactions/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-overview'] });
      queryClient.invalidateQueries({ queryKey: ['today-transactions'] });
      setEditingTx(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'تعذر تعديل المصروف');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/today/transactions/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-overview'] });
      queryClient.invalidateQueries({ queryKey: ['today-transactions'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'تعذر حذف المصروف');
    },
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    updateMutation.mutate({
      id: editingTx.id,
      payload: {
        amount: parseFloat(editAmount),
        description: editDescription,
        manualVoucherNumber: editVoucher || null,
      },
    });
  };

  // Add Expense Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCustomBeneficiary, setIsCustomBeneficiary] = useState(false);
  const [newBeneficiaryName, setNewBeneficiaryName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBeneficiaryId, setNewBeneficiaryId] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newVoucher, setNewVoucher] = useState('');
  const [newInvoice, setNewInvoice] = useState('');
  const [addError, setAddError] = useState('');

  // Master data for quick add
  const { data: beneficiaries = [] } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: async () => (await api.get('/beneficiaries')).data?.data || [],
    enabled: isAddModalOpen,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/expense-categories')).data?.data || [],
    enabled: isAddModalOpen,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', true],
    queryFn: async () => (await api.get('/projects', { params: { activeOnly: true } })).data?.data || [],
    enabled: isAddModalOpen,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/today/transactions', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-overview'] });
      queryClient.invalidateQueries({ queryKey: ['today-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      setIsAddModalOpen(false);
      setNewAmount('');
      setNewDescription('');
      setNewBeneficiaryId('');
      setNewBeneficiaryName('');
      setIsCustomBeneficiary(false);
      setNewCategoryId('');
      setNewProjectId('');
      setNewVoucher('');
      setNewInvoice('');
      setAddError('');
    },
    onError: (err: any) => {
      setAddError(err.response?.data?.message || 'تعذر إضافة المصروف');
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    if (isCustomBeneficiary) {
      if (!newBeneficiaryName.trim()) {
        setAddError('يرجى إدخال اسم المستفيد');
        return;
      }
    } else {
      if (!newBeneficiaryId) {
        setAddError('يرجى اختيار المستفيد من القائمة');
        return;
      }
    }

    if (!newCategoryId) {
      setAddError('يرجى اختيار نوع المصروف');
      return;
    }
    if (!newAmount || parseFloat(newAmount) <= 0) {
      setAddError('يرجى إدخال مبلغ أكبر من صفر');
      return;
    }
    if (!newDescription.trim()) {
      setAddError('يرجى إدخال البيان / التفاصيل');
      return;
    }

    createMutation.mutate({
      beneficiaryId: isCustomBeneficiary ? null : parseInt(newBeneficiaryId, 10),
      beneficiaryName: isCustomBeneficiary ? newBeneficiaryName.trim() : null,
      categoryId: parseInt(newCategoryId, 10),
      projectId: newProjectId ? parseInt(newProjectId, 10) : null,
      amount: parseFloat(newAmount),
      description: newDescription.trim(),
      manualVoucherNumber: newVoucher.trim() || null,
      invoiceNumber: newInvoice.trim() || null,
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Simple & Clean Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>{todaySummary?.systemDate || 'اليوم'}</span>
              <span>•</span>
              <span className="font-mono">اليومية: {todaySummary?.journalNumber || '...'}</span>
              <span>•</span>
              <span className={`inline-flex items-center gap-1 font-bold ${todaySummary?.status === 'OPEN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {todaySummary?.status === 'OPEN' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {todaySummary?.status === 'OPEN' ? 'مفتوحة' : 'مغلقة'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              لوحة المصروفات اليومية
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm text-sm transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>إضافة مصروف</span>
            </button>

            <Link
              href="/transactions/new"
              className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
            >
              <span>النموذج الكامل</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
            </Link>
          </div>
        </div>

        {/* 2 Clean & Focused Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي مصروفات اليوم</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono-num">
                  {(todaySummary?.totalAmount || 0).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ر.س</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">عدد العمليات اليوم</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono-num">
                  {todaySummary?.transactionsCount || 0}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">سند</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Clean Transactions Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              مصروفات اليوم
            </h2>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              {transactions.length} عمليات
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-xs font-bold border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3 px-4">رقم السند</th>
                  <th className="py-3 px-4">المستفيد</th>
                  <th className="py-3 px-4">البيان</th>
                  <th className="py-3 px-4">المشروع</th>
                  <th className="py-3 px-4">المبلغ</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                      لا توجد مصروفات مسجلة اليوم حتى الآن.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                        {tx.manualVoucherNumber || '-'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {tx.beneficiary?.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-xs max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4">
                        {tx.project ? (
                          <span className="inline-block bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-xs px-2.5 py-0.5 rounded-lg font-medium border border-cyan-200/50 dark:border-cyan-800/50">
                            {tx.project.projectName}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">عام</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-slate-900 dark:text-white text-sm">
                        {Number(tx.amount).toLocaleString()} <span className="text-[10px] font-normal text-slate-400">ر.س</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingTx(tx);
                              setEditAmount(tx.amount.toString());
                              setEditDescription(tx.description);
                              setEditVoucher(tx.manualVoucherNumber || '');
                            }}
                            className="p-1.5 text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
                                deleteMutation.mutate(tx.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Simple & Clean Quick Add Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">إضافة مصروف جديد</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {addError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs rounded-xl font-semibold">
                  {addError}
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">المستفيد *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomBeneficiary(!isCustomBeneficiary);
                          setNewBeneficiaryId('');
                          setNewBeneficiaryName('');
                        }}
                        className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
                      >
                        {isCustomBeneficiary ? 'اختر من القائمة' : '+ اسم جديد'}
                      </button>
                    </div>

                    {isCustomBeneficiary ? (
                      <input
                        type="text"
                        required
                        value={newBeneficiaryName}
                        onChange={(e) => setNewBeneficiaryName(e.target.value)}
                        placeholder="اسم المستفيد..."
                        className="w-full p-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-cyan-500 outline-none"
                      />
                    ) : (
                      <select
                        required
                        value={newBeneficiaryId}
                        onChange={(e) => setNewBeneficiaryId(e.target.value)}
                        className="w-full p-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-cyan-500 outline-none"
                      >
                        <option value="">اختر المستفيد...</option>
                        {beneficiaries.map((b: any) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نوع المصروف *</label>
                    <select
                      required
                      value={newCategoryId}
                      onChange={(e) => setNewCategoryId(e.target.value)}
                      className="w-full p-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-cyan-500 outline-none"
                    >
                      <option value="">اختر نوع المصروف...</option>
                      {categories.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المبلغ (ر.س) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-2.5 text-xs font-bold font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المشروع (اختياري)</label>
                    <select
                      value={newProjectId}
                      onChange={(e) => setNewProjectId(e.target.value)}
                      className="w-full p-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-cyan-500 outline-none"
                    >
                      <option value="">عام (بدون مشروع)</option>
                      {projects.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.projectName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">البيان / التفاصيل *</label>
                  <input
                    type="text"
                    required
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="وصف المصروف..."
                    className="w-full p-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم السند اليدوي (اختياري)</label>
                    <input
                      type="text"
                      value={newVoucher}
                      onChange={(e) => setNewVoucher(e.target.value)}
                      placeholder="مثال: 1001"
                      className="w-full p-2.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الفاتورة (اختياري)</label>
                    <input
                      type="text"
                      value={newInvoice}
                      onChange={(e) => setNewInvoice(e.target.value)}
                      placeholder="مثال: INV-99"
                      className="w-full p-2.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white font-bold rounded-xl text-xs transition"
                  >
                    {createMutation.isPending ? 'جاري الحفظ...' : 'حفظ المصروف'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Simple Edit Modal */}
        {editingTx && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">تعديل المصروف</h3>
              <form onSubmit={handleEditSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المبلغ (ر.س) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full p-2.5 text-xs font-bold font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">البيان *</label>
                  <input
                    type="text"
                    required
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full p-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم السند اليدوي</label>
                  <input
                    type="text"
                    value={editVoucher}
                    onChange={(e) => setEditVoucher(e.target.value)}
                    className="w-full p-2.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white font-bold rounded-xl text-xs transition"
                  >
                    حفظ التعديلات
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingTx(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
