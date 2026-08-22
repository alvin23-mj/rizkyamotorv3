'use client';

import { useEffect } from 'react';
import { useSession } from '@/components/providers/AuthProvider';
import { signOut } from 'next-auth/react';
import { LogOut, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AdminTopHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();

  let pageTitle = 'Panel Admin';
  let tabTitle = 'Admin | Rizkya Motor';

  if (pathname === '/dashboard/admin') {
    pageTitle = 'Ringkasan Dashboard';
    tabTitle = 'Ringkasan | Admin';
  } else if (pathname === '/dashboard/admin/cars') {
    pageTitle = 'Kelola Mobil';
    tabTitle = 'Kelola Mobil | Admin';
  } else if (pathname === '/dashboard/admin/brands') {
    pageTitle = 'Kelola Merek';
    tabTitle = 'Kelola Merek | Admin';
  } else if (pathname === '/dashboard/admin/users') {
    pageTitle = 'Manajemen User';
    tabTitle = 'Manajemen User | Admin';
  } else if (pathname === '/dashboard/admin/submissions') {
    pageTitle = 'Pengajuan Jual';
    tabTitle = 'Pengajuan Jual | Admin';
  } else if (pathname === '/dashboard/admin/testdrives') {
    pageTitle = 'Jadwal Test Drive';
    tabTitle = 'Test Drive | Admin';
  } else if (pathname === '/dashboard/admin/events') {
    pageTitle = 'Event & Promo';
    tabTitle = 'Kelola Event | Admin';
  } else if (pathname === '/dashboard/admin/reports') {
    pageTitle = 'Laporan Showroom';
    tabTitle = 'Laporan | Admin';
  } else if (pathname === '/dashboard/admin/schedule-settings' || pathname?.includes('operating-hours')) {
    pageTitle = 'Kelola Jam & Jadwal';
    tabTitle = 'Jam & Jadwal | Admin';
  } else if (pathname === '/dashboard/admin/settings') {
    pageTitle = 'Pengaturan Showroom';
    tabTitle = 'Pengaturan | Admin';
  } else if (pathname === '/dashboard/admin/add' || pathname === '/dashboard/admin/cars/add') {
    pageTitle = 'Tambah Mobil Baru';
    tabTitle = 'Tambah Mobil | Admin';
  } else if (pathname?.endsWith('/edit')) {
    pageTitle = 'Edit Data Mobil';
    tabTitle = 'Edit Mobil | Admin';
  } else if (pathname?.startsWith('/dashboard/admin/cars/')) {
    pageTitle = 'Detail Mobil';
    tabTitle = 'Detail Mobil | Admin';
  }

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = tabTitle;
    }
  }, [tabTitle]);

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center shrink-0 justify-between shadow-xs z-10">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-admin-menu'))}
          className="lg:hidden p-2 -ml-1 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Buka menu admin"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg sm:text-[21px] font-bold text-slate-900 leading-tight">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* User Info Badge */}
        <div className="hidden sm:inline-flex items-center justify-center h-[34px] px-3.5 bg-slate-100 border border-slate-300 text-slate-800 text-[13px] font-semibold rounded-md shadow-xs">
          <span>Rizkya Super Admin</span>
        </div>

        {/* Pembatas */}
        <div className="h-5 w-px bg-slate-300" />

        {/* Logout Button */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="inline-flex items-center justify-center h-[34px] gap-1.5 px-3.5 bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 text-[14px] font-semibold rounded-md shadow-sm hover:shadow transition-all cursor-pointer"
          title="Keluar dari akun admin"
        >
          <LogOut className="w-4 h-4 text-white" />
          <span>Keluar</span>
        </button>
      </div>
    </header>
  );
}
