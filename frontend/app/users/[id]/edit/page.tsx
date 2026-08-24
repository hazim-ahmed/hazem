'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { Save, AlertCircle, ArrowRight, Edit } from 'lucide-react';

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
  const [errorMessage, setErrorMessage] = useState('');

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => (await api.get(`/users/${userId}`)).data.data,
  });

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmployeeNumber(user.employeeNumber || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setMustChangePassword(Boolean(user.mustChangePassword));
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.patch(`/users/${userId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      router.push(`/users/${userId}`);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'تعذر تعديل بيانات المستخدم');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    updateMutation.mutate({
      fullName: fullName.trim(),
      employeeNumber: employeeNumber.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      mustChangePassword,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-slate-500 font-bold">جاري تحميل بيانات المستخدم...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <Edit className="w-6 h-6 text-blue-600" />
              <span>تعديل حساب المستخدم ({user?.username})</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">تحديث الاسم الكامل، الرقم الوظيفي، والبريد الإلكتروني</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-sm font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الرقم الوظيفي</label>
              <input
                type="text"
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-sm font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-sm font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الجوال</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-sm font-semibold text-slate-800"
              />
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
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 text-sm transition"
            >
              <Save className="w-5 h-5" />
              <span>{updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
