'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export default function PendingInvoicesPage() {
  const { data: items = [] } = useQuery({
    queryKey: ['pending-invoices'],
    queryFn: async () => (await api.get('/reports/pending-invoices')).data.data,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-extrabold text-slate-800">تقرير الفواتير المعلقة (Pending Invoices)</h1>
        <p className="text-sm text-slate-500">سندات الصرف التي حدد المستخدم فيها أن الفاتورة ستقدم لاحقاً</p>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                <th className="p-4">الرقم الداخلي</th>
                <th className="p-4">المستفيد</th>
                <th className="p-4">الوصف</th>
                <th className="p-4">المبلغ</th>
                <th className="p-4">المشروع</th>
                <th className="p-4">حالة الفاتورة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-mono font-bold text-blue-600">{item.systemReference}</td>
                  <td className="p-4 font-bold text-slate-800">{item.beneficiary?.name}</td>
                  <td className="p-4 text-slate-600 max-w-xs truncate">{item.description}</td>
                  <td className="p-4 font-extrabold text-emerald-700">{Number(item.amount).toLocaleString()} ر.س</td>
                  <td className="p-4 font-bold text-slate-700">{item.project?.projectName || 'غير مربوط'}</td>
                  <td className="p-4">
                    <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-xs">
                      ستقدم لاحقاً (PENDING)
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
