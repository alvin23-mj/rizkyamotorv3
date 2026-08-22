'use client';

import { useState, useEffect } from 'react';
import {
  Handshake,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  CarFront,
  Calendar,
  Gauge,
  Tag,
  MessageSquare,
  ChevronDown,
  X,
  Eye,
  Pencil,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { formatRupiah, formatNumber } from '@/lib/utils';
import PopUpAlert from '@/components/ui/PopUpAlert';

const formatIndonesianDateWithDay = (dateStr?: string | null) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    const dayName = d.toLocaleDateString('id-ID', { weekday: 'long' });
    const dayDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${dayName}, ${dayDate}`;
  } catch (e) {
    return dateStr;
  }
};

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit / Status Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [statusInput, setStatusInput] = useState('PENDING');
  const [offerPriceInput, setOfferPriceInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load submissions
  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sell');
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      } else {
        const err = await res.json();
        setAlert({ type: 'error', message: err.error || 'Gagal memuat data pengajuan jual.' });
      }
    } catch (e) {
      console.error(e);
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem saat memuat pengajuan.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  // Open Edit Modal
  const handleOpenEdit = (item: any) => {
    setSelectedSubmission(item);
    setStatusInput(item.status || 'PENDING');
    setOfferPriceInput(item.offerPrice ? item.offerPrice.toString() : item.expectedPrice.toString());
    setNotesInput(item.notes || '');
    setModalOpen(true);
  };

  // Submit Update Status & Offer Price
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setSubmitting(true);
    setAlert(null);

    try {
      const res = await fetch(`/api/sell/${selectedSubmission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusInput,
          offerPrice: offerPriceInput ? parseFloat(offerPriceInput) : null,
          notes: notesInput,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal memperbarui pengajuan.');
      }

      setAlert({
        type: 'success',
        message: `Status pengajuan customer "${selectedSubmission.customerName}" berhasil diperbarui menjadi ${statusInput}!`,
      });
      setModalOpen(false);
      loadSubmissions();
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pengajuan dari "${name}"?`)) return;

    try {
      const res = await fetch(`/api/sell/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((item) => item.id !== id));
        setAlert({ type: 'success', message: 'Pengajuan jual berhasil dihapus.' });
      } else {
        const err = await res.json();
        setAlert({ type: 'error', message: err.error || 'Gagal menghapus pengajuan.' });
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan saat menghapus data.' });
    }
  };

  // Format WhatsApp Link
  const getWhatsAppLink = (phone: string, customerName: string, brand: string, model: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;
    const message = encodeURIComponent(
      `Halo ${customerName}, kami dari Admin Showroom Rizkya Motor ingin menindaklanjuti pengajuan jual mobil Anda (${brand} ${model}).`
    );
    return `https://wa.me/${formattedPhone}?text=${message}`;
  };

  // Filtering
  const filteredSubmissions = submissions.filter((item) => {
    const matchSearch =
      item.customerName.toLowerCase().includes(search.toLowerCase()) ||
      item.brand.toLowerCase().includes(search.toLowerCase()) ||
      item.model.toLowerCase().includes(search.toLowerCase()) ||
      item.customerPhone.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Calculate statistics
  const totalSubmissions = submissions.length;
  const pendingCount = submissions.filter((s) => s.status === 'PENDING').length;
  const inspectingCount = submissions.filter((s) => s.status === 'INSPECTING' || s.status === 'CONTACTED').length;
  const acceptedCount = submissions.filter((s) => s.status === 'ACCEPTED').length;

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Kelola Pengajuan Penjualan Mobil
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tinjau penawaran mobil bekas dari customer, atur inspeksi, dan berikan harga penawaran terbaik showroom.
          </p>
        </div>

        <button
          onClick={loadSubmissions}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 transition-all cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Muat Ulang Data</span>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pengajuan</p>
            <p className="text-xl font-bold text-slate-900">{totalSubmissions} Unit</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Menunggu Respon</p>
            <p className="text-xl font-bold text-slate-900">{pendingCount} Unit</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <CarFront className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dalam Inspeksi</p>
            <p className="text-xl font-bold text-slate-900">{inspectingCount} Unit</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Penawaran Disetujui</p>
            <p className="text-xl font-bold text-slate-900">{acceptedCount} Unit</p>
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
            placeholder="Cari nama customer, merek, model, atau WhatsApp..."
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
              <option value="PENDING">Menunggu Respon (Pending)</option>
              <option value="CONTACTED">Sudah Dihubungi</option>
              <option value="INSPECTING">Dalam Inspeksi Fisik</option>
              <option value="OFFERED">Penawaran Dikirim</option>
              <option value="ACCEPTED">Penawaran Disetujui</option>
              <option value="REJECTED">Ditolak</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden w-full">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-slate-600" />
            <p className="text-sm font-medium">Memuat data pengajuan jual mobil...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Handshake className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-800">Belum ada pengajuan jual ditemukan</p>
            <p className="text-xs text-slate-400">Tidak ada data pengajuan yang sesuai dengan filter atau kata kunci saat ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800 uppercase tracking-wider text-xs whitespace-nowrap">
                <tr>
                  <th className="px-4 py-4">Tgl Ajuan</th>
                  <th className="px-5 py-4">Jadwal Datang / Inspeksi</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Unit Mobil</th>
                  <th className="px-4 py-4">Tahun</th>
                  <th className="px-4 py-4">Kilometer (KM)</th>
                  <th className="px-5 py-4">Harga Ekspektasi</th>
                  <th className="px-5 py-4">Penawaran Showroom</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-5 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSubmissions.map((item) => {
                  const waLink = getWhatsAppLink(item.customerPhone, item.customerName, item.brand, item.model);
                  const formattedCreateDate = new Date(item.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const formattedInspectionDate = formatIndonesianDateWithDay(item.inspectionDate);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Tanggal Ajuan */}
                      <td className="px-4 py-4 whitespace-nowrap text-xs font-semibold text-slate-600">
                        {formattedCreateDate}
                      </td>

                      {/* Jadwal Datang / Inspeksi */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {formattedInspectionDate ? (
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{formattedInspectionDate}</p>
                            {item.inspectionTime && (
                              <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Jam {item.inspectionTime.replace(/\s*WIB/gi, '')} WIB
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium text-xs">Belum Ditetapkan</span>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900 text-sm">{item.customerName}</p>
                        <div className="mt-0.5 text-xs">
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-800 font-semibold underline cursor-pointer"
                            title="Chat via WhatsApp"
                          >
                            {item.customerPhone}
                          </a>
                        </div>
                        {item.city && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {item.city}
                          </p>
                        )}
                      </td>

                      {/* Mobil */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900 text-sm">
                          {item.brand} {item.model}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.transmission}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.fuelType}
                        </p>
                      </td>

                      {/* Tahun */}
                      <td className="px-4 py-4 whitespace-nowrap text-xs font-bold text-slate-900">
                        {item.year}
                      </td>

                      {/* Kilometer (KM) */}
                      <td className="px-4 py-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                        {formatNumber(item.mileage)}
                      </td>

                      {/* Ekspektasi Harga */}
                      <td className="px-5 py-4 whitespace-nowrap font-bold text-slate-900 text-sm">
                        {formatRupiah(item.expectedPrice)}
                      </td>

                      {/* Penawaran Showroom */}
                      <td className="px-5 py-4 whitespace-nowrap font-bold text-emerald-700 text-sm">
                        {item.offerPrice ? formatRupiah(item.offerPrice) : <span className="text-slate-400 font-medium text-xs">Belum ada</span>}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold border ${
                            item.status === 'PENDING'
                              ? 'bg-amber-50 border-amber-200 text-amber-800'
                              : item.status === 'CONTACTED'
                              ? 'bg-blue-50 border-blue-200 text-blue-800'
                              : item.status === 'INSPECTING'
                              ? 'bg-purple-50 border-purple-200 text-purple-800'
                              : item.status === 'OFFERED'
                              ? 'bg-orange-50 border-orange-200 text-orange-800'
                              : item.status === 'ACCEPTED'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-rose-50 border-rose-200 text-rose-800'
                          }`}
                        >
                          {item.status === 'PENDING'
                            ? 'Menunggu Respon'
                            : item.status === 'CONTACTED'
                            ? 'Sudah Dihubungi'
                            : item.status === 'INSPECTING'
                            ? 'Dalam Inspeksi'
                            : item.status === 'OFFERED'
                            ? 'Penawaran Dikirim'
                            : item.status === 'ACCEPTED'
                            ? 'Disetujui / Dibeli'
                            : 'Ditolak'}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold"
                            title="Tindak Lanjut & Beri Penawaran"
                          >
                            <Pencil className="w-3.5 h-3.5 text-amber-600" />
                            <span>Kelola</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.customerName)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl shadow-2xs transition-all cursor-pointer inline-flex items-center justify-center"
                            title="Hapus Pengajuan"
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

      {/* MODAL UPDATE STATUS & PENAWARAN */}
      {modalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 my-8 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
                  <Handshake className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-snug">
                    Tindak Lanjut Pengajuan Jual
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Customer: {selectedSubmission.customerName} ({selectedSubmission.customerPhone})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleUpdateStatus} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Info Ringkas Mobil Customer */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Detail Unit Mobil</span>
                  <span className="text-xs font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    Ekspektasi Customer: {formatRupiah(selectedSubmission.expectedPrice)}
                  </span>
                </div>
                <p className="text-base font-bold text-slate-900">
                  {selectedSubmission.brand} {selectedSubmission.model} ({selectedSubmission.year})
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  {selectedSubmission.transmission} • {selectedSubmission.fuelType} • {formatNumber(selectedSubmission.mileage)} KM • Kota: {selectedSubmission.city || '-'}
                </p>
                {selectedSubmission.description && (
                  <p className="text-xs text-slate-500 pt-1 border-t border-slate-200 mt-2">
                    &quot;{selectedSubmission.description}&quot;
                  </p>
                )}

                {/* Foto Unit dari Customer */}
                {selectedSubmission.images && (
                  <div className="pt-2 border-t border-slate-200 mt-2 space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                      Foto Unit dari Customer ({(() => {
                        try {
                          return JSON.parse(selectedSubmission.images || '[]').length;
                        } catch {
                          return 0;
                        }
                      })()} Foto):
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {(() => {
                        try {
                          return JSON.parse(selectedSubmission.images || '[]');
                        } catch {
                          return [];
                        }
                      })().map((imgUrl: string, idx: number) => (
                        <a
                          key={idx}
                          href={imgUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aspect-video rounded-lg overflow-hidden border border-slate-300 bg-slate-100 group relative block"
                          title="Klik untuk lihat ukuran besar"
                        >
                          <img src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick WhatsApp Action Button */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900">Hubungi Langsung via WhatsApp:</p>
                    <p className="text-xs text-emerald-700 font-medium">{selectedSubmission.customerPhone}</p>
                  </div>
                </div>
                <a
                  href={getWhatsAppLink(
                    selectedSubmission.customerPhone,
                    selectedSubmission.customerName,
                    selectedSubmission.brand,
                    selectedSubmission.model
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>Buka Chat WA</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Form Input Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Ubah Status Pengajuan *
                </label>
                <div className="relative">
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    className="w-full text-sm pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold appearance-none cursor-pointer"
                  >
                    <option value="PENDING">Menunggu Respon (Pending)</option>
                    <option value="CONTACTED">Sudah Dihubungi (Contacted)</option>
                    <option value="INSPECTING">Dalam Inspeksi Fisik (Inspecting)</option>
                    <option value="OFFERED">Penawaran Dikirim (Offered)</option>
                    <option value="ACCEPTED">Disetujui / Dibeli Showroom (Accepted)</option>
                    <option value="REJECTED">Ditolak (Rejected)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Form Input Harga Penawaran Showroom */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Harga Penawaran Showroom (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  value={offerPriceInput}
                  onChange={(e) => setOfferPriceInput(e.target.value)}
                  placeholder="Masukkan nominal tawaran showroom..."
                  className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold text-emerald-800"
                />
                {offerPriceInput && (
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">
                    Pratinjau Tawaran: {formatRupiah(parseFloat(offerPriceInput))}
                  </p>
                )}
              </div>

              {/* Form Input Catatan Internal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Catatan Internal Showroom
                </label>
                <textarea
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Tuliskan catatan hasil inspeksi, kondisi bodi/mesin, kesepakatan harga..."
                  className="w-full text-sm p-4 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
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
