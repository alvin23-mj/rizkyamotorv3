'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/components/providers/AuthProvider';
import { signOut } from 'next-auth/react';
import {
  Calendar,
  Info,
  PhoneCall,
  Sparkles,
  LogOut,
} from 'lucide-react';

// Custom Crisp SVG Icons for 5 Mobile Navigation Items
const SvgBeranda = ({ active }: { active: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? '2.2' : '1.8'}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-5 h-5 mb-0.5 transition-all ${active ? 'text-slate-900' : 'text-slate-500'}`}
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const SvgKatalog = ({ active }: { active: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? '2.2' : '1.8'}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-5 h-5 mb-0.5 transition-all ${active ? 'text-slate-900' : 'text-slate-500'}`}
  >
    <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11M5 11v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6M5 11h14" />
    <circle cx="7.5" cy="14.5" r="1.2" fill="currentColor" />
    <circle cx="16.5" cy="14.5" r="1.2" fill="currentColor" />
  </svg>
);

const SvgJualMobil = ({ active }: { active: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? '2.2' : '1.8'}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-5 h-5 mb-0.5 transition-all ${active ? 'text-slate-900' : 'text-slate-500'}`}
  >
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const SvgLainnya = ({ active }: { active: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? '2.2' : '1.8'}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-5 h-5 mb-0.5 transition-all ${active ? 'text-slate-900' : 'text-slate-500'}`}
  >
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const SvgMasukAkun = ({ active }: { active: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? '2.2' : '1.8'}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-5 h-5 mb-0.5 transition-all ${active ? 'text-slate-900' : 'text-slate-500'}`}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(console.error);
  }, []);

  // Close dropup menu on pathname change
  useEffect(() => {
    setMoreDrawerOpen(false);
  }, [pathname]);

  // Hide on login, register, admin dashboard pages, or before client hydration
  if (
    !mounted ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname?.startsWith('/dashboard/admin')
  ) {
    return null;
  }

  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === 'ADMIN_SHOWROOM' || userRole === 'ADMIN';
  const dashboardHref = isAdmin ? '/dashboard/admin' : '/dashboard';

  const isHomeActive = pathname === '/';
  const isCatalogActive = pathname.startsWith('/cars');
  const isSellActive = pathname === '/sell' || pathname.startsWith('/dashboard/listings/create');
  const isAccountActive = pathname.startsWith('/dashboard') || pathname === '/login';

  const isMoreActive =
    moreDrawerOpen ||
    pathname === '/schedule' ||
    pathname === '/compare' ||
    pathname === '/favorites' ||
    pathname === '/events' ||
    pathname === '/about' ||
    pathname === '/contact';

  const waNumber = (settings?.whatsapp || settings?.phone || '6281234567890').replace(/[^0-9]/g, '');

  return (
    <>
      {/* Simple Minimal Floating Dropup Box for "Lainnya" */}
      {moreDrawerOpen && (
        <>
          {/* Transparent Backdrop Overlay to close when clicking outside */}
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setMoreDrawerOpen(false)}
          />

          {/* Clean Dropdown Card (Floating right above the "Lainnya" button) */}
          <div className="fixed bottom-[68px] right-2 sm:right-16 z-50 w-52 sm:w-56 bg-white border border-slate-200 shadow-2xl py-1 text-xs text-slate-800 animate-in fade-in zoom-in-95 duration-100 rounded-none">
            <Link
              href="/schedule"
              onClick={() => setMoreDrawerOpen(false)}
              className="px-4 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-semibold flex items-center gap-2.5 rounded-none"
            >
              <Calendar className="w-4 h-4 text-slate-800 shrink-0" />
              <span>Jadwal Test Drive</span>
            </Link>

            <Link
              href="/events"
              onClick={() => setMoreDrawerOpen(false)}
              className="px-4 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-semibold flex items-center gap-2.5 rounded-none"
            >
              <Sparkles className="w-4 h-4 text-slate-800 shrink-0" />
              <span>Event & Promo</span>
            </Link>

            <Link
              href="/about"
              onClick={() => setMoreDrawerOpen(false)}
              className="px-4 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-semibold flex items-center gap-2.5 rounded-none"
            >
              <Info className="w-4 h-4 text-slate-800 shrink-0" />
              <span>Tentang Kami</span>
            </Link>

            <Link
              href="/contact"
              onClick={() => setMoreDrawerOpen(false)}
              className="px-4 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-semibold flex items-center gap-2.5 rounded-none"
            >
              <PhoneCall className="w-4 h-4 text-slate-800 shrink-0" />
              <span>Kontak Kami</span>
            </Link>

            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMoreDrawerOpen(false)}
              className="px-4 py-2.5 text-orange-600 hover:bg-orange-50 font-bold flex items-center gap-2.5 rounded-none border-t border-slate-100"
            >
              <svg className="w-4 h-4 fill-current shrink-0 text-orange-600" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>WhatsApp CS</span>
            </a>

            {session && (
              <button
                type="button"
                onClick={() => {
                  setMoreDrawerOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="w-full text-left px-4 py-2.5 text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-2.5 rounded-none border-t border-slate-100 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Keluar Akun ({session.user?.name?.split(' ')[0]})</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* Sticky Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto items-center text-center">
          {/* 1. Beranda */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center h-full transition-colors relative ${
              isHomeActive ? 'text-slate-900 font-extrabold' : 'text-slate-500 font-medium hover:text-slate-800'
            }`}
          >
            <SvgBeranda active={isHomeActive} />
            <span className="text-[11px] leading-none">Beranda</span>
          </Link>

          {/* 2. Katalog */}
          <Link
            href="/cars"
            className={`flex flex-col items-center justify-center h-full transition-colors relative ${
              isCatalogActive ? 'text-slate-900 font-extrabold' : 'text-slate-500 font-medium hover:text-slate-800'
            }`}
          >
            <SvgKatalog active={isCatalogActive} />
            <span className="text-[11px] leading-none">Katalog</span>
          </Link>

          {/* 3. Jual Mobil */}
          <Link
            href="/sell"
            className={`flex flex-col items-center justify-center h-full transition-colors relative ${
              isSellActive ? 'text-slate-900 font-extrabold' : 'text-slate-500 font-medium hover:text-slate-800'
            }`}
          >
            <SvgJualMobil active={isSellActive} />
            <span className="text-[11px] leading-none">Jual Mobil</span>
          </Link>

          {/* 4. Lainnya */}
          <button
            type="button"
            onClick={() => setMoreDrawerOpen(!moreDrawerOpen)}
            className={`flex flex-col items-center justify-center h-full transition-colors relative cursor-pointer ${
              isMoreActive ? 'text-slate-900 font-extrabold' : 'text-slate-500 font-medium hover:text-slate-800'
            }`}
          >
            <SvgLainnya active={isMoreActive} />
            <span className="text-[11px] leading-none">Lainnya</span>
          </button>

          {/* 5. Masuk / Akun */}
          {session ? (
            <Link
              href={dashboardHref}
              className={`flex flex-col items-center justify-center h-full transition-colors relative ${
                isAccountActive ? 'text-slate-900 font-extrabold' : 'text-slate-500 font-medium hover:text-slate-800'
              }`}
            >
              <SvgMasukAkun active={isAccountActive} />
              <span className="text-[11px] leading-none truncate max-w-[56px]">
                {session.user?.name?.split(' ')[0] || 'Akun'}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className={`flex flex-col items-center justify-center h-full transition-colors relative ${
                isAccountActive ? 'text-slate-900 font-extrabold' : 'text-slate-500 font-medium hover:text-slate-800'
              }`}
            >
              <SvgMasukAkun active={isAccountActive} />
              <span className="text-[11px] leading-none">Masuk</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
