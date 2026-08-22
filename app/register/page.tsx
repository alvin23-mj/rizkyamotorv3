'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, Lock, Mail, User, Phone, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal mendaftar');
      } else {
        alert('Pendaftaran berhasil! Silakan login dengan akun baru Anda.');
        router.push('/login');
      }
    } catch (err: any) {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
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

      <div className="bg-white border border-slate-200 rounded-md p-8 shadow-xs space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Buat Akun Pelanggan</h2>
          <p className="text-xs text-slate-500">
            Daftar untuk menyimpan favorit & melakukan reservasi test drive
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label htmlFor="reg-name" className="block font-semibold text-slate-700 mb-1.5">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="reg-name"
                type="text"
                required
                placeholder="Contoh: Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition-all cursor-text"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" className="block font-semibold text-slate-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="reg-email"
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition-all cursor-text"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-phone" className="block font-semibold text-slate-700 mb-1.5">Nomor WhatsApp</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="reg-phone"
                type="tel"
                placeholder="08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition-all cursor-text"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-password" className="block font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md pl-10 pr-10 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition-all cursor-text"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                title={showPassword ? 'Sembunyikan Password' : 'Tampilkan Password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-md shadow-2xs transition-all disabled:opacity-60 cursor-pointer mt-2 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
            <span>{loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-200">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-extrabold text-slate-900 hover:underline">
            Masuk Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col items-center justify-center p-4 selection:bg-slate-900 selection:text-white">
      <Suspense fallback={<div className="text-xs text-slate-500">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
