'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  FolderKanban, 
  Edit, 
  Eye, 
  Archive, 
  Power, 
  Building2,
  Receipt,
  Sparkles,
  Layers,
  Filter
} from 'lucide-react';

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/projects', { params: { search, status: statusFilter } });
      return res.data.data;
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status, isActive }: { id: number; status: string; isActive: boolean }) => {
      const res = await api.patch(`/projects/${id}/status`, { status, isActive });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.post(`/projects/${id}/archive`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const totalProjectsCount = projects.length;
  const activeProjectsCount = projects.filter((p: any) => p.status === 'ACTIVE').length;
  const totalUnitsCount = projects.reduce((acc: number, p: any) => acc + (p.unitsCount || 0), 0);
  const totalTxCount = projects.reduce((acc: number, p: any) => acc + (p.transactionsCount || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-700 dark:from-[#0b1329] dark:via-cyan-950 dark:to-[#070d19] rounded-2xl sm:rounded-3xl p-6 sm:p-7 text-white shadow-xl dark:shadow-2xl border border-cyan-400/30 dark:border-cyan-500/20">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-white/20 dark:bg-cyan-500/15 backdrop-blur-md w-fit px-3.5 py-1.5 rounded-full text-xs font-black text-white dark:text-cyan-300 border border-white/20 dark:border-cyan-500/30">
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>إدارة وحوكمة المشاريع</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <span>المشاريع والوحدات العقارية</span>
              </h1>
              <p className="text-xs sm:text-sm text-cyan-50 dark:text-zinc-300 font-medium max-w-xl">
                إدارة السجلات المركزية للمشاريع، مراكز التكلفة، ربط الوحدات ومتابعة المصروفات المالية الحية.
              </p>
            </div>

            <Link
              href="/projects/new"
              className="btn-cyan-primary text-xs sm:text-sm whitespace-nowrap"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>إضافة مشروع جديد</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#0b1329]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold block">إجمالي المشاريع</span>
              <span className="text-xl font-black text-slate-900 dark:text-white font-mono-num">{totalProjectsCount}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0b1329]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold block">المشاريع النشطة</span>
              <span className="text-xl font-black text-slate-900 dark:text-white font-mono-num">{activeProjectsCount}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0b1329]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold block">إجمالي الوحدات</span>
              <span className="text-xl font-black text-slate-900 dark:text-white font-mono-num">{totalUnitsCount}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0b1329]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold block">سندات المصروفات</span>
              <span className="text-xl font-black text-slate-900 dark:text-white font-mono-num">{totalTxCount}</span>
            </div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white dark:bg-[#0b1329]/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 dark:text-zinc-400 absolute right-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث برقم كود المشروع، الاسم، مركز التكلفة، أو الموقع..."
              className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-[#070d19] border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-cyan-500 outline-none text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-cyan-500 shrink-0" />
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">الفلترة حسب الحالة:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2.5 bg-slate-50 dark:bg-[#070d19] border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">جميع الحالات</option>
              <option value="ACTIVE">نشط (ACTIVE)</option>
              <option value="SUSPENDED">متوقف (SUSPENDED)</option>
              <option value="PLANNED">مخطط له (PLANNED)</option>
              <option value="COMPLETED">مكتمل (COMPLETED)</option>
              <option value="ARCHIVED">مؤرشف (ARCHIVED)</option>
            </select>
          </div>
        </div>

        {/* Projects Modern Luxury Table */}
        <div className="bg-white dark:bg-[#0b1329]/90 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 dark:bg-[#070d19] border-b border-slate-200 dark:border-slate-800 text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                  <th className="p-4">رقم المشروع (Code)</th>
                  <th className="p-4">اسم المشروع</th>
                  <th className="p-4">مركز التكلفة</th>
                  <th className="p-4">الموقع</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">عدد الوحدات</th>
                  <th className="p-4">عدد السندات</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-zinc-400 font-bold">
                      جاري تحميل المشاريع...
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-500 dark:text-zinc-400 font-bold">
                      لا توجد مشاريع مسجلة في النظام تطابق شروط البحث.
                    </td>
                  </tr>
                ) : (
                  projects.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                      <td className="p-4 font-mono-num font-black text-cyan-600 dark:text-cyan-400">{p.projectCode}</td>
                      <td className="p-4 font-black text-slate-900 dark:text-white">{p.projectName}</td>
                      <td className="p-4 font-mono-num text-xs text-slate-600 dark:text-zinc-400">{p.costCenterCode || '-'}</td>
                      <td className="p-4 text-xs font-medium text-slate-600 dark:text-zinc-300">{p.location || '-'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wide border ${
                          p.status === 'ACTIVE' 
                            ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' :
                          p.status === 'SUSPENDED' 
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' :
                          p.status === 'ARCHIVED' 
                            ? 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30' : 
                            'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-slate-700 dark:text-zinc-200 font-mono-num">{p.unitsCount || 0}</td>
                      <td className="p-4 font-extrabold text-slate-700 dark:text-zinc-200 font-mono-num">{p.transactionsCount || 0}</td>
                      <td className="p-4 flex items-center justify-center gap-2">
                        <Link
                          href={`/projects/${p.id}`}
                          className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-zinc-200 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition"
                          title="عرض التفاصيل والمصروفات"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-500" />
                          <span>عرض</span>
                        </Link>

                        <Link
                          href={`/projects/${p.id}/edit`}
                          className="text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-cyan-500/30 transition"
                          title="تعديل"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => toggleStatusMutation.mutate({
                            id: p.id,
                            status: p.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                            isActive: p.status !== 'ACTIVE',
                          })}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border transition ${
                            p.status === 'ACTIVE'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          }`}
                          title={p.status === 'ACTIVE' ? 'إيقاف المشروع' : 'تفعيل المشروع'}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{p.status === 'ACTIVE' ? 'إيقاف' : 'تفعيل'}</span>
                        </button>

                        {p.status !== 'ARCHIVED' && (
                          <button
                            type="button"
                            onClick={() => archiveMutation.mutate(p.id)}
                            className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-zinc-400 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition"
                            title="أرشفة المشروع"
                          >
                            <Archive className="w-3.5 h-3.5" />
                            <span>أرشفة</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
