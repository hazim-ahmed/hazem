'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Plus, X, Tag } from 'lucide-react';

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [requiresProject, setRequiresProject] = useState(false);
  const [requiresInvoice, setRequiresInvoice] = useState(false);
  const [error, setError] = useState('');

  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/expense-categories')).data.data,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/expense-categories', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
      setCode('');
      setName('');
      setRequiresProject(false);
      setRequiresInvoice(false);
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'تعذر إضافة التصنيف');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code.trim() || !name.trim()) {
      setError('الكود واسم التصنيف إجباريان');
      return;
    }
    createMutation.mutate({
      code: code.trim(),
      name: name.trim(),
      requiresProject,
      requiresInvoice,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <Tag className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              <span>تصنيفات المصروفات</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">إدارة فئات وتصنيفات بنود المصروفات</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 dark:bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-cyan-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تصنيف جديد</span>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden">
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <th className="p-4">الكود</th>
                <th className="p-4">اسم التصنيف</th>
                <th className="p-4">يتطلب مشروع؟</th>
                <th className="p-4">يتطلب فاتورة؟</th>
                <th className="p-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {categories.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4 font-mono font-bold text-cyan-600 dark:text-cyan-400">{c.code}</td>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{c.name}</td>
                  <td className="p-4">
                    {c.requiresProject ? (
                      <span className="text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full dark:border dark:border-emerald-800/60">نعم</span>
                    ) : (
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">لا</span>
                    )}
                  </td>
                  <td className="p-4">
                    {c.requiresInvoice ? (
                      <span className="text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full dark:border dark:border-emerald-800/60">نعم</span>
                    ) : (
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">لا</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full text-xs font-bold dark:border dark:border-emerald-800/60">نشط</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">إضافة تصنيف جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs rounded-xl font-bold">{error}</div>}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">كود التصنيف *</label>
                <input type="text" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="EXP-01"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم التصنيف *</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="أعمال السباكة والكهرباء"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none" />
              </div>
              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={requiresProject} onChange={(e) => setRequiresProject(e.target.checked)} className="w-4 h-4 text-cyan-600 rounded" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">يتطلب تحديد مشروع دائماً</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={requiresInvoice} onChange={(e) => setRequiresInvoice(e.target.checked)} className="w-4 h-4 text-cyan-600 rounded" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">يتطلب إرفاق فاتورة دائماً</span>
                </label>
              </div>
              <div className="flex gap-2 pt-3">
                <button type="submit" disabled={createMutation.isPending}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 dark:bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 text-white font-bold py-2.5 rounded-xl transition shadow-md shadow-cyan-600/20">
                  {createMutation.isPending ? 'جاري الحفظ...' : 'حفظ التصنيف'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 rounded-xl transition">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
