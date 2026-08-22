'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Sparkles, ChevronRight, X, User, Phone, CheckCircle2 } from 'lucide-react';

interface EventItem {
  id?: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  image: string;
  description: string;
  badge?: string;
  isVisible?: boolean;
}

export default function EventCarousel() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [formState, setFormState] = useState({ name: '', phone: '', count: '1' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.events && Array.isArray(data.events)) {
          const visible = data.events.filter((e: EventItem) => e.isVisible !== false);
          setEvents(visible.length > 0 ? visible : data.events);
        }
      })
      .catch(console.error);
  }, []);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setRegisterSuccess(true);
    }, 600);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setRegisterSuccess(false);
    setFormState({ name: '', phone: '', count: '1' });
  };

  const displayEvents = events.length > 0 ? events : [
    {
      id: 'default-1',
      title: 'Jalan Santai & Gathering Komunitas Rizkya Motor',
      category: 'Acara Showroom & Komunitas',
      date: 'Minggu, 23 Agustus 2026',
      time: '06.00 - 10.00 WIB',
      location: 'Showroom Utama Rizkya Motor - Jl. Raya Otomotif No. 88, Jakarta',
      image: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?q=80&w=1200&auto=format&fit=crop',
      description: 'Acara jalan santai keluarga & gathering pecinta otomotif Rizkya Motor. Menampilkan hiburan musik, doorprize menarik (TV 43", Sepeda Listrik, Voucher BBM), check-up gratis 160 titik mobil, serta sarapan bersama.',
      badge: 'Jalan Santai',
    },
    {
      id: 'default-2',
      title: 'Rizkya Motor Weekend Auto Expo 2026',
      category: 'Pameran & Test Drive',
      date: '15 - 17 Agustus 2026',
      time: '09.00 - 21.00 WIB',
      location: 'Showroom Utama Rizkya Motor - Jakarta',
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1200&auto=format&fit=crop',
      description: 'Pameran mobil bekas berkualitas terbesar tahun ini. Diskon harga hingga Rp 25 Juta, gratis garansi mesin 2 tahun, dan promo bunga 0% dari partner leasing.',
      badge: 'Pameran Utama',
    },
    {
      id: 'default-3',
      title: 'Hybrid & EV Tech Experience Festival',
      category: 'Teknologi & Mobil Ramah Lingkungan',
      date: '28 - 30 Agustus 2026',
      time: '10.00 - 20.00 WIB',
      location: 'Grand Atrium Central Park, Jakarta Barat',
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=1200&auto=format&fit=crop',
      description: 'Coba langsung performa serta keiritan unit Mobil Hybrid dan Listrik (EV) pilihan. Dapatkan voucher charging gratis 1 tahun & bonus kaca film premium.',
      badge: 'Test Drive EV',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayEvents.map((evt, idx) => (
          <div
            key={evt.id || idx}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
          >
            <div>
              {/* Event Image */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={evt.image}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                
                {evt.badge && (
                  <span className="absolute top-3 left-3 bg-slate-900/90 text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/20 shadow-md">
                    {evt.badge}
                  </span>
                )}

                <span className="absolute bottom-3 left-3 text-[11px] font-bold text-slate-200 bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded">
                  {evt.category}
                </span>
              </div>

              {/* Event Info */}
              <div className="p-5 space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-slate-800 transition-colors line-clamp-2 leading-snug">
                  {evt.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {evt.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800">{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{evt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{evt.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-5 pt-0">
              <button
                onClick={() => setSelectedEvent(evt)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                <span>Lihat Acara & Daftar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Event Detail & Registration Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="relative h-48 bg-slate-900 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-5 right-5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                  {selectedEvent.category}
                </span>
                <h3 className="text-lg font-extrabold text-white leading-tight">
                  {selectedEvent.title}
                </h3>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="bg-slate-50 p-3.5 rounded-xl space-y-2 text-xs text-slate-700 border border-slate-200">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="font-bold text-slate-900">{selectedEvent.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{selectedEvent.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{selectedEvent.location}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Deskripsi Kegiatan
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>

              {/* Registration Form */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Formulir Pendaftaran Acara (Gratis)
                </h4>

                {registerSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h5 className="font-extrabold text-slate-900 text-sm">Pendaftaran Berhasil!</h5>
                    <p className="text-xs text-slate-600">
                      Terima kasih <strong className="text-slate-900">{formState.name}</strong>. Tim showroom kami akan mengonfirmasi via WhatsApp ({formState.phone}).
                    </p>
                    <button
                      onClick={closeModal}
                      className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-5 rounded-lg transition-colors cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Nama Lengkap *
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          placeholder="Nama Anda"
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Nomor WA / HP *
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="tel"
                            required
                            placeholder="08123456789"
                            value={formState.phone}
                            onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Jumlah Peserta
                        </label>
                        <select
                          value={formState.count}
                          onChange={(e) => setFormState({ ...formState, count: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                        >
                          <option value="1">1 Orang</option>
                          <option value="2">2 Orang</option>
                          <option value="3">3 Orang</option>
                          <option value="4+">4+ Orang (Keluarga)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 mt-2"
                    >
                      {submitting ? 'Mengirim Pendaftaran...' : 'Konfirmasi Pendaftaran Acara'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
