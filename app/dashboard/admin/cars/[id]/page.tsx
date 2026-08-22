'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CarFront,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Save,
  Loader2,
  Trash2,
  Zap,
  X,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import PopUpAlert from '@/components/ui/PopUpAlert';

export default function AdminCarDetailFeaturesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // States for manual features and legal documents
  const [carFeatures, setCarFeatures] = useState<string[]>([]);
  const [legalDocs, setLegalDocs] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  // Input states
  const [featureInput, setFeatureInput] = useState('');
  const [docInput, setDocInput] = useState('');

  // Load car data
  const loadCar = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/cars/${id}`);
      if (!res.ok) throw new Error('Gagal memuat data mobil.');
      const data = await res.json();
      setCar(data.car);
      setDescription(data.car.description || '');

      let initialCarFeatures: string[] = [];
      let initialLegalDocs: string[] = [];

      if (data.car.features) {
        try {
          const parsed = typeof data.car.features === 'string' ? JSON.parse(data.car.features) : data.car.features;
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            initialCarFeatures = parsed.carFeatures || [];
            initialLegalDocs = parsed.legalDocs || [];
          } else if (Array.isArray(parsed)) {
            const docKeywords = ['stnk', 'bpkb', 'faktur', 'kwitansi', 'buku', 'kunci', 'sertifikat', 'form a', 'dokumen', 'surat'];
            initialLegalDocs = parsed.filter((f: string) => docKeywords.some((k) => f.toLowerCase().includes(k)));
            initialCarFeatures = parsed.filter((f: string) => !docKeywords.some((k) => f.toLowerCase().includes(k)));
          }
        } catch (e) {
          console.error('Failed to parse features', e);
        }
      }

      setCarFeatures(initialCarFeatures);
      setLegalDocs(initialLegalDocs);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCar();
  }, [id]);

  // Handlers for Fitur Utama
  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = featureInput.trim();
    if (!trimmed) return;
    if (carFeatures.some((f) => f.toLowerCase() === trimmed.toLowerCase())) {
      setFeatureInput('');
      return;
    }
    setCarFeatures((prev) => [...prev, trimmed]);
    setFeatureInput('');
  };

  const handleRemoveFeature = (itemToRemove: string) => {
    setCarFeatures((prev) => prev.filter((f) => f !== itemToRemove));
  };

  // Handlers for Kelengkapan Surat & Dokumen Legal
  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = docInput.trim();
    if (!trimmed) return;
    if (legalDocs.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
      setDocInput('');
      return;
    }
    setLegalDocs((prev) => [...prev, trimmed]);
    setDocInput('');
  };

  const handleRemoveDoc = (itemToRemove: string) => {
    setLegalDocs((prev) => prev.filter((d) => d !== itemToRemove));
  };

  // Save changes to database
  const handleSaveFeatures = async () => {
    if (!car) return;
    setSaving(true);
    setAlert(null);

    try {
      const res = await fetch(`/api/cars/${car.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: JSON.stringify({
            carFeatures,
            legalDocs,
          }),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan data mobil.');
      }

      setAlert({
        type: 'success',
        message: 'Data fitur & kelengkapan surat mobil berhasil diperbarui!',
      });
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Terjadi kesalahan saat menyimpan.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3 max-w-6xl mx-auto">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-800" />
        <p className="text-sm font-medium">Memuat kelola fitur unit mobil...</p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4 text-center">
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl space-y-2">
          <p className="text-sm font-bold">Error Memuat Detail Mobil</p>
          <p className="text-xs">{error || 'Mobil tidak ditemukan.'}</p>
        </div>
        <Link
          href="/dashboard/admin/cars"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Kelola Stok Mobil</span>
        </Link>
      </div>
    );
  }

  const primaryImg = car.images?.[0]?.url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80';

  return (
    <div className="w-full p-6 space-y-6">
      {/* Top Header & Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Kelola Fitur Mobil: {car.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tambah fitur dan kelengkapan surat unit ini secara manual dari awal.
          </p>
        </div>

        {/* Buttons Group (Kembali + Simpan Perubahan) */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard/admin/cars"
            className="inline-flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold text-sm rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Kembali</span>
          </Link>

          <button
            onClick={handleSaveFeatures}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* PopUp Toast Alert (PopUp sesuai standar aplikasi) */}
      {alert && (
        <PopUpAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Ringkasan Unit Mobil */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={primaryImg} alt={car.title} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 border border-slate-200 text-slate-800">
                {car.brand}
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                car.status === 'AVAILABLE'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}>
                {car.status === 'AVAILABLE' ? 'Tersedia' : car.status}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">{car.title}</h2>
            <p className="text-xs text-slate-500 font-medium">Model: {car.model}</p>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 w-full sm:w-auto">
          <p className="text-xs font-bold text-slate-500 uppercase">Harga Cash Showroom</p>
          <p className="text-xl font-bold text-slate-900 mt-0.5">{formatRupiah(car.price)}</p>
          <p className="text-xs text-emerald-700 font-bold mt-0.5">
            {carFeatures.length + legalDocs.length} Total Data Ditambahkan
          </p>
        </div>
      </div>

      {/* 2 Manual Tables / Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Table 1 Card: Fitur Utama Kendaraan */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Fitur Utama Kendaraan</h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {carFeatures.length} Fitur
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* Form Input Tambah Fitur */}
              <form onSubmit={handleAddFeature} className="flex gap-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Ketik fitur (misal: Keyless Entry, Sensor Parkir 360)..."
                  className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  type="submit"
                  disabled={!featureInput.trim()}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  + Tambah Fitur
                </button>
              </form>

              {/* Daftar Fitur Ditambahkan */}
              {carFeatures.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {carFeatures.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 text-slate-900 text-xs font-semibold flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(item)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Hapus fitur ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-500 font-medium">Belum ada fitur kendaraan yang ditambahkan.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Ketik nama fitur di atas lalu klik Tambah Fitur.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table 2 Card: Kelengkapan Surat & Dokumen Legal */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Kelengkapan Surat & Dokumen Legal</h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {legalDocs.length} Dokumen
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* Form Input Tambah Dokumen */}
              <form onSubmit={handleAddDoc} className="flex gap-2">
                <input
                  type="text"
                  value={docInput}
                  onChange={(e) => setDocInput(e.target.value)}
                  placeholder="Ketik dokumen (misal: STNK Asli, BPKB Ready, Faktur Asli)..."
                  className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  type="submit"
                  disabled={!docInput.trim()}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  + Tambah Surat
                </button>
              </form>

              {/* Daftar Dokumen Ditambahkan */}
              {legalDocs.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {legalDocs.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 text-slate-900 text-xs font-semibold flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(item)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Hapus dokumen ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-500 font-medium">Belum ada dokumen legal yang ditambahkan.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Ketik nama dokumen di atas lalu klik Tambah Surat.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
