'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Lock, User, AlertCircle, Loader2, Wallet, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login: setAuthLogin } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    const token = localStorage.getItem('accessToken');
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { username, password });
      const { tokens, user } = res.data.data;

      setAuthLogin(tokens.accessToken, tokens.refreshToken, user);
    } catch (err: any) {
      if (!err.response) {
        setError('تعذر الاتصال بالخادم. تأكد من تشغيل Backend.');
      } else if (err.response.status === 401 || err.response.status === 400) {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
      } else {
        setError(err.response.data?.message || 'حدث خطأ أثناء تسجيل الدخول');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#070d19] text-white flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-slate-950"
    >
      <div className="w-full max-w-md bg-[#0b1329]/90 backdrop-blur-xl border border-cyan-500/30 p-8 rounded-3xl shadow-2xl shadow-cyan-950/50 space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-white/10 dark:bg-slate-900/90 rounded-3xl border border-cyan-500/40 shadow-2xl shadow-cyan-500/20 mb-1 backdrop-blur-md">
            <img
              src="/logo-only.png"
              alt="شعار النظام"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-xl transform scale-105 transition hover:scale-110"
            />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">نظام إدارة المصروفات وسندات الصرف</h1>
          <p className="text-xs text-zinc-400 font-medium">سجّل دخولك للوصول إلى لوحة اليومية والمصروفات</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-sm font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">اسم المستخدم *</label>
            <div className="relative flex items-center">
              <span className="absolute right-3.5 z-10 pointer-events-none text-zinc-400 flex items-center justify-center">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم..."
                style={{ paddingRight: '2.85rem', paddingLeft: '1rem' }}
                className="w-full py-3 bg-[#070d19]/80 border border-slate-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-white outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">كلمة المرور *</label>
            <div className="relative flex items-center">
              <span className="absolute right-3.5 z-10 pointer-events-none text-zinc-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingRight: '2.85rem', paddingLeft: '2.85rem' }}
                className="w-full py-3 bg-[#070d19]/80 border border-slate-800 rounded-xl text-sm font-mono focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-white outline-none transition"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 z-10 text-zinc-400 hover:text-white transition flex items-center justify-center"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5 text-zinc-400" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-extrabold rounded-xl shadow-lg shadow-cyan-500/25 text-sm transition flex items-center justify-center gap-2 mt-2 border border-cyan-300/30 active:scale-98"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري تسجيل الدخول...</span>
              </>
            ) : (
              <span>تسجيل الدخول</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <p className="text-xs text-zinc-400 font-medium">
            الحساب التلقائي التجريبي: <span className="font-mono text-cyan-400 font-bold">admin</span> / <span className="font-mono text-cyan-400 font-bold">AdminPass123!</span>
          </p>
        </div>
      </div>
    </div>
  );
}
