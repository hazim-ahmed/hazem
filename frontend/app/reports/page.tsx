'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { FileSpreadsheet, FileCheck, Unlink, Calendar, User, Tags, FolderKanban, BarChart3 } from 'lucide-react';

const reports = [
  { title: 'تقرير المصروفات اليومية', desc: 'استعراض جميع العمليات والسندات اليومية المنفذة', icon: Calendar, href: '/journals' },
  { title: 'السندات اليدوية', desc: 'تقرير شامل عن كافة السندات اليدوية الورقية ودفاتر السندات', icon: FileCheck, href: '/reports/manual-vouchers' },
  { title: 'سندات غير مرتبطة بمشروع', desc: 'حصر المصروفات المعلقة التي تتطلب تحديد مشروع', icon: Unlink, href: '/unassigned-projects' },
  { title: 'الفواتير المعلقة', desc: 'متابعة الفواتير المطلوبة التي ستسلم لاحقاً', icon: FileSpreadsheet, href: '/reports/pending-invoices' },
  { title: 'المصروفات حسب المشروع', desc: 'تحليل تكلفة وإجمالي مصروفات كل مشروع مستمر أو منتهي', icon: FolderKanban, href: '/reports/by-project' },
  { title: 'المصروفات حسب المستفيد', desc: 'إجمالي التجميعات المالية حسب كل مورد أو شركة أو موظف', icon: User, href: '/beneficiaries' },
  { title: 'المصروفات حسب التصنيف', desc: 'تحليل توزيع المصروفات على فئات مواد البناء، العزل، الأجور، العمولات', icon: Tags, href: '/categories' },
];

export default function ReportsHubPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <span>مركز التقارير المالية والإدارية</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">التقارير التحليلية لمتابعة حركة المصروفات والسندات بالفلاتر المتعددة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reports.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.title}
                href={r.href}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl hover:border-cyan-500/50 hover:shadow-cyan-500/10 transition space-y-3 group"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/60 flex items-center justify-center font-bold group-hover:bg-cyan-600 group-hover:text-white transition">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">{r.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{r.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
