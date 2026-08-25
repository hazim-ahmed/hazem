'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { downloadFile } from '@/lib/download';
import { Unlink, FolderPlus, CheckCircle, AlertCircle, FileSpreadsheet, Printer, Loader2 } from 'lucide-react';

export default function UnassignedProjectsPage() {
  const queryClient = useQueryClient();
  const [selectedTxIds, setSelectedTxIds] = useState<number[]>([]);
  const [targetProjectId, setTargetProjectId] = useState('');
  const [assignReason, setAssignReason] = useState('تم ربط السندات بالمشروع بعد المراجعة المحاسبية');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      await downloadFile('/reports/unassigned-project-transactions/export/excel', 'Unassigned_Transactions_Report.xlsx');
    } catch {
      alert('فشل تصدير ملف الإكسل');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExportingPdf(true);
      await downloadFile('/reports/unassigned-project-transactions/export/pdf', 'Unassigned_Transactions_Report.pdf');
    } catch {
      alert('فشل تصدير ملف الـ PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['unassigned-txs'],
    queryFn: async () => {
      const res = await api.get('/reports/unassigned-project-transactions');
      return res.data.data;
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects')).data.data,
  });

  const bulkAssignMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.patch('/expense-transactions/bulk-assign-project', payload);
      return res.data;
    },
    onSuccess: (resData) => {
      queryClient.invalidateQueries({ queryKey: ['unassigned-txs'] });
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      setSelectedTxIds([]);
      setMessage(resData.message || 'تم الربط الجماعي بالمشروع بنجاح');
      setErrorMessage('');
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'تعذر الربط بالمشروع');
    },
  });

  const toggleSelect = (id: number) => {
    if (selectedTxIds.includes(id)) {
      setSelectedTxIds(selectedTxIds.filter((item) => item !== id));
    } else {
      setSelectedTxIds([...selectedTxIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedTxIds.length === transactions.length) {
      setSelectedTxIds([]);
    } else {
      setSelectedTxIds(transactions.map((t: any) => t.id));
    }
  };

  const handleBulkAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTxIds.length === 0) {
      setErrorMessage('يرجى اختيار عملية واحدة على الأقل');
      return;
    }
    if (!targetProjectId) {
      setErrorMessage('يرجى اختيار المشروع المراد الربط به');
      return;
    }

    bulkAssignMutation.mutate({
      transactionIds: selectedTxIds,
      projectId: parseInt(targetProjectId, 10),
      reason: assignReason,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <Unlink className="w-6 h-6 text-rose-500" />
              <span>السندات غير المرتبطة بالمشاريع</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              إدارة وربط سندات الصرف التي تمت إضافتها بدون مشروع، مع إمكانية الربط الجماعي
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm transition disabled:opacity-50"
              title="تصدير السندات غير المربوطة إلى Excel"
            >
              {isExportingExcel ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
              <span>تصدير Excel</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs border border-slate-700 transition disabled:opacity-50"
              title="طباعة وتصدير PDF مع خانات التوقيع"
            >
              {isExportingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
              <span>طباعة PDF</span>
            </button>
          </div>
        </div>

        {message && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-sm font-semibold flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 rounded-xl text-sm font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Bulk Assignment Tool Bar */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>أداة الربط الجماعي بمشروع واحد</span>
          </h3>

          <form onSubmit={handleBulkAssign} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اختر المشروع المستهدف *</label>
              <select
                required
                value={targetProjectId}
                onChange={(e) => setTargetProjectId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
              >
                <option value="">اختر المشروع...</option>
                {projects.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName} (كود: {p.projectCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[250px]">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">سبب الربط التوثيقي</label>
              <input
                type="text"
                value={assignReason}
                onChange={(e) => setAssignReason(e.target.value)}
                className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={bulkAssignMutation.isPending || selectedTxIds.length === 0}
              className="bg-cyan-600 hover:bg-cyan-700 dark:bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-600/20 text-sm transition"
            >
              {bulkAssignMutation.isPending ? 'جاري الربط...' : `حفظ ربط (${selectedTxIds.length}) عملية`}
            </button>
          </form>
        </div>

        {/* Transactions List Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={transactions.length > 0 && selectedTxIds.length === transactions.length}
                      onChange={toggleSelectAll}
                      className="rounded text-cyan-600"
                    />
                  </th>
                  <th className="p-4">رقم السند اليدوي</th>
                  <th className="p-4">الرقم الداخلي</th>
                  <th className="p-4">التاريخ</th>
                  <th className="p-4">المستفيد</th>
                  <th className="p-4">الوصف</th>
                  <th className="p-4">المبلغ</th>
                  <th className="p-4">الصندوق</th>
                  <th className="p-4">اليومية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-slate-400 font-bold">
                      🎉 ممتاز! جميع سندات الصرف مرتبطة بمشاريع ولا توجد سندات معلقة بدون مشروع.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx: any) => {
                    const isSelected = selectedTxIds.includes(tx.id);
                    return (
                      <tr key={tx.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${isSelected ? 'bg-cyan-50/50 dark:bg-cyan-950/30' : ''}`}>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(tx.id)}
                            className="rounded text-cyan-600"
                          />
                        </td>
                        <td className="p-4 font-bold text-slate-800 dark:text-slate-100">
                          {tx.manualVoucherNumber ? `${tx.manualVoucherNumber}` : '-'}
                        </td>
                        <td className="p-4 font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">{tx.systemReference}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">{new Date(tx.voucherDate).toLocaleDateString('ar-SA')}</td>
                        <td className="p-4 font-semibold text-slate-700 dark:text-slate-200">{tx.beneficiary?.name}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">{tx.description}</td>
                        <td className="p-4 font-extrabold text-cyan-700 dark:text-cyan-400 font-mono-num">{Number(tx.amount).toLocaleString()} ر.س</td>
                        <td className="p-4 font-medium text-slate-600 dark:text-slate-400">{tx.journal?.cashbox?.name || 'الصندوق الرئيسي'}</td>
                        <td className="p-4 font-bold text-slate-700 dark:text-slate-200">{tx.journal?.journalNumber}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
