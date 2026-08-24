'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export default function PaymentMethodsPage() {
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => (await api.get('/payment-methods')).data.data,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-extrabold text-slate-800">طرق الدفع (Payment Methods)</h1>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                <th className="p-4">كود طريقة الدفع</th>
                <th className="p-4">الاسم</th>
                <th className="p-4">تتطلب رقم مرجعي؟</th>
                <th className="p-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paymentMethods.map((pm: any) => (
                <tr key={pm.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-mono font-bold text-blue-600">{pm.code}</td>
                  <td className="p-4 font-bold text-slate-800">{pm.name}</td>
                  <td className="p-4">
                    {pm.requiresReference ? (
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">نعم</span>
                    ) : (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">لا</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold">نشط</span>
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
