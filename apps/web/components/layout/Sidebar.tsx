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
  PanelRightClose,
  PanelRightOpen,
  ChevronRight,
  ChevronLeft,
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN') ?? false;

  const renderContent = (collapsed: boolean) => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 select-none">
      {/* Brand Header */}
      <div className={`border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950 transition-all ${
        collapsed ? 'p-3 flex flex-col items-center gap-3' : 'px-3.5 py-3.5 flex items-center justify-between gap-2'
      }`}>
        <div className={`flex items-center ${collapsed ? 'flex-col justify-center' : 'gap-2.5'}`}>
          <div className="relative shrink-0">
            <div className={`${
              collapsed ? 'w-11 h-11' : 'w-11 h-11'
            } rounded-xl bg-white dark:bg-slate-900/90 flex items-center justify-center p-1 shadow-sm border border-slate-200 dark:border-cyan-500/30 overflow-hidden transition-all`}>
              <img
                src="/logo-only.png"
                alt="شعار النظام"
                className="w-full h-full object-contain"
              />
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 shadow-xs"
              title="النظام متصل"
            />
          </div>

          {!collapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <h1 className="font-black text-sm text-slate-900 dark:text-white tracking-tight whitespace-nowrap">نظام المصروفات</h1>
                <Sparkles className="w-3 h-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
              </div>
              <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold leading-tight mt-0.5 whitespace-nowrap">سندات الصرف واليومية Pro</p>
            </div>
          )}
        </div>

        {/* Collapse Button on Desktop */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={`hidden lg:flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 hover:text-cyan-700 dark:text-slate-300 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-800 transition active:scale-95 shadow-xs shrink-0 ${
              collapsed ? 'w-7 h-7' : 'w-7 h-7'
            }`}
            title={collapsed ? 'توسيع القائمة الجانبية (Expand)' : 'تصغير القائمة الجانبية (Collapse)'}
          >
            {collapsed ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}

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
      <nav className={`flex-1 overflow-y-auto space-y-4 ${collapsed ? 'p-2' : 'p-3'}`}>
        {navigationGroups.map((group, groupIdx) => {
          const visibleItems = group.items.filter((item) => !item.adminOnly || isAdmin);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-1">
              {!collapsed ? (
                <h3 className="px-3 text-[10px] font-black text-slate-400 dark:text-cyan-400/80 uppercase tracking-widest">
                  {group.title}
                </h3>
              ) : groupIdx > 0 ? (
                <div className="my-2 border-t border-slate-200/80 dark:border-slate-800/80 mx-2" />
              ) : null}

              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  if (collapsed) {
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        title={item.name}
                        className={`group relative flex items-center justify-center w-full h-11 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20 dark:bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 dark:text-white dark:border dark:border-cyan-400/30'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-cyan-700 dark:hover:text-cyan-300'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute right-0 top-2 bottom-2 w-1 bg-amber-400 rounded-l-full shadow-xs" />
                        )}
                        <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400'}`} />
                      </Link>
                    );
                  }

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
                        <span className="absolute right-0 top-2 bottom-2 w-1 bg-amber-400 rounded-l-full shadow-xs" />
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
      <div className={`border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/60 ${collapsed ? 'p-2 flex justify-center' : 'p-3'}`}>
        {collapsed ? (
          <div
            className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-slate-800 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400 shadow-xs cursor-pointer"
            title={`${user?.fullName || user?.username || 'المستخدم'} (${user?.roles?.[0] || 'CASHIER'})`}
          >
            <User className="w-5 h-5" />
          </div>
        ) : (
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-slate-800 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{user?.fullName || user?.username || 'المستخدم'}</p>
              <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800/60">
                {user?.roles?.[0] || 'CASHIER'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex ${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-white dark:bg-slate-950 text-slate-800 dark:text-white min-h-screen flex-col border-l border-slate-200 dark:border-slate-800/80 shrink-0 shadow-lg dark:shadow-2xl z-30 transition-all duration-300 ease-in-out`}
      >
        {renderContent(isCollapsed)}
      </aside>

      {/* Mobile & Tablet Slide-over Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          {/* Drawer Panel (Always full-width on mobile) */}
          <aside className="fixed top-0 bottom-0 right-0 w-72 bg-white dark:bg-slate-950 text-slate-800 dark:text-white z-50 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
            {renderContent(false)}
          </aside>
        </div>
      )}
    </>
  );
}
