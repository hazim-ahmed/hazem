'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { Save, AlertCircle, ArrowRight, UserPlus } from 'lucide-react';

export default function NewUserPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [username, setUsername] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoleNames, setSelectedRoleNames] = useState<string[]>(['CASHIER']);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([2]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
  const [selectedCashboxIds, setSelectedCashboxIds] = useState<number[]>([]);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [status, setStatus] = useState('ACTIVE');
  const [errorMessage, setErrorMessage] = useState('');

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects')).data.data,
  });

  const { data: cashboxes = [] } = useQuery({
    queryKey: ['cashboxes'],
    queryFn: async () => (await api.get('/cashboxes')).data.data,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/users', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      router.push('/users');
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'تعذر إضافة المستخدم');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('اسم المستخدم إجباري وفريد');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('الاسم الكامل مطلوب');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    createMutation.mutate({
      username: username.trim(),
      employeeNumber: employeeNumber.trim() || null,
      fullName: fullName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      password,
      roleIds: selectedRoleIds,
      roleNames: selectedRoleNames,
      projectIds: selectedProjectIds,
      cashboxIds: selectedCashboxIds,
      mustChangePassword,
      status,
    });
  };

  const toggleRole = (roleId: number, roleName: string) => {
    if (selectedRoleNames.includes(roleName)) {
      setSelectedRoleNames(selectedRoleNames.filter((r) => r !== roleName));
      setSelectedRoleIds(selectedRoleIds.filter((id) => id !== roleId));
    } else {
      setSelectedRoleNames([...selectedRoleNames, roleName]);
      setSelectedRoleIds([...selectedRoleIds, roleId]);
    }
  };

  const toggleProject = (pId: number) => {
    if (selectedProjectIds.includes(pId)) {
      setSelectedProjectIds(selectedProjectIds.filter((p) => p !== pId));
    } else {
      setSelectedProjectIds([...selectedProjectIds, pId]);
    }
  };

  const toggleCashbox = (cId: number) => {
    if (selectedCashboxIds.includes(cId)) {
      setSelectedCashboxIds(selectedCashboxIds.filter((c) => c !== cId));
    } else {
      setSelectedCashboxIds([...selectedCashboxIds, cId]);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-emerald-600" />
              <span>إضافة مستخدم جديد وتعيين الأدوار والنطاق</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">إنشاء حساب مستخدم جديد وتعيين الأدوار والمشاريع والصناديق المصرح بها</p>
          </div>

          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-800 text-sm font-bold bg-slate-100 px-4 py-2 rounded-xl"
          >
            <ArrowRight className="w-4 h-4" />
            <span>رجوع</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستخدم *</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: sadiq_hassan"
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-sm font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الرقم الوظيفي</label>
              <input
                type="text"
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
                placeholder="EMP-102"
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-sm font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثال: صادق حسن علي"
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-sm font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sadiq@example.com"
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-sm font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الجوال</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0501112233"
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-sm font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-sm font-mono text-slate-800"
              />
            </div>
          </div>

          {/* Roles Selection */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <label className="block text-xs font-bold text-slate-700">الأدوار المخصصة (Roles)</label>
            <div className="flex flex-wrap gap-3">
              {[
                { id: 1, name: 'ADMIN', label: 'مدير نظام كامل (ADMIN)' },
                { id: 2, name: 'CASHIER', label: 'أمين صندوق (CASHIER)' },
                { id: 3, name: 'ACCOUNTANT', label: 'محاسب مراجع (ACCOUNTANT)' },
                { id: 4, name: 'MANAGER', label: 'مدير اعتمادات (MANAGER)' },
                { id: 5, name: 'VIEWER', label: 'مستعرض فقط (VIEWER)' },
              ].map((r) => (
                <label key={r.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRoleNames.includes(r.name)}
                    onChange={() => toggleRole(r.id, r.name)}
                    className="rounded text-emerald-600"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Link Projects */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <label className="block text-xs font-bold text-slate-700">المشاريع المصرح للمستخدم بالوصول إليها</label>
            <div className="flex flex-wrap gap-3">
              {projects.map((p: any) => (
                <label key={p.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedProjectIds.includes(p.id)}
                    onChange={() => toggleProject(p.id)}
                    className="rounded text-emerald-600"
                  />
                  <span>{p.projectName} (كود: {p.projectCode})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Link Cashboxes */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <label className="block text-xs font-bold text-slate-700">الصناديق المصرح للمستخدم بإدارتها</label>
            <div className="flex flex-wrap gap-3">
              {cashboxes.map((cb: any) => (
                <label key={cb.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCashboxIds.includes(cb.id)}
                    onChange={() => toggleCashbox(cb.id)}
                    className="rounded text-emerald-600"
                  />
                  <span>{cb.name} (كود: {cb.code})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 text-sm transition"
            >
              <Save className="w-5 h-5" />
              <span>{createMutation.isPending ? 'جاري الإضافة...' : 'حفظ حساب المستخدم'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
