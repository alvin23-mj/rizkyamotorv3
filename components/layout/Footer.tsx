'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MapPin,
  PhoneCall,
  ChevronRight,
  ArrowUp,
  ExternalLink,
} from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Do not render Footer on login and register pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const showroomName = settings?.name || 'Rizkya Motor';
  const phoneNumber = locations.length > 0 && locations[0].phone ? locations[0].phone : (settings?.phone || '0812-9988-7766');
  const addressText = locations.length > 0 ? locations[0].address : (settings?.address || 'Alamat Showroom');

  return (
    <footer className="bg-slate-900 text-slate-200 border-t border-slate-800 text-[14px] select-none">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand Info */}
          <div className="space-y-3.5">
            <div>
              <span className="text-[24px] font-extrabold text-white uppercase tracking-tight block" style={{ fontSize: '24px' }}>
                {showroomName}
              </span>
              <span className="text-[14px] text-slate-200 font-medium block mt-0.5">
                Jual Beli Mobil Bekas
              </span>
            </div>

            <p className="text-slate-200 text-[14px] leading-relaxed">
              Platform marketplace & showroom mobil terpercaya dengan standar inspeksi transparan dan pelayanan terbaik.
            </p>

            {/* Social Media Links (!rounded-none + hover upward animation) */}
            <div className="pt-1">
              <div className="flex items-center gap-2">
                <a
                  href={settings?.instagramUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 !rounded-none bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white hover:-translate-y-1 flex items-center justify-center transition-transform duration-300"
                  style={{ borderRadius: 0 }}
                  title="Instagram"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href={settings?.facebookUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 !rounded-none bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white hover:-translate-y-1 flex items-center justify-center transition-transform duration-300"
                  style={{ borderRadius: 0 }}
                  title="Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z" />
                  </svg>
                </a>
                <a
                  href={settings?.tiktokUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 !rounded-none bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white hover:-translate-y-1 flex items-center justify-center transition-transform duration-300"
                  style={{ borderRadius: 0 }}
                  title="TikTok"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.96-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.57-1.31 1.56-1.28 2.55.02.99.57 1.94 1.42 2.45.92.56 2.12.56 3.04.04.88-.49 1.44-1.43 1.47-2.44.07-4.43.03-8.86.04-13.29z" />
                  </svg>
                </a>
                <a
                  href={settings?.youtubeUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 !rounded-none bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white hover:-translate-y-1 flex items-center justify-center transition-transform duration-300"
                  style={{ borderRadius: 0 }}
                  title="YouTube"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Navigasi */}
          <div className="space-y-3">
            <h3 className="text-white text-[16px] font-bold uppercase tracking-wider">
              Navigasi Utama
            </h3>
            <ul className="space-y-2 text-[14px] text-slate-200">
              <li>
                <Link href="/cars" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-200" />
                  <span>Katalog Mobil</span>
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-200" />
                  <span>Jual Kendaraan</span>
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-200" />
                  <span>Komparasi Spesifikasi</span>
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-200" />
                  <span>Acara & Event</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-200" />
                  <span>Tentang Kami</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-200" />
                  <span>Kontak Kami</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Hubungi Kami */}
          <div className="space-y-3">
            <h3 className="text-white text-[16px] font-bold uppercase tracking-wider">
              Hubungi Kami
            </h3>
            <div className="space-y-2.5 text-[14px] text-slate-200">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-200 shrink-0 mt-0.5" />
                <span>{addressText}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-slate-200 shrink-0" />
                <span className="text-slate-200 font-medium">{phoneNumber}</span>
              </div>
            </div>
          </div>

          {/* Column 4: Lokasi Map */}
          <div className="space-y-3">
            <h3 className="text-white text-[16px] font-bold uppercase tracking-wider">
              Lokasi Showroom
            </h3>
            <div
              className="!rounded-none overflow-hidden border border-slate-800 bg-slate-800 h-[120px] relative"
              style={{ borderRadius: 0 }}
            >
              <iframe
                src={
                  locations.length > 0 && locations[0].mapUrl
                    ? locations[0].mapUrl
                    : `https://maps.google.com/maps?q=${encodeURIComponent(addressText)}&t=&z=14&ie=UTF8&iwloc=&output=embed`
                }
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Peta Lokasi Showroom"
                className="w-full h-full opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
            <a
              href="https://www.google.com/maps/place/Rizkya+Mobil/@-7.6586549,111.9367471,17z/data=!4m15!1m8!3m7!1s0x2e784dabfa19518f:0xef795007f00d9a93!2sRizkya+Mobil!8m2!3d-7.6586549!4d111.9367471"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-slate-200 hover:text-white hover:underline flex items-center gap-1 transition-colors"
            >
              <span>Buka di Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[14px] text-slate-200">
          <p>© {new Date().getFullYear()} {showroomName}. Hak Cipta Dilindungi.</p>
          <div className="flex items-center space-x-5">
            <Link href="/privacy" className="hover:text-white hover:underline transition-colors">Kebijakan Privasi</Link>
            <Link href="/terms" className="hover:text-white hover:underline transition-colors">Syarat & Ketentuan</Link>
            <button
              onClick={scrollToTop}
              suppressHydrationWarning
              className="flex items-center gap-1 hover:text-white hover:underline transition-colors cursor-pointer"
            >
              <span>Ke Atas</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
