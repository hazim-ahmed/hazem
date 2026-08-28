'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Plus, X, Wallet } from 'lucide-react';

export default function CashboxesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [error, setError] = useState('');

  const queryClient = useQueryClient();

  const { data: cashboxes = [] } = useQuery({
    queryKey: ['cashboxes'],
    queryFn: async () => (await api.get('/cashboxes')).data.data,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/cashboxes', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashboxes'] });
      setIsModalOpen(false);
      setCode('');
      setName('');
      setBranchName('');
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'تعذر إضافة الصندوق');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code.trim() || !name.trim()) {
      setError('كود واسم الصندوق إجباريان');
      return;
    }
    createMutation.mutate({
      code: code.trim(),
      name: name.trim(),
      branchName: branchName ? branchName.trim() : 'الرئيسي',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <Wallet className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              <span>الصناديق المالية</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">صناديق عهد المصروفات اليومية والفروع</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 dark:bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-cyan-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة صندوق جديد</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cashboxes.map((cb: any) => (
            <div key={cb.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-3 hover:border-cyan-500/50 transition">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">{cb.name}</h3>
                <span className="font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 px-2 py-1 rounded-md">
                  {cb.code}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">الفرع: {cb.branchName || 'الرئيسي'}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">أمين الصندوق: {cb.custodian?.fullName || 'غير محدد'}</p>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">إضافة صندوق جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs rounded-xl font-bold">{error}</div>}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">كود الصندوق *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="CB-01"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم الصندوق *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="صندوق المصروفات النثرية"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الفرع (اختياري)</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="الفرع الرئيسي - الرياض"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 dark:bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 text-white font-bold py-2.5 rounded-xl transition shadow-md shadow-cyan-600/20"
                >
                  {createMutation.isPending ? 'جاري الحفظ...' : 'حفظ الصندوق'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 rounded-xl transition"
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
