import Link from 'next/link';
import { Calendar, ArrowLeft } from 'lucide-react';
import EventCarousel from '@/components/home/EventCarousel';

export const metadata = {
  title: 'Acara & Event Showroom | Rizkya Motor',
  description: 'Jadwal kegiatan komunitas, jalan santai, pameran auto expo, dan promo spesial Rizkya Motor.',
};

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          
          <Link
            href="/schedule"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Lihat Jadwal Test Drive</span>
          </Link>
        </div>

        {/* Events Grid & Interactive Component */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-200">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Daftar Acara & Gathering Showroom
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Klik salah satu acara di bawah ini untuk melihat detail lengkap dan mendaftar (Gratis).
            </p>
          </div>

          <EventCarousel />
        </div>
      </div>
    </div>
  );
}
