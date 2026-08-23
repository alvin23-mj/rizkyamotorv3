import Link from 'next/link';
import { Calendar, Sparkles, ArrowLeft, ShieldCheck, Gift, Car, MessageSquare, Clock } from 'lucide-react';
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
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Event & Komunitas Showroom</span>
          </span>
        </div>

        {/* Page Header Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/20 via-indigo-600/10 to-transparent pointer-events-none" />

          <div className="max-w-2xl space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 text-slate-200 text-xs font-bold px-3.5 py-1 rounded-full backdrop-blur-xs border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Jadwal Kegiatan Resmi Showroom 2026</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Acara, Pameran & Gathering Komunitas
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
              Ikuti berbagai agenda keseruan dari Rizkya Motor seperti <strong className="text-white">Jalan Santai Komunitas</strong>, pameran <strong className="text-white">Weekend Auto Expo</strong>, konsultasi perawatan gratis, hingga promo diskon spesial.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/schedule"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Car className="w-4 h-4" />
                <span>Lihat & Booking Jadwal Test Drive</span>
              </Link>

              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin%20Rizkya%20Motor,%20saya%20ingin%20bertanya%20mengenai%20acara%20showroom"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all border border-white/15 cursor-pointer backdrop-blur-xs"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Konsultasi Event via WA</span>
              </a>
            </div>
          </div>
        </div>

        {/* Benefits Grid Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Gift className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Doorprize & Souvenir</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Raih kesempatan memenangkan TV 43", Sepeda Listrik & Voucher BBM gratis bagi pengunjung event.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Inspeksi 160 Titik Gratis</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Gratis check-up kondisi fisik & mesin kendaraan Anda oleh tim mekanik berpengalaman.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Car className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Test Drive EV & Hybrid</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Cobalah berbagai unit mobil impian terbaru lengkap dengan pendampingan sales konsultan.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Pendaftaran 100% Gratis</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Seluruh rangkaian acara komunitas dan pameran showroom terbuka gratis untuk umum & keluarga.
            </p>
          </div>
        </div>

        {/* Events Grid & Registration Interactive Component */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Agenda & Daftar Acara Showroom
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Pilih kategori atau ketik pencarian, lalu klik acara untuk mendaftar atau berkonsultasi secara gratis.
              </p>
            </div>

            <Link
              href="/schedule"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-all border border-slate-200 shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-700" />
              <span>Jadwal Operasional Showroom</span>
            </Link>
          </div>

          <EventCarousel />
        </div>
      </div>
    </div>
  );
}
