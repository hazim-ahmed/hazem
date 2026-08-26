'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { downloadFile } from '@/lib/download';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Plus,
  Lock,
  Unlock,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Paperclip,
  CheckCheck,
  Ban,
  Download,
  UploadCloud,
  X,
  Trash2,
  Building2,
} from 'lucide-react';

export default function JournalDetailPage() {
  const params = useParams();
  const journalId = params.id;
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState('');
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Attachments & Rejection State
  const [attachmentModalTx, setAttachmentModalTx] = useState<any>(null);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [rejectingTx, setRejectingTx] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: journal, isLoading, error } = useQuery({
    queryKey: ['journal', journalId],
    queryFn: async () => {
      const res = await api.get(`/journals/${journalId}`);
      return res.data.data;
    },
  });

  // Attachments for selected transaction
  const { data: currentAttachments = [], refetch: refetchAttachments } = useQuery({
    queryKey: ['transaction-attachments', attachmentModalTx?.id],
    queryFn: async () => {
      if (!attachmentModalTx?.id) return [];
      const res = await api.get(`/expense-transactions/${attachmentModalTx.id}/attachments`);
      return res.data?.data || [];
    },
    enabled: Boolean(attachmentModalTx?.id),
  });

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      await downloadFile(`/journals/${journalId}/export/excel`, `Journal_${journal?.journalNumber || journalId}.xlsx`);
    } catch {
      alert('فشل في تصدير ملف الإكسل');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExportingPdf(true);
      await downloadFile(`/journals/${journalId}/export/pdf`, `Journal_${journal?.journalNumber || journalId}.pdf`);
    } catch {
      alert('فشل في تصدير ملف الـ PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const closeMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/journals/${journalId}/close`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal', journalId] });
      setActionError('');
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || 'تعذر إغلاق اليومية');
    },
  });

  const reopenMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/journals/${journalId}/reopen`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal', journalId] });
      setActionError('');
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || 'تعذر إعادة فتح اليومية');
    },
  });

  const approveJournalMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/journals/${journalId}/approve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal', journalId] });
      setActionError('');
      alert('تم اعتماد اليومية وسنداتها بالكامل بنجاح!');
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || 'تعذر اعتماد اليومية');
    },
  });

  const approveTxMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.post(`/expense-transactions/${id}/approve`, { comments: 'اعتماد محاسبي' });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal', journalId] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'تعذر اعتماد السند');
    },
  });

  const rejectTxMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const res = await api.post(`/expense-transactions/${id}/reject`, { reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal', journalId] });
      setRejectingTx(null);
      setRejectionReason('');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'تعذر رفض السند');
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ['journal', journalId] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'تعذر رفع المرفق');
    },
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: number) => {
      const res = await api.delete(`/expense-transactions/attachments/${attachmentId}`);
      return res.data;
    },
    onSuccess: () => {
      refetchAttachments();
      queryClient.invalidateQueries({ queryKey: ['journal', journalId] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'تعذر حذف المرفق');
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-slate-400 font-bold">جاري تحميل تفاصيل اليومية...</div>
      </DashboardLayout>
    );
  }

  if (error || !journal) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-rose-500 font-bold">تعذر تحميل بيانات اليومية</div>
      </DashboardLayout>
    );
  }

  const txs = Array.isArray(journal.transactions) ? journal.transactions : [];
  const totalAmount = txs.reduce((sum: number, tx: any) => sum + (parseFloat(tx.amount) || 0), 0);
  const totalCount = txs.length;
  const unassignedCount = txs.filter((tx: any) => !tx.projectId).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-28">
        {/* Header Info & Action Controls */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white font-mono-num">{journal.journalNumber}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 ${
                journal.status === 'APPROVED'
                  ? 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800'
                  : journal.status === 'OPEN'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}>
                {journal.status === 'APPROVED' ? <CheckCheck className="w-3.5 h-3.5" /> : null}
                <span>{journal.status === 'APPROVED' ? 'معتمدة رسمياً' : journal.status === 'OPEN' ? 'مفتوحة (OPEN)' : 'مغلقة (CLOSED)'}</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-bold">
              التاريخ: {new Date(journal.journalDate).toLocaleDateString('ar-SA')} | الصندوق: {journal.cashbox?.name || 'الصندوق الافتراضي'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-sm shadow-sm transition disabled:opacity-50"
            >
              {isExportingExcel ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              <span>إكسل Excel</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-sm shadow-sm border border-slate-700 dark:border-slate-600 transition disabled:opacity-50"
            >
              {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
              <span>طباعة PDF</span>
            </button>

            {journal.status !== 'APPROVED' && (
              <button
                onClick={() => {
                  if (confirm('هل أنت متأكد من رغبتك في اعتماد اليومية بالكامل؟')) {
                    approveJournalMutation.mutate();
                  }
                }}
                disabled={approveJournalMutation.isPending}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow transition"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{approveJournalMutation.isPending ? 'جاري الاعتماد...' : 'اعتماد اليومية'}</span>
              </button>
            )}

            {journal.status === 'OPEN' && (
              <Link
                href="/transactions/new"
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 dark:bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-lg shadow-cyan-600/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة سند جديد</span>
              </Link>
            )}

            {journal.status !== 'CLOSED' && journal.status !== 'APPROVED' && (
              <button
                onClick={() => closeMutation.mutate()}
                disabled={closeMutation.isPending}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow transition"
              >
                <Lock className="w-4 h-4" />
                <span>{closeMutation.isPending ? 'جاري الإغلاق...' : 'إغلاق اليومية'}</span>
              </button>
            )}

            {journal.status === 'CLOSED' && (
              <button
                onClick={() => reopenMutation.mutate()}
                disabled={reopenMutation.isPending}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow transition"
              >
                <Unlock className="w-4 h-4" />
                <span>{reopenMutation.isPending ? 'جاري الفتح...' : 'إعادة فتح اليومية'}</span>
              </button>
            )}
          </div>
        </div>

        {actionError && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-sm font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center justify-between">
            <span>سندات الصرف في هذه اليومية ({totalCount} سند)</span>
            {unassignedCount > 0 && (
              <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-lg border border-rose-200 dark:border-rose-800/60">
                يوجد {unassignedCount} سندات بدون مشروع
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-sm min-w-[1200px]">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <th className="p-3 whitespace-nowrap">#</th>
                  <th className="p-3 whitespace-nowrap">الرقم المرجعي / اليدوي</th>
                  <th className="p-3 whitespace-nowrap">الحالة</th>
                  <th className="p-3 whitespace-nowrap">المستفيد</th>
                  <th className="p-3 min-w-[180px]">التفاصيل والبيان</th>
                  <th className="p-3 whitespace-nowrap">المشروع والوحدة</th>
                  <th className="p-3 whitespace-nowrap">طريقة الدفع</th>
                  <th className="p-3 whitespace-nowrap">الفاتورة والمرفقات</th>
                  <th className="p-3 whitespace-nowrap">المبلغ</th>
                  <th className="p-3 whitespace-nowrap text-center">الإجراءات والاعتماد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {txs.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400 font-medium">
                      لا توجد عمليات مسجلة في هذه اليومية حتى الآن.
                    </td>
                  </tr>
                ) : (
                  txs.map((tx: any, idx: number) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3 font-semibold text-slate-500 whitespace-nowrap">{idx + 1}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400 block">
                          {tx.systemReference}
                        </span>
                        {tx.manualVoucherNumber && (
                          <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 block mt-0.5">
                            يدوي: #{tx.manualVoucherNumber}
                          </span>
                        )}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        {tx.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-lg text-xs font-black border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            معتمد
                          </span>
                        ) : tx.status === 'REJECTED' ? (
                          <span
                            className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-lg text-xs font-black border border-rose-200 dark:border-rose-800 cursor-help"
                            title={tx.rejectionReason ? `سبب الرفض: ${tx.rejectionReason}` : 'مرفوض'}
                          >
                            <XCircle className="w-3 h-3" />
                            مرفوض
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-lg text-xs font-black border border-amber-200 dark:border-amber-800">
                            <Clock className="w-3 h-3" />
                            قيد المراجعة
                          </span>
                        )}
                      </td>

                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {tx.beneficiary?.name || tx.beneficiaryName}
                      </td>

                      <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs">
                        <div>{tx.description}</div>
                        {tx.rejectionReason && tx.status === 'REJECTED' && (
                          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-1">
                            سبب الرفض: {tx.rejectionReason}
                          </div>
                        )}
                      </td>

                      <td className="p-3 whitespace-nowrap font-bold">
                        {tx.project ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1.5 text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/80 px-2.5 py-1 rounded-xl border border-cyan-200 dark:border-cyan-800/60 text-xs font-black shadow-xs whitespace-nowrap">
                              <Building2 className="w-3 h-3 text-cyan-500" />
                              {tx.project.projectName}
                            </span>
                            {tx.projectUnit && (
                              <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 pr-1">
                                وحدة: {tx.projectUnit.unitNumber}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800/60 text-xs font-bold whitespace-nowrap">
                            غير مربوط بمشروع
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-slate-700 dark:text-slate-300 text-xs font-bold whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                          {tx.paymentMethod?.name || '-'}
                        </span>
                        {tx.paymentReference && (
                          <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                            {tx.paymentReference}
                          </span>
                        )}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            tx.invoiceStatus === 'PROVIDED'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : tx.invoiceStatus === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {tx.invoiceStatus === 'PROVIDED' ? 'فاتورة مرفقة' : tx.invoiceStatus === 'PENDING' ? 'معلقة' : tx.invoiceNumber || 'بدون فاتورة'}
                          </span>

                          <button
                            onClick={() => setAttachmentModalTx(tx)}
                            className="p-1 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 rounded-md text-xs transition border border-cyan-200 dark:border-cyan-800"
                            title="المرفقات"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="p-3 font-extrabold text-cyan-700 dark:text-cyan-400 text-base font-mono-num whitespace-nowrap">
                        {Number(tx.amount).toLocaleString()} ر.س
                      </td>

                      <td className="p-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {tx.status !== 'APPROVED' && (
                            <button
                              onClick={() => approveTxMutation.mutate(tx.id)}
                              disabled={approveTxMutation.isPending}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs transition border border-emerald-200 dark:border-emerald-800"
                              title="اعتماد السند"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {tx.status !== 'REJECTED' && (
                            <button
                              onClick={() => {
                                setRejectingTx(tx);
                                setRejectionReason('');
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-lg text-xs transition border border-rose-200 dark:border-rose-800"
                              title="رفض السند"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {!tx.projectId && (
                            <Link
                              href={`/unassigned-projects?txId=${tx.id}`}
                              className="text-xs bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold px-2 py-1 rounded-lg border border-rose-300 dark:border-rose-700"
                            >
                              ربط
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Journal Totals Summary Footer Bar */}
        <div className="bg-slate-900 dark:bg-[#070d19] text-white p-5 rounded-2xl border border-slate-800 dark:border-slate-800/80 shadow-xl flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <div>
              <span className="text-xs text-slate-400 block font-bold">عدد السندات</span>
              <span className="text-xl font-black text-slate-100 font-mono-num">{totalCount}</span>
            </div>

            <div className="h-8 w-px bg-slate-800 hidden sm:block" />

            <div>
              <span className="text-xs text-slate-400 block font-bold">إجمالي المصروفات</span>
              <span className="text-xl font-black text-cyan-400 font-mono-num">{totalAmount.toLocaleString()} ر.س</span>
            </div>

            <div className="h-8 w-px bg-slate-800 hidden sm:block" />

            <div>
              <span className="text-xs text-slate-400 block font-bold">سندات بدون مشروع</span>
              <span className={`text-xl font-black font-mono-num ${unassignedCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {unassignedCount}
              </span>
            </div>
          </div>
        </div>

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
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-xs transition"
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
