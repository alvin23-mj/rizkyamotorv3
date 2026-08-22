'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  CarFront,
  CalendarClock,
  Handshake,
  Building2,
  ChevronRight,
  Globe,
  Clock,
  Award,
  Users,
  Settings,
  X,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';

const navSections = [
  {
    title: 'Utama',
    items: [
      { href: '/dashboard/admin', label: 'Ringkasan', icon: BarChart3 },
    ],
  },
  {
    title: 'Katalog & Inventaris',
    items: [
      { href: '/dashboard/admin/cars', label: 'Kelola Mobil', icon: CarFront },
      { href: '/dashboard/admin/brands', label: 'Kelola Merek', icon: Award },
      { href: '/dashboard/admin/models', label: 'Kelola Model', icon: Layers },
    ],
  },
  {
    title: 'Transaksi & Layanan',
    items: [
      { href: '/dashboard/admin/submissions', label: 'Pengajuan Jual', icon: Handshake },
      { href: '/dashboard/admin/testdrives', label: 'Jadwal Test Drive', icon: CalendarClock },
      { href: '/dashboard/admin/users', label: 'Manajemen User', icon: Users },
    ],
  },
  {
    title: 'Laporan & Pengaturan',
    items: [
      { href: '/dashboard/admin/reports', label: 'Laporan Showroom', icon: FileSpreadsheet },
      { href: '/dashboard/admin/schedule-settings', label: 'Kelola Jam & Jadwal', icon: Clock },
      { href: '/dashboard/admin/settings', label: 'Pengaturan Showroom', icon: Settings },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setMobileOpen((prev) => !prev);
    window.addEventListener('toggle-admin-menu', handleToggle);
    return () => window.removeEventListener('toggle-admin-menu', handleToggle);
  }, []);

  if (role !== 'ADMIN') return null;

  const SidebarBody = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Logo / Brand Header */}
      <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center shadow-xs">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[21px] font-bold text-slate-900 leading-tight">Panel Admin</h1>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-1.5">
              {section.title}
            </p>
            {section.items.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href ||
                (href === '/dashboard/admin/cars' &&
                  (pathname?.startsWith('/dashboard/admin/cars') || pathname?.startsWith('/dashboard/admin/add'))) ||
                (href !== '/dashboard/admin' && href !== '/dashboard/admin/cars' && pathname?.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              );
            })}
          </div>
        ))}

        <div className="pt-3 border-t border-slate-200">
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-1.5">Lainnya</p>
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
          >
            <Globe className="w-4 h-4 shrink-0 text-slate-500" />
            <span>Lihat Toko Publik</span>
          </Link>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 shadow-md z-20">
        <SidebarBody />
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10 shadow-2xl">
            <SidebarBody />
          </div>
        </div>
      )}
    </>
  );
}
