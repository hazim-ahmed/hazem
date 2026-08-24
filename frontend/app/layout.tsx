import './globals.css';
import React from 'react';
import Providers from '@/lib/providers';

export const metadata = {
  title: 'نظام إدارة المصروفات اليومية وسندات الصرف',
  description: 'لوحة تحكم إدارية ومالية لإدارة اليومية وسندات الصرف ومتابعة ربط المشاريع',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-50 min-h-screen text-slate-900 antialiased font-arabic">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
