'use client';

import { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Upload,
  Search,
  Eye,
  EyeOff,
} from 'lucide-react';
import PopUpAlert from '@/components/ui/PopUpAlert';

interface BrandItem {
  id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  order: number;
  isFeatured: boolean;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    logoUrl: '',
    description: '',
    order: '1',
    isFeatured: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/brands');
      if (res.ok) {
        const data = await res.json();
        setBrands(data);
      } else {
        setAlert({ type: 'error', message: 'Gagal memuat daftar merek.' });
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert(null);

    try {
      const url = '/api/brands';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setAlert({ type: 'success', message: data.message || 'Data merek berhasil disimpan.' });
        setModalOpen(false);
        fetchBrands();
      } else {
        setAlert({ type: 'error', message: data.error || 'Gagal menyimpan merek.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBrand = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus merek "${name}"?`)) return;

    try {
      const res = await fetch(`/api/brands?id=${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        setAlert({ type: 'success', message: data.message || 'Merek berhasil dihapus.' });
        fetchBrands();
      } else {
        setAlert({ type: 'error', message: data.error || 'Gagal menghapus merek.' });
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    }
  };

  const filteredBrands = brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Merek Kendaraan</h1>
          <p className="text-sm text-slate-500 mt-1">
            Atur merek mobil yang tampil di beranda, pasang logo merek resmi, serta urutan prioritas tampilnya.
          </p>
        </div>

        <button
          onClick={() => {
            setIsEdit(false);
            setFormData({
              id: '',
              name: '',
              logoUrl: '',
              description: '',
              order: (brands.length + 1).toString(),
              isFeatured: true,
            });
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Merek Baru</span>
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

      {/* Search & Stats */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama merek (misal: Toyota, Honda)..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <span className="text-xs text-slate-500 font-medium">Total: {filteredBrands.length} Merek</span>
      </div>

      {/* Brands Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-800" />
          <p>Memuat data merek...</p>
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="py-16 text-center text-slate-500 space-y-2 bg-white rounded-2xl border border-slate-200">
          <Award className="w-10 h-10 mx-auto text-slate-300" />
          <p className="font-bold text-slate-700">Belum ada merek terdaftar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredBrands.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                    Urutan #{b.order}
                  </span>
                  {b.isFeatured ? (
                    <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                      <Eye className="w-3 h-3 text-emerald-600" /> Tampil di Beranda
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> Disembunyikan
                    </span>
                  )}
                </div>

                <div className="w-full h-24 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-3 overflow-hidden">
                  {b.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.logoUrl} alt={b.name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <Award className="w-10 h-10 text-slate-300" />
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{b.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                    {b.description || 'Tidak ada deskripsi.'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setIsEdit(true);
                    setFormData({
                      id: b.id,
                      name: b.name,
                      logoUrl: b.logoUrl || '',
                      description: b.description || '',
                      order: b.order.toString(),
                      isFeatured: b.isFeatured,
                    });
                    setModalOpen(true);
                  }}
                  className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDeleteBrand(b.id, b.name)}
                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Brand Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-slate-800" />
                {isEdit ? `Edit Merek: ${formData.name}` : 'Tambah Merek Kendaraan Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Merek *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Toyota, Honda, BMW..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Logo / Gambar Merek</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Tempel URL gambar atau unggah dari laptop..."
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                    />
                    <label className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-xl cursor-pointer shadow-xs">
                      <Upload className="w-4 h-4" />
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>

                  {formData.logoUrl && (
                    <div className="w-full h-20 bg-slate-100 border border-slate-200 rounded-xl p-2 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formData.logoUrl} alt="Preview Logo" className="max-h-full max-w-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Deskripsi Singkat (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Kendaraan Tangguh & Efisien..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Urutan Tampil *</label>
                  <input
                    type="number"
                    required
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Status Tampil</label>
                  <select
                    value={formData.isFeatured ? 'YES' : 'NO'}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.value === 'YES' })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold cursor-pointer"
                  >
                    <option value="YES">Tampilkan di Beranda</option>
                    <option value="NO">Sembunyikan</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-xl border border-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Merek'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
