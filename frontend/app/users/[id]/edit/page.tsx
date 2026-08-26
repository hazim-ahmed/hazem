'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { Save, AlertCircle, ArrowRight, Edit, ShieldCheck, FolderKanban, Wallet } from 'lucide-react';

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id;
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
  const [selectedCashboxIds, setSelectedCashboxIds] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => (await api.get(`/users/${userId}`)).data.data,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => (await api.get('/roles')).data.data || [],
  });

  const { data: allProjects = [] } = useQuery({
    queryKey: ['projects', true],
    queryFn: async () => (await api.get('/projects', { params: { activeOnly: true } })).data.data || [],
  });

  const { data: allCashboxes = [] } = useQuery({
    queryKey: ['cashboxes'],
    queryFn: async () => (await api.get('/cashboxes')).data.data || [],
  });

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmployeeNumber(user.employeeNumber || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setMustChangePassword(Boolean(user.mustChangePassword));
      if (user.roles && roles.length > 0) {
        const rIds = roles.filter((r: any) => user.roles.includes(r.name)).map((r: any) => r.id);
        setSelectedRoleIds(rIds);
      }
      if (user.userProjects) {
        setSelectedProjectIds(user.userProjects.map((up: any) => Number(up.projectId)));
      }
      if (user.userCashboxes) {
        setSelectedCashboxIds(user.userCashboxes.map((uc: any) => Number(uc.cashboxId)));
      }
    }
  }, [user, roles]);

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      // 1. Update basic info
      await api.patch(`/users/${userId}`, payload.basic);

      // 2. Update roles if changed
      if (payload.roleIds && payload.roleIds.length > 0) {
        await api.patch(`/users/${userId}/roles`, { roleIds: payload.roleIds });
      }

      // 3. Update projects
      if (payload.projectIds !== undefined) {
        await api.patch(`/users/${userId}/projects`, { projectIds: payload.projectIds });
      }

      // 4. Update cashboxes
      if (payload.cashboxIds !== undefined) {
        await api.patch(`/users/${userId}/cashboxes`, { cashboxIds: payload.cashboxIds });
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      router.push(`/users/${userId}`);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'تعذر تعديل بيانات المستخدم أو أدواره');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    updateMutation.mutate({
      basic: {
        fullName: fullName.trim(),
        employeeNumber: employeeNumber.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        mustChangePassword,
      },
      roleIds: selectedRoleIds,
      projectIds: selectedProjectIds,
      cashboxIds: selectedCashboxIds,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-slate-400 font-bold">جاري تحميل بيانات المستخدم...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <Edit className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              <span>تعديل حساب المستخدم ({user?.username})</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">تحديث البيانات الشخصية، الأدوار، والصناديق والمشاريع المصرحة</p>
          </div>

          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white text-sm font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-4 py-2 rounded-xl transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>رجوع</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 rounded-xl text-sm font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-6">
          {/* 1. Basic Info */}
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
              1. البيانات الشخصية والوظيفية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الرقم الوظيفي</label>
                <input
                  type="text"
                  value={employeeNumber}
                  onChange={(e) => setEmployeeNumber(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm font-mono text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الجوال</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Roles Management */}
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-500" />
              <span>2. تعيين الأدوار والصلاحيات</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {roles.map((r: any) => {
                const isSelected = selectedRoleIds.includes(r.id);
                return (
                  <label
                    key={r.id}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition ${
                      isSelected
                        ? 'bg-cyan-50 border-cyan-500 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-500'
                        : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRoleIds([...selectedRoleIds, r.id]);
                        } else {
                          setSelectedRoleIds(selectedRoleIds.filter((id) => id !== r.id));
                        }
                      }}
                      className="rounded text-cyan-600 focus:ring-cyan-500"
                    />
                    <span>{r.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 3. Cashboxes & Projects Permissions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-cyan-500" />
                <span>3. تفويض الصناديق المالية</span>
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allCashboxes.map((cb: any) => {
                  const isSelected = selectedCashboxIds.includes(cb.id);
                  return (
                    <label
                      key={cb.id}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition ${
                        isSelected
                          ? 'bg-cyan-50 border-cyan-400 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-300'
                          : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCashboxIds([...selectedCashboxIds, cb.id]);
                          } else {
                            setSelectedCashboxIds(selectedCashboxIds.filter((id) => id !== cb.id));
                          }
                        }}
                        className="rounded text-cyan-600 focus:ring-cyan-500"
                      />
                      <span>{cb.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4 flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-cyan-500" />
                <span>4. تخصيص المشاريع المصرحة</span>
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allProjects.map((p: any) => {
                  const isSelected = selectedProjectIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition ${
                        isSelected
                          ? 'bg-cyan-50 border-cyan-400 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-300'
                          : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProjectIds([...selectedProjectIds, p.id]);
                          } else {
                            setSelectedProjectIds(selectedProjectIds.filter((id) => id !== p.id));
                          }
                        }}
                        className="rounded text-cyan-600 focus:ring-cyan-500"
                      />
                      <span>{p.projectName} ({p.projectCode})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm transition"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-8 py-2.5 bg-cyan-600 hover:bg-cyan-700 dark:bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/20 text-sm transition"
            >
              <Save className="w-5 h-5" />
              <span>{updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات الشاملة'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
