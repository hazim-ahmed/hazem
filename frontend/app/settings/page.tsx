'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Settings, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => (await api.get('/system-settings')).data.data,
  });

  const projectModeSetting = settings.find(
    (s: any) => s.key === 'expenses.project_requirement_mode'
  );

  const [selectedMode, setSelectedMode] = useState('OPTIONAL');

  React.useEffect(() => {
    if (projectModeSetting?.value) {
      setSelectedMode(projectModeSetting.value);
    }
  }, [projectModeSetting]);

  const updateModeMutation = useMutation({
    mutationFn: async (value: string) => {
      const res = await api.patch('/system-settings/expenses.project_requirement_mode', { value });
      return res.data;
    },
    onSuccess: (resData) => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      setSuccessMsg(resData.message || 'تم تحديث وضع إلزامية المشروع بنجاح');
      setErrorMsg('');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'تعذر تحديث الإعدادات');
    },
  });

  const handleSave = (mode: string) => {
    setSelectedMode(mode);
    setSuccessMsg('');
    setErrorMsg('');
    updateModeMutation.mutate(mode);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-700" />
            <span>إعدادات النظام العامة (System Settings)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">التحكم في السياسات والقيود المالية للنظام</p>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Setting Card for Project Requirement Mode */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <span className="text-xs font-mono text-slate-400">expenses.project_requirement_mode</span>
            <h3 className="font-extrabold text-lg text-slate-800 mt-1">وضع إلزامية ربط المصروفات بالمشاريع</h3>
            <p className="text-sm text-slate-500 mt-1">
              يحدد هذا الإعداد سلوك Backend عند تسجيل السندات، الاعتمادات، وإغلاق اليوميات Daily Journals.
            </p>
          </div>

          <div className="space-y-3">
            <label
              onClick={() => handleSave('OPTIONAL')}
              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                selectedMode === 'OPTIONAL'
                  ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="mode"
                checked={selectedMode === 'OPTIONAL'}
                onChange={() => {}}
                className="mt-1 text-emerald-600"
              />
              <div>
                <h4 className="font-bold text-slate-800">اختياري (OPTIONAL) - القيمة الافتراضية</h4>
                <p className="text-xs text-slate-500 mt-1">
                  يمكن إنشاء واعتماد جميع عمليات المصروف وإغلاق اليومية بدون ربطها بمشروع. تعرض السندات في تقرير السندات غير المرتبطة بمشروع.
                </p>
              </div>
            </label>

            <label
              onClick={() => handleSave('REQUIRED_ON_APPROVAL')}
              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                selectedMode === 'REQUIRED_ON_APPROVAL'
                  ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="mode"
                checked={selectedMode === 'REQUIRED_ON_APPROVAL'}
                onChange={() => {}}
                className="mt-1 text-emerald-600"
              />
              <div>
                <h4 className="font-bold text-slate-800">مطلوب عند الاعتماد والإغلاق (REQUIRED_ON_APPROVAL)</h4>
                <p className="text-xs text-slate-500 mt-1">
                  يمكن حفظ العملية بدون مشروع، لكن يمنع Backend اعتماد العملية أو إغلاق اليومية إذا كانت تحتوي على عمليات غير مرتبطة بمشروع.
                </p>
              </div>
            </label>

            <label
              onClick={() => handleSave('REQUIRED_ON_CREATE')}
              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                selectedMode === 'REQUIRED_ON_CREATE'
                  ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="mode"
                checked={selectedMode === 'REQUIRED_ON_CREATE'}
                onChange={() => {}}
                className="mt-1 text-emerald-600"
              />
              <div>
                <h4 className="font-bold text-slate-800">مطلوب فور الإنشاء (REQUIRED_ON_CREATE)</h4>
                <p className="text-xs text-slate-500 mt-1">
                  لا يمكن إنشاء أو حفظ أي سند صرف جديد بدون اختيار مشروع بشكل إجباري.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
