'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { downloadFile } from '@/lib/download';
import Link from 'next/link';
import {
  Plus,
  Calendar,
  DollarSign,
  ListOrdered,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  FileSpreadsheet,
  Printer,
  Loader2,
  Paperclip,
  CheckCheck,
  Ban,
  Download,
  UploadCloud,
  X,
  Building2,
  User,
} from 'lucide-react';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  
  // Transaction Editing State
  const [editingTx, setEditingTx] = useState<any>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editVoucher, setEditVoucher] = useState('');

  // Transaction Reject Modal State
  const [rejectingTx, setRejectingTx] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Attachments Modal State
  const [attachmentModalTx, setAttachmentModalTx] = useState<any>(null);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);

  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Fetch today's summary & auto journal status
  const { data: todaySummary } = useQuery({
    queryKey: ['today-overview'],
    queryFn: async () => {
      const res = await api.get('/today');
      return res.data?.data || null;
    },
  });

  // Fetch today's transactions
  const { data: transactionsRaw } = useQuery({
    queryKey: ['today-transactions'],
    queryFn: async () => {
      const res = await api.get('/today/transactions');
      return res.data?.data || [];
    },
  });

  const transactions = Array.isArray(transactionsRaw) ? transactionsRaw : [];

  // Fetch attachments for selected transaction
  const { data: currentAttachments = [], refetch: refetchAttachments } = useQuery({
    queryKey: ['transaction-attachments', attachmentModalTx?.id],
    queryFn: async () => {
      if (!attachmentModalTx?.id) return [];
      const res = await api.get(`/expense-transactions/${attachmentModalTx.id}/attachments`);
      return res.data?.data || [];
    },
    enabled: Boolean(attachmentModalTx?.id),
  });

  // Exports
  const handleExportTodayExcel = async () => {
    if (!todaySummary?.journalId && !todaySummary?.id) return;
    const jId = todaySummary.journalId || todaySummary.id;
    try {
      setIsExportingExcel(true);
      await downloadFile(`/journals/${jId}/export/excel`, `Daily_Journal_${todaySummary.journalNumber || 'Today'}.xlsx`);
    } catch {
      alert('فشل في تصدير ملف الإكسل');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportTodayPDF = async () => {
    if (!todaySummary?.journalId && !todaySummary?.id) return;
    const jId = todaySummary.journalId || todaySummary.id;
    try {
      setIsExportingPdf(true);
      await downloadFile(`/journals/${jId}/export/pdf`, `Daily_Journal_${todaySummary.journalNumber || 'Today'}.pdf`);
    } catch {
      alert('فشل في تصدير أو طباعة ملف الـ PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Mutations
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

  // Approve Transaction Mutation
  const approveTxMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.post(`/expense-transactions/${id}/approve`, { comments: 'اعتماد محاسبي' });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-overview'] });
      queryClient.invalidateQueries({ queryKey: ['today-transactions'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'تعذر اعتماد السند');
    },
  });

  // Reject Transaction Mutation
  const rejectTxMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const res = await api.post(`/expense-transactions/${id}/reject`, { reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-overview'] });
      queryClient.invalidateQueries({ queryKey: ['today-transactions'] });
      setRejectingTx(null);
      setRejectionReason('');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'تعذر رفض السند');
    },
  });

  // Approve Full Journal Mutation
  const approveJournalMutation = useMutation({
    mutationFn: async (journalId: number) => {
      const res = await api.post(`/journals/${journalId}/approve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-overview'] });
      queryClient.invalidateQueries({ queryKey: ['today-transactions'] });
      alert('تم اعتماد اليومية بالكامل بنجاح!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'تعذر اعتماد اليومية');
    },
  });

  // Upload Attachment Mutation
  const uploadAttachmentMutation = useMutation({
    mutationFn: async ({ transactionId, file }: { transactionId: number; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('attachmentType', 'INVOICE');
      const res = await api.post(`/expense-transactions/${transactionId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      refetchAttachments();
      setUploadingFile(null);
      queryClient.invalidateQueries({ queryKey: ['today-transactions'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'تعذر رفع المرفق');
    },
  });

  // Delete Attachment Mutation
  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: number) => {
      const res = await api.delete(`/expense-transactions/attachments/${attachmentId}`);
      return res.data;
    },
    onSuccess: () => {
      refetchAttachments();
      queryClient.invalidateQueries({ queryKey: ['today-transactions'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'تعذر حذف المرفق');
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

  const currentJournalId = todaySummary?.journalId || todaySummary?.id;

  return (
    <DashboardLayout>
      <div className="space-y-5 sm:space-y-6 pb-12">
        {/* Bento Hero Banner */}
        <div className="animate-fade-in-up relative overflow-hidden bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-700 dark:from-slate-950 dark:via-cyan-950 dark:to-slate-900 rounded-2xl sm:rounded-[28px] p-5 sm:p-7 text-white shadow-xl dark:shadow-2xl border border-cyan-400/30 dark:border-cyan-500/20">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/20 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 bg-white/20 dark:bg-cyan-500/15 backdrop-blur-md w-fit px-3.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-black text-white dark:text-cyan-300 border border-white/30 dark:border-cyan-500/30">
                <Calendar className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-300 dark:text-amber-400" />
                <span>توقيع الخادم السعودي: {todaySummary?.systemDate || '...'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-snug">
                يومية اليوم ({todaySummary?.journalNumber || '...'})
              </h1>
              <p className="text-xs sm:text-sm text-cyan-50 dark:text-slate-300 font-bold max-w-xl">
                إدارة وسجل مصروفات اليومية الفورية، تتبع السندات والفواتير مع مسار الاعتماد والمرفقات.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="bg-black/20 dark:bg-slate-900/60 backdrop-blur-md px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-white/20 dark:border-slate-700/80 text-center shadow-inner">
                <span className="text-[10px] sm:text-[11px] text-cyan-100 dark:text-slate-400 block font-extrabold uppercase">حالة اليومية</span>
                <span className={`font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 mt-0.5 ${
                  todaySummary?.status === 'APPROVED'
                    ? 'text-cyan-300 dark:text-cyan-400'
                    : todaySummary?.status === 'OPEN'
                    ? 'text-emerald-300 dark:text-emerald-400'
                    : 'text-rose-300 dark:text-rose-400'
                }`}>
                  {todaySummary?.status === 'APPROVED' ? (
                    <CheckCheck className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  ) : todaySummary?.status === 'OPEN' ? (
                    <Unlock className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  ) : (
                    <Lock className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  )}
                  <span>
                    {todaySummary?.status === 'APPROVED'
                      ? 'يومية معتمدة رسمياً'
                      : todaySummary?.status === 'OPEN'
                      ? 'يومية مفتوحة (OPEN)'
                      : 'يومية مغلقة (CLOSED)'}
                  </span>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                {currentJournalId && todaySummary?.status !== 'APPROVED' && (
                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من رغبتك في اعتماد اليومية وسنداتها بالكامل؟')) {
                        approveJournalMutation.mutate(currentJournalId);
                      }
                    }}
                    disabled={approveJournalMutation.isPending}
                    className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black px-4 py-3 sm:py-3.5 rounded-2xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-xs sm:text-sm"
                  >
                    <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span>{approveJournalMutation.isPending ? 'جاري الاعتماد...' : 'اعتماد اليومية'}</span>
                  </button>
                )}

                <Link
                  href="/transactions/new"
                  className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-6 py-3 sm:py-3.5 rounded-2xl shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-xs sm:text-sm"
                >
                  <Plus className="w-4 sm:w-5 h-4 sm:h-5 stroke-[3]" />
                  <span>تسجيل مصروف جديد</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="fintech-card fintech-card-hover p-5 sm:p-6 flex items-center justify-between">
            <div className="space-y-1 sm:space-y-1.5">
              <span className="text-[11px] sm:text-xs font-black text-slate-600 dark:text-cyan-300 uppercase tracking-widest block">إجمالي مصروفات يومية اليوم</span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-cyan-600 dark:text-cyan-400 font-mono-num tracking-tight">
                {(todaySummary?.totalAmount || 0).toLocaleString()} <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-300">ر.س</span>
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-cyan-700 dark:text-cyan-300 font-bold pt-1">
                <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-ping" />
                <span>يُحدث فورياً مع كل سند إدخال</span>
              </div>
            </div>
            <div className="w-14 sm:w-16 h-14 sm:h-16 bg-cyan-500 dark:bg-gradient-to-tr dark:from-cyan-500 dark:via-teal-500 dark:to-blue-600 rounded-2xl text-white dark:text-slate-950 flex items-center justify-center shadow-md dark:shadow-lg glow-cyan shrink-0 border border-cyan-400/30">
              <DollarSign className="w-7 sm:w-8 h-7 sm:h-8 stroke-[2.5]" />
            </div>
          </div>

          <div className="fintech-card fintech-card-hover p-5 sm:p-6 flex items-center justify-between">
            <div className="space-y-1 sm:space-y-1.5">
              <span className="text-[11px] sm:text-xs font-black text-slate-600 dark:text-blue-300 uppercase tracking-widest block">عدد عمليات سندات اليوم</span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white font-mono-num tracking-tight">
                {todaySummary?.transactionsCount || 0} <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-300">سندات</span>
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-blue-700 dark:text-blue-300 font-bold pt-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                <span>مدرجة في سجل اليومية الحالي</span>
              </div>
            </div>
            <div className="w-14 sm:w-16 h-14 sm:h-16 bg-blue-600 dark:bg-gradient-to-tr dark:from-blue-600 dark:via-indigo-600 dark:to-cyan-500 rounded-2xl text-white flex items-center justify-center shadow-md dark:shadow-lg glow-blue shrink-0 border border-blue-400/30">
              <ListOrdered className="w-7 sm:w-8 h-7 sm:h-8" />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="fintech-card p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">جدول مصروفات وسندات اليوم الحية</h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-200 mt-1">سجل مقيد لكافة السندات المالية الصادرة مع دورة الاعتماد والمرفقات</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleExportTodayExcel}
                disabled={isExportingExcel || !todaySummary}
                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold px-3 py-1.5 rounded-xl text-xs border border-emerald-200 dark:border-emerald-800/60 transition disabled:opacity-50"
              >
                {isExportingExcel ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                <span>تصدير Excel</span>
              </button>

              <button
                onClick={handleExportTodayPDF}
                disabled={isExportingPdf || !todaySummary}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs border border-slate-700 transition disabled:opacity-50"
              >
                {isExportingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
                <span>طباعة PDF</span>
              </button>

              <span className="text-xs font-black bg-cyan-50 text-cyan-800 border border-cyan-200 dark:bg-slate-900 dark:text-cyan-400 dark:border-cyan-500/30 px-3.5 py-1.5 rounded-xl font-mono-num">
                سجل اليومية: {todaySummary?.journalNumber || '...'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 shadow-xs">
            <table className="w-full text-right border-collapse text-sm min-w-[1200px]">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  <th className="p-4 whitespace-nowrap">المرجع / السند اليدوي</th>
                  <th className="p-4 whitespace-nowrap">الحالة</th>
                  <th className="p-4 whitespace-nowrap">المستفيد</th>
                  <th className="p-4 min-w-[180px]">التفاصيل والبيان</th>
                  <th className="p-4 whitespace-nowrap">المشروع والوحدة</th>
                  <th className="p-4 whitespace-nowrap">طريقة الدفع</th>
                  <th className="p-4 whitespace-nowrap">الفاتورة والمرفقات</th>
                  <th className="p-4 whitespace-nowrap">المبلغ (ر.س)</th>
                  <th className="p-4 text-center whitespace-nowrap">الإجراءات والاعتماد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-slate-500 dark:text-slate-300 font-bold">
                      لم يتم إدراج أي مصروفات في يومية اليوم حتى الآن. اضغط على "تسجيل مصروف جديد" للبدء.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/90 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-mono-num font-black text-cyan-700 dark:text-cyan-400 block text-xs">
                          {tx.systemReference}
                        </span>
                        {tx.manualVoucherNumber && (
                          <span className="font-mono-num text-[11px] text-amber-600 dark:text-amber-400 block mt-0.5">
                            يدوي: #{tx.manualVoucherNumber}
                          </span>
                        )}
                        {tx.creator && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                            <User className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                            {tx.creator.fullName || tx.creator.username}
                          </span>
                        )}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {tx.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-xl text-xs font-black border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle className="w-3.5 h-3.5" />
                            معتمد
                          </span>
                        ) : tx.status === 'REJECTED' ? (
                          <span
                            className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-xl text-xs font-black border border-rose-200 dark:border-rose-800 cursor-help"
                            title={tx.rejectionReason ? `سبب الرفض: ${tx.rejectionReason}` : 'مرفوض'}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            مرفوض
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-xl text-xs font-black border border-amber-200 dark:border-amber-800">
                            <Clock className="w-3.5 h-3.5" />
                            قيد المراجعة
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {tx.beneficiary?.name}
                      </td>

                      <td className="p-4 text-slate-700 dark:text-slate-200 font-semibold">
                        {tx.description}
                        {tx.rejectionReason && tx.status === 'REJECTED' && (
                          <span className="block text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-1">
                            سبب الرفض: {tx.rejectionReason}
                          </span>
                        )}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {tx.project ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1.5 bg-cyan-50 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 px-3 py-1 rounded-xl text-xs font-black border border-cyan-200 dark:border-cyan-800/60 shadow-xs">
                              <Building2 className="w-3 h-3 text-cyan-500" />
                              {tx.project.projectName}
                            </span>
                            {tx.projectUnit && (
                              <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 pr-2">
                                وحدة: {tx.projectUnit.unitNumber} {tx.projectUnit.unitType ? `(${tx.projectUnit.unitType})` : ''}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">مصروف عام/نثري</span>
                        )}
                      </td>

                      <td className="p-4 text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                          {tx.paymentMethod?.name || '-'}
                        </span>
                        {tx.paymentReference && (
                          <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-mono-num mt-1">
                            {tx.paymentReference}
                          </span>
                        )}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                            tx.invoiceStatus === 'PROVIDED'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : tx.invoiceStatus === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {tx.invoiceStatus === 'PROVIDED'
                              ? 'فاتورة مرفقة'
                              : tx.invoiceStatus === 'PENDING'
                              ? 'فاتورة معلقة'
                              : tx.invoiceNumber
                              ? tx.invoiceNumber
                              : 'بدون فاتورة'}
                          </span>

                          <button
                            onClick={() => setAttachmentModalTx(tx)}
                            className="p-1.5 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/80 dark:hover:bg-cyan-900 text-cyan-700 dark:text-cyan-300 rounded-lg text-xs font-bold transition border border-cyan-200 dark:border-cyan-800/60"
                            title="المرفقات"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="p-4 font-mono-num font-black text-cyan-700 dark:text-cyan-400 text-base whitespace-nowrap">
                        {Number(tx.amount).toLocaleString()} ر.س
                      </td>

                      <td className="p-4 flex items-center justify-center gap-1.5 whitespace-nowrap">
                        {tx.status !== 'APPROVED' && (
                          <button
                            onClick={() => approveTxMutation.mutate(tx.id)}
                            disabled={approveTxMutation.isPending}
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold transition border border-emerald-200 dark:border-emerald-800"
                            title="اعتماد السند"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {tx.status !== 'REJECTED' && (
                          <button
                            onClick={() => {
                              setRejectingTx(tx);
                              setRejectionReason('');
                            }}
                            className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold transition border border-rose-200 dark:border-rose-800"
                            title="رفض السند"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setEditingTx(tx);
                            setEditAmount(tx.amount.toString());
                            setEditDescription(tx.description);
                            setEditVoucher(tx.manualVoucherNumber || '');
                          }}
                          className="p-2 bg-cyan-50 hover:bg-cyan-100 dark:bg-blue-950/80 dark:hover:bg-blue-900 text-cyan-700 dark:text-blue-300 rounded-xl text-xs font-bold transition border border-cyan-200 dark:border-blue-800/60"
                          title="تعديل المصروف"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
                              deleteMutation.mutate(tx.id);
                            }
                          }}
                          className="p-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-bold transition border border-rose-900/60"
                          title="حذف المصروف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {editingTx && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
              <h3 className="font-black text-xl text-slate-900 dark:text-white">تعديل مصروف اليوم</h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">المبلغ (ر.س) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-950 text-sm font-black text-cyan-700 dark:text-cyan-400 font-mono-num text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">التفاصيل *</label>
                  <input
                    type="text"
                    required
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-950 text-sm font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">رقم السند اليدوي</label>
                  <input
                    type="text"
                    value={editVoucher}
                    onChange={(e) => setEditVoucher(e.target.value)}
                    className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-950 text-sm font-bold text-slate-900 dark:text-white font-mono-num"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-black rounded-2xl text-sm transition shadow-md dark:shadow-blue-600/30"
                  >
                    حفظ التعديلات
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingTx(null)}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-sm transition border border-slate-200 dark:border-slate-700"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {rejectingTx && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
              <h3 className="font-black text-xl text-rose-600 dark:text-rose-400">رفض سند الصرف</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                سند رقم: {rejectingTx.systemReference} ({rejectingTx.beneficiary?.name})
              </p>
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                  سبب الرفض المالي *
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="مثال: عدم وضوح الفاتورة، أو عدم مطابقة البند للمشروع..."
                  className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-950 text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!rejectionReason.trim()) {
                      alert('يرجى كتابة سبب الرفض');
                      return;
                    }
                    rejectTxMutation.mutate({ id: rejectingTx.id, reason: rejectionReason.trim() });
                  }}
                  disabled={rejectTxMutation.isPending}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl text-sm transition"
                >
                  {rejectTxMutation.isPending ? 'جاري الرفض...' : 'تأكيد الرفض'}
                </button>

                <button
                  type="button"
                  onClick={() => setRejectingTx(null)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-sm transition"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Attachments Modal */}
        {attachmentModalTx && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-cyan-500" />
                    <span>مرفقات سند الصرف ({attachmentModalTx.systemReference})</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                    المستفيد: {attachmentModalTx.beneficiary?.name} | المبلغ: {Number(attachmentModalTx.amount).toLocaleString()} ر.س
                  </p>
                </div>
                <button
                  onClick={() => setAttachmentModalTx(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Upload New Attachment */}
              <div className="p-4 bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/50 rounded-2xl space-y-3">
                <label className="text-xs font-black text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4" />
                  <span>رفع مرفق جديد (فاتورة / مستند)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/jpg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadingFile(e.target.files[0]);
                      }
                    }}
                    className="file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-cyan-500 file:text-white text-xs text-slate-600 dark:text-slate-300"
                  />
                  <button
                    type="button"
                    disabled={!uploadingFile || uploadAttachmentMutation.isPending}
                    onClick={() => {
                      if (uploadingFile) {
                        uploadAttachmentMutation.mutate({
                          transactionId: attachmentModalTx.id,
                          file: uploadingFile,
                        });
                      }
                    }}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-black rounded-xl text-xs disabled:opacity-50 transition"
                  >
                    {uploadAttachmentMutation.isPending ? 'جاري الرفع...' : 'رفع'}
                  </button>
                </div>
              </div>

              {/* Attachments List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {currentAttachments.length === 0 ? (
                  <p className="text-center py-6 text-xs font-bold text-slate-400">
                    لا توجد ملفات مرفقة لهذا السند حتى الآن.
                  </p>
                ) : (
                  currentAttachments.map((att: any) => (
                    <div
                      key={att.id}
                      className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div className="truncate">
                        <span className="text-xs font-black text-slate-900 dark:text-white block truncate">
                          {att.originalFileName}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono-num">
                          {(att.fileSize / 1024).toFixed(1)} KB | {new Date(att.createdAt).toLocaleDateString('ar-SA')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`/api/v1/expense-transactions/attachments/${att.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 rounded-xl text-xs transition"
                          title="تحميل"
                        >
                          <Download className="w-4 h-4" />
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('هل أنت متأكد من حذف هذا المرفق؟')) {
                              deleteAttachmentMutation.mutate(att.id);
                            }
                          }}
                          className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 rounded-xl text-xs transition"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setAttachmentModalTx(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-xs transition"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
