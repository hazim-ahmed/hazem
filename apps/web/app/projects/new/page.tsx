'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { Save, AlertCircle, ArrowRight, FolderPlus } from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [projectCode, setProjectCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [costCenterCode, setCostCenterCode] = useState('');
  const [location, setLocation] = useState('');
  const [projectManagerId, setProjectManagerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expectedEndDate, setExpectedEndDate] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [errorMessage, setErrorMessage] = useState('');

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get('/users')).data.data,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/projects', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      router.push('/projects');
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'تعذر إضافة المشروع. تحقق من الحقول');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!projectCode.trim()) {
      setErrorMessage('رقم كود المشروع إجباري وفريد');
      return;
    }

    if (!projectName.trim()) {
      setErrorMessage('اسم المشروع إجباري');
      return;
    }

    createMutation.mutate({
      projectCode: projectCode.trim(),
      projectName: projectName.trim(),
      description: description || null,
      costCenterCode: costCenterCode || null,
      location: location || null,
      projectManagerId: projectManagerId ? parseInt(projectManagerId, 10) : null,
      startDate: startDate || null,
      expectedEndDate: expectedEndDate || null,
      estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : null,
      status,
      isActive: status === 'ACTIVE',
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                <FolderPlus className="w-5 h-5" />
              </div>
              <span>إضافة مشروع جديد</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">إدخال البيانات الأساسية للمشروع الجديد ومركز التكلفة</p>
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-xl transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>رجوع</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="form-label">رقم/كود المشروع (إجباري وفريد) *</label>
              <input
                type="text"
                required
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
                placeholder="مثال: 114"
              />
            </div>

            <div>
              <label className="form-label">اسم المشروع *</label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="مثال: مشروع مجمع النرجس 3"
              />
            </div>

            <div>
              <label className="form-label">رمز مركز التكلفة</label>
              <input
                type="text"
                value={costCenterCode}
                onChange={(e) => setCostCenterCode(e.target.value)}
                placeholder="مثال: CC-114"
              />
            </div>

            <div>
              <label className="form-label">الموقع / العنوان</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="مثال: الرياض - حي الملقا"
              />
            </div>

            <div>
              <label className="form-label">مدير المشروع</label>
              <select
                value={projectManagerId}
                onChange={(e) => setProjectManagerId(e.target.value)}
              >
                <option value="">اختر مدير المشروع...</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.username})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">حالة المشروع</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ACTIVE">نشط (ACTIVE)</option>
                <option value="PLANNED">مخطط له (PLANNED)</option>
                <option value="SUSPENDED">متوقف (SUSPENDED)</option>
                <option value="COMPLETED">مكتمل (COMPLETED)</option>
              </select>
            </div>

            <div>
              <label className="form-label">تاريخ البدء</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">تاريخ الانتهاء المتوقع</label>
              <input
                type="date"
                value={expectedEndDate}
                onChange={(e) => setExpectedEndDate(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="form-label">الميزانية التقديرية (ر.س)</label>
              <input
                type="number"
                step="0.01"
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(e.target.value)}
                placeholder="0.00"
                className="!text-base !font-black text-cyan-600 dark:text-cyan-400 font-mono-num"
              />
            </div>

            <div className="md:col-span-2">
              <label className="form-label">وصف وتفاصيل المشروع</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف تفصيلي ونطاق العمل..."
              />
            </div>
          </div>

          <div className="pt-5 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary-cancel"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-cyan-primary"
            >
              <Save className="w-5 h-5" />
              <span>{createMutation.isPending ? 'جاري الحفظ...' : 'حفظ المشروع'}</span>
            </button>
          </div>
        </form>

      </div>
    </DashboardLayout>
  );

}
