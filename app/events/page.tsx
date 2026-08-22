import Link from 'next/link';
import { Calendar, Sparkles, ArrowLeft } from 'lucide-react';
import EventCarousel from '@/components/home/EventCarousel';

export const metadata = {
  title: 'Acara & Event Showroom | Rizkya Motor',
  description: 'Jadwal kegiatan komunitas, jalan santai, pameran auto expo, dan promo spesial Rizkya Motor.',
};

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Event & Komunitas Showroom</span>
          </span>
        </div>

        {/* Page Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none" />
          
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 text-slate-200 text-xs font-bold px-3.5 py-1 rounded-full backdrop-blur-xs border border-white/10">
              <Calendar className="w-3.5 h-3.5" />
              <span>Jadwal Kegiatan Resmi 2026</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Acara & Gathering Komunitas Showroom
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Ikuti berbagai agenda seru dari Rizkya Motor seperti <strong className="text-white">Jalan Santai Komunitas</strong>, pameran <strong className="text-white">Weekend Auto Expo</strong>, konsultasi perawatan gratis, hingga promo diskon kemerdekaan.
            </p>
          </div>
        </div>

        {/* Events Grid & Registration Component */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-200">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Daftar Acara Mendatang
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Klik salah satu acara di bawah ini untuk melihat detail lengkap dan mendaftar (Gratis).
            </p>
          </div>

          <EventCarousel />
        </div>
      </div>
    </div>
  );
}
