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
        <div className="p-8 text-center text-slate-500 font-bold">جاري تحميل بيانات المستخدم...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-800">{user.fullName}</h1>
              <span className="font-mono text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold">
                @{user.username}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {user.isActive ? 'نشط' : 'معطل'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              الرقم الوظيفي: {user.employeeNumber || '-'} | البريد: {user.email || '-'} | الجوال: {user.phone || '-'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/users/${userId}/edit`}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow transition"
            >
              <Edit className="w-4 h-4" />
              <span>تعديل الحساب</span>
            </Link>

            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-800 text-sm font-bold bg-slate-100 px-4 py-2.5 rounded-xl"
            >
              <ArrowRight className="w-4 h-4" />
              <span>رجوع</span>
            </button>
          </div>
        </div>

        {/* Roles & Status Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>الأدوار المخصصة (Roles)</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.roles?.map((role: string) => (
              <span key={role} className="bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-xl text-sm border border-emerald-200">
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* User Projects & Cashboxes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-blue-600" />
              <span>المشاريع المرتبطة والمصرح بها</span>
            </h3>
            {user.userProjects?.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium">لم يتم تخصيص مشاريع محددة (أو يملك صلاحيات شاملة).</p>
            ) : (
              <div className="space-y-2">
                {user.userProjects?.map((up: any) => (
                  <div key={up.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800">{up.projectName} (كود: {up.projectCode})</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">{up.accessLevel}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              <span>الصناديق المالية المصرح بإدارتها</span>
            </h3>
            {user.userCashboxes?.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium">لم يتم تخصيص صناديق محددة للمستخدم.</p>
            ) : (
              <div className="space-y-2">
                {user.userCashboxes?.map((uc: any) => (
                  <div key={uc.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800">{uc.cashboxName}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-semibold">مصرح</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fine-grained permissions list */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-600" />
            <span>الصلاحيات الفعلية المستحقة (Permissions Checklist)</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {user.permissions?.map((perm: string) => (
              <span key={perm} className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-mono text-slate-700 font-bold">
                ✓ {perm}
              </span>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
