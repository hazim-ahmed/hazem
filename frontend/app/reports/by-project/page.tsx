'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Building2, Folder, PieChart, DollarSign, ListOrdered } from 'lucide-react';

export default function ExpensesByProjectReportPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

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
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-600" />
            <span>تقرير المصروفات حسب المشروع</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">عرض ملخص وتفاصيل التكاليف المنصرفة لكل مشروع مقاولات/عقارات</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-bold text-slate-600">اختر مشروعاً للفلترة:</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
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
            <div className="flex items-center gap-2 text-slate-700">
              <ListOrdered className="w-4 h-4 text-blue-600" />
              <span>إجمالي العمليات: {totalTxCount}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>إجمالي المبالغ: {grandTotal.toLocaleString()} ر.س</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 font-medium">جاري تحميل التقرير...</div>
          ) : reportData.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">لا توجد بيانات مصروفات للمشروع المحدد.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase">
                  <tr>
                    <th className="p-4">اسم المشروع</th>
                    <th className="p-4">عدد السندات والعمليات</th>
                    <th className="p-4">إجمالي المنصرف (ر.س)</th>
                    <th className="p-4">نسبة الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {reportData.map((item: any) => {
                    const percentage = grandTotal > 0 ? ((item.totalAmount / grandTotal) * 100).toFixed(1) : '0';
                    return (
                      <tr key={item.projectId} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                          <Folder className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{item.projectName}</span>
                        </td>
                        <td className="p-4 text-slate-600 font-semibold">{item.count} عملية</td>
                        <td className="p-4 font-extrabold text-emerald-700">{Number(item.totalAmount).toLocaleString()} ر.س</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                            </div>
                            <span className="text-xs font-bold text-slate-500">{percentage}%</span>
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
