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
  Sun,
  Moon,
  Calendar,
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
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
        if (data.locations && Array.isArray(data.locations)) setLocations(data.locations);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    if (path === '/cars') return pathname.startsWith('/cars');
    return pathname === path;
  };

  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === 'ADMIN_SHOWROOM' || userRole === 'ADMIN';
  const dashboardHref = isAdmin ? '/dashboard/admin' : '/dashboard';

  // Do not render Navbar on login and register pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/cars?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/cars');
    }
  };

  return (
    <header className="sticky top-0 z-50 shadow-xs">
      {/* 1. Top Sub-Header Bar (Navbar 1: Dark Slate) */}
      <div className="bg-slate-900 text-white text-[12px] border-b border-slate-800 hidden md:block">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-stretch justify-between">
          {/* Left Info: Lihat Toko Dropdown */}
          <div className="flex items-center gap-3 text-[12px] text-slate-300 font-medium py-2">
            <div className="relative">
              <button
                onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
                className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer group"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-300 group-hover:text-white transition-colors shrink-0" />
                <span>Lokasi Showroom</span>
                <ChevronDown className={`w-3 h-3 text-slate-300 group-hover:text-white transition-all ${storeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {storeDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-800 shadow-2xl py-1 z-50 text-white text-xs rounded-[10px]"
                  onMouseLeave={() => setStoreDropdownOpen(false)}
                >
                  {/* Dynamic Showroom Locations List */}
                  {locations && locations.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60">
                      {locations.map((loc) => (
                        <Link
                          key={loc.id}
                          href="/contact"
                          onClick={() => setStoreDropdownOpen(false)}
                          className="px-4 py-3 hover:bg-slate-800/80 flex flex-col gap-1 transition-colors group block"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white group-hover:text-amber-400 transition-colors">
                              {loc.name}
                            </span>
                            {loc.city && (
                              <span className="text-[10px] text-slate-400 font-bold uppercase">{loc.city}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            {loc.address}
                          </p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href="/contact"
                      onClick={() => setStoreDropdownOpen(false)}
                      className="px-4 py-3 hover:bg-slate-800/80 flex flex-col gap-1 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white group-hover:text-amber-400 transition-colors">
                          {settings?.name || 'Rizkya Motor'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {settings?.address || 'Alamat Showroom'}
                      </p>
                    </Link>
                  )}

                  {/* Footer Link */}
                  <div className="border-t border-slate-800/60 mt-1">
                    <Link
                      href="/contact"
                      onClick={() => setStoreDropdownOpen(false)}
                      className="px-4 py-2.5 hover:bg-slate-800/80 text-[11px] font-bold text-slate-300 hover:text-white no-underline flex items-center justify-between transition-colors group"
                    >
                      <span>Lihat Peta & Detail Lokasi</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Vertical Divider */}
            <div className="h-3.5 w-px bg-slate-700" />

            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span>{settings?.operatingHoursText || '08:30 - 18:00 WIB'}</span>
            </div>
          </div>

          {/* Right Info & Auth Actions (Tentang Kami + Kontak Kami + Profile) */}
          <div className="flex items-center gap-3 text-[12px] text-slate-300 font-medium py-2">
            {/* Tentang Kami Link */}
            <Link
              href="/about"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Tentang Kami
            </Link>

            {/* Vertical Divider */}
            <div className="h-3.5 w-px bg-slate-700" />

            {/* Kontak Kami Link */}
            <Link
              href="/contact"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Kontak Kami
            </Link>

            {/* Vertical Divider */}
            <div className="h-3.5 w-px bg-slate-700" />

            {/* Auth Actions inside Navbar 1 */}
            {session ? (
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1 rounded-[6px] transition-all shadow-xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-[10px] border border-slate-700">
                      {session.user?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="max-w-[120px] truncate">{session.user?.name}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 shadow-xl py-2 z-50 text-xs text-slate-800 rounded-[10px]"
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

                      <button
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-2.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/register"
                  className="text-slate-300 hover:text-white font-medium transition-colors text-[12px]"
                >
                  Daftar Akun
                </Link>
                <Link
                  href="/login"
                  className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-[12px] px-3 py-1 rounded-[6px] transition-all shadow-xs"
                >
                  Masuk
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Header Bar (Navbar 2: Abu-abu Slate-100 - Logo + Input Search + Nomor + Jual Kendaraan) */}
      <div className="bg-slate-100 border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-22 sm:h-[96px] flex items-center justify-between py-3">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center group shrink-0 pr-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings?.logoUrl || '/logo.png'}
              alt={settings?.name || 'Rizkya Motor'}
              className="h-14 sm:h-[72px] lg:h-[78px] max-w-[280px] sm:max-w-[340px] object-contain transition-all mix-blend-multiply"
              onError={(e) => {
                // If logo fails, show text fallback
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </Link>

          {/* Center Search Input Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex items-center relative pr-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan merek, model (ex: Honda HRV, Innova)..."
              className="w-full bg-slate-50 focus:bg-white text-slate-800 text-sm font-medium pl-11 pr-4 py-3.5 rounded-[12px] shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:shadow-md transition-all placeholder:text-slate-400"
            />
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>

          {/* Right Action Buttons in Navbar 2: Direct Phone & Jual Kendaraan */}
          <div className="hidden md:flex items-center space-x-3 shrink-0">
            {/* Lihat Jadwal Button */}
            <Link
              href="/schedule"
              className="group flex items-center gap-2 font-bold text-slate-800 bg-white hover:bg-slate-900 hover:text-white px-4 py-3.5 transition-all text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 rounded-[12px] cursor-pointer"
            >
              <Calendar className="w-4.5 h-4.5 text-slate-800 group-hover:text-white transition-colors shrink-0" />
              <span>Lihat Jadwal</span>
            </Link>

            {/* Jual Kendaraan Button */}
            <Link
              href="/sell"
              className="flex items-center gap-2 font-bold text-white bg-slate-900 hover:bg-slate-800 px-5 py-3.5 transition-all text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 rounded-[12px]"
            >
              <PlusCircle className="w-4.5 h-4.5 text-white shrink-0" />
              <span>Jual Kendaraan</span>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-800 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 3. Navigation Bar (Navbar 3: Pure White tab bar with rounded 10px pills) */}
      <div className="bg-white border-b border-slate-200 hidden md:block py-2">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Navigation Links & Category Dropdown */}
          <nav className="flex items-center gap-2 text-[15px] font-normal">
            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className={`w-[245px] px-5 py-2 flex items-center justify-between rounded-[10px] transition-all text-[15px] font-normal ${categoryDropdownOpen
                    ? 'bg-slate-900 text-white shadow-inner'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200 hover:text-slate-900 shadow-xs'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  <span>Kategori</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoryDropdownOpen && (
                <div
                  className="absolute left-0 top-full mt-1.5 w-[260px] max-h-[440px] overflow-y-auto bg-white border border-slate-200 shadow-xl py-2 z-50 text-slate-800 text-xs rounded-[10px]"
                  onMouseLeave={() => setCategoryDropdownOpen(false)}
                >
                  {/* 1. Tipe Bodi */}
                  <div className="px-4 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Tipe Bodi
                  </div>
                  <Link
                    href="/cars?bodyType=SUV"
                    onClick={() => setCategoryDropdownOpen(false)}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-medium flex items-center text-[13px] transition-colors"
                  >
                    <span>Mobil SUV</span>
                  </Link>
                  <Link
                    href="/cars?bodyType=MPV"
                    onClick={() => setCategoryDropdownOpen(false)}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-medium flex items-center text-[13px] transition-colors"
                  >
                    <span>Mobil MPV</span>
                  </Link>
                  <Link
                    href="/cars?bodyType=Sedan"
                    onClick={() => setCategoryDropdownOpen(false)}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-medium flex items-center text-[13px] transition-colors"
                  >
                    <span>Mobil Sedan</span>
                  </Link>
                  <Link
                    href="/cars?bodyType=Hatchback"
                    onClick={() => setCategoryDropdownOpen(false)}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-medium flex items-center text-[13px] transition-colors"
                  >
                    <span>Mobil Hatchback</span>
                  </Link>

                  {/* 2. Merek Mobil */}
                  <div className="px-4 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 mt-1.5 pt-2">
                    Merek Mobil
                  </div>
                  <Link
                    href="/cars?brand=Toyota"
                    onClick={() => setCategoryDropdownOpen(false)}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-medium flex items-center text-[13px] transition-colors"
                  >
                    <span>Toyota</span>
                  </Link>
                  <Link
                    href="/cars?brand=Honda"
                    onClick={() => setCategoryDropdownOpen(false)}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-medium flex items-center text-[13px] transition-colors"
                  >
                    <span>Honda</span>
                  </Link>
                  <Link
                    href="/cars?brand=Mitsubishi"
                    onClick={() => setCategoryDropdownOpen(false)}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-medium flex items-center text-[13px] transition-colors"
                  >
                    <span>Mitsubishi</span>
                  </Link>
                  <Link
                    href="/cars?brand=Suzuki"
                    onClick={() => setCategoryDropdownOpen(false)}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-medium flex items-center text-[13px] transition-colors"
                  >
                    <span>Suzuki</span>
                  </Link>
                  <Link
                    href="/cars?brand=Hyundai"
                    onClick={() => setCategoryDropdownOpen(false)}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-medium flex items-center text-[13px] transition-colors"
                  >
                    <span>Hyundai</span>
                  </Link>

                  {/* 3. Tipe Bahan Bakar */}
                  <div className="px-4 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 mt-1.5 pt-2">
                    Tipe Bahan Bakar
                  </div>
                  <Link
                    href="/cars?fuelType=Bensin"
                    onClick={() => setCategoryDropdownOpen(false)}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-medium flex items-center text-[13px] transition-colors"
                  >
                    <span>Mobil Bensin</span>
                  </Link>
                  <Link
                    href="/cars?fuelType=Diesel"
                    onClick={() => setCategoryDropdownOpen(false)}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-medium flex items-center text-[13px] transition-colors"
                  >
                    <span>Mobil Diesel</span>
                  </Link>
                  <Link
                    href="/cars?fuelType=Hybrid"
                    onClick={() => setCategoryDropdownOpen(false)}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-medium flex items-center text-[13px] transition-colors"
                  >
                    <span>Mobil Hybrid</span>
                  </Link>
                  <Link
                    href="/cars?fuelType=EV"
                    onClick={() => setCategoryDropdownOpen(false)}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-medium flex items-center text-[13px] transition-colors"
                  >
                    <span>Mobil Listrik (EV)</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Nav links matching Kategori button size with inset/menjorok active style */}
            <Link
              href="/"
              className={`px-4 py-2 flex items-center rounded-[10px] text-[15px] transition-all ${isActive('/')
                  ? 'bg-slate-100 text-slate-900 font-bold shadow-inner'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
            >
              <span>Beranda</span>
            </Link>

            <Link
              href="/cars"
              className={`px-4 py-2 flex items-center rounded-[10px] text-[15px] transition-all ${isActive('/cars')
                  ? 'bg-slate-100 text-slate-900 font-bold shadow-inner'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
            >
              <span>Katalog</span>
            </Link>

            <Link
              href="/compare"
              className={`px-4 py-2 flex items-center gap-1.5 rounded-[10px] text-[15px] transition-all ${isActive('/compare')
                  ? 'bg-slate-100 text-slate-900 font-bold shadow-inner'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
            >
              <span>Komparasi</span>
              {comparisonList.length > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[11px] font-bold rounded-full shrink-0 bg-slate-200 text-slate-700 shadow-inner">
                  {comparisonList.length}
                </span>
              )}
            </Link>

            <Link
              href="/favorites"
              className={`px-4 py-2 flex items-center gap-1.5 rounded-[10px] text-[15px] transition-all ${isActive('/favorites') || isActive('/dashboard/favorites')
                  ? 'bg-slate-100 text-slate-900 font-bold shadow-inner'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
            >
              <span>Favorit</span>
              {favoriteList.length > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[11px] font-bold rounded-full shrink-0 bg-slate-200 text-slate-700 shadow-inner">
                  {favoriteList.length}
                </span>
              )}
            </Link>
          </nav>

          {/* Dashboard link on right side if logged in */}
          {session && (
            <Link
              href={dashboardHref}
              className={`px-4 py-2 flex items-center rounded-[10px] text-[15px] transition-all ${isActive(dashboardHref)
                  ? 'bg-slate-100 text-slate-900 font-bold shadow-inner'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
            >
              <span>Dashboard</span>
            </Link>
          )}
        </div>
      </div>

      {/* 4. Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white text-slate-900 border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 text-sm">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari merek atau model..."
              className="w-full bg-slate-100 text-slate-800 text-xs pl-9 pr-4 py-2 rounded-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 hover:text-slate-900 font-medium"
          >
            Beranda
          </Link>
          <Link
            href="/cars"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 hover:text-slate-900 font-medium"
          >
            Katalog Mobil
          </Link>
          <Link
            href="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 hover:text-slate-900 font-medium"
          >
            Komparasi Unit ({comparisonList.length})
          </Link>
          <Link
            href="/dashboard/favorites"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 hover:text-slate-900 font-medium"
          >
            Favorit Saya
          </Link>
          <Link
            href="/sell"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-900 font-bold bg-slate-100 px-3"
          >
            Jual Kendaraan
          </Link>

          {session ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <p className="text-xs text-slate-400">Logged in as {session.user?.name}</p>
              <Link
                href={dashboardHref}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-900 font-bold"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="w-full text-left py-2 text-rose-600 font-medium"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex gap-3">
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 bg-slate-100 text-slate-800 font-bold text-xs rounded-[6px]"
              >
                Daftar Akun
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 bg-slate-900 text-white font-bold text-xs shadow-xs rounded-[6px]"
              >
                Masuk
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
