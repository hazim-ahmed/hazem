'use client';

import React from 'react';
import { LogOut, User, ShieldCheck, Activity, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export default function Header({ onToggleMobileMenu }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm dark:shadow-xl transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle Button */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 transition active:scale-95"
            title="فتح القائمة الجانبية"
          >
            <Menu className="w-5 h-5 text-slate-800 dark:text-cyan-400" />
          </button>
        )}

        <div className="flex items-center gap-2.5 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 px-3 sm:px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-black shadow-inner">
          <img src="/logo-only.png" alt="Logo" className="w-5 h-5 object-contain shrink-0 drop-shadow-sm" />
          <span className="truncate max-w-[180px] sm:max-w-none">نظام اليوميات وسندات الصرف الحية Pro</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 text-xs font-black px-3.5 py-2 rounded-xl transition border shadow-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-cyan-400 border-slate-200 dark:border-slate-800 hover:scale-105 active:scale-95"
          title={theme === 'dark' ? 'التحويل للوضع الفاتح (Light Mode)' : 'التحويل للوضع الداكن (Dark Mode)'}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span className="hidden sm:inline text-slate-200">الوضع الفاتح</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-cyan-600" />
              <span className="hidden sm:inline text-slate-800">الوضع الداكن</span>
            </>
          )}
        </button>

        {/* User Card Badge */}
        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900/90 px-4 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 transition cursor-pointer shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-cyan-600 dark:bg-gradient-to-tr dark:from-cyan-500 dark:to-blue-600 text-white dark:text-slate-950 flex items-center justify-center font-bold text-xs shadow-md shadow-cyan-500/30">
            <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">
              {user?.fullName || user?.username || 'المستخدم'}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <span className="text-[10px] font-extrabold text-cyan-700 dark:text-cyan-400 uppercase tracking-wide">
                {user?.roles?.[0] || 'CASHIER'}
              </span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 px-3.5 py-2 rounded-xl transition border border-rose-200 dark:border-rose-900/60 font-black shadow-sm"
          title="تسجيل الخروج من الجلسة"
        >
          <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span className="hidden sm:inline">تسجيل الخروج</span>
        </button>
      </div>
    </header>
  );


}
