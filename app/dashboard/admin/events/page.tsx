'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  PlusCircle,
  Search,
  Pencil,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Filter,
  RefreshCw,
  ChevronDown,
  Eye,
  EyeOff,
  Upload,
} from 'lucide-react';
import PopUpAlert from '@/components/ui/PopUpAlert';

interface EventItem {
  id: string;
  title: string;
  category?: string;
  date: string;
  time: string;
  location: string;
  image: string;
  description: string;
  badge?: string;
  isVisible: boolean;
  order: number;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '09.00 - 21.00 WIB',
    location: '',
    image: '',
    description: '',
    badge: 'Terdekat',
  });

  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.events) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      date: '',
      time: '09.00 - 21.00 WIB',
      location: 'Showroom Utama Rizkya Motor - Jl. Raya Otomotif No. 88, Jakarta',
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1200&auto=format&fit=crop',
      description: '',
      badge: 'Terdekat',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (evt: EventItem) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title,
      date: evt.date,
      time: evt.time,
      location: evt.location,
      image: evt.image,
      description: evt.description,
      badge: evt.badge || '',
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert(null);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editingEvent ? 'UPDATE_EVENT' : 'CREATE_EVENT',
          id: editingEvent?.id,
          ...formData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan event');

      setAlert({ type: 'success', message: data.message || 'Data event berhasil disimpan!' });
      setIsModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleVisibility = async (evt: EventItem) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_VISIBILITY',
          id: evt.id,
          isVisible: !evt.isVisible,
        }),
      });
      if (res.ok) {
        setAlert({
          type: 'success',
          message: evt.isVisible
            ? 'Event berhasil disembunyikan.'
            : 'Event sekarang ditampilkan di halaman publik.',
        });
        fetchEvents();
      } else {
        const err = await res.json();
        setAlert({ type: 'error', message: err.error || 'Gagal mengubah visibilitas.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus event "${title}"?`)) return;
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_EVENT', id }),
      });
      if (res.ok) {
        setAlert({ type: 'success', message: 'Event berhasil dihapus.' });
        fetchEvents();
      } else {
        const err = await res.json();
        setAlert({ type: 'error', message: err.error || 'Gagal menghapus event.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan saat menghapus data.' });
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchSearch =
      evt.title.toLowerCase().includes(search.toLowerCase()) ||
      evt.location.toLowerCase().includes(search.toLowerCase()) ||
      evt.description.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && evt.isVisible) ||
      (statusFilter === 'HIDDEN' && !evt.isVisible);

    return matchSearch && matchStatus;
  });

  const totalEvents = events.length;
  const activeEvents = events.filter((e) => e.isVisible).length;
  const hiddenEvents = events.filter((e) => !e.isVisible).length;

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Kelola Event & Promo Showroom
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tambah, edit, dan atur jadwal acara pameran atau promo diskon yang tampil di halaman publik.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg transition-all shadow-sm cursor-pointer shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Tambah Event Baru</span>
        </button>
      </div>

      {/* PopUp Toast Alert */}
      {alert && (
        <PopUpAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Stats Cards (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Event</p>
            <p className="text-xl font-bold text-slate-900">{totalEvents} Event</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Event Aktif</p>
            <p className="text-xl font-bold text-slate-900">{activeEvents} Event</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <EyeOff className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Disembunyikan</p>
            <p className="text-xl font-bold text-slate-900">{hiddenEvents} Event</p>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, lokasi, atau deskripsi..."
            className="w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-sm text-slate-600 font-semibold shrink-0">
            <Filter className="w-4 h-4" />
            <span>Filter:</span>
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium appearance-none cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="HIDDEN">Disembunyikan</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={fetchEvents}
            title="Refresh Data"
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* CRUD Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden w-full">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-slate-600" />
            <p className="text-sm font-medium">Memuat data event showroom...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-800">Tidak ada event ditemukan</p>
            <p className="text-sm text-slate-400">Coba ubah kata kunci pencarian atau filter yang aktif.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800 uppercase tracking-wider text-xs whitespace-nowrap">
                <tr>
                  <th className="px-4 py-4">Banner</th>
                  <th className="px-5 py-4">Event</th>
                  <th className="px-4 py-4">Jadwal & Waktu</th>
                  <th className="px-4 py-4">Lokasi</th>
                  <th className="px-4 py-4">Status Tampil</th>
                  <th className="px-5 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Banner Image */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="w-16 h-12 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" />
                      </div>
                    </td>

                    {/* Judul & Deskripsi */}
                    <td className="px-5 py-4 min-w-[220px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 text-sm">{evt.title}</p>
                        {evt.badge && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 border border-amber-200 text-amber-800 shrink-0">
                            {evt.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{evt.description}</p>
                    </td>

                    {/* Jadwal & Waktu */}
                    <td className="px-4 py-4 font-medium text-slate-700 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 text-xs">
                        {evt.date}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {evt.time}
                      </div>
                    </td>

                    {/* Lokasi */}
                    <td className="px-4 py-4 font-medium text-slate-700 min-w-[200px]">
                      <div className="text-slate-700 text-xs">
                        {evt.location}
                      </div>
                    </td>

                    {/* Status Tampil */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${
                          evt.isVisible
                            ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {evt.isVisible ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                            <span>Disembunyikan</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Aksi (Icon-Only Buttons, matching cars/page.tsx) */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleVisibility(evt)}
                          className={`p-2 rounded-md border shadow-xs transition-all cursor-pointer inline-flex items-center justify-center ${
                            evt.isVisible
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-300'
                          }`}
                          title={evt.isVisible ? 'Disembunyikan dari Publik' : 'Tampilkan di Publik'}
                        >
                          {evt.isVisible ? (
                            <Eye className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        <button
                          onClick={() => openEditModal(evt)}
                          className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-md shadow-xs transition-all cursor-pointer inline-flex items-center justify-center"
                          title="Edit Event"
                        >
                          <Pencil className="w-4 h-4 text-amber-600" />
                        </button>

                        <button
                          onClick={() => handleDelete(evt.id, evt.title)}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md shadow-xs transition-all cursor-pointer inline-flex items-center justify-center"
                          title="Hapus Event"
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form Event (Matching cars page modal styling) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 my-8 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-snug">
                    {editingEvent ? 'Edit Data Event' : 'Tambah Event Baru'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {editingEvent ? `ID Event: ${editingEvent.id}` : 'Isi formulir di bawah untuk membuat event baru'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Judul Event *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rizkya Motor Weekend Auto Expo 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Badge Info (Opsional)</label>
                <input
                  type="text"
                  placeholder="Terdekat / Popular / Segera"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Tanggal Event *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 15 - 17 Agustus 2026"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Jam Slot Event *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 09.00 - 21.00 WIB"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Lokasi Pelaksanaan *</label>
                <input
                  type="text"
                  required
                  placeholder="Showroom Utama Rizkya Motor - Jl. Raya Otomotif No. 88, Jakarta"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Deskripsi Singkat *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan keuntungan, promo diskon, atau kegiatan pada event..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-xs resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Banner Gambar Event *</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    required
                    placeholder="URL gambar banner..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-xs"
                  />
                  <label className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2.5 rounded-lg border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 text-xs">
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                {formData.image && (
                  <div className="mt-2.5 h-28 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer text-xs disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingEvent ? 'Simpan Perubahan' : 'Tambah Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
