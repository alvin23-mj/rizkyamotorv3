'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  CalendarX,
  Sliders,
  X,
  Power,
} from 'lucide-react';
import PopUpAlert from '@/components/ui/PopUpAlert';

export default function AdminScheduleSettingsPage() {
  const [operatingHours, setOperatingHours] = useState<any[]>([]);
  const [closures, setClosures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form Emergency Closure ("Tutup Mendadak")
  const [closedDateInput, setClosedDateInput] = useState('');
  const [reasonInput, setReasonInput] = useState('Tutup Mendadak / Maintenance Showroom');
  const [submittingClosure, setSubmittingClosure] = useState(false);

  // Form Add Custom Time Slot
  const [newSlotInput, setNewSlotInput] = useState('');
  const [newQuotaInput, setNewQuotaInput] = useState('3');
  const [submittingSlot, setSubmittingSlot] = useState(false);

  // Helper tomorrow YYYY-MM-DD
  const getTomorrowStr = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getTodayStr = () => {
    return new Date().toISOString().split('T')[0];
  };

  const formatIndonesianDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      if (isNaN(d.getTime())) return dateStr;
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'long' });
      const dayDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      return `${dayName}, ${dayDate}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Load Settings Data
  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/schedule-settings');
      if (res.ok) {
        const data = await res.json();
        setOperatingHours(data.operatingHours || []);
        setClosures(data.closures || []);
      } else {
        const err = await res.json();
        setAlert({ type: 'error', message: err.error || 'Gagal memuat pengaturan jadwal.' });
      }
    } catch (e) {
      console.error(e);
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem saat memuat jadwal.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Quick Preset Closure (e.g. "Besok Tutup")
  const handleQuickCloseTomorrow = () => {
    setClosedDateInput(getTomorrowStr());
    setReasonInput('Tutup Mendadak / Maintenance Showroom');
  };

  const handleQuickCloseToday = () => {
    setClosedDateInput(getTodayStr());
    setReasonInput('Showroom Tutup Hari Ini');
  };

  // Submit Closure Date
  const handleAddClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closedDateInput || !reasonInput) {
      setAlert({ type: 'error', message: 'Harap pilih tanggal tutup dan tuliskan alasannya.' });
      return;
    }

    setSubmittingClosure(true);
    setAlert(null);

    try {
      const res = await fetch('/api/schedule-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_CLOSURE',
          closedDate: closedDateInput,
          reason: reasonInput,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setAlert({ type: 'success', message: data.message || 'Jadwal tutup showroom berhasil ditetapkan!' });
        setClosedDateInput('');
        setReasonInput('Tutup Mendadak / Maintenance Showroom');
        loadSettings();
      } else {
        throw new Error(data.error || 'Gagal menyimpan jadwal tutup.');
      }
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Terjadi kesalahan server.' });
    } finally {
      setSubmittingClosure(false);
    }
  };

  // Delete Closure (Re-open Showroom)
  const handleDeleteClosure = async (id: string, dateStr: string) => {
    if (!confirm(`Apakah Anda yakin ingin MEMBUKA KEMBALI showroom pada ${formatIndonesianDate(dateStr)}?`)) return;

    try {
      const res = await fetch(`/api/schedule-settings?type=CLOSURE&id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAlert({ type: 'success', message: 'Showroom resmi DIBUKA KEMBALI pada tanggal tersebut.' });
        loadSettings();
      } else {
        const err = await res.json();
        setAlert({ type: 'error', message: err.error || 'Gagal menghapus status tutup.' });
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    }
  };

  // Submit New Custom Slot
  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotInput) return;

    setSubmittingSlot(true);
    setAlert(null);

    try {
      const res = await fetch('/api/schedule-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_SLOT',
          timeSlot: newSlotInput,
          maxQuota: parseInt(newQuotaInput, 10),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setAlert({ type: 'success', message: data.message || 'Slot jam baru berhasil ditambahkan!' });
        setNewSlotInput('');
        loadSettings();
      } else {
        throw new Error(data.error || 'Gagal menambah slot jam.');
      }
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Terjadi kesalahan server.' });
    } finally {
      setSubmittingSlot(false);
    }
  };

  // Toggle Slot Active Status
  const handleToggleSlotActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/schedule-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentActive }),
      });

      if (res.ok) {
        setOperatingHours((prev) =>
          prev.map((item) => (item.id === id ? { ...item, isActive: !currentActive } : item))
        );
      } else {
        const err = await res.json();
        setAlert({ type: 'error', message: err.error || 'Gagal mengabaikan slot.' });
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Gagal memperbarui status slot.' });
    }
  };

  // Update Slot Quota directly
  const handleUpdateSlotQuota = async (id: string, newQuota: number) => {
    if (newQuota < 1) return;
    try {
      setOperatingHours((prev) =>
        prev.map((item) => (item.id === id ? { ...item, maxQuota: newQuota } : item))
      );
      await fetch('/api/schedule-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, maxQuota: newQuota }),
      });
    } catch (e) {
      console.error('Error updating slot quota:', e);
    }
  };

  // Delete Time Slot
  const handleDeleteSlot = async (id: string, slotStr: string) => {
    if (!confirm(`Hapus slot jam "${slotStr}"?`)) return;

    try {
      const res = await fetch(`/api/schedule-settings?type=SLOT&id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setOperatingHours((prev) => prev.filter((item) => item.id !== id));
        setAlert({ type: 'success', message: 'Slot jam berhasil dihapus.' });
      } else {
        const err = await res.json();
        setAlert({ type: 'error', message: err.error || 'Gagal menghapus slot jam.' });
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
            Kelola Jam Operasional & Tutup Mendadak
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Atur ketersediaan slot jam untuk Test Drive & Inspeksi Jual, serta tetapkan hari libur / tutup mendadak showroom.
          </p>
        </div>

        <button
          onClick={loadSettings}
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

      {/* MAIN TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Tutup Mendadak & Hari Libur Showroom */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <CalendarX className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Tetapkan Tutup Mendadak / Hari Libur</h2>
                <p className="text-xs text-slate-500">
                  Tanggal yang ditutup akan otomatis memblokir booking Test Drive & Inspeksi Jual dari customer.
                </p>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Pilihan Cepat:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleQuickCloseTomorrow}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold rounded-lg border border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Besok Tutup Mendadak</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickCloseToday}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-lg border border-amber-200 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Hari Ini Tutup</span>
                </button>
              </div>
            </div>

            {/* Form Input Closure Date */}
            <form onSubmit={handleAddClosure} className="space-y-4 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Pilih Tanggal Tutup *
                </label>
                <input
                  type="date"
                  required
                  min={getTodayStr()}
                  value={closedDateInput}
                  onChange={(e) => setClosedDateInput(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold cursor-pointer"
                />
                {closedDateInput && (
                  <p className="text-xs font-bold text-rose-700">
                    🗓️ Tanggal Dipilih: {formatIndonesianDate(closedDateInput)}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Alasan Tutup / Keterangan *
                </label>
                <input
                  type="text"
                  required
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="Contoh: Tutup Mendadak / Maintenance Showroom & Stok Opname..."
                  className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={submittingClosure}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submittingClosure ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Status Tutup...</span>
                  </>
                ) : (
                  <>
                    <CalendarX className="w-4 h-4" />
                    <span>Simpan Jadwal Tutup Showroom</span>
                  </>
                )}
              </button>
            </form>

            {/* List Showroom Closures */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Daftar Tanggal Tutup / Libur Terjadwal:
              </h3>

              {closures.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-xs font-medium">
                  Belum ada tanggal tutup mendadak yang ditetapkan. Showroom BUKA setiap hari sesuai jam operasional.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {closures.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-md uppercase">
                            TUTUP
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {formatIndonesianDate(c.closedDate)}
                          </span>
                        </div>
                        <p className="text-xs text-rose-800 font-medium mt-1">
                          Alasan: &quot;{c.reason}&quot;
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteClosure(c.id, c.closedDate)}
                        className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-300 hover:border-emerald-300 rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0"
                        title="Buka kembali showroom pada tanggal ini"
                      >
                        Buka Kembali
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Kelola Slot Jam Operasional & Quota */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Kelola Slot Jam Kunjungan</h2>
                  <p className="text-xs text-slate-500">
                    Aktifkan/nonaktifkan jam kunjungan Test Drive & Inspeksi Jual serta batasi kuota customer per slot.
                  </p>
                </div>
              </div>
            </div>

            {/* List Slot Jam Operasional */}
            <div className="space-y-3">
              {loading ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-600" />
                  <p className="text-xs font-medium">Memuat slot jam operasional...</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {operatingHours.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        slot.isActive
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-slate-100/60 border-slate-300 opacity-60'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900">{slot.timeSlot}</p>
                          
                          {/* Slot Kuota Kustomer Stepper / Input */}
                          <div className="flex items-center gap-1.5 mt-1 bg-white border border-slate-300 rounded-lg px-2 py-0.5 w-fit shadow-2xs">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Slot Kuota:</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateSlotQuota(slot.id, Math.max(1, slot.maxQuota - 1))}
                              className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-xs transition-colors cursor-pointer"
                              title="Kurangi kuota"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={slot.maxQuota}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val >= 1) handleUpdateSlotQuota(slot.id, val);
                              }}
                              className="w-8 text-center text-xs font-extrabold text-slate-900 focus:outline-none bg-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateSlotQuota(slot.id, slot.maxQuota + 1)}
                              className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-xs transition-colors cursor-pointer"
                              title="Tambah kuota"
                            >
                              +
                            </button>
                            <span className="text-[11px] font-semibold text-slate-600">Kustomer</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                        {/* Toggle Active / Nonaktif */}
                        <button
                          type="button"
                          onClick={() => handleToggleSlotActive(slot.id, slot.isActive)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            slot.isActive
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                              : 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{slot.isActive ? 'Aktif' : 'Nonaktif'}</span>
                        </button>

                        {/* Hapus Slot */}
                        <button
                          type="button"
                          onClick={() => handleDeleteSlot(slot.id, slot.timeSlot)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus slot jam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Add New Custom Slot */}
            <form onSubmit={handleAddSlot} className="pt-4 border-t border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tambah Slot Jam Kustom Baru:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wide">
                    Jam Slot Kunjungan *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSlotInput}
                    onChange={(e) => setNewSlotInput(e.target.value)}
                    placeholder="Contoh: 08:00 - 09:30 WIB..."
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold"
                  />
                </div>
                <div className="sm:col-span-6 flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wide">
                      Slot Kuota Kustomer *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newQuotaInput}
                      onChange={(e) => setNewQuotaInput(e.target.value)}
                      placeholder="1"
                      className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold text-center"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingSlot}
                    className="py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
