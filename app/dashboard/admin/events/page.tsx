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
  MessageSquare,
  Info,
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
  hasRegistration?: boolean;
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
    category: 'Umum',
    date: '',
    time: '09.00 - 21.00 WIB',
    location: '',
    image: '',
    description: '',
    badge: 'Terdekat',
    hasRegistration: true,
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
      category: 'Komunitas & Gathering',
      date: '',
      time: '09.00 - 21.00 WIB',
      location: 'Showroom Utama Rizkya Motor - Jl. Raya Otomotif No. 88, Jakarta',
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1200&auto=format&fit=crop',
      description: '',
      badge: 'Terdekat',
      hasRegistration: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (evt: EventItem) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title,
      category: evt.category || 'Umum',
      date: evt.date,
      time: evt.time,
      location: evt.location,
      image: evt.image,
      description: evt.description,
      badge: evt.badge || '',
      hasRegistration: evt.hasRegistration !== false,
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAlert({
        type: 'success',
        message: evt.isVisible
          ? `Event "${evt.title}" disembunyikan dari halaman publik.`
          : `Event "${evt.title}" sekarang tampil di publik.`,
      });
      fetchEvents();
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Gagal mengubah visibilitas.' });
    }
  };

  const handleDelete = async (evt: EventItem) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus event "${evt.title}"?`)) return;

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_EVENT',
          id: evt.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAlert({ type: 'success', message: `Event "${evt.title}" berhasil dihapus.` });
      fetchEvents();
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Gagal menghapus event.' });
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchSearch =
      evt.title.toLowerCase().includes(search.toLowerCase()) ||
      evt.description.toLowerCase().includes(search.toLowerCase()) ||
      evt.location.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'VISIBLE' && evt.isVisible) ||
      (statusFilter === 'HIDDEN' && !evt.isVisible);

    return matchSearch && matchStatus;
  });

  return (
    <div className="w-full p-6 space-y-6">
      {/* PopUp Alert */}
      {alert && <PopUpAlert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Top Header Controls (Matching cars/page.tsx design) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Kelola Acara & Kegiatan Showroom
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tambah, sunting, atur mode pendaftaran WhatsApp, dan visibilitas kegiatan promo atau gathering showroom.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Event Baru</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Cari judul event, lokasi, deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filter & Count */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium appearance-none cursor-pointer"
            >
              <option value="ALL">Semua Status (Tampil & Sembunyi)</option>
              <option value="VISIBLE">Aktif Tampil di Publik</option>
              <option value="HIDDEN">Disembunyikan</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={fetchEvents}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-600 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
            <p className="text-xs font-semibold">Memuat daftar kegiatan showroom...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Calendar className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-800">Tidak Ada Event Ditemukan</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || statusFilter !== 'ALL'
                ? 'Tidak ada kegiatan yang sesuai dengan filter pencarian.'
                : 'Belum ada agenda kegiatan showroom. Klik tombol "+ Tambah Event Baru" di atas untuk membuat.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="px-4 py-4">Banner</th>
                  <th className="px-5 py-4">Judul & Deskripsi Event</th>
                  <th className="px-4 py-4">Jadwal & Waktu</th>
                  <th className="px-4 py-4">Mode Akses</th>
                  <th className="px-4 py-4">Status Tampil</th>
                  <th className="px-5 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
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
                      <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-2">{evt.description}</p>
                    </td>

                    {/* Jadwal & Waktu */}
                    <td className="px-4 py-4 font-medium text-slate-700 whitespace-nowrap">
                      <div className="font-bold text-slate-900 text-xs">
                        {evt.date}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {evt.time}
                      </div>
                    </td>

                    {/* Mode Akses Pendaftaran */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {evt.hasRegistration !== false ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Daftar WA</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 border border-slate-200 text-slate-600">
                          <Info className="w-3.5 h-3.5 text-slate-500" />
                          <span>Info Saja</span>
                        </span>
                      )}
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

                    {/* Aksi (Icon-Only Buttons) */}
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
                          {evt.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => openEditModal(evt)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300 transition-all cursor-pointer inline-flex items-center justify-center"
                          title="Edit Event"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(evt)}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md border border-rose-200 transition-all cursor-pointer inline-flex items-center justify-center"
                          title="Hapus Event"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal Form Event */}
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
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs font-medium">
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
                <label className="block font-bold text-slate-800 mb-1">Kategori Event *</label>
                <input
                  type="text"
                  required
                  placeholder="Komunitas & Gathering / Pameran & Test Drive / Promo Showroom"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-xs"
                />
              </div>

              {/* Mode Pendaftaran Toggle */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Mode Pendaftaran / Akses Publik *</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => setFormData({ ...formData, hasRegistration: true })}
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.hasRegistration
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="registrationMode"
                      checked={formData.hasRegistration}
                      onChange={() => setFormData({ ...formData, hasRegistration: true })}
                      className="accent-emerald-600"
                    />
                    <div>
                      <p className="text-xs font-bold">Buka Pendaftaran WA</p>
                      <p className="text-[10px] font-normal text-slate-500">Tampilkan tombol "Daftar WA" & Detail</p>
                    </div>
                  </label>

                  <label
                    onClick={() => setFormData({ ...formData, hasRegistration: false })}
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      !formData.hasRegistration
                        ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="registrationMode"
                      checked={!formData.hasRegistration}
                      onChange={() => setFormData({ ...formData, hasRegistration: false })}
                      className="accent-amber-600"
                    />
                    <div>
                      <p className="text-xs font-bold">Hanya Informasi Saja</p>
                      <p className="text-[10px] font-normal text-slate-500">Tanpa tombol pendaftaran (Info publik)</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Badge Label (Opsional)</label>
                <input
                  type="text"
                  placeholder="Terdekat / Pameran Utama / Promo Spesial"
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
                    placeholder="Contoh: Minggu, 23 Agustus 2026"
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

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-300 transition-colors text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm transition-all text-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Event</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
