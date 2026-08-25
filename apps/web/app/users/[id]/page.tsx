'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ShieldCheck, Edit, ArrowRight, FolderKanban, Wallet, Key } from 'lucide-react';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id;

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => (await api.get(`/users/${userId}`)).data.data,
  });

  if (isLoading || !user) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-slate-400 font-bold">جاري تحميل بيانات المستخدم...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">{user.fullName}</h1>
              <span className="font-mono text-sm bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 px-3 py-1 rounded-full font-bold border border-cyan-200 dark:border-cyan-800/60">
                @{user.username}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                user.isActive
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 dark:border dark:border-emerald-800/60'
                  : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 dark:border dark:border-rose-800/60'
              }`}>
                {user.isActive ? 'نشط' : 'معطل'}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              الرقم الوظيفي: {user.employeeNumber || '-'} | البريد: {user.email || '-'} | الجوال: {user.phone || '-'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/users/${userId}/edit`}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 dark:bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-lg shadow-cyan-600/20 transition"
            >
              <Edit className="w-4 h-4" />
              <span>تعديل الحساب</span>
            </Link>

            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white text-sm font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-4 py-2.5 rounded-xl transition"
            >
              <ArrowRight className="w-4 h-4" />
              <span>رجوع</span>
            </button>
          </div>
        </div>

        {/* Roles & Status Banner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <span>الأدوار المخصصة</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.roles?.map((role: string) => (
              <span key={role} className="bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 font-extrabold px-3 py-1 rounded-xl text-sm border border-cyan-200 dark:border-cyan-800/60">
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* User Projects & Cashboxes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span>المشاريع المرتبطة والمصرح بها</span>
            </h3>
            {user.userProjects?.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium">لم يتم تخصيص مشاريع محددة (أو يملك صلاحيات شاملة).</p>
            ) : (
              <div className="space-y-2">
                {user.userProjects?.map((up: any) => (
                  <div key={up.id} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{up.projectName} (كود: {up.projectCode})</span>
                    <span className="text-xs bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 px-2 py-0.5 rounded font-semibold">{up.accessLevel}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span>الصناديق المالية المصرح بإدارتها</span>
            </h3>
            {user.userCashboxes?.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium">لم يتم تخصيص صناديق محددة للمستخدم.</p>
            ) : (
              <div className="space-y-2">
                {user.userCashboxes?.map((uc: any) => (
                  <div key={uc.id} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{uc.cashboxName}</span>
                    <span className="text-xs bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 px-2 py-0.5 rounded font-semibold">مصرح</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fine-grained permissions list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-500" />
            <span>الصلاحيات الفعلية المستحقة</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {user.permissions?.map((perm: string) => (
              <span key={perm} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg font-mono text-slate-700 dark:text-slate-300 font-bold">
                ✓ {perm}
              </span>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
