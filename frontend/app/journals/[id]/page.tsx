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
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  AlertCircle,
  FileText,
  Building,
  DollarSign,
  Send,
  FileSpreadsheet,
  Printer,
  Loader2,
} from 'lucide-react';

export default function JournalDetailPage() {
  const params = useParams();
  const journalId = params.id;
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState('');
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

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

  const { data: journal, isLoading, error } = useQuery({
    queryKey: ['journal', journalId],
    queryFn: async () => {
      const res = await api.get(`/journals/${journalId}`);
      return res.data.data;
    },
  });

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

  const approveMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/journals/${journalId}/approve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal', journalId] });
      setActionError('');
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || 'تعذر اعتماد اليومية');
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

  const approveTxMutation = useMutation({
    mutationFn: async (txId: number) => {
      const res = await api.post(`/expense-transactions/${txId}/approve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal', journalId] });
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || 'تعذر اعتماد العملية');
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-slate-500 font-bold">جاري تحميل تفاصيل اليومية...</div>
      </DashboardLayout>
    );
  }

  if (error || !journal) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-rose-600 font-bold">تعذر تحميل بيانات اليومية</div>
      </DashboardLayout>
    );
  }

  const txs = journal.transactions || [];
  const metrics = journal.metrics || {};

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-24">
        {/* Header Header Info & Action Controls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-800">{journal.journalNumber}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                journal.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                journal.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                journal.status === 'CLOSED' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {journal.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              التاريخ: {new Date(journal.journalDate).toLocaleDateString('ar-SA')} | الصندوق: {journal.cashbox?.name}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-sm shadow-sm transition disabled:opacity-50"
              title="تصدير بيانات اليومية إلى ملف Excel"
            >
              {isExportingExcel ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              <span>إكسل Excel</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-sm shadow-sm border border-slate-700 transition disabled:opacity-50"
              title="تصدير أو طباعة اليومية بصيغة PDF مع خانات التوقيع والاعتماد"
            >
              {isExportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              <span>طباعة PDF</span>
            </button>

            {journal.status === 'OPEN' && (
              <Link
                href={`/transactions/new?journalId=${journal.id}`}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow transition"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة سند جديد</span>
              </Link>
            )}

            {journal.status === 'OPEN' && (
              <button
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow transition"
              >
                <CheckCircle className="w-4 h-4" />
                <span>اعتماد اليومية</span>
              </button>
            )}

            {journal.status !== 'CLOSED' ? (
              <button
                onClick={() => closeMutation.mutate()}
                disabled={closeMutation.isPending}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow transition"
              >
                <Lock className="w-4 h-4" />
                <span>إغلاق اليومية</span>
              </button>
            ) : (
              <button
                onClick={() => reopenMutation.mutate()}
                disabled={reopenMutation.isPending}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow transition"
              >
                <Unlock className="w-4 h-4" />
                <span>إعادة فتح اليومية</span>
              </button>
            )}
          </div>
        </div>

        {actionError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Transactions Table as specified in Section 19 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-sm">
            سندات الصرف في هذه اليومية
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-xs font-bold text-slate-600">
                  <th className="p-3">#</th>
                  <th className="p-3">رقم السند اليدوي</th>
                  <th className="p-3">الرقم الداخلي</th>
                  <th className="p-3">المستفيد</th>
                  <th className="p-3">الوصف والتفاصيل</th>
                  <th className="p-3">المشروع</th>
                  <th className="p-3">طريقة الدفع</th>
                  <th className="p-3">رقم الفاتورة</th>
                  <th className="p-3">ملاحظات</th>
                  <th className="p-3">المبلغ</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {txs.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-8 text-center text-slate-400 font-medium">
                      لا توجد عمليات سريان مسجلة في هذه اليومية حتى الآن.
                    </td>
                  </tr>
                ) : (
                  txs.map((tx: any, idx: number) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-semibold text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-800">
                        {tx.manualVoucherNumber ? `${tx.manualVoucherNumber} (${tx.voucherBookNumber || 'بدون دفتر'})` : '-'}
                      </td>
                      <td className="p-3 font-mono text-xs font-bold text-blue-600">{tx.systemReference}</td>
                      <td className="p-3 font-semibold text-slate-700">{tx.beneficiary?.name}</td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">{tx.description}</td>
                      <td className="p-3 font-bold">
                        {tx.project ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs">
                            {tx.project.projectName} {tx.projectUnit ? `(وحدة ${tx.projectUnit.unitNumber})` : ''}
                          </span>
                        ) : (
                          <span className="text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 text-xs">
                            غير مربوط بمشروع
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-700 text-xs font-bold">
                        {tx.paymentMethod?.name || '-'}
                        {tx.paymentReference && (
                          <span className="block text-[11px] text-slate-500 font-mono mt-1">{tx.paymentReference}</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 font-mono text-xs">
                        {tx.invoiceNumber || (tx.invoiceStatus === 'PENDING' ? 'معلقة' : '-')}
                      </td>
                      <td className="p-3 text-slate-600 text-xs max-w-[180px] truncate" title={tx.notes || ''}>
                        {tx.notes || '-'}
                      </td>
                      <td className="p-3 font-extrabold text-emerald-700 text-base">
                        {Number(tx.amount).toLocaleString()} ر.س
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          tx.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                          tx.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3 flex items-center gap-2">
                        {tx.status !== 'APPROVED' && (
                          <button
                            onClick={() => approveTxMutation.mutate(tx.id)}
                            className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-lg border border-emerald-300"
                          >
                            اعتماد
                          </button>
                        )}
                        {!tx.projectId && (
                          <Link
                            href={`/unassigned-projects?txId=${tx.id}`}
                            className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2.5 py-1 rounded-lg border border-rose-300"
                          >
                            ربط بمشروع
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Journal Totals Summary Footer Bar as explicitly specified in Section 19 */}
        <div className="fixed bottom-0 right-64 left-0 bg-slate-900 text-white p-4 border-t border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-6 z-20">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-xs text-slate-400 block font-medium">عدد العمليات</span>
              <span className="text-lg font-extrabold text-slate-100">{metrics.totalTransactions || 0}</span>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div>
              <span className="text-xs text-slate-400 block font-medium">إجمالي المصروفات</span>
              <span className="text-lg font-extrabold text-emerald-400">{(metrics.totalExpenses || 0).toLocaleString()} ر.س</span>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div>
              <span className="text-xs text-slate-400 block font-medium">إجمالي المعتمد</span>
              <span className="text-lg font-extrabold text-blue-400">{(metrics.totalApproved || 0).toLocaleString()} ر.س</span>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div>
              <span className="text-xs text-slate-400 block font-medium">إجمالي المرفوض</span>
              <span className="text-lg font-extrabold text-rose-400">{(metrics.totalRejected || 0).toLocaleString()} ر.س</span>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div>
              <span className="text-xs text-slate-400 block font-medium">إجمالي المعلق</span>
              <span className="text-lg font-extrabold text-amber-400">{(metrics.totalPending || 0).toLocaleString()} ر.س</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
