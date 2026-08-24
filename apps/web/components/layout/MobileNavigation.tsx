'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  FolderKanban, 
  FileSpreadsheet,
  MoreHorizontal,
  Receipt,
  Users,
  Tags,
  ShieldCheck,
  Settings,
  X,
  Sparkles
} from 'lucide-react';

export default function MobileNavigation() {
  const [mounted, setMounted] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Primary 4 tabs in bottom dock
  const navLinks = [
    { label: 'الرئيسية', href: '/dashboard', icon: LayoutDashboard },
    { label: 'اليوميات', href: '/journals', icon: BookOpen },
    { label: 'المشاريع', href: '/projects', icon: FolderKanban },
    { label: 'التقارير', href: '/reports', icon: FileSpreadsheet },
  ];

  // Secondary screens in "المزيد" menu
  const extraLinks = [
    { 
      label: 'إضافة سند صرف', 
      desc: 'تسجيل سند جديد بسرعة',
      href: '/transactions/new', 
      icon: Receipt,
      badge: 'سريع'
    },
    { 
      label: 'المستفيدون والموردون', 
      desc: 'إدارة أطراف المعاملات',
      href: '/beneficiaries', 
      icon: Users 
    },
    { 
      label: 'تصنيفات المصروفات', 
      desc: 'تبويب البنود والمصروفات',
      href: '/categories', 
      icon: Tags 
    },
    { 
      label: 'المستخدمون والصلاحيات', 
      desc: 'إدارة الحسابات والأدوار',
      href: '/users', 
      icon: ShieldCheck 
    },
    { 
      label: 'إعدادات النظام', 
      desc: 'تخصيص الخيارات والتفضيلات',
      href: '/settings', 
      icon: Settings 
    },
  ];

  const isPrimaryActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname.startsWith(href);
  };

  const isExtraActive = extraLinks.some((link) => pathname.startsWith(link.href));

  // Don't render mobile navbar on login page
  if (pathname === '/login') return null;

  return (
    <>
      {/* Bottom Sheet Modal for "المزيد" */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-[120] md:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMoreOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
          />

          {/* Sliding Card Drawer */}
          <div 
            className="fixed bottom-0 inset-x-0 mx-auto w-full max-w-lg rounded-t-3xl border-t border-x border-cyan-500/40 p-5 z-[130] shadow-2xl animate-in slide-in-from-bottom duration-300"
            style={{
              background: 'linear-gradient(180deg, #0b1329 0%, #070d19 100%)',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-cyan-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white tracking-tight">جميع الشاشات والخدمات</h3>
                  <p className="text-xs text-zinc-400 font-medium">اختر الشاشة المطلوبة للانتقال المباشر</p>
                </div>
              </div>

              <button
                onClick={() => setIsMoreOpen(false)}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Extra Screens */}
            <div className="space-y-2 mb-4">
              {extraLinks.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const IconComponent = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${
                      isActive
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                        : 'bg-white/5 border-white/10 text-zinc-200 hover:bg-white/10 hover:border-cyan-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                          isActive 
                            ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold shadow-md' 
                            : 'bg-[#070d19] text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white">{item.label}</span>
                          {item.badge && (
                            <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-cyan-500 text-slate-950">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 font-medium mt-0.5">{item.desc}</p>
                      </div>
                    </div>

                    <div className="w-2 h-2 rounded-full bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>

            {/* Footer Close Info */}
            <div className="pt-3 border-t border-white/5 text-center">
              <span className="text-[11px] text-zinc-400 font-bold">
                نظام المصروفات • التنقل السريع
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Navigation Dock */}
      <nav
        className="md:hidden fixed inset-x-0 mx-auto z-[100] w-[96%] max-w-md pointer-events-auto"
        style={{
          bottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.96)',
          transition: 'opacity 700ms cubic-bezier(0.22,1,0.36,1), transform 700ms cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <div
          className="flex items-center gap-1 px-1.5 py-1.5 rounded-2xl border border-cyan-500/30 backdrop-blur-2xl"
          style={{
            background: 'linear-gradient(135deg, #0b1329 0%, #070d19 100%)',
            boxShadow: '0 16px 40px -14px rgba(7, 13, 25, 0.85), 0 0 20px -5px rgba(6, 182, 212, 0.3)',
            minHeight: '62px',
          }}
        >
          {/* Main 4 Navigation Links */}
          {navLinks.map((link) => {
            const active = isPrimaryActive(link.href) && !isMoreOpen;
            const IconComponent = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMoreOpen(false)}
                className={`flex items-center justify-center gap-1 py-2.5 rounded-xl select-none transition-all duration-300 ${
                  active ? 'text-cyan-400' : 'text-zinc-300 hover:text-white active:scale-95'
                }`}
                style={
                  active
                    ? {
                        flex: '1.4',
                        minHeight: '44px',
                        background: 'rgba(6, 182, 212, 0.18)',
                        boxShadow: '0 4px 20px -4px rgba(6, 182, 212, 0.35), inset 0 1px 1px rgba(255,255,255,0.2)',
                        border: '1px solid rgba(6, 182, 212, 0.45)',
                        borderRadius: '0.75rem',
                        transition: 'flex 500ms cubic-bezier(0.22,1,0.36,1)',
                      }
                    : {
                        flex: '1',
                        minHeight: '44px',
                        transition: 'flex 500ms cubic-bezier(0.22,1,0.36,1), color 200ms',
                      }
                }
              >
                <IconComponent
                  className="shrink-0"
                  style={{
                    width: '19px',
                    height: '19px',
                    strokeWidth: active ? 2.5 : 2,
                    color: active ? '#22d3ee' : 'currentColor',
                    transition: 'stroke-width 300ms, color 300ms',
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    maxWidth: active ? '85px' : '0px',
                    opacity: active ? 1 : 0,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    fontWeight: '800',
                    color: '#22d3ee',
                    transition: 'max-width 500ms cubic-bezier(0.22,1,0.36,1), opacity 350ms ease',
                  }}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}

          {/* 5th Tab: "المزيد" Button to Access All Extra Screens */}
          <button
            type="button"
            onClick={() => setIsMoreOpen((prev) => !prev)}
            className={`flex items-center justify-center gap-1 py-2.5 rounded-xl select-none transition-all duration-300 ${
              isMoreOpen || isExtraActive
                ? 'text-cyan-400'
                : 'text-zinc-300 hover:text-white active:scale-95'
            }`}
            style={
              isMoreOpen || isExtraActive
                ? {
                    flex: '1.4',
                    minHeight: '44px',
                    background: 'rgba(6, 182, 212, 0.18)',
                    boxShadow: '0 4px 20px -4px rgba(6, 182, 212, 0.35), inset 0 1px 1px rgba(255,255,255,0.2)',
                    border: '1px solid rgba(6, 182, 212, 0.45)',
                    borderRadius: '0.75rem',
                    transition: 'flex 500ms cubic-bezier(0.22,1,0.36,1)',
                  }
                : {
                    flex: '1',
                    minHeight: '44px',
                    transition: 'flex 500ms cubic-bezier(0.22,1,0.36,1), color 200ms',
                  }
            }
          >
            <MoreHorizontal
              className="shrink-0"
              style={{
                width: '20px',
                height: '20px',
                strokeWidth: isMoreOpen || isExtraActive ? 2.5 : 2,
                color: isMoreOpen || isExtraActive ? '#22d3ee' : 'currentColor',
                transition: 'stroke-width 300ms, color 300ms',
              }}
            />
            <span
              style={{
                fontSize: '11px',
                maxWidth: isMoreOpen || isExtraActive ? '85px' : '0px',
                opacity: isMoreOpen || isExtraActive ? 1 : 0,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                display: 'inline-block',
                fontWeight: '800',
                color: '#22d3ee',
                transition: 'max-width 500ms cubic-bezier(0.22,1,0.36,1), opacity 350ms ease',
              }}
            >
              المزيد
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}

