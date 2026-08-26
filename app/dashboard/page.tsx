'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/components/providers/AuthProvider';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { formatRupiah, formatDate } from '@/lib/utils';
import { User, ArrowRight, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [bookings, setBookings] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const role = (session?.user as any)?.role;
  const isAdmin = role === 'ADMIN' || role === 'ADMIN_SHOWROOM';

  useEffect(() => {
    async function loadUserTransactions() {
      if (!session) return;
      setLoadingData(true);
      try {
        const [resBookings, resSubmissions] = await Promise.all([
          fetch('/api/bookings?my=true'),
          fetch('/api/sell?my=true'),
        ]);

        if (resBookings.ok) {
          const bData = await resBookings.json();
          setBookings(Array.isArray(bData) ? bData : []);
        }

        if (resSubmissions.ok) {
          const sData = await resSubmissions.json();
          setSubmissions(Array.isArray(sData) ? sData : []);
        }
      } catch (e) {
        console.error('Failed to load user transactions:', e);
      } finally {
        setLoadingData(false);
      }
    }

    loadUserTransactions();
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="bg-slate-50 min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Memuat Dashboard...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 min-h-[65vh] flex flex-col items-center justify-center text-center bg-white">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Harap Login</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md leading-relaxed">
          Silakan login untuk mengakses Dashboard riwayat transaksi Anda.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-sm cursor-pointer"
        >
          Login Sekarang
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/60 min-h-[calc(100vh-180px)] pt-4 sm:pt-6 pb-28 lg:pb-12 text-xs">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">

        {/* Profile Header Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white font-extrabold text-base sm:text-lg shrink-0 uppercase shadow-xs">
              {session.user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 space-y-0.5">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                {session.user?.name}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium">
                {isAdmin ? 'Admin Showroom' : 'Pengguna Terverifikasi'}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                {session.user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-wrap">
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer text-center"
              >
                Panel Admin
              </Link>
            )}
            <Link
              href="/dashboard/profile"
              className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <User className="w-3.5 h-3.5 text-slate-600" />
              <span>Pengaturan Profil</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex-1 sm:flex-none bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-rose-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              title="Keluar dari Akun"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* 2 Main Transaction History Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">

          {/* Card 1: Riwayat Transaksi Pembelian */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  Riwayat Transaksi Pembelian
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Booking unit & janji temu test drive kendaraan Anda
                </p>
              </div>
              <span className="self-start sm:self-auto text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                {bookings.length} Transaksi
              </span>
            </div>

            {loadingData ? (
              <div className="py-10 text-center text-slate-400 font-medium text-xs">
                Memuat riwayat pembelian...
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-0.5">
                {bookings.map((item) => {
                  const isDp = Boolean(item.notes?.toLowerCase().includes('dp'));
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 bg-white sm:bg-slate-50/50 space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-xs leading-snug">
                            {item.carListing?.title || `${item.carListing?.brand || 'Unit'} ${item.carListing?.model || ''}`}
                          </h3>
                          {item.carListing?.price && (
                            <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                              {formatRupiah(item.carListing.price)}
                            </p>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="self-start sm:self-auto shrink-0">
                          {item.status === 'CONFIRMED' || item.status === 'CONFIRMED_DP' ? (
                            <span className="inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md">
                              Disetujui
                            </span>
                          ) : item.status === 'COMPLETED' ? (
                            <span className="inline-flex items-center bg-slate-100 text-slate-800 border border-slate-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md">
                              Selesai
                            </span>
                          ) : item.status === 'CANCELLED' ? (
                            <span className="inline-flex items-center bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md">
                              Dibatalkan
                            </span>
                          ) : (
                            <span className="inline-flex items-center bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md">
                              Menunggu Respon
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-slate-600">
                        <span>Jadwal: <strong>{item.bookingDate}</strong> ({item.bookingTime})</span>
                        <span className="font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px]">
                          {isDp ? 'DP Tanda Jadi' : 'Test Drive'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center border border-dashed border-slate-300 rounded-xl space-y-2.5 px-4">
                <p className="font-bold text-slate-900 text-xs">Belum Ada Transaksi Pembelian</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Anda belum pernah melakukan booking kunjungan atau DP tanda jadi.
                </p>
                <div className="pt-1">
                  <Link
                    href="/cars"
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    <span>Lihat Katalog Mobil</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Riwayat Transaksi Penjualan */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  Riwayat Transaksi Penjualan
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pengajuan penjualan unit mobil Anda ke showroom
                </p>
              </div>
              <span className="self-start sm:self-auto text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                {submissions.length} Pengajuan
              </span>
            </div>

            {loadingData ? (
              <div className="py-10 text-center text-slate-400 font-medium text-xs">
                Memuat riwayat penjualan...
              </div>
            ) : submissions.length > 0 ? (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-0.5">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 bg-white sm:bg-slate-50/50 space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-xs leading-snug">
                          {sub.brand} {sub.model} ({sub.year})
                        </h3>
                        <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                          Ekspektasi: {formatRupiah(sub.expectedPrice)}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="self-start sm:self-auto shrink-0">
                        {sub.status === 'APPROVED' || sub.status === 'INSPECTED' ? (
                          <span className="inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md">
                            Disetujui
                          </span>
                        ) : sub.status === 'REJECTED' ? (
                          <span className="inline-flex items-center bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md">
                            Ditolak
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md">
                            Menunggu Review
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-slate-600">
                      <span>Kota: <strong>{sub.city}</strong></span>
                      <span>{sub.createdAt ? formatDate(sub.createdAt) : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center border border-dashed border-slate-300 rounded-xl space-y-2.5 px-4">
                <p className="font-bold text-slate-900 text-xs">Belum Ada Transaksi Penjualan</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Anda belum pernah mengajukan penjualan mobil bekas ke showroom kami.
                </p>
                <div className="pt-1">
                  <Link
                    href="/sell"
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    <span>Jual Mobil Saya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
