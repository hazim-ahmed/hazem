import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { downloadFile } from '@/lib/download';
import Link from 'next/link';
import { Calendar, Lock, Unlock, Eye, RefreshCw, FileSpreadsheet, Printer, Loader2 } from 'lucide-react';

export default function JournalsPage() {
  const queryClient = useQueryClient();
  const [downloadingId, setDownloadingId] = useState<{ id: number; type: 'excel' | 'pdf' } | null>(null);

  const handleExport = async (id: number, number: string, type: 'excel' | 'pdf') => {
    try {
      setDownloadingId({ id, type });
      const ext = type === 'excel' ? 'xlsx' : 'pdf';
      await downloadFile(`/journals/${id}/export/${type}`, `Journal_${number}.${ext}`);
    } catch (err) {
      alert(`فشل تصدير اليومية بصيغة ${type.toUpperCase()}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const { data: journals = [], isLoading } = useQuery({
    queryKey: ['journals'],
    queryFn: async () => (await api.get('/journals')).data.data,
  });

  const reopenMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.post(`/journals/${id}/reopen`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      queryClient.invalidateQueries({ queryKey: ['today-overview'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'تعذر إعادة فتح اليومية');
    },
  });

  const closeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.post(`/journals/${id}/close`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      queryClient.invalidateQueries({ queryKey: ['today-overview'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'تعذر إغلاق اليومية');
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              <span>أرشيف اليوميات</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">عرض السجل التاريخي لليوميات وطباعة أو تصدير التقارير المالية</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden">
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <th className="p-4">رقم اليومية</th>
                <th className="p-4">تاريخ اليومية</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">عدد العمليات</th>
                <th className="p-4">إجمالي اليومية</th>
                <th className="p-4">الإجراءات والطباعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {journals.map((j: any) => (
                <tr key={j.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4 font-mono font-extrabold text-cyan-700 dark:text-cyan-400">{j.journalNumber}</td>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                    {new Date(j.journalDate).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1 ${
                      j.status === 'OPEN'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border dark:border-emerald-800/60'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:border dark:border-slate-700'
                    }`}>
                      {j.status === 'OPEN' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{j.status === 'OPEN' ? 'مفتوحة' : 'مغلقة'}</span>
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{j.transactionsCount} عمليات</td>
                  <td className="p-4 font-extrabold text-cyan-700 dark:text-cyan-400 font-mono-num">{(j.totalAmount || 0).toLocaleString()} ر.س</td>
                  <td className="p-4 flex items-center gap-1.5 flex-wrap">
                    <Link
                      href={`/journals/${j.id}`}
                      className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-slate-300 dark:border-slate-700 transition"
                      title="عرض تفاصيل اليومية"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>عرض</span>
                    </Link>

                    <button
                      onClick={() => handleExport(j.id, j.journalNumber, 'excel')}
                      disabled={downloadingId?.id === j.id && downloadingId?.type === 'excel'}
                      className="text-xs bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-emerald-200 dark:border-emerald-800/60 transition disabled:opacity-50"
                      title="تصدير إكسل"
                    >
                      {downloadingId?.id === j.id && downloadingId?.type === 'excel' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      )}
                      <span>إكسل</span>
                    </button>

                    <button
                      onClick={() => handleExport(j.id, j.journalNumber, 'pdf')}
                      disabled={downloadingId?.id === j.id && downloadingId?.type === 'pdf'}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-white font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-slate-700 transition disabled:opacity-50"
                      title="طباعة وتصدير PDF"
                    >
                      {downloadingId?.id === j.id && downloadingId?.type === 'pdf' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Printer className="w-3.5 h-3.5" />
                      )}
                      <span>PDF</span>
                    </button>

                    {j.status === 'CLOSED' ? (
                      <button
                        onClick={() => reopenMutation.mutate(j.id)}
                        className="text-xs bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold px-2 py-1.5 rounded-lg flex items-center gap-1 border border-amber-200 dark:border-amber-800/60 transition"
                        title="إعادة فتح اليومية"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>فتح</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => closeMutation.mutate(j.id)}
                        className="text-xs bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold px-2 py-1.5 rounded-lg flex items-center gap-1 border border-rose-200 dark:border-rose-800/60 transition"
                        title="إغلاق اليومية"
                      >
                        <Lock className="w-3 h-3" />
                        <span>إغلاق</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
