'use client';

import { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Search,
  Filter,
  CarFront,
  CheckSquare,
} from 'lucide-react';
import PopUpAlert from '@/components/ui/PopUpAlert';

interface BrandItem {
  id: string;
  name: string;
  logoUrl?: string;
}

interface CarModelItem {
  id: string;
  name: string;
  bodyType?: string;
  brandId: string;
  brand: BrandItem;
  createdAt: string;
}

export default function AdminModelsPage() {
  const [models, setModels] = useState<CarModelItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('ALL');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Checkbox Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    brandId: '',
    brandName: '',
    name: '',
    bodyType: 'MPV',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resModels, resBrands] = await Promise.all([
        fetch('/api/models'),
        fetch('/api/brands'),
      ]);

      if (resModels.ok && resBrands.ok) {
        const dataModels = await resModels.json();
        const dataBrands = await resBrands.json();
        setModels(dataModels);
        setBrands(dataBrands);
      } else {
        setAlert({ type: 'error', message: 'Gagal memuat data model atau merek.' });
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredModels = models.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.brand?.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.bodyType || '').toLowerCase().includes(search.toLowerCase());

    const matchesBrand =
      selectedBrandFilter === 'ALL' || m.brand?.name === selectedBrandFilter || m.brandId === selectedBrandFilter;

    return matchesSearch && matchesBrand;
  });

  // Toggle selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredModels.length && filteredModels.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredModels.map((m) => m.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenAddModal = () => {
    setFormData({
      id: '',
      brandId: brands[0]?.id || '',
      brandName: brands[0]?.name || 'Toyota',
      name: '',
      bodyType: 'MPV',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setAlert({ type: 'error', message: 'Nama model kendaraan wajib diisi.' });
      return;
    }

    setSubmitting(true);
    setAlert(null);

    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setAlert({ type: 'success', message: data.message || 'Model kendaraan berhasil ditambahkan!' });
        setModalOpen(false);
        fetchData();
      } else {
        setAlert({ type: 'error', message: data.error || 'Gagal menyimpan model.' });
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSingle = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus model "${name}"?`)) return;

    try {
      const res = await fetch(`/api/models?id=${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        setAlert({ type: 'success', message: 'Model kendaraan berhasil dihapus.' });
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        fetchData();
      } else {
        setAlert({ type: 'error', message: data.error || 'Gagal menghapus model.' });
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan server.' });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} model terpilih sekaligus?`)) return;

    try {
      const res = await fetch('/api/models', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();

      if (res.ok) {
        setAlert({ type: 'success', message: `${selectedIds.length} model kendaraan berhasil dihapus.` });
        setSelectedIds([]);
        fetchData();
      } else {
        setAlert({ type: 'error', message: data.error || 'Gagal menghapus model terpilih.' });
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan server.' });
    }
  };

  const isAllSelected =
    filteredModels.length > 0 && selectedIds.length === filteredModels.length;

  return (
    <div className="w-full p-6 space-y-6">
      {/* PopUp Toast Alert */}
      {alert && (
        <PopUpAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Header & Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Kelola Model Mobil per Merek
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Atur dan kelola rekomendasi model mobil per merek untuk memudahkan pengisian data dan statistik showroom.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Model Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari model mobil (misal: Avanza, HR-V, 320i)..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter Brand */}
          <div className="relative">
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer appearance-none"
            >
              <option value="ALL">Semua Merek ({brands.length})</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <span className="text-xs text-slate-500 font-bold shrink-0">
          Total {filteredModels.length} Model Terdaftar
        </span>
      </div>

      {/* Bulk Action Banner (Appears when 1 or more items selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-rose-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              {selectedIds.length}
            </span>
            <div>
              <p className="text-xs font-bold text-rose-950">
                {selectedIds.length} Model Mobil Terpilih
              </p>
              <p className="text-[11px] text-rose-700">
                Centang item yang ingin dihapus, lalu klik tombol hapus massal di kanan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3.5 py-2 bg-white text-rose-700 hover:bg-rose-100 font-semibold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer"
            >
              Batal Pilih
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus {selectedIds.length} Model Terpilih</span>
            </button>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-800" />
            <p className="text-xs font-medium">Memuat daftar model mobil per merek...</p>
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <CarFront className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-800">Tidak ada model mobil ditemukan</p>
            <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau filter merek.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer accent-slate-900"
                      title="Pilih / Batal Pilih Semua"
                    />
                  </th>
                  <th className="p-4 w-12 text-center">No</th>
                  <th className="p-4">Merek Kendaraan</th>
                  <th className="p-4">Nama Model</th>
                  <th className="p-4">Tipe Bodi</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredModels.map((item, index) => {
                  const isChecked = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isChecked ? 'bg-rose-50/40 hover:bg-rose-50/60' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(item.id)}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer accent-slate-900"
                        />
                      </td>
                      <td className="p-4 text-center font-bold text-slate-400">{index + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          {item.brand?.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.brand.logoUrl}
                              alt={item.brand.name}
                              className="w-6 h-6 object-contain rounded-md border border-slate-200 p-0.5 shrink-0 bg-white"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-md bg-slate-900 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                              {item.brand?.name?.substring(0, 2).toUpperCase() || 'MK'}
                            </div>
                          )}
                          <span className="font-extrabold text-slate-900">{item.brand?.name || '-'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-700 font-semibold">{item.bodyType || '-'}</span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteSingle(item.id, item.name)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Hapus Model Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add Model */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Tambah Model Mobil Baru</h3>
              <p className="text-xs text-slate-500 mt-1">
                Daftarkan tipe/model baru sesuai merek untuk menjadi rekomendasi otomatis saat input stok unit.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select Merek */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Pilih Merek Mobil *
                </label>
                <select
                  value={formData.brandId}
                  onChange={(e) => {
                    const found = brands.find((b) => b.id === e.target.value);
                    setFormData({
                      ...formData,
                      brandId: e.target.value,
                      brandName: found?.name || '',
                    });
                  }}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold cursor-pointer"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Input Nama Model */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Nama Model Kendaraan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Avanza / Innova Reborn / HR-V / 320i Sport..."
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold"
                />
              </div>

              {/* Select Tipe Bodi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Tipe Bodi (Kategori) *
                </label>
                <select
                  value={formData.bodyType}
                  onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold cursor-pointer"
                >
                  <option value="MPV">MPV</option>
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Crossover">Crossover</option>
                  <option value="Pick Up">Pick Up / Double Cab</option>
                  <option value="Minibus">Minibus / Van</option>
                  <option value="Coupe">Coupe / Sports</option>
                  <option value="Convertible">Convertible</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Model</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
