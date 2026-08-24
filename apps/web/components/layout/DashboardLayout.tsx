'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNavigation from './MobileNavigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#070d19] text-slate-900 dark:text-white antialiased selection:bg-cyan-500 selection:text-white transition-colors duration-200">
      <Sidebar isMobileOpen={isMobileMenuOpen} onCloseMobile={() => setIsMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto">{children}</main>
      </div>
      <MobileNavigation />
    </div>
  );
}



