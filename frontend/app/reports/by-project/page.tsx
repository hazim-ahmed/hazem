'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { downloadFile } from '@/lib/download';
import { Building2, Folder, DollarSign, ListOrdered, FileSpreadsheet, Printer, Loader2 } from 'lucide-react';

export default function ExpensesByProjectReportPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      const query = selectedProjectId ? `?projectId=${selectedProjectId}` : '';
      await downloadFile(`/reports/by-project/export/excel${query}`, 'Expenses_By_Project.xlsx');
    } catch {
      alert('فشل تصدير ملف الإكسل');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExportingPdf(true);
      const query = selectedProjectId ? `?projectId=${selectedProjectId}` : '';
      await downloadFile(`/reports/by-project/export/pdf${query}`, 'Expenses_By_Project.pdf');
    } catch {
      alert('فشل تصدير ملف الـ PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects')).data.data,
  });

  const { data: reportData = [], isLoading } = useQuery({
    queryKey: ['reports-by-project', selectedProjectId],
    queryFn: async () => {
      const res = await api.get('/reports/by-project', {
        params: { projectId: selectedProjectId || undefined },
      });
      return res.data.data;
    },
  });

  const grandTotal = reportData.reduce((sum: number, item: any) => sum + (item.totalAmount || 0), 0);
  const totalTxCount = reportData.reduce((sum: number, item: any) => sum + (item.count || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              <span>تقرير المصروفات حسب المشروع</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">عرض ملخص وتفاصيل التكاليف المنصرفة لكل مشروع مقاولات/عقارات</p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm transition disabled:opacity-50"
              title="تصدير التقرير إلى Excel"
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

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">اختر مشروعاً للفلترة:</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              <option value="">جميع المشاريع</option>
              {projects.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.projectName} ({p.projectCode})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-6 text-sm font-bold">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <ListOrdered className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>إجمالي العمليات: {totalTxCount}</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400">
              <DollarSign className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>إجمالي المبالغ: {grandTotal.toLocaleString()} ر.س</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 font-medium">جاري تحميل التقرير...</div>
          ) : reportData.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">لا توجد بيانات مصروفات للمشروع المحدد.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase">
                  <tr>
                    <th className="p-4">اسم المشروع</th>
                    <th className="p-4">عدد السندات والعمليات</th>
                    <th className="p-4">إجمالي المنصرف (ر.س)</th>
                    <th className="p-4">نسبة الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                  {reportData.map((item: any) => {
                    const percentage = grandTotal > 0 ? ((item.totalAmount / grandTotal) * 100).toFixed(1) : '0';
                    return (
                      <tr key={item.projectId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <Folder className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                          <span>{item.projectName}</span>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{item.count} عملية</td>
                        <td className="p-4 font-extrabold text-cyan-700 dark:text-cyan-400 font-mono-num">{Number(item.totalAmount).toLocaleString()} ر.س</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                            </div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
