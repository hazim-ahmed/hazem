'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import { Plus, Search, ShieldCheck, Edit, Eye, Power, KeyRound, AlertCircle } from 'lucide-react';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [resetModalUser, setResetModalUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', search, statusFilter, roleFilter],
    queryFn: async () => {
      const res = await api.get('/users', { params: { search, status: statusFilter, roleName: roleFilter } });
      return res.data.data;
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await api.patch(`/users/${id}/status`, { isActive });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'تعذر تغيير حالة المستخدم');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, newPassword }: { id: number; newPassword: string }) => {
      const res = await api.post(`/users/${id}/reset-password`, { newPassword });
      return res.data;
    },
    onSuccess: () => {
      setResetMessage('تم إعادة تعيين كلمة المرور بنجاح وتسجيل الإجراء في سجل التعديلات');
      setResetError('');
      setNewPassword('');
    },
    onError: (err: any) => {
      setResetError(err.response?.data?.message || 'تعذر إعادة تعيين كلمة المرور');
    },
  });

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage('');
    setResetError('');
    if (!newPassword || newPassword.length < 6) {
      setResetError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    resetPasswordMutation.mutate({ id: resetModalUser.id, newPassword });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              <span>إدارة المستخدمين والصلاحيات</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">عرض وتعيين حسابات المستخدمين، الأرقام الوظيفية، والأدوار والصلاحيات</p>
          </div>

          <Link
            href="/users/new"
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 dark:bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 dark:hover:from-cyan-700 dark:hover:to-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-600/20 text-sm transition"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة مستخدم جديد</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute right-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث بالاسم، اسم المستخدم، رقم الموظف، أو البريد..."
              className="w-full pr-11 pl-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium dark:text-white focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400 transition"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <option value="">جميع الأدوار</option>
              <option value="ADMIN">مدير نظام</option>
              <option value="CASHIER">أمين صندوق</option>
              <option value="ACCOUNTANT">محاسب</option>
              <option value="MANAGER">مدير اعتمادات</option>
              <option value="VIEWER">مستعرض</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <option value="">جميع الحالات</option>
              <option value="ACTIVE">نشط</option>
              <option value="INACTIVE">معطل</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden">
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <th className="p-4">رقم الموظف</th>
                <th className="p-4">اسم المستخدم</th>
                <th className="p-4">الاسم الكامل</th>
                <th className="p-4">البريد/الجوال</th>
                <th className="p-4">الأدوار</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4 font-mono font-bold text-cyan-600 dark:text-cyan-400">{u.employeeNumber || '-'}</td>
                  <td className="p-4 font-mono font-extrabold text-slate-800 dark:text-slate-100">{u.username}</td>
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-200">{u.fullName}</td>
                  <td className="p-4 text-xs text-slate-600 dark:text-slate-400">{u.email || u.phone || '-'}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {u.roles?.map((r: string) => (
                        <span key={r} className="bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 font-bold px-2 py-0.5 rounded-md text-xs border border-cyan-200 dark:border-cyan-800/60">
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      u.isActive
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border dark:border-emerald-800/60'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 dark:border dark:border-rose-800/60'
                    }`}>
                      {u.isActive ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td className="p-4 flex items-center gap-2">
                    <Link
                      href={`/users/${u.id}`}
                      className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-slate-300 dark:border-slate-700 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>عرض</span>
                    </Link>

                    <Link
                      href={`/users/${u.id}/edit`}
                      className="text-xs bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-cyan-200 dark:border-cyan-800/60 transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </Link>

                    <button
                      onClick={() => setResetModalUser(u)}
                      className="text-xs bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-amber-200 dark:border-amber-800/60 transition"
                      title="إعادة تعيين كلمة المرور"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>كلمة السر</span>
                    </button>

                    <button
                      onClick={() => toggleStatusMutation.mutate({ id: u.id, isActive: !u.isActive })}
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 border transition ${
                        u.isActive
                          ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60 dark:hover:bg-rose-900/60'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60 dark:hover:bg-emerald-900/60'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{u.isActive ? 'تعطيل' : 'تفعيل'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Reset Password Modal */}
        {resetModalUser && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5 border border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">
                إعادة تعيين كلمة المرور للمستخدم ({resetModalUser.fullName})
              </h3>

              {resetMessage && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl font-bold">
                  {resetMessage}
                </div>
              )}

              {resetError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs rounded-xl font-bold">
                  {resetError}
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">كلمة المرور الجديدة *</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm font-mono text-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={resetPasswordMutation.isPending}
                    className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 dark:bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 text-white font-bold rounded-xl text-sm transition shadow-md shadow-cyan-600/20"
                  >
                    تأكيد تعيين كلمة السر
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setResetModalUser(null);
                      setResetMessage('');
                      setResetError('');
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm transition"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
