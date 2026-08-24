'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export default function ManualVouchersPage() {
  const { data: vouchers = [] } = useQuery({
    queryKey: ['manual-vouchers'],
    queryFn: async () => (await api.get('/reports/manual-vouchers')).data.data,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-extrabold text-slate-800">تقرير السندات اليدوية (Manual Vouchers)</h1>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                <th className="p-4">رقم السند اليدوي</th>
                <th className="p-4">دفتر السندات</th>
                <th className="p-4">الرقم الداخلي</th>
                <th className="p-4">التاريخ</th>
                <th className="p-4">المستفيد</th>
                <th className="p-4">المبلغ</th>
                <th className="p-4">المشروع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vouchers.map((v: any) => (
                <tr key={v.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-bold text-slate-800">{v.manualVoucherNumber}</td>
                  <td className="p-4 font-semibold text-slate-600">{v.voucherBookNumber || 'بدون دفتر'}</td>
                  <td className="p-4 font-mono text-xs font-bold text-blue-600">{v.systemReference}</td>
                  <td className="p-4 text-slate-600">{new Date(v.voucherDate).toLocaleDateString('ar-SA')}</td>
                  <td className="p-4 font-semibold text-slate-700">{v.beneficiary?.name}</td>
                  <td className="p-4 font-extrabold text-emerald-700">{Number(v.amount).toLocaleString()} ر.س</td>
                  <td className="p-4 font-bold text-slate-700">{v.project?.projectName || 'غير مربوط'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
