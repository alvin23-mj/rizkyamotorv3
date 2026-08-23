'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import { User, Mail, Phone, Lock, Save, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function UserProfilePage() {
  const { data: session, update } = useSession();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setName(data.name || session?.user?.name || '');
          setEmail(data.email || session?.user?.email || '');
          setPhone(data.phone || '');
        } else {
          setName(session?.user?.name || '');
          setEmail(session?.user?.email || '');
        }
      } catch (err) {
        setName(session?.user?.name || '');
        setEmail(session?.user?.email || '');
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Nama / Username tidak boleh kosong.' });
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setMessage({ type: 'error', text: 'Kata sandi baru minimal 6 karakter.' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'Konfirmasi kata sandi baru tidak cocok.' });
        return;
      }
      if (!currentPassword) {
        setMessage({ type: 'error', text: 'Masukkan kata sandi lama untuk mengubah kata sandi.' });
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui profil.');
      }

      setMessage({ type: 'success', text: 'Profil & akun Anda berhasil diperbarui!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      await update({
        ...session,
        user: {
          ...session?.user,
          name: name,
          email: email,
        },
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan saat menyimpan.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center text-xs font-medium text-slate-500">
        Memuat data profil...
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 min-h-[calc(100vh-200px)] py-8 text-xs">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back Link & Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
          <h1 className="text-base font-bold text-slate-900">Pengaturan Akun & Profil</h1>
        </div>

        {/* Alert Notification */}
        {message && (
          <div
            className={`p-4 rounded-xl flex items-start gap-3 border transition-all ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <p className="font-semibold text-xs leading-relaxed">{message.text}</p>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Data Pengguna */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-700" />
              <h2 className="font-bold text-slate-900 text-sm">Informasi Akun Saya</h2>
            </div>

            <div className="space-y-4">
              {/* Username / Name */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Nama Lengkap / Username</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs font-medium text-slate-900"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Alamat Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs font-medium text-slate-900"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Nomor HP / WhatsApp</label>
                <div className="relative">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs font-medium text-slate-900"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Ubah Password */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-700" />
              <h2 className="font-bold text-slate-900 text-sm">Ganti Kata Sandi (Opsional)</h2>
            </div>
            <p className="text-slate-500 text-xs">
              Isi bagian ini hanya jika Anda ingin mengganti kata sandi akun Anda.
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Kata Sandi Lama</label>
                <div className="relative">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Kata sandi saat ini"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs font-medium text-slate-900"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Kata Sandi Baru</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs font-medium text-slate-900"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Konfirmasi Kata Sandi Baru</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs font-medium text-slate-900"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Profil'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
