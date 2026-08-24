'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { FileSpreadsheet, FileCheck, Unlink, Calendar, User, Tags, FolderKanban } from 'lucide-react';

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
          <h1 className="text-2xl font-extrabold text-slate-800">مركز التقارير المالية والإدارية</h1>
          <p className="text-sm text-slate-500 mt-1">التقارير التحليلية لمتابعة حركة المصروفات والسندات بالفلاتر المتعددة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reports.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.title}
                href={r.href}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-3 group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:bg-emerald-600 group-hover:text-white transition">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-800">{r.title}</h3>
                <p className="text-xs text-slate-500">{r.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
