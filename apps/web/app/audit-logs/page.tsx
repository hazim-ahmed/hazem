'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { History, Shield, Filter, Search, User, Calendar, Tag } from 'lucide-react';

export default function AuditLogsPage() {
  const [entityType, setEntityType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', entityType, page],
    queryFn: async () => {
      const res = await api.get('/audit-logs', {
        params: {
          entityType: entityType || undefined,
          page,
          limit: 20,
        },
      });
      return res.data;
    },
  });

  const logs = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  const formatJSON = (val: any) => {
    if (!val) return null;
    if (typeof val === 'string') return val;
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <History className="w-6 h-6 text-slate-700" />
            <span>سجل التعديلات والأحداث (Audit Logs)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">تتبع التغييرات في النظام، التعديلات المالية، وربط المشاريع</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">جميع الكيانات (Entity Types)</option>
              <option value="EXPENSE_TRANSACTION">سندات المصروفات (EXPENSE_TRANSACTION)</option>
              <option value="PROJECT">المشاريع (PROJECT)</option>
              <option value="USER">المستخدمون (USER)</option>
              <option value="SYSTEM_SETTING">إعدادات النظام (SYSTEM_SETTING)</option>
              <option value="EXPENSE_JOURNAL">اليوميات (EXPENSE_JOURNAL)</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            إجمالي السجلات: <span className="font-bold text-slate-800">{meta.total}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 font-medium">جاري تحميل سجل التعديلات...</div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">لا توجد سجلات تعديل مطابقة.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">التاريخ والوقت</th>
                    <th className="p-3">المستخدم</th>
                    <th className="p-3">الكيان (Entity)</th>
                    <th className="p-3">نوع الإجراء (Action)</th>
                    <th className="p-3">السبب / البيان</th>
                    <th className="p-3">القيم القديمة والجديدة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono text-slate-400">#{log.id}</td>
                      <td className="p-3 text-slate-600 dir-ltr text-right whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('ar-SA')}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {log.user?.fullName || log.user?.username || `مستخدم #${log.userId}`}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                          {log.entityType} #{log.entityId}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded font-semibold text-[11px] bg-emerald-100 text-emerald-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 max-w-xs">{log.reason || '-'}</td>
                      <td className="p-3 text-slate-500 max-w-sm">
                        {log.oldValues && (
                          <div className="text-[10px] font-mono text-rose-600 truncate">
                            قديم: {formatJSON(log.oldValues)}
                          </div>
                        )}
                        {log.newValues && (
                          <div className="text-[10px] font-mono text-emerald-600 truncate">
                            جديد: {formatJSON(log.newValues)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {meta.totalPages > 1 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border rounded-lg bg-white font-medium disabled:opacity-50"
              >
                السابق
              </button>
              <span className="text-slate-600 font-semibold">
                صفحة {page} من {meta.totalPages}
              </span>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border rounded-lg bg-white font-medium disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
