'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Settings, CheckCircle, AlertCircle } from 'lucide-react';

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
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <span>إعدادات النظام العامة</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">التحكم في السياسات والقيود المالية للنظام</p>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-sm font-semibold flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 rounded-xl text-sm font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Setting Card for Project Requirement Mode */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-5">
          <div>
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">expenses.project_requirement_mode</span>
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mt-1">وضع إلزامية ربط المصروفات بالمشاريع</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              يحدد هذا الإعداد سلوك النظام عند تسجيل السندات، الاعتمادات، وإغلاق اليوميات.
            </p>
          </div>

          <div className="space-y-3">
            <label
              onClick={() => handleSave('OPTIONAL')}
              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                selectedMode === 'OPTIONAL'
                  ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/40 dark:border-cyan-400 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="mode"
                checked={selectedMode === 'OPTIONAL'}
                onChange={() => {}}
                className="mt-1 text-cyan-600"
              />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100">اختياري (OPTIONAL) - القيمة الافتراضية</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  يمكن إنشاء واعتماد جميع عمليات المصروف وإغلاق اليومية بدون ربطها بمشروع. تعرض السندات في تقرير السندات غير المرتبطة بمشروع.
                </p>
              </div>
            </label>

            <label
              onClick={() => handleSave('REQUIRED_ON_APPROVAL')}
              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                selectedMode === 'REQUIRED_ON_APPROVAL'
                  ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/40 dark:border-cyan-400 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="mode"
                checked={selectedMode === 'REQUIRED_ON_APPROVAL'}
                onChange={() => {}}
                className="mt-1 text-cyan-600"
              />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100">مطلوب عند الاعتماد والإغلاق (REQUIRED_ON_APPROVAL)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  يمكن حفظ العملية بدون مشروع، لكن يمنع النظام اعتماد العملية أو إغلاق اليومية إذا كانت تحتوي على عمليات غير مرتبطة بمشروع.
                </p>
              </div>
            </label>

            <label
              onClick={() => handleSave('REQUIRED_ON_CREATE')}
              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                selectedMode === 'REQUIRED_ON_CREATE'
                  ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/40 dark:border-cyan-400 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="mode"
                checked={selectedMode === 'REQUIRED_ON_CREATE'}
                onChange={() => {}}
                className="mt-1 text-cyan-600"
              />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100">مطلوب فور الإنشاء (REQUIRED_ON_CREATE)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
