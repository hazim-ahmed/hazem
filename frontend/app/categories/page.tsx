'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Plus, X } from 'lucide-react';

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
          <h1 className="text-2xl font-extrabold text-slate-800">تصنيفات المصروفات (Expense Categories)</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تصنيف جديد</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                <th className="p-4">الكود</th>
                <th className="p-4">اسم التصنيف</th>
                <th className="p-4">يتطلب مشروع؟</th>
                <th className="p-4">يتطلب فاتورة؟</th>
                <th className="p-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-mono font-bold text-blue-600">{c.code}</td>
                  <td className="p-4 font-bold text-slate-800">{c.name}</td>
                  <td className="p-4">
                    {c.requiresProject ? (
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">نعم</span>
                    ) : (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">لا</span>
                    )}
                  </td>
                  <td className="p-4">
                    {c.requiresInvoice ? (
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">نعم</span>
                    ) : (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">لا</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold">نشط</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-lg text-slate-800">إضافة تصنيف جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold">{error}</div>}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كود التصنيف *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="EXP-01"
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم التصنيف *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أعمال السباكة والكهرباء"
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresProject}
                    onChange={(e) => setRequiresProject(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-700">يتطلب تحديد مشروع دائماً</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresInvoice}
                    onChange={(e) => setRequiresInvoice(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-700">يتطلب إرفاق فاتورة دائماً</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 bg-emerald-600 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition"
                >
                  {createMutation.isPending ? 'جاري الحفظ...' : 'حفظ التصنيف'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-300 font-bold text-slate-600 rounded-xl hover:bg-slate-50"
                >
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
