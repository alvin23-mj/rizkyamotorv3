'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  Phone,
  MapPin,
  Clock,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Plus,
  Trash2,
  Edit2,
  ImageIcon,
  Save,
} from 'lucide-react';
import PopUpAlert from '@/components/ui/PopUpAlert';

interface ShowroomSettingData {
  id: string;
  name: string;
  logoUrl?: string;
  address: string;
  phone: string;
  whatsapp: string;
  operatingHoursText: string;
  heroHomeUrl?: string;
  heroCatalogUrl?: string;
  heroSellUrl?: string;
  heroScheduleUrl?: string;
  categoryBrandUrl?: string;
  categoryBodyUrl?: string;
  categoryCompareUrl?: string;
  categoryScheduleUrl?: string;
  categoryEventUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
}

interface LocationItem {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  mapUrl?: string;
  isActive: boolean;
}

interface HeroBannerItem {
  id: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'identity' | 'hero' | 'locations'>('identity');
  const [settings, setSettings] = useState<ShowroomSettingData>({
    id: '',
    name: 'Rizkya Motor',
    logoUrl: '',
    address: 'Jl. Raya Otomotif No. 88, Jakarta',
    phone: '0812-9988-7766',
    whatsapp: '6281299887766',
    operatingHoursText: '08:30 - 18:00 WIB',
    heroHomeUrl: '',
    heroCatalogUrl: '',
    heroSellUrl: '',
    heroScheduleUrl: '',
    categoryBrandUrl: '',
    categoryBodyUrl: '',
    categoryCompareUrl: '',
    categoryScheduleUrl: '',
    categoryEventUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    tiktokUrl: '',
    youtubeUrl: '',
  });

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [heroBanners, setHeroBanners] = useState<HeroBannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Location Modal State
  const [locModalOpen, setLocModalOpen] = useState(false);
  const [isLocEdit, setIsLocEdit] = useState(false);
  const [locFormData, setLocFormData] = useState({
    id: '',
    name: '',
    address: '',
    city: '',
    phone: '',
    mapUrl: '',
    isActive: true,
  });
  const [submittingLoc, setSubmittingLoc] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings({
            ...data.settings,
            logoUrl: data.settings.logoUrl || '',
            heroHomeUrl: data.settings.heroHomeUrl || '',
            heroCatalogUrl: data.settings.heroCatalogUrl || '',
            heroSellUrl: data.settings.heroSellUrl || '',
            heroScheduleUrl: data.settings.heroScheduleUrl || '',
            categoryBrandUrl: data.settings.categoryBrandUrl || '',
            categoryBodyUrl: data.settings.categoryBodyUrl || '',
            categoryCompareUrl: data.settings.categoryCompareUrl || '',
            categoryScheduleUrl: data.settings.categoryScheduleUrl || '',
            categoryEventUrl: data.settings.categoryEventUrl || '',
          });
        }
        if (data.locations) {
          setLocations(data.locations);
        }
        if (data.heroBanners) {
          setHeroBanners(data.heroBanners);
        }
      } else {
        setAlert({ type: 'error', message: 'Gagal memuat pengaturan showroom.' });
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof ShowroomSettingData) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
          setSettings((prev) => ({ ...prev, [fieldName]: compressedDataUrl }));
        };
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingSettings(true);
    setAlert(null);

    const payload = {
      name: settings.name || 'Rizkya Motor',
      logoUrl: settings.logoUrl || '',
      address: settings.address || '',
      phone: settings.phone || '',
      whatsapp: settings.whatsapp || '',
      operatingHoursText: settings.operatingHoursText || '',
      heroHomeUrl: settings.heroHomeUrl || '',
      heroCatalogUrl: settings.heroCatalogUrl || '',
      heroSellUrl: settings.heroSellUrl || '',
      heroScheduleUrl: settings.heroScheduleUrl || '',
      categoryBrandUrl: settings.categoryBrandUrl || '',
      categoryBodyUrl: settings.categoryBodyUrl || '',
      categoryCompareUrl: settings.categoryCompareUrl || '',
      categoryScheduleUrl: settings.categoryScheduleUrl || '',
      categoryEventUrl: settings.categoryEventUrl || '',
      instagramUrl: settings.instagramUrl || '',
      facebookUrl: settings.facebookUrl || '',
      tiktokUrl: settings.tiktokUrl || '',
      youtubeUrl: settings.youtubeUrl || '',
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_SETTINGS',
          ...payload,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAlert({ type: 'success', message: data.message || 'Pengaturan showroom berhasil disimpan.' });
        fetchSettings();
      } else {
        setAlert({ type: 'error', message: data.error || 'Gagal menyimpan pengaturan.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddHeroBanner = async () => {
    setAlert(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_HERO_BANNER',
          imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({ type: 'success', message: 'Slide carousel beranda baru berhasil ditambahkan.' });
        fetchSettings();
      } else {
        setAlert({ type: 'error', message: data.error || 'Gagal menambahkan slide.' });
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    }
  };

  const handleUpdateBanner = async (id: string, updates: Partial<HeroBannerItem>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_HERO_BANNER',
          id,
          ...updates,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({ type: 'success', message: 'Banner beranda berhasil diperbarui.' });
        fetchSettings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBannerUrlChange = (id: string, newUrl: string) => {
    setHeroBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, imageUrl: newUrl } : b))
    );
  };

  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>, bannerId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          handleBannerUrlChange(bannerId, compressedDataUrl);
          handleUpdateBanner(bannerId, { imageUrl: compressedDataUrl });
        };
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteHeroBanner = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus slide carousel ini?')) return;
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_HERO_BANNER', id }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({ type: 'success', message: 'Slide carousel berhasil dihapus.' });
        fetchSettings();
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    }
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLoc(true);
    setAlert(null);

    try {
      const action = isLocEdit ? 'UPDATE_LOCATION' : 'ADD_LOCATION';
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          ...locFormData,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAlert({ type: 'success', message: data.message || 'Data lokasi berhasil disimpan.' });
        setLocModalOpen(false);
        fetchSettings();
      } else {
        setAlert({ type: 'error', message: data.error || 'Gagal menyimpan lokasi.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setSubmittingLoc(false);
    }
  };

  const handleDeleteLocation = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus lokasi "${name}"?`)) return;

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_LOCATION', id }),
      });
      const data = await res.json();

      if (res.ok) {
        setAlert({ type: 'success', message: data.message || 'Lokasi berhasil dihapus.' });
        fetchSettings();
      } else {
        setAlert({ type: 'error', message: data.error || 'Gagal menghapus lokasi.' });
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-slate-500 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-800" />
        <p>Memuat pengaturan showroom...</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pengaturan Showroom</h1>
          <p className="text-sm text-slate-500 mt-1">
            Atur identitas toko (logo, nomor telepon/WA, alamat), lokasi cabang showroom, dan gambar hero tiap halaman.
          </p>
        </div>
      </div>

      {/* PopUp Toast Alert */}
      {alert && (
        <PopUpAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Tabs Navigation Header (No Underline, Soft Shadow) */}
      <div className="flex items-center gap-2 bg-slate-100/90 p-1.5 rounded-2xl w-fit border border-slate-200/60 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('identity')}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'identity'
              ? 'bg-white text-slate-900 shadow-md font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>1. Identitas & Kontak Toko</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'hero'
              ? 'bg-white text-slate-900 shadow-md font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>2. Banner Hero Image</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('locations')}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'locations'
              ? 'bg-white text-slate-900 shadow-md font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>3. Lokasi Cabang ({locations.length})</span>
        </button>
      </div>

      {/* Tab 1: Identitas & Kontak Toko */}
      {activeTab === 'identity' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-5 h-5 text-slate-800" />
              Identitas & Informasi Kontak Showroom
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Showroom / Toko *</label>
                <input
                  type="text"
                  required
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Nomor WhatsApp Direct *</label>
                <input
                  type="text"
                  required
                  placeholder="6281299887766 (Gunakan format 62...)"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Nomor Telepon Kontak *</label>
                <input
                  type="text"
                  required
                  placeholder="0812-9988-7766"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Jam Operasional (Teks di Topbar) *</label>
                <input
                  type="text"
                  required
                  placeholder="08:30 - 18:00 WIB"
                  value={settings.operatingHoursText}
                  onChange={(e) => setSettings({ ...settings, operatingHoursText: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1">Alamat Utama Showroom *</label>
                <input
                  type="text"
                  required
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-800">Logo Showroom (Unggah File Gambar / URL)</label>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, logoUrl: '/logo.png' })}
                    className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md border border-slate-300 transition-all cursor-pointer"
                  >
                    Gunakan Logo Resmi Showroom (/logo.png)
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Atau masukan URL gambar logo..."
                    value={settings.logoUrl || ''}
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  />
                  <label className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl cursor-pointer shadow-xs font-bold shrink-0 flex items-center gap-1.5 transition-all">
                    <Upload className="w-4 h-4" />
                    <span>Pilih File Gambar Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'logoUrl')}
                      className="hidden"
                    />
                  </label>
                </div>

                {settings.logoUrl && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
                    <div className="w-36 h-16 bg-white border border-slate-300 rounded-lg p-2 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={settings.logoUrl} alt="Logo Showroom" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">Preview Logo Aktif</p>
                      <p className="text-[11px] text-slate-500">Logo ini tampil di Navbar atas dan Footer toko publik.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Media Sosial Showroom */}
              <div className="sm:col-span-2 pt-4 border-t border-slate-200 mt-2 space-y-3">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Akun Media Sosial Showroom (Untuk Tampil di Footer)</h4>
                  <p className="text-[11px] text-slate-500">Tautan ini akan otomatis memunculkan tombol icon media sosial resmi di Footer halaman publik.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Instagram URL</label>
                    <input
                      type="text"
                      placeholder="https://instagram.com/rizkyamotor"
                      value={settings.instagramUrl || ''}
                      onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Facebook URL</label>
                    <input
                      type="text"
                      placeholder="https://facebook.com/rizkyamotor"
                      value={settings.facebookUrl || ''}
                      onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">TikTok URL</label>
                    <input
                      type="text"
                      placeholder="https://tiktok.com/@rizkyamotor"
                      value={settings.tiktokUrl || ''}
                      onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">YouTube URL</label>
                    <input
                      type="text"
                      placeholder="https://youtube.com/@rizkyamotor"
                      value={settings.youtubeUrl || ''}
                      onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-8 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {savingSettings ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Pengaturan...</span>
                </>
              ) : (
                <span>Simpan Pengaturan Identitas</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Banner Hero Image (Table Format) */}
      {activeTab === 'hero' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-slate-800" />
                Tabel Banner Hero Image & Carousel Halaman
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Kelola seluruh gambar hero banner toko. Anda dapat menambah slide carousel beranda atau mengubah banner halaman publik lainnya.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddHeroBanner}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Slide Carousel Beranda</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-900 font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Posisi / Target Banner</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Preview Banner</th>
                  <th className="py-3.5 px-4 min-w-[280px]">URL Gambar / Upload File</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {/* Carousel Slides for Home Page */}
                {heroBanners.map((banner, index) => (
                  <tr key={banner.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-500">{index + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-50 text-blue-800 border border-blue-200 font-extrabold text-[10px] px-2 py-0.5 rounded-md shrink-0">
                          Beranda Carousel
                        </span>
                        <span className="font-bold text-slate-900">Slide #{index + 1}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-14 w-28 bg-slate-900 rounded-lg overflow-hidden border border-slate-300 shadow-2xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={banner.imageUrl} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={banner.imageUrl}
                          onChange={(e) => handleBannerUrlChange(banner.id, e.target.value)}
                          onBlur={() => handleUpdateBanner(banner.id, { imageUrl: banner.imageUrl })}
                          className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-800"
                        />
                        <label className="bg-slate-900 text-white p-2 rounded-lg cursor-pointer hover:bg-slate-800 shrink-0" title="Upload file gambar baru">
                          <Upload className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleBannerFileUpload(e, banner.id)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleUpdateBanner(banner.id, { isActive: !banner.isActive })}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold border cursor-pointer transition-all ${
                          banner.isActive
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                            : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {banner.isActive ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteHeroBanner(banner.id)}
                        disabled={heroBanners.length <= 1}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 font-bold disabled:opacity-40 cursor-pointer"
                        title="Hapus Slide Carousel Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Fixed Page Hero Banners */}
                {/* Katalog Mobil */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-500">{heroBanners.length + 1}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-50 text-purple-800 border border-purple-200 font-extrabold text-[10px] px-2 py-0.5 rounded-md shrink-0">
                        Katalog Mobil
                      </span>
                      <span className="font-bold text-slate-900">Header Banner (/cars)</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-14 w-28 bg-slate-900 rounded-lg overflow-hidden border border-slate-300 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={settings.heroCatalogUrl || ''} alt="Katalog Hero" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={settings.heroCatalogUrl || ''}
                        onChange={(e) => setSettings({ ...settings, heroCatalogUrl: e.target.value })}
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                      <label className="bg-slate-900 text-white p-2 rounded-lg cursor-pointer hover:bg-slate-800 shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'heroCatalogUrl')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-2.5 py-1 rounded-md text-[10px] font-extrabold">
                      Aktif
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleSaveSettings()}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all cursor-pointer inline-flex items-center justify-center shadow-2xs"
                      title="Simpan Banner"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>

                {/* Jual Mobil */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-500">{heroBanners.length + 2}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 font-extrabold text-[10px] px-2 py-0.5 rounded-md shrink-0">
                        Jual Mobil
                      </span>
                      <span className="font-bold text-slate-900">Header Banner (/sell)</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-14 w-28 bg-slate-900 rounded-lg overflow-hidden border border-slate-300 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={settings.heroSellUrl || ''} alt="Jual Hero" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={settings.heroSellUrl || ''}
                        onChange={(e) => setSettings({ ...settings, heroSellUrl: e.target.value })}
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                      <label className="bg-slate-900 text-white p-2 rounded-lg cursor-pointer hover:bg-slate-800 shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'heroSellUrl')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-2.5 py-1 rounded-md text-[10px] font-extrabold">
                      Aktif
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleSaveSettings()}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all cursor-pointer inline-flex items-center justify-center shadow-2xs"
                      title="Simpan Banner"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>

                {/* Jadwal Test Drive */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-500">{heroBanners.length + 3}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-teal-50 text-teal-800 border border-teal-200 font-extrabold text-[10px] px-2 py-0.5 rounded-md shrink-0">
                        Jadwal Test Drive
                      </span>
                      <span className="font-bold text-slate-900">Header Banner (/schedule)</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-14 w-28 bg-slate-900 rounded-lg overflow-hidden border border-slate-300 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={settings.heroScheduleUrl || ''} alt="Jadwal Hero" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={settings.heroScheduleUrl || ''}
                        onChange={(e) => setSettings({ ...settings, heroScheduleUrl: e.target.value })}
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                      <label className="bg-slate-900 text-white p-2 rounded-lg cursor-pointer hover:bg-slate-800 shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'heroScheduleUrl')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-2.5 py-1 rounded-md text-[10px] font-extrabold">
                      Aktif
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleSaveSettings()}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all cursor-pointer inline-flex items-center justify-center shadow-2xs"
                      title="Simpan Banner"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
                {/* 5 Kartu Kategori Beranda */}
                {/* 1. Kategori Merek */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-500">{heroBanners.length + 4}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-[10px] px-2 py-0.5 rounded-md shrink-0">
                        Kartu Beranda
                      </span>
                      <span className="font-bold text-slate-900">Kategori Merek</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-14 w-28 bg-slate-900 rounded-lg overflow-hidden border border-slate-300 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={settings.categoryBrandUrl || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000&auto=format&fit=crop'} alt="Kategori Merek" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={settings.categoryBrandUrl || ''}
                        onChange={(e) => setSettings({ ...settings, categoryBrandUrl: e.target.value })}
                        placeholder="URL Gambar (misal: Unsplash / Public URL)..."
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                      <label className="bg-slate-900 text-white p-2 rounded-lg cursor-pointer hover:bg-slate-800 shrink-0" title="Upload dari File Explorer">
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'categoryBrandUrl')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-2.5 py-1 rounded-md text-[10px] font-extrabold">
                      Aktif
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleSaveSettings()}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all cursor-pointer inline-flex items-center justify-center shadow-2xs"
                      title="Simpan Pengaturan Gambar"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>

                {/* 2. Kategori Tipe Bodi */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-500">{heroBanners.length + 5}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-[10px] px-2 py-0.5 rounded-md shrink-0">
                        Kartu Beranda
                      </span>
                      <span className="font-bold text-slate-900">Kategori Tipe Bodi</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-14 w-28 bg-slate-900 rounded-lg overflow-hidden border border-slate-300 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={settings.categoryBodyUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000&auto=format&fit=crop'} alt="Kategori Tipe Bodi" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={settings.categoryBodyUrl || ''}
                        onChange={(e) => setSettings({ ...settings, categoryBodyUrl: e.target.value })}
                        placeholder="URL Gambar..."
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                      <label className="bg-slate-900 text-white p-2 rounded-lg cursor-pointer hover:bg-slate-800 shrink-0" title="Upload dari File Explorer">
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'categoryBodyUrl')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-2.5 py-1 rounded-md text-[10px] font-extrabold">
                      Aktif
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleSaveSettings()}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all cursor-pointer inline-flex items-center justify-center shadow-2xs"
                      title="Simpan Pengaturan Gambar"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>

                {/* 3. Komparasi Mobil */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-500">{heroBanners.length + 6}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-[10px] px-2 py-0.5 rounded-md shrink-0">
                        Kartu Beranda
                      </span>
                      <span className="font-bold text-slate-900">Komparasi Mobil</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-14 w-28 bg-slate-900 rounded-lg overflow-hidden border border-slate-300 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={settings.categoryCompareUrl || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1000&auto=format&fit=crop'} alt="Komparasi Mobil" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={settings.categoryCompareUrl || ''}
                        onChange={(e) => setSettings({ ...settings, categoryCompareUrl: e.target.value })}
                        placeholder="URL Gambar..."
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                      <label className="bg-slate-900 text-white p-2 rounded-lg cursor-pointer hover:bg-slate-800 shrink-0" title="Upload dari File Explorer">
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'categoryCompareUrl')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-2.5 py-1 rounded-md text-[10px] font-extrabold">
                      Aktif
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleSaveSettings()}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all cursor-pointer inline-flex items-center justify-center shadow-2xs"
                      title="Simpan Pengaturan Gambar"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>

                {/* 4. Lihat Jadwal */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-500">{heroBanners.length + 7}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-[10px] px-2 py-0.5 rounded-md shrink-0">
                        Kartu Beranda
                      </span>
                      <span className="font-bold text-slate-900">Lihat Jadwal</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-14 w-28 bg-slate-900 rounded-lg overflow-hidden border border-slate-300 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={settings.categoryScheduleUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop'} alt="Lihat Jadwal" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={settings.categoryScheduleUrl || ''}
                        onChange={(e) => setSettings({ ...settings, categoryScheduleUrl: e.target.value })}
                        placeholder="URL Gambar..."
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                      <label className="bg-slate-900 text-white p-2 rounded-lg cursor-pointer hover:bg-slate-800 shrink-0" title="Upload dari File Explorer">
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'categoryScheduleUrl')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-2.5 py-1 rounded-md text-[10px] font-extrabold">
                      Aktif
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleSaveSettings()}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all cursor-pointer inline-flex items-center justify-center shadow-2xs"
                      title="Simpan Pengaturan Gambar"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>

                {/* 5. Acara Showroom */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-500">{heroBanners.length + 8}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-[10px] px-2 py-0.5 rounded-md shrink-0">
                        Kartu Beranda
                      </span>
                      <span className="font-bold text-slate-900">Acara Showroom</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-14 w-28 bg-slate-900 rounded-lg overflow-hidden border border-slate-300 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={settings.categoryEventUrl || 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?q=80&w=1000&auto=format&fit=crop'} alt="Acara Showroom" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={settings.categoryEventUrl || ''}
                        onChange={(e) => setSettings({ ...settings, categoryEventUrl: e.target.value })}
                        placeholder="URL Gambar..."
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                      <label className="bg-slate-900 text-white p-2 rounded-lg cursor-pointer hover:bg-slate-800 shrink-0" title="Upload dari File Explorer">
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'categoryEventUrl')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-2.5 py-1 rounded-md text-[10px] font-extrabold">
                      Aktif
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleSaveSettings()}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all cursor-pointer inline-flex items-center justify-center shadow-2xs"
                      title="Simpan Pengaturan Gambar"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => handleSaveSettings()}
              disabled={savingSettings}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-8 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Seluruh Gambar Banner & Kartu Beranda</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Lokasi Cabang Showroom */}
      {activeTab === 'locations' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-slate-800" />
              Daftar Lokasi Showroom / Cabang
            </h3>

            <button
              onClick={() => {
                setIsLocEdit(false);
                setLocFormData({ id: '', name: '', address: '', city: '', phone: '', mapUrl: '', isActive: true });
                setLocModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Lokasi Cabang</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {locations.map((loc) => (
              <div key={loc.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <p className="font-extrabold text-slate-900 text-sm">{loc.name}</p>
                  <p className="text-slate-600 font-medium">{loc.address}</p>
                  {loc.phone && <p className="text-slate-500">Telepon: {loc.phone}</p>}
                  {loc.mapUrl ? (
                    <p className="text-slate-600 flex items-center gap-1 font-medium text-[11px] pt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-emerald-700 font-bold">Peta Leaflet / Maps Terpasang</span>
                    </p>
                  ) : (
                    <p className="text-slate-400 text-[11px] pt-1">Peta Leaflet / Maps belum diatur</p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsLocEdit(true);
                      setLocFormData({
                        id: loc.id,
                        name: loc.name,
                        address: loc.address,
                        city: loc.city,
                        phone: loc.phone || '',
                        mapUrl: loc.mapUrl || '',
                        isActive: loc.isActive,
                      });
                      setLocModalOpen(true);
                    }}
                    className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteLocation(loc.id, loc.name)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 font-bold transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location Modal */}
      {locModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-slate-800" />
                {isLocEdit ? `Edit Lokasi: ${locFormData.name}` : 'Tambah Lokasi Showroom Baru'}
              </h3>
              <button onClick={() => setLocModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLocationSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Lokasi Showroom *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Showroom Utama Jakarta"
                  value={locFormData.name}
                  onChange={(e) => setLocFormData({ ...locFormData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Alamat Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Jl. Raya Otomotif No..."
                  value={locFormData.address}
                  onChange={(e) => setLocFormData({ ...locFormData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Kota Domisili *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jakarta, Tangerang..."
                    value={locFormData.city}
                    onChange={(e) => setLocFormData({ ...locFormData, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Nomor Telepon Cabang</label>
                  <input
                    type="text"
                    placeholder="0812..."
                    value={locFormData.phone}
                    onChange={(e) => setLocFormData({ ...locFormData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  URL Embed Peta (Leaflet / OpenStreetMap / Google Maps)
                </label>
                <input
                  type="text"
                  placeholder="https://www.openstreetmap.org/export/embed.html?bbox=..."
                  value={locFormData.mapUrl}
                  onChange={(e) => setLocFormData({ ...locFormData, mapUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Masukan URL embed peta Leaflet / OpenStreetMap atau Google Maps untuk ditampilkan pada lokasi cabang ini.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLocModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-xl border border-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingLoc}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {submittingLoc ? 'Menyimpan...' : 'Simpan Lokasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
