'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { CreditCard } from 'lucide-react';

export default function PaymentMethodsPage() {
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => (await api.get('/payment-methods')).data.data,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <span>طرق الدفع</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">إدارة طرق الدفع المعتمدة في سندات الصرف</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden">
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <th className="p-4">كود طريقة الدفع</th>
                <th className="p-4">الاسم</th>
                <th className="p-4">تتطلب رقم مرجعي؟</th>
                <th className="p-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paymentMethods.map((pm: any) => (
                <tr key={pm.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4 font-mono font-bold text-cyan-600 dark:text-cyan-400">{pm.code}</td>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{pm.name}</td>
                  <td className="p-4">
                    {pm.requiresReference ? (
                      <span className="text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full dark:border dark:border-emerald-800/60">نعم</span>
                    ) : (
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">لا</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full text-xs font-bold dark:border dark:border-emerald-800/60">نشط</span>
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
