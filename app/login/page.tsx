'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, Lock, Mail, Building2, UserCheck, User, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email: loginEmail,
        password: loginPass,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        setActiveDemo(null);
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError('Terjadi kesalahan saat login.');
      setLoading(false);
      setActiveDemo(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setActiveDemo(demoEmail);
    await performLogin(demoEmail, 'password123');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col items-center justify-center p-4 selection:bg-slate-900 selection:text-white">
      {/* Main Login Container */}
      <div className="w-full max-w-md">
        {/* Back Link */}
        <div className="mb-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-lg shadow-2xs hover:shadow-xs transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-md p-8 shadow-xs space-y-6">
          {/* Header Title */}
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Masuk ke Akun</h2>
            <p className="text-xs text-slate-500">
              Kelola mobil favorit, simulasi kredit, atau reservasi test drive
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-md pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition-all cursor-text"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-md pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition-all cursor-text"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                  title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-md shadow-2xs transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading && !activeDemo && <Loader2 className="w-4 h-4 animate-spin text-white" />}
              <span>{loading ? 'Proses Login...' : 'Masuk Sekarang'}</span>
            </button>
          </form>



          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-200">
            Belum punya akun?{' '}
            <Link href="/register" className="text-slate-900 font-extrabold hover:underline">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
