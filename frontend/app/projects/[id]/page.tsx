'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Building2, Plus, Edit, ArrowRight, DollarSign, AlertCircle, Sparkles, Receipt, Layers } from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id;
  const queryClient = useQueryClient();

  const [unitNumber, setUnitNumber] = useState('');
  const [unitType, setUnitType] = useState('APARTMENT');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [unitError, setUnitError] = useState('');

  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['project-summary', projectId],
    queryFn: async () => (await api.get(`/projects/${projectId}/summary`)).data.data,
  });

  const addUnitMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post(`/projects/${projectId}/units`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-summary', projectId] });
      setUnitNumber('');
      setBuildingNumber('');
      setFloorNumber('');
      setUnitError('');
    },
    onError: (err: any) => {
      setUnitError(err.response?.data?.message || 'تعذر إضافة الوحدة');
    },
  });

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    setUnitError('');

    if (!unitNumber.trim()) {
      setUnitError('رقم الوحدة مطلوب');
      return;
    }

    addUnitMutation.mutate({
      unitNumber: unitNumber.trim(),
      unitType,
      buildingNumber: buildingNumber || null,
      floorNumber: floorNumber || null,
    });
  };

  if (isLoading || !summaryData) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-zinc-400 font-bold">جاري تحميل بيانات المشروع...</div>
      </DashboardLayout>
    );
  }

  const project = summaryData.project;
  const metrics = summaryData.metrics;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-700 dark:from-[#0b1329] dark:via-cyan-950 dark:to-[#070d19] border border-cyan-400/30 rounded-2xl sm:rounded-3xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{project.projectName}</h1>
              <span className="font-mono-num text-xs bg-white/20 dark:bg-cyan-500/20 text-white dark:text-cyan-300 px-3 py-1 rounded-full font-extrabold border border-white/20 dark:border-cyan-500/30">
                كود: {project.projectCode}
              </span>
              <span className="bg-cyan-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black">
                {project.status}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-cyan-100 dark:text-zinc-300 font-medium">
              مركز التكلفة: <span className="font-mono-num font-bold text-white">{project.costCenterCode || '-'}</span> | الموقع: <span className="font-bold text-white">{project.location || 'غير محدد'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/projects/${projectId}/edit`}
              className="btn-cyan-primary text-xs sm:text-sm"
            >
              <Edit className="w-4 h-4" />
              <span>تعديل المشروع</span>
            </Link>

            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl text-white transition border border-white/20"
            >
              <ArrowRight className="w-4 h-4" />
              <span>رجوع</span>
            </button>
          </div>
        </div>

        {/* Financial Summary Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-white dark:bg-[#0b1329]/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1.5">
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold block">عدد سندات المصروفات</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono-num">{metrics.totalTransactions}</h3>
          </div>

          <div className="bg-white dark:bg-[#0b1329]/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1.5">
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold block">إجمالي المنصرف المعالج</span>
            <h3 className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono-num">{(metrics.totalSpent || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">ر.س</span></h3>
          </div>

          <div className="bg-white dark:bg-[#0b1329]/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1.5">
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold block">إجمالي المعتمد المالي</span>
            <h3 className="text-2xl font-black text-teal-600 dark:text-teal-400 font-mono-num">{(metrics.approvedSpent || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">ر.س</span></h3>
          </div>

          <div className="bg-white dark:bg-[#0b1329]/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1.5">
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold block">الميزانية التقديرية</span>
            <h3 className="text-2xl font-black text-amber-500 font-mono-num">
              {metrics.estimatedBudget ? `${metrics.estimatedBudget.toLocaleString()} ر.س` : 'غير محددة'}
            </h3>
          </div>
        </div>

        {/* Units Section */}
        <div className="bg-white dark:bg-[#0b1329]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <span>الوحدات العقارية التابعة للمشروع ({project.projectUnits?.length || 0})</span>
            </h3>
          </div>

          {unitError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{unitError}</span>
            </div>
          )}

          {/* Add Unit Inline Form */}
          <form onSubmit={handleAddUnit} className="bg-slate-50 dark:bg-[#070d19] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[140px]">
              <label className="form-label">رقم الوحدة *</label>
              <input
                type="text"
                required
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                placeholder="مثال: 27"
              />
            </div>

            <div className="flex-1 min-w-[140px]">
              <label className="form-label">نوع الوحدة</label>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
              >
                <option value="APARTMENT">شقة (APARTMENT)</option>
                <option value="SHOP">محل تجاري (SHOP)</option>
                <option value="OFFICE">مكتب (OFFICE)</option>
                <option value="VILLA">فيلا (VILLA)</option>
              </select>
            </div>

            <div className="flex-1 min-w-[120px]">
              <label className="form-label">رقم المبنى</label>
              <input
                type="text"
                value={buildingNumber}
                onChange={(e) => setBuildingNumber(e.target.value)}
                placeholder="مبنى أ"
              />
            </div>

            <div className="flex-1 min-w-[100px]">
              <label className="form-label">الطابق</label>
              <input
                type="text"
                value={floorNumber}
                onChange={(e) => setFloorNumber(e.target.value)}
                placeholder="3"
              />
            </div>

            <button
              type="submit"
              disabled={addUnitMutation.isPending}
              className="btn-cyan-primary !py-2.5 text-xs whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة وحدة</span>
            </button>
          </form>

          {/* Units List Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {project.projectUnits?.map((u: any) => (
              <div key={u.id} className="bg-slate-50 dark:bg-[#070d19] p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white block font-mono-num">وحدة {u.unitNumber}</span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{u.unitType} {u.buildingNumber ? `(${u.buildingNumber})` : ''}</span>
                </div>
                <span className="bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 text-[10px] font-black px-2.5 py-1 rounded-md border border-cyan-500/30">
                  {u.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Linked Transactions Table */}
        <div className="bg-white dark:bg-[#0b1329]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-black text-lg text-slate-900 dark:text-white">مصروفات وسندات هذا المشروع</h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 dark:bg-[#070d19] border-b border-slate-200 dark:border-slate-800 text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                  <th className="p-3.5">رقم السند اليدوي</th>
                  <th className="p-3.5">الرقم الداخلي</th>
                  <th className="p-3.5">المستفيد</th>
                  <th className="p-3.5">التصنيف</th>
                  <th className="p-3.5">المبلغ</th>
                  <th className="p-3.5">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {project.transactions?.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                    <td className="p-3.5 font-bold font-mono-num text-amber-500">{tx.manualVoucherNumber || '-'}</td>
                    <td className="p-3.5 font-mono-num text-xs font-bold text-cyan-600 dark:text-cyan-400">{tx.systemReference}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{tx.beneficiary?.name}</td>
                    <td className="p-3.5 text-xs font-semibold text-slate-600 dark:text-zinc-300">{tx.category?.name}</td>
                    <td className="p-3.5 font-black text-cyan-600 dark:text-cyan-400 font-mono-num">{Number(tx.amount).toLocaleString()} ر.س</td>
                    <td className="p-3.5">
                      <span className="bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 px-3 py-1 rounded-full text-xs font-black border border-cyan-500/30">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
