'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useSession } from '@/components/providers/AuthProvider';
import { useState, useEffect } from 'react';
import {
  Car,
  LogOut,
  Menu,
  X,
  PhoneCall,
  ShieldCheck,
  LayoutDashboard,
  MapPin,
  Clock,
  ChevronDown,
  ChevronRight,
  Search,
  LayoutGrid,
  PlusCircle,
  Calendar,
  User,
  Heart,
  Scale,
} from 'lucide-react';
import { useComparison } from '@/context/ComparisonContext';
import { useFavorites } from '@/context/FavoritesContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { comparisonList } = useComparison();
  const { favoriteList } = useFavorites();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [catalogCars, setCatalogCars] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
        if (data.locations && Array.isArray(data.locations)) setLocations(data.locations);
      })
      .catch(console.error)
      .finally(() => setIsLoaded(true));

    fetch('/api/cars')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setCatalogCars(data);
      })
      .catch(console.error);
  }, []);

  // Handle ESC key press and body scroll locking for search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
      }
    };

    if (searchModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchModalOpen]);

  // Dynamic category options derived from current catalog cars
  const bodyTypesList = (() => {
    if (!catalogCars || catalogCars.length === 0) {
      return ['SUV', 'MPV', 'Sedan', 'Hatchback', 'Crossover'];
    }
    const set = new Set(catalogCars.map((c) => c.bodyType).filter((b): b is string => Boolean(b)));
    return Array.from(set);
  })();

  const brandsList = (() => {
    if (!catalogCars || catalogCars.length === 0) {
      return ['Toyota', 'Honda', 'Mitsubishi', 'Suzuki', 'Hyundai', 'BMW', 'Mercedes-Benz'];
    }
    const set = new Set(catalogCars.map((c) => c.brand).filter((b): b is string => Boolean(b)));
    return Array.from(set);
  })();

  const fuelTypesList = (() => {
    if (!catalogCars || catalogCars.length === 0) {
      return ['Bensin', 'Diesel', 'Hybrid', 'Electric'];
    }
    const set = new Set(
      catalogCars
        .map((c) => (c.fuelType === 'Pertalite/Bensin' ? 'Bensin' : c.fuelType))
        .filter((f): f is string => Boolean(f))
    );
    return Array.from(set);
  })();

  const transmissionsList = (() => {
    if (!catalogCars || catalogCars.length === 0) {
      return ['Automatic', 'Manual'];
    }
    const set = new Set(catalogCars.map((c) => c.transmission).filter((t): t is string => Boolean(t)));
    return Array.from(set);
  })();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    if (path === '/cars') return pathname.startsWith('/cars');
    return pathname === path;
  };

  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === 'ADMIN_SHOWROOM' || userRole === 'ADMIN';
  const dashboardHref = isAdmin ? '/dashboard/admin' : '/dashboard';

  // Live filter catalog cars based on searchQuery
  const filteredCars = (() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return catalogCars.filter((car) => {
      const titleMatch = car.title?.toLowerCase().includes(query);
      const brandMatch = car.brand?.toLowerCase().includes(query);
      const modelMatch = car.model?.toLowerCase().includes(query);
      const bodyMatch = car.bodyType?.toLowerCase().includes(query);
      const yearMatch = car.year?.toString().includes(query);
      return titleMatch || brandMatch || modelMatch || bodyMatch || yearMatch;
    });
  })();

  // Do not render Navbar on login and register pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/cars?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchModalOpen(false);
    } else {
      router.push('/cars');
      setSearchModalOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
      {/* 1. Motodeal Style Top Bar with Slanted Info (\ Slant Cut), Orange Call Box & Aligned Navy Right Extension */}
      <div className="bg-white text-slate-800 text-[12px] hidden md:block relative z-20 overflow-hidden">
        {/* Dark Navy Background overlay extending from left-1/4 to screen right edge */}
        <div className="bg-slate-900 absolute top-0 bottom-0 right-0 left-1/4 -z-10 [clip-path:polygon(0_0,100%_0,100%_100%,36px_100%)] pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex justify-end items-center h-11">
          {/* Right Slanted Info Bar & Call Button (Orange button aligned with Navbar 2 right edge) */}
          <div className="flex items-center h-full">
            {/* Slanted Dark Container (Slant Cut: Top Left 0_0, Bottom Left 36px_100%) */}
            <div className="bg-slate-900 text-slate-200 pl-14 sm:pl-20 pr-6 h-full flex items-center gap-6 text-[12px] font-medium [clip-path:polygon(0_0,100%_0,100%_100%,36px_100%)]">
              <div className="flex items-center gap-2 pl-2">
                <Clock className="w-3.5 h-3.5 text-white shrink-0" />
                <span>{settings?.operatingHoursText || 'Senin - Sabtu: 08:30 - 18:00 WIB'}</span>
              </div>
              <a
                href={
                  settings?.googleMapsUrl ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings?.address || 'Showroom Rizkya Motor')}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hidden lg:flex text-slate-200 cursor-pointer"
                title="Buka Lokasi di Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-white shrink-0" />
                <span>{settings?.address || 'Jl. Raya Showroom Utama, Jakarta'}</span>
              </a>
            </div>

            {/* Vibrant Orange Call CTA Box */}
            <a
              href={`https://wa.me/${(settings?.whatsapp || settings?.phone || '6281234567890').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-600 hover:bg-orange-500 text-white px-6 sm:px-8 flex items-center gap-2 text-[12px] font-extrabold transition-colors shadow-xs h-full shrink-0"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>{settings?.whatsapp || settings?.phone || '0812-3456-7890'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar (Container Layout matching Brand Section) */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-[78px] flex items-center justify-between">
        {/* Brand Logo (Spanning Navbar 1 & Navbar 2 on desktop) */}
        <Link href="/" className="flex items-center shrink-0 pr-4 sm:pr-6 relative z-30 md:-mt-11 h-auto md:h-[122px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={settings?.logoUrl || '/logo.png'}
            alt={settings?.name || 'Rizkya Motor'}
            className={`h-12 sm:h-16 lg:h-[96px] max-w-[200px] sm:max-w-[340px] object-contain transition-opacity duration-300 mix-blend-multiply ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo.png';
            }}
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 sm:gap-8 font-bold text-[15px] text-slate-900">
          <Link
            href="/"
            className={`py-1 transition-colors ${
              isActive('/') ? 'text-black font-extrabold' : 'text-slate-900 font-bold hover:text-black'
            }`}
          >
            Beranda
          </Link>

          <Link
            href="/cars"
            className={`py-1 transition-colors ${
              isActive('/cars') ? 'text-black font-extrabold' : 'text-slate-900 font-bold hover:text-black'
            }`}
          >
            Katalog
          </Link>

          <Link
            href="/schedule"
            className={`py-1 transition-colors ${
              isActive('/schedule') ? 'text-black font-extrabold' : 'text-slate-900 font-bold hover:text-black'
            }`}
          >
            Lihat Jadwal
          </Link>

          <Link
            href="/sell"
            className={`py-1 transition-colors ${
              isActive('/sell') ? 'text-black font-extrabold' : 'text-slate-900 font-bold hover:text-black'
            }`}
          >
            Jual Kendaraan
          </Link>

          <Link
            href="/contact"
            className={`py-1 transition-colors ${
              isActive('/contact') ? 'text-black font-extrabold' : 'text-slate-900 font-bold hover:text-black'
            }`}
          >
            Kontak Kami
          </Link>
        </nav>

        {/* Right Icon Actions: Search, Favorites, Compare & User Auth */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Search Trigger Button */}
          <button
            suppressHydrationWarning
            onClick={() => setSearchModalOpen(!searchModalOpen)}
            className="p-2 rounded-full text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors relative cursor-pointer"
            title="Cari Mobil"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Favorites Link */}
          <Link
            href="/favorites"
            className="p-2 rounded-full text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors relative flex items-center justify-center"
            title="Mobil Favorit"
          >
            <Heart className="w-5 h-5" />
            {mounted && favoriteList.length > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center">
                {favoriteList.length}
              </span>
            )}
          </Link>

          {/* Compare Link */}
          <Link
            href="/compare"
            className="p-2 rounded-full text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors relative flex items-center justify-center"
            title="Komparasi Unit"
          >
            <Scale className="w-5 h-5" />
            {mounted && comparisonList.length > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-slate-900 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center">
                {comparisonList.length}
              </span>
            )}
          </Link>

          {/* Vertical Divider | */}
          <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

          {/* User Auth Profile Dropdown or Login Link (Desktop Only) */}
          {mounted && session ? (
            <div className="relative hidden lg:block">
              <button
                suppressHydrationWarning
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1 text-slate-900 font-bold text-[15px] hover:text-slate-700 transition-colors px-1 py-1 cursor-pointer"
              >
                <span className="whitespace-nowrap">{session.user?.name?.split(' ')[0] || 'User'}</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 shadow-2xl py-2 z-50 text-xs text-slate-800 rounded-md"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-[11px] text-slate-400">Tersambung sebagai</p>
                    <p className="font-bold text-slate-900 truncate">{session.user?.email}</p>
                  </div>

                  <Link
                    href={dashboardHref}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="px-4 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-semibold flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-800" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    href={isAdmin ? '/dashboard/admin/profile' : '/dashboard/profile'}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="px-4 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-semibold flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-slate-800" />
                    <span>Profil & Akun</span>
                  </Link>

                  <button
                    suppressHydrationWarning
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-slate-900 font-bold text-[15px] hover:text-black transition-colors px-1 py-1 hidden lg:block"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>

      {/* Pop-up Search Modal with 50% Blur Backdrop */}
      {searchModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/50 backdrop-blur-md transition-all duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSearchModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="p-4 sm:p-5 flex items-center gap-3 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-400 shrink-0 ml-1" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik merek atau model (contoh: Toyota, Avanza, HRV)..."
                className="w-full bg-transparent text-slate-900 text-sm sm:text-base font-medium focus:outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors shrink-0 cursor-pointer"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </form>

            {/* Live Search Suggestions */}
            {searchQuery.trim() ? (
              <div className="bg-slate-50/70 p-4 sm:p-5 text-xs max-h-[60vh] overflow-y-auto border-t border-slate-100">
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1">
                    <p className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                      Hasil Pencarian Langsung
                    </p>
                  </div>

                  {filteredCars.length > 0 ? (
                    <div className="divide-y divide-slate-200/60 bg-white border border-slate-200 shadow-2xs">
                      {filteredCars.slice(0, 8).map((car) => (
                        <div
                          key={car.id}
                          onClick={() => {
                            router.push(`/cars/${car.id}`);
                            setSearchModalOpen(false);
                          }}
                          className="p-3 flex items-center gap-3.5 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              car.images && car.images.length > 0
                                ? car.images[0].url
                                : 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80'
                            }
                            alt={car.title}
                            className="w-14 h-10 object-cover border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-xs truncate">{car.title}</p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span>{car.brand}</span>
                              <span>•</span>
                              <span>{car.year}</span>
                              <span>•</span>
                              <span className="font-bold text-slate-900">
                                Rp {Number(car.price || 0).toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-500 space-y-2">
                      <p className="text-xs">Tidak ada unit mobil yang cocok dengan &quot;{searchQuery}&quot;</p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
