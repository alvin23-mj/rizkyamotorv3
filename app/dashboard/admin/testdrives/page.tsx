'use client';

import { useState, useEffect } from 'react';
import {
  CalendarClock,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  CarFront,
  Calendar,
  Clock,
  ExternalLink,
  ChevronDown,
  X,
  MapPin,
  Tag,
  Trash2,
  Pencil,
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import PopUpAlert from '@/components/ui/PopUpAlert';

export default function AdminTestDrivesPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [carsList, setCarsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    bookingDate: '',
    bookingTime: '09:00 - 10:30 WIB',
    carListingId: '',
    status: 'PENDING',
    notes: '',
    isWithDp: false,
  });

  const loadCarsList = async () => {
    try {
      const res = await fetch('/api/cars');
      if (res.ok) setCarsList(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  // Load Test Drive bookings
  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      } else {
        const err = await res.json();
        setAlert({ type: 'error', message: err.error || 'Gagal memuat jadwal test drive.' });
      }
    } catch (e) {
      console.error(e);
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem saat memuat janji temu.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    loadCarsList();
  }, []);

  const handleOpenEdit = (item: any) => {
    setEditFormData({
      id: item.id,
      customerName: item.customerName || '',
      customerPhone: item.customerPhone || '',
      customerEmail: item.customerEmail || '',
      bookingDate: item.bookingDate || '',
      bookingTime: item.bookingTime || '09:00 - 10:30 WIB',
      carListingId: item.carListingId || '',
      status: item.status || 'PENDING',
      notes: item.notes || '',
      isWithDp: Boolean(item.hasDp) || Boolean(item.notes?.toLowerCase().includes('dp')),
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingEdit(true);
    try {
      const updatedNotes = editFormData.notes || (editFormData.isWithDp ? 'Booking dengan DP Tanda Jadi (Unit Disimpan)' : 'Booking Tanpa DP');
      const res = await fetch(`/api/bookings/${editFormData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editFormData,
          notes: updatedNotes,
          hasDp: editFormData.isWithDp,
        }),
      });

      if (res.ok) {
        setAlert({
          type: 'success',
          message: `Data booking dari ${editFormData.customerName} berhasil diperbarui!`,
        });
        setEditModalOpen(false);
        loadBookings();
      } else {
        const err = await res.json();
        setAlert({ type: 'error', message: err.error || 'Gagal menyimpan perubahan booking.' });
      }
    } catch (e) {
      console.error(e);
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem saat menyimpan.' });
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Format WhatsApp Link
  const getWhatsAppLink = (phone: string, customerName: string, carTitle: string, date: string, time: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;
    const message = encodeURIComponent(
      `Halo ${customerName}, mengonfirmasi janji temu Test Drive unit ${carTitle} di showroom kami pada tanggal ${date} jam ${time}.`
    );
    return `https://wa.me/${formattedPhone}?text=${message}`;
  };

  // Filtering
  const filteredBookings = bookings.filter((item) => {
    const carTitle = item.carListing?.title || '';
    const matchSearch =
      item.customerName.toLowerCase().includes(search.toLowerCase()) ||
      item.customerPhone.toLowerCase().includes(search.toLowerCase()) ||
      carTitle.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Calculate statistics
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const confirmedDpCount = bookings.filter((b) => b.status === 'CONFIRMED_DP' || b.status === 'CONFIRMED').length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
        setAlert({
          type: 'success',
          message: `Status booking berhasil diperbarui menjadi ${newStatus}.`,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleWaClick = async (item: any, waLink: string) => {
    window.open(waLink, '_blank');
    if (item.status === 'PENDING') {
      await handleStatusUpdate(item.id, 'WAITING_WA');
    }
  };

  const handleDeleteBooking = async (id: string, customerName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus booking dari "${customerName}"?`)) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
        setAlert({
          type: 'success',
          message: `Jadwal booking dari ${customerName} berhasil dihapus.`,
        });
      } else {
        const err = await res.json();
        setAlert({ type: 'error', message: err.error || 'Gagal menghapus booking.' });
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    }
  };

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Jadwal Test Drive & Janji Temu
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola seluruh jadwal kunjungan customer untuk mencoba unit kendaraan di lokasi showroom.
          </p>
        </div>

        <button
          onClick={loadBookings}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 transition-all cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Muat Ulang Data</span>
        </button>
      </div>

      {/* Pop-Up Toast Notification */}
      {alert && (
        <PopUpAlert
          message={alert.message}
          type={alert.type}
          duration={2000}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Janji Temu</p>
            <p className="text-xl font-bold text-slate-900">{totalBookings} Booking</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Belum di-Chat</p>
            <p className="text-xl font-bold text-slate-900">{bookings.filter((b) => b.status === 'PENDING').length} Booking</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sudah Janjian</p>
            <p className="text-xl font-bold text-slate-900">{bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'CONFIRMED_DP').length} Janjian</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Terjual</p>
            <p className="text-xl font-bold text-slate-900">{bookings.filter((b) => b.status === 'COMPLETED').length} Unit</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama customer, judul mobil, atau WhatsApp..."
            className="w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-bold uppercase tracking-wider shrink-0">
            <Filter className="w-4 h-4" />
            <span>Filter Status:</span>
          </div>

          <div className="relative w-full sm:w-56">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-sm pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium appearance-none cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Belum di-chat</option>
              <option value="WAITING_WA">Menunggu Respon WA</option>
              <option value="CONFIRMED">Sudah Janjian</option>
              <option value="COMPLETED">Terjual</option>
              <option value="CANCELLED">Batal</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden w-full">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-slate-600" />
            <p className="text-sm font-medium">Memuat jadwal test drive customer...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <CalendarClock className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-800">Belum ada jadwal test drive ditemukan</p>
            <p className="text-xs text-slate-400">Belum ada booking janji temu yang sesuai dengan pencarian Anda saat ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800 uppercase tracking-wider text-xs whitespace-nowrap">
                <tr>
                  <th className="px-5 py-4">Jadwal Kunjungan</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Unit Mobil Target</th>
                  <th className="px-4 py-4">Lokasi Showroom</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Catatan</th>
                  <th className="px-5 py-4 text-center">Kontak Direct</th>
                  <th className="px-4 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBookings.map((item) => {
                  const carTitle = item.carListing?.title || 'Mobil Showroom';
                  const waLink = getWhatsAppLink(
                    item.customerPhone,
                    item.customerName,
                    carTitle,
                    item.bookingDate,
                    item.bookingTime
                  );

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Jadwal Kunjungan */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900 text-sm">{item.bookingDate}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Jam {item.bookingTime.replace(/\s*WIB/gi, '')} WIB
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900 text-sm">{item.customerName}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{item.customerPhone}</p>
                      </td>

                      {/* Unit Mobil Target */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900 text-sm">{carTitle}</p>
                        {item.carListing?.price && (
                          <p className="text-xs font-bold text-emerald-700 mt-0.5">
                            {formatRupiah(item.carListing.price)}
                          </p>
                        )}
                      </td>

                      {/* Lokasi Showroom */}
                      <td className="px-4 py-4 whitespace-nowrap text-xs font-medium text-slate-700">
                        {item.carListing?.location || 'Showroom Utama Jakarta'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="relative inline-block">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                            className="text-xs font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer appearance-none"
                          >
                            <option value="PENDING">Belum di-chat</option>
                            <option value="WAITING_WA">Menunggu Respon WA</option>
                            <option value="CONFIRMED">Sudah Janjian</option>
                            <option value="COMPLETED">Terjual</option>
                            <option value="CANCELLED">Batal</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </td>

                      {/* Catatan */}
                      <td className="px-4 py-4 whitespace-normal break-words max-w-[220px] text-xs text-slate-600 font-medium leading-relaxed">
                        {item.notes ? (
                          <span>{item.notes}</span>
                        ) : (
                          <span className="text-slate-400 font-normal">-</span>
                        )}
                      </td>

                      {/* Kontak Direct WA */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleWaClick(item, waLink)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Hubungi via WA</span>
                        </button>
                      </td>

                      {/* Aksi (Edit & Delete) */}
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg shadow-2xs transition-all cursor-pointer inline-flex items-center justify-center"
                            title="Edit Booking Ini"
                          >
                            <Pencil className="w-4 h-4 text-amber-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(item.id, item.customerName)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg shadow-2xs transition-all cursor-pointer inline-flex items-center justify-center"
                            title="Hapus Booking Ini"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Edit Booking */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Pencil className="w-5 h-5 text-slate-800" />
                <h2 className="text-base font-bold text-slate-900">Edit Data Test Drive & Booking</h2>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs font-medium text-slate-700">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Customer</label>
                <input
                  type="text"
                  required
                  value={editFormData.customerName}
                  onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.customerPhone}
                    onChange={(e) => setEditFormData({ ...editFormData, customerPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Email (Opsional)</label>
                  <input
                    type="email"
                    value={editFormData.customerEmail}
                    onChange={(e) => setEditFormData({ ...editFormData, customerEmail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Tanggal Kunjungan</label>
                  <input
                    type="date"
                    required
                    value={editFormData.bookingDate}
                    onChange={(e) => setEditFormData({ ...editFormData, bookingDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Pilih Jam Slot</label>
                  <div className="relative">
                    <select
                      value={editFormData.bookingTime}
                      onChange={(e) => setEditFormData({ ...editFormData, bookingTime: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3.5 pr-9 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold appearance-none cursor-pointer"
                    >
                      <option value="09:00 - 10:30 WIB">09:00 - 10:30 WIB</option>
                      <option value="11:00 - 12:30 WIB">11:00 - 12:30 WIB</option>
                      <option value="13:00 - 14:30 WIB">13:00 - 14:30 WIB</option>
                      <option value="15:00 - 16:30 WIB">15:00 - 16:30 WIB</option>
                      <option value="17:00 - 18:30 WIB">17:00 - 18:30 WIB</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Unit Mobil Target</label>
                <div className="relative">
                  <select
                    value={editFormData.carListingId}
                    onChange={(e) => setEditFormData({ ...editFormData, carListingId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3.5 pr-9 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold appearance-none cursor-pointer"
                  >
                    <option value="">-- Pilih Unit Mobil --</option>
                    {carsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.brand} {c.title} - {formatRupiah(c.price)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Status Booking</label>
                <div className="relative">
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3.5 pr-9 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold appearance-none cursor-pointer"
                  >
                    <option value="PENDING">Belum di-chat</option>
                    <option value="WAITING_WA">Menunggu Respon WA</option>
                    <option value="CONFIRMED">Sudah Janjian</option>
                    <option value="COMPLETED">Terjual</option>
                    <option value="CANCELLED">Batal</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Catatan / Keterangan</label>
                <textarea
                  rows={2}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="Catatan khusus dari customer atau admin..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {submittingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
