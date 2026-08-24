'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Receipt,
  FolderKanban,
  Users,
  Tags,
  FileSpreadsheet,
  ShieldCheck,
  Settings,
  Sparkles,
  User,
} from 'lucide-react';

const navigationGroups = [
  {
    title: 'الرئيسية والتشغيل',
    items: [
      { name: 'لوحة المعلومات', href: '/dashboard', icon: LayoutDashboard },
      { name: 'إضافة سند صرف', href: '/transactions/new', icon: Receipt },
      { name: 'أرشيف اليوميات', href: '/journals', icon: BookOpen },
    ],
  },
  {
    title: 'التصانيف والمشاريع',
    items: [
      { name: 'المشاريع والوحدات', href: '/projects', icon: FolderKanban },
      { name: 'المستفيدون والموردون', href: '/beneficiaries', icon: Users },
      { name: 'تصنيفات المصروفات', href: '/categories', icon: Tags },
    ],
  },
  {
    title: 'التقارير والإدارة',
    items: [
      { name: 'التقارير المالية', href: '/reports', icon: FileSpreadsheet },
      { name: 'المستخدمون والصلاحيات', href: '/users', icon: ShieldCheck, adminOnly: true },
      { name: 'إعدادات النظام', href: '/settings', icon: Settings, adminOnly: true },
    ],
  },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ isMobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN') ?? false;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-transparent">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-blue-600 flex items-center justify-center font-black text-slate-950 text-lg shadow-lg shadow-cyan-500/30 border border-cyan-300/40">
              ص
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-white dark:border-slate-950 shadow-sm" title="النظام نشط" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-base text-slate-900 dark:text-white tracking-tight">نظام المصروفات</h1>
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-cyan-700 dark:text-cyan-400 font-bold mt-0.5">سندات الصرف واليومية Pro</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-black text-lg transition"
            title="إغلاق القائمة"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3.5 space-y-6 overflow-y-auto">
        {navigationGroups.map((group) => {
          const visibleItems = group.items.filter((item) => !item.adminOnly || isAdmin);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-1">
              <h3 className="px-3 text-[10px] font-black text-slate-500 dark:text-cyan-400 uppercase tracking-widest">
                {group.title}
              </h3>
              <div className="space-y-1 pt-1">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => onCloseMobile && onCloseMobile()}
                      className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-cyan-600 text-white font-extrabold shadow-md shadow-cyan-500/20 dark:bg-gradient-to-r dark:from-cyan-600 dark:via-teal-600 dark:to-blue-600 dark:text-white dark:border dark:border-cyan-400/30 dark:shadow-lg dark:shadow-cyan-600/40'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-cyan-700 dark:hover:text-cyan-300 font-bold'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute right-0 top-2 bottom-2 w-1 bg-amber-400 rounded-l-full shadow-sm" />
                      )}
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400'}`} />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Footer Card */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/60">
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-slate-800 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{user?.fullName || user?.username || 'المستخدم'}</p>
            <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800/60">
              {user?.roles?.[0] || 'CASHIER'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-950 text-slate-800 dark:text-white min-h-screen flex-col border-l border-slate-200 dark:border-slate-800/80 shrink-0 shadow-lg dark:shadow-2xl z-30 transition-colors">
        {sidebarContent}
      </aside>

      {/* Mobile & Tablet Slide-over Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <aside className="fixed top-0 bottom-0 right-0 w-72 bg-white dark:bg-slate-950 text-slate-800 dark:text-white z-50 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}


