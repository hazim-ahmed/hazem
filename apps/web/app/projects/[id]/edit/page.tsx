'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { Save, AlertCircle, ArrowRight, Edit } from 'lucide-react';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id;
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

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => (await api.get(`/projects/${projectId}`)).data.data,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get('/users')).data.data,
  });

  useEffect(() => {
    if (project) {
      setProjectCode(project.projectCode || '');
      setProjectName(project.projectName || '');
      setDescription(project.description || '');
      setCostCenterCode(project.costCenterCode || '');
      setLocation(project.location || '');
      setProjectManagerId(project.projectManagerId ? project.projectManagerId.toString() : '');
      setStartDate(project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '');
      setExpectedEndDate(project.expectedEndDate ? new Date(project.expectedEndDate).toISOString().split('T')[0] : '');
      setEstimatedBudget(project.estimatedBudget ? project.estimatedBudget.toString() : '');
      setStatus(project.status || 'ACTIVE');
    }
  }, [project]);

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.patch(`/projects/${projectId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-summary', projectId] });
      router.push(`/projects/${projectId}`);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'تعذر تعديل بيانات المشروع');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    updateMutation.mutate({
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-slate-500 font-bold">جاري تحميل بيانات المشروع...</div>
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
              <span>تعديل بيانات المشروع ({projectName})</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">تحديث بيانات كود المشروع، ومركز التكلفة والموقع</p>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم/كود المشروع *</label>
              <input
                type="text"
                required
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-sm font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المشروع *</label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-sm font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">مركز التكلفة</label>
              <input
                type="text"
                value={costCenterCode}
                onChange={(e) => setCostCenterCode(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-sm font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الموقع</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-sm font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">مدير المشروع</label>
              <select
                value={projectManagerId}
                onChange={(e) => setProjectManagerId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-sm font-semibold text-slate-800"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">حالة المشروع</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-sm font-semibold text-slate-800"
              >
                <option value="ACTIVE">نشط (ACTIVE)</option>
                <option value="PLANNED">مخطط له (PLANNED)</option>
                <option value="SUSPENDED">متوقف (SUSPENDED)</option>
                <option value="COMPLETED">مكتمل (COMPLETED)</option>
                <option value="ARCHIVED">مؤرشف (ARCHIVED)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">الميزانية التقديرية (ر.س)</label>
              <input
                type="number"
                step="0.01"
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-sm font-extrabold text-emerald-700"
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
              <span>{updateMutation.isPending ? 'جاري التعديل...' : 'حفظ التعديلات'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
