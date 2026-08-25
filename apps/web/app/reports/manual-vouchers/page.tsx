'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { FileCheck } from 'lucide-react';

export default function ManualVouchersPage() {
  const { data: vouchers = [] } = useQuery({
    queryKey: ['manual-vouchers'],
    queryFn: async () => (await api.get('/reports/manual-vouchers')).data.data,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <span>تقرير السندات اليدوية</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">حصر السندات الورقية اليدوية وأرقام الدفاتر</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden">
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <th className="p-4">رقم السند اليدوي</th>
                <th className="p-4">دفتر السندات</th>
                <th className="p-4">الرقم الداخلي</th>
                <th className="p-4">التاريخ</th>
                <th className="p-4">المستفيد</th>
                <th className="p-4">المبلغ</th>
                <th className="p-4">المشروع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {vouchers.map((v: any) => (
                <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{v.manualVoucherNumber}</td>
                  <td className="p-4 font-semibold text-slate-600 dark:text-slate-300">{v.voucherBookNumber || 'بدون دفتر'}</td>
                  <td className="p-4 font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">{v.systemReference}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{new Date(v.voucherDate).toLocaleDateString('ar-SA')}</td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-200">{v.beneficiary?.name}</td>
                  <td className="p-4 font-extrabold text-cyan-700 dark:text-cyan-400 font-mono-num">{Number(v.amount).toLocaleString()} ر.س</td>
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300">{v.project?.projectName || 'غير مربوط'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
