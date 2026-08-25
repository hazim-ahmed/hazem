'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Users, Search, Plus, X } from 'lucide-react';

export default function BeneficiariesPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('COMPANY');
  const [taxNumber, setTaxNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const queryClient = useQueryClient();

  const { data: beneficiaries = [], isLoading } = useQuery({
    queryKey: ['beneficiaries', search],
    queryFn: async () => {
      const res = await api.get('/beneficiaries', { params: { search } });
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/beneficiaries', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      setIsModalOpen(false);
      setName('');
      setTaxNumber('');
      setPhone('');
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'تعذر إضافة المستفيد');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('اسم المستفيد إجباري');
      return;
    }
    createMutation.mutate({
      name: name.trim(),
      beneficiaryType: type,
      taxNumber: taxNumber || null,
      phone: phone || null,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              <span>إدارة المستفيدين</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">الشركات، المؤسسات، الموردين، والموظفين المستلمين لسندات الصرف</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 dark:bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-cyan-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مستفيد جديد</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute right-3.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث باسم المستفيد، الجوال، أو الرقم الضريبي..."
            className="w-full pr-11 pl-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium dark:text-white focus:ring-2 focus:ring-cyan-500 shadow-sm transition"
          />
        </div>

        {/* Beneficiaries Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden">
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <th className="p-4">اسم المستفيد</th>
                <th className="p-4">النوع</th>
                <th className="p-4">الرقم الضريبي</th>
                <th className="p-4">السجل التجاري</th>
                <th className="p-4">رقم الجوال</th>
                <th className="p-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {beneficiaries.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{b.name}</td>
                  <td className="p-4">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700">
                      {b.beneficiaryType === 'COMPANY' ? 'شركة / مؤسسة' : 'فرد / موظف'}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-600 dark:text-slate-400">{b.taxNumber || '-'}</td>
                  <td className="p-4 font-mono text-xs text-slate-600 dark:text-slate-400">{b.commercialRegistration || '-'}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{b.phone || '-'}</td>
                  <td className="p-4">
                    <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full text-xs font-bold dark:border dark:border-emerald-800/60">
                      نشط
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">إضافة مستفيد جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs rounded-xl font-bold">{error}</div>}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المستفيد *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: شركة المواد الوطنية"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نوع المستفيد</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                >
                  <option value="COMPANY">شركة / مؤسسة</option>
                  <option value="PERSON">فرد / موظف</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الرقم الضريبي (اختياري)</label>
                <input
                  type="text"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  placeholder="300000000000003"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الجوال (اختياري)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0500000000"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 dark:bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 text-white font-bold py-2.5 rounded-xl transition shadow-md shadow-cyan-600/20"
                >
                  {createMutation.isPending ? 'جاري الحفظ...' : 'حفظ المستفيد'}
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
