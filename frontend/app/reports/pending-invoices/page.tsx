'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { downloadFile } from '@/lib/download';
import { FileSpreadsheet, Printer, Loader2 } from 'lucide-react';

export default function PendingInvoicesPage() {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      await downloadFile('/reports/pending-invoices/export/excel', 'Pending_Invoices_Report.xlsx');
    } catch {
      alert('فشل تصدير ملف الإكسل');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExportingPdf(true);
      await downloadFile('/reports/pending-invoices/export/pdf', 'Pending_Invoices_Report.pdf');
    } catch {
      alert('فشل تصدير ملف الـ PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const { data: items = [] } = useQuery({
    queryKey: ['pending-invoices'],
    queryFn: async () => (await api.get('/reports/pending-invoices')).data.data,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              <span>تقرير الفواتير المعلقة</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">سندات الصرف التي حدد المستخدم فيها أن الفاتورة ستقدم لاحقاً</p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm transition disabled:opacity-50"
              title="تصدير الفواتير المعلقة إلى Excel"
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

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden">
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <th className="p-4">الرقم الداخلي</th>
                <th className="p-4">المستفيد</th>
                <th className="p-4">الوصف</th>
                <th className="p-4">المبلغ</th>
                <th className="p-4">المشروع</th>
                <th className="p-4">حالة الفاتورة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {items.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4 font-mono font-bold text-cyan-600 dark:text-cyan-400">{item.systemReference}</td>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{item.beneficiary?.name}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">{item.description}</td>
                  <td className="p-4 font-extrabold text-cyan-700 dark:text-cyan-400 font-mono-num">{Number(item.amount).toLocaleString()} ر.س</td>
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300">{item.project?.projectName || 'غير مربوط'}</td>
                  <td className="p-4">
                    <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-3 py-1 rounded-full text-xs dark:border dark:border-amber-800/60">
                      ستقدم لاحقاً
                    </span>
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
