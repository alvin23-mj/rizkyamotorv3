'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  X,
  User,
  Phone,
  CheckCircle2,
  Search,
  Tag,
  Gift,
  Car,
  MessageSquare,
} from 'lucide-react';

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
  const [formState, setFormState] = useState({ name: '', phone: '', count: '1', interest: 'Hadir Gathering' });
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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
    setFormState({ name: '', phone: '', count: '1', interest: 'Hadir Gathering' });
  };

  const defaultEventsList: EventItem[] = [
    {
      id: 'default-1',
      title: 'Jalan Santai & Gathering Komunitas Rizkya Motor',
      category: 'Komunitas & Gathering',
      date: 'Minggu, 23 Agustus 2026',
      time: '06.00 - 10.00 WIB',
      location: 'Showroom Utama Rizkya Motor - Jl. Raya Otomotif No. 88, Jakarta',
      image: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?q=80&w=1200&auto=format&fit=crop',
      description: 'Acara jalan santai keluarga & gathering pecinta otomotif Rizkya Motor. Menampilkan hiburan musik, doorprize menarik (TV 43", Sepeda Listrik, Voucher BBM), check-up gratis 160 titik mobil, serta sarapan bersama.',
      badge: 'Terdekat',
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
      category: 'Teknologi & EV',
      date: '28 - 30 Agustus 2026',
      time: '10.00 - 20.00 WIB',
      location: 'Grand Atrium Central Park, Jakarta Barat',
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=1200&auto=format&fit=crop',
      description: 'Coba langsung performa serta keiritan unit Mobil Hybrid dan Listrik (EV) pilihan. Dapatkan voucher charging gratis 1 tahun & bonus kaca film premium.',
      badge: 'Test Drive EV',
    },
    {
      id: 'default-4',
      title: 'Pesta Kredit DP Seger & Akselerasi Ringan',
      category: 'Promo Showroom',
      date: '12 - 14 September 2026',
      time: '08.30 - 18.00 WIB',
      location: 'Seluruh Cabang Showroom Rizkya Motor',
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop',
      description: 'Dapatkan fasilitas DP seger mulai 10% dengan angsuran fleksibel & proses approval instan 1x24 jam untuk semua unit mobil pilihan.',
      badge: 'Promo Spesial',
    },
  ];

  const allEvents = events.length > 0 ? events : defaultEventsList;

  // Filter events based on activeCategory and searchQuery
  const filteredEvents = allEvents.filter((evt) => {
    const matchCategory =
      activeCategory === 'ALL' ||
      evt.category.toLowerCase().includes(activeCategory.toLowerCase()) ||
      (activeCategory === 'KOMUNITAS' && evt.category.toLowerCase().includes('komunitas')) ||
      (activeCategory === 'PAMERAN' && evt.category.toLowerCase().includes('pameran')) ||
      (activeCategory === 'TEKNOLOGI' && (evt.category.toLowerCase().includes('teknologi') || evt.category.toLowerCase().includes('ev'))) ||
      (activeCategory === 'PROMO' && evt.category.toLowerCase().includes('promo'));

    const matchQuery =
      !searchQuery.trim() ||
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar: Search & Category Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { key: 'ALL', label: 'Semua Acara' },
            { key: 'KOMUNITAS', label: 'Komunitas & Gathering' },
            { key: 'PAMERAN', label: 'Pameran & Test Drive' },
            { key: 'TEKNOLOGI', label: 'Teknologi & EV' },
            { key: 'PROMO', label: 'Promo Showroom' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                activeCategory === tab.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative shrink-0 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari acara / kata kunci..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-medium"
          />
        </div>
      </div>

      {/* Active Count */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <span>Menampilkan <strong className="text-slate-900 font-bold">{filteredEvents.length}</strong> acara aktif</span>
        {filteredEvents.length === 0 && (
          <button
            onClick={() => {
              setActiveCategory('ALL');
              setSearchQuery('');
            }}
            className="text-emerald-600 font-bold hover:underline cursor-pointer"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Cards Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt, idx) => (
            <div
              key={evt.id || idx}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Event Image */}
                <div
                  onClick={() => setSelectedEvent(evt)}
                  className="relative h-52 w-full overflow-hidden bg-slate-100 cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={evt.image}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/30 to-transparent" />

                  {evt.badge && (
                    <span className="absolute top-3 left-3 bg-slate-900/90 text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/20 shadow-md">
                      {evt.badge}
                    </span>
                  )}

                  <span className="absolute bottom-3 left-3 text-[11px] font-bold text-slate-100 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/10">
                    {evt.category}
                  </span>
                </div>

                {/* Event Info */}
                <div className="p-5 space-y-3">
                  <h3
                    onClick={() => setSelectedEvent(evt)}
                    className="text-base font-extrabold text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-2 leading-snug cursor-pointer"
                  >
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-slate-900">{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedEvent(evt)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                >
                  <span>Daftar Gratis</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <a
                  href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Admin Rizkya Motor, saya berminat mendaftar acara: ${evt.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Daftar WA</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-3">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="font-bold text-slate-800 text-sm">Acara Tidak Ditemukan</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ada acara yang cocok dengan kata kunci pencarian atau kategori ini.
          </p>
        </div>
      )}

      {/* Event Detail & Registration Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative max-h-[90vh] flex flex-col">
            {/* Modal Header Cover */}
            <div className="relative h-52 bg-slate-900 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 transition-all cursor-pointer border border-white/20 shadow-md"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-5 right-5 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500 text-slate-950 px-3 py-1 rounded-full shadow-xs">
                  {selectedEvent.category}
                </span>
                <h3 className="text-xl font-extrabold text-white leading-tight">
                  {selectedEvent.title}
                </h3>
              </div>
            </div>

            {/* Modal Content & Form */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs text-slate-700 border border-slate-200">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-slate-900">{selectedEvent.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{selectedEvent.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="font-medium text-slate-800">{selectedEvent.location}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Detail & Deskripsi Kegiatan
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {selectedEvent.description}
                </p>
              </div>

              {/* Benefits / Fasilitas */}
              <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl space-y-2 text-xs text-blue-900">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Fasilitas & Keuntungan Peserta Acara:</span>
                </p>
                <ul className="text-[11px] space-y-1 pl-5 list-disc font-medium text-slate-700">
                  <li>Pendaftaran 100% Gratis & tanpa dipungut biaya</li>
                  <li>Doorprize menarik & snack / sarapan bersama</li>
                  <li>Konsultasi gratis & penawaran promo spesial event</li>
                </ul>
              </div>

              {/* Registration Form Section */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Formulir Pendaftaran Gratis
                </h4>

                {registerSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h5 className="font-extrabold text-slate-900 text-base">Pendaftaran Berhasil!</h5>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                      Terima kasih <strong className="text-slate-900">{formState.name}</strong>. Tempat Anda telah berhasil dicatat untuk acara ini. Tim konsultasi kami akan mengirimkan e-ticket via WhatsApp ke <strong className="text-slate-900">{formState.phone}</strong>.
                    </p>
                    <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        onClick={closeModal}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all cursor-pointer"
                      >
                        Tutup Window
                      </button>
                      <a
                        href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Admin Rizkya Motor, saya sudah mendaftar acara ${selectedEvent.title} atas nama ${formState.name}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Konfirmasi via WhatsApp</span>
                      </a>
                    </div>
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
                          placeholder="Ketik nama lengkap Anda"
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Nomor WhatsApp / HP *
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="tel"
                            required
                            placeholder="08123456789"
                            value={formState.phone}
                            onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-medium"
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
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-medium"
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
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <span>Proses Pendaftaran...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Konfirmasi Pendaftaran Gratis</span>
                        </>
                      )}
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
