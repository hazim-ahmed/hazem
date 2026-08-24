'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import { Calendar, Lock, Unlock, Eye, RefreshCw } from 'lucide-react';

export default function JournalsPage() {
  const queryClient = useQueryClient();

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
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-emerald-600" />
              <span>أرشيف اليوميات اليومية (Daily Journals Archive)</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">عرض السجل التاريخي لليوميات وإعادة فتحها عند الحاجة من قبل مسؤول النظام</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                <th className="p-4">رقم اليومية</th>
                <th className="p-4">تاريخ اليومية</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">عدد العمليات</th>
                <th className="p-4">إجمالي اليومية</th>
                <th className="p-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {journals.map((j: any) => (
                <tr key={j.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-mono font-extrabold text-emerald-700">{j.journalNumber}</td>
                  <td className="p-4 font-bold text-slate-800">
                    {new Date(j.journalDate).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1 ${
                      j.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {j.status === 'OPEN' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{j.status === 'OPEN' ? 'مفتوحة (OPEN)' : 'مغلقة (CLOSED)'}</span>
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">{j.transactionsCount} عمليات</td>
                  <td className="p-4 font-extrabold text-emerald-700">{(j.totalAmount || 0).toLocaleString()} ر.س</td>
                  <td className="p-4 flex items-center gap-2">
                    <Link
                      href={`/journals/${j.id}`}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-slate-300"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>عرض</span>
                    </Link>

                    {j.status === 'CLOSED' ? (
                      <button
                        onClick={() => reopenMutation.mutate(j.id)}
                        className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-amber-200"
                        title="إعادة فتح اليومية من قبل مسؤول النظام"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>إعادة فتح</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => closeMutation.mutate(j.id)}
                        className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-rose-200"
                        title="إغلاق اليومية يدويًا"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>إغلاق يدوي</span>
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
