'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CarFront,
  ArrowLeft,
  Save,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  ImagePlus,
  ChevronDown,
  Pencil,
  FileText,
  ShieldCheck,
  Palette,
  Plus,
  Sparkles,
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import PopUpAlert from '@/components/ui/PopUpAlert';

const DEFAULT_FEATURE_OPTIONS = [
  'Sunroof / Panoramic Roof',
  'Kamera 360 & Sensor Parkir',
  'Honda Sensing / Toyota Safety Sense (ADAS)',
  'Interior Kulit Premium & Pilot Seat',
  'Keyless Entry & Push Start Button',
  'Power Tailgate (Bagasi Elektrik)',
  'Apple CarPlay & Android Auto',
  'AC Digital Auto Climate Dual-Zone',
  'Audio Premium Speaker System',
  'Lulus Uji 160 Titik Inspeksi Showroom',
  'Garansi 100% Bebas Banjir & Tabrakan',
  'Dokumen Legal Lengkap (STNK, BPKB, Faktur)',
];

const SOLID_COLORS = [
  { name: 'Putih', hex: '#FFFFFF', border: true },
  { name: 'Hitam', hex: '#111827' },
  { name: 'Abu-abu', hex: '#4B5563' },
  { name: 'Silver', hex: '#9CA3AF' },
  { name: 'Merah', hex: '#DC2626' },
  { name: 'Biru', hex: '#1D4ED8' },
  { name: 'Hijau', hex: '#047857' },
  { name: 'Cokelat', hex: '#78350F' },
  { name: 'Gold', hex: '#D97706' },
  { name: 'Kuning', hex: '#EAB308' },
  { name: 'Oranye', hex: '#EA580C' },
  { name: 'Ungu', hex: '#7E22CE' },
];

const COLOR_FINISHES = [
  { label: 'Solid', suffix: 'Solid' },
  { label: 'Metallic', suffix: 'Metallic' },
  { label: 'Pearl / Mutiara', suffix: 'Pearl' },
  { label: 'Doff / Matte', suffix: 'Doff' },
  { label: 'Satin', suffix: 'Satin' },
  { label: 'Chrome', suffix: 'Chrome' },
];

const PRESET_BODY_TYPES = [
  'SUV',
  'MPV',
  'Sedan',
  'Hatchback',
  'Crossover',
  'Coupe',
  'Pick Up',
  'Convertible',
  'Roadster',
  'Van / Minibus',
  'Komersial / Pick Up',
];

export default function AdminCarEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [colorHex, setColorHex] = useState('#FFFFFF');
  const [selectedBaseColor, setSelectedBaseColor] = useState('Putih');
  const [selectedFinish, setSelectedFinish] = useState('');
  const [isCustomBodyType, setIsCustomBodyType] = useState(false);
  const [customBodyType, setCustomBodyType] = useState('');
  const [modelSuggestions, setModelSuggestions] = useState<any[]>([]);
  const [isCustomModelInput, setIsCustomModelInput] = useState(false);

  // Auto detect body type from model name or suggestions
  const autoDetectBodyType = (modelName: string, suggestions: any[]) => {
    if (!modelName) return null;
    const match = suggestions.find(
      (m) =>
        m.name.toLowerCase() === modelName.toLowerCase() ||
        modelName.toLowerCase().includes(m.name.toLowerCase())
    );
    if (match && match.bodyType) {
      return match.bodyType;
    }
    const lowerModel = modelName.toLowerCase();
    if (
      lowerModel.includes('avanza') ||
      lowerModel.includes('xenia') ||
      lowerModel.includes('innova') ||
      lowerModel.includes('veloz') ||
      lowerModel.includes('ertiga') ||
      lowerModel.includes('xpander') ||
      lowerModel.includes('alphard') ||
      lowerModel.includes('voxy') ||
      lowerModel.includes('serena') ||
      lowerModel.includes('stargazer') ||
      lowerModel.includes('sigra') ||
      lowerModel.includes('calya')
    ) {
      return 'MPV';
    }
    if (
      lowerModel.includes('brio') ||
      lowerModel.includes('yaris') ||
      lowerModel.includes('baleno') ||
      lowerModel.includes('ayla') ||
      lowerModel.includes('agya') ||
      lowerModel.includes('jazz')
    ) {
      return 'Hatchback';
    }
    if (
      lowerModel.includes('fortuner') ||
      lowerModel.includes('pajero') ||
      lowerModel.includes('cr-v') ||
      lowerModel.includes('crv') ||
      lowerModel.includes('terios') ||
      lowerModel.includes('rush') ||
      lowerModel.includes('creta') ||
      lowerModel.includes('palisade') ||
      lowerModel.includes('santa fe') ||
      lowerModel.includes('jimny')
    ) {
      return 'SUV';
    }
    if (
      lowerModel.includes('hr-v') ||
      lowerModel.includes('hrv') ||
      lowerModel.includes('wr-v') ||
      lowerModel.includes('wrv') ||
      lowerModel.includes('raize') ||
      lowerModel.includes('rocky') ||
      lowerModel.includes('ioniq') ||
      lowerModel.includes('xforce') ||
      lowerModel.includes('cx-3')
    ) {
      return 'Crossover';
    }
    if (
      lowerModel.includes('corolla') ||
      lowerModel.includes('camry') ||
      lowerModel.includes('civic') ||
      lowerModel.includes('accord') ||
      lowerModel.includes('city') ||
      lowerModel.includes('320i') ||
      lowerModel.includes('520i') ||
      lowerModel.includes('c200') ||
      lowerModel.includes('c300') ||
      lowerModel.includes('e300')
    ) {
      return 'Sedan';
    }
    if (
      lowerModel.includes('triton') ||
      lowerModel.includes('hilux') ||
      lowerModel.includes('pick up')
    ) {
      return 'Pick Up';
    }
    return null;
  };

  const handleModelSelect = (selectedModelName: string) => {
    const detectedBody = autoDetectBodyType(selectedModelName, modelSuggestions);
    const updatedBodyType = detectedBody || formData.bodyType || 'SUV';
    setIsCustomBodyType(false);

    setFormData((prev) => ({
      ...prev,
      model: selectedModelName,
      bodyType: updatedBodyType,
    }));
  };

  const handleBrandChange = (newBrand: string) => {
    setFormData((prev) => ({
      ...prev,
      brand: newBrand,
      model: '',
    }));
    setIsCustomModelInput(false);
  };

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    brand: 'Toyota',
    model: '',
    year: '2022',
    price: '',
    mileage: '',
    plateNumber: 'B 1234 RFS',
    transmission: 'Automatic',
    fuelType: 'Pertalite/Bensin',
    bodyType: 'SUV',
    seats: '5',
    color: 'Putih Pearl',
    previousOwners: '1',
    warrantyMonths: '12',
    location: 'Showroom Utama Jakarta',
    status: 'AVAILABLE',
    description: '',
  });

  useEffect(() => {
    if (formData.brand) {
      fetch(`/api/models?brand=${encodeURIComponent(formData.brand)}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) {
            setModelSuggestions(data);
          }
        })
        .catch(() => setModelSuggestions([]));
    }
  }, [formData.brand]);

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Lulus Uji 160 Titik Inspeksi Showroom',
    'Garansi 100% Bebas Banjir & Tabrakan',
    'Dokumen Legal Lengkap (STNK, BPKB, Faktur)',
  ]);
  const [customFeatureInput, setCustomFeatureInput] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // Fetch car detail to populate form
  const loadCarDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/cars/${id}`);
      if (!res.ok) throw new Error('Gagal memuat data mobil untuk di-edit.');
      const data = await res.json();
      const car = data.car;

      setFormData({
        id: car.id,
        title: car.title || '',
        brand: car.brand || 'Toyota',
        model: car.model || '',
        year: (car.year || 2022).toString(),
        price: (car.price || 0).toString(),
        mileage: (car.mileage || 0).toString(),
        plateNumber: car.plateNumber || 'B 1234 RFS',
        transmission: car.transmission || 'Automatic',
        fuelType: car.fuelType || 'Pertalite/Bensin',
        bodyType: car.bodyType || 'SUV',
        seats: (car.seats || 5).toString(),
        color: car.color || 'Putih Pearl',
        previousOwners: (car.previousOwners || 1).toString(),
        warrantyMonths: (car.warrantyMonths || 12).toString(),
        location: car.location || 'Showroom Utama Jakarta',
        status: car.status || 'AVAILABLE',
        description: car.description || '',
      });

      if (car.bodyType && !PRESET_BODY_TYPES.includes(car.bodyType)) {
        setIsCustomBodyType(true);
        setCustomBodyType(car.bodyType);
      }

      // Parse features if available
      if (car.features) {
        try {
          const parsed = typeof car.features === 'string' ? JSON.parse(car.features) : car.features;
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSelectedFeatures(parsed);
          }
        } catch (e) {
          // If plain text string
          if (typeof car.features === 'string' && car.features.trim()) {
            setSelectedFeatures([car.features]);
          }
        }
      }

      const imgs = car.images?.map((img: any) => img.url) || [];
      setSelectedImages(imgs.length > 0 ? imgs : ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80']);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCarDetail();
  }, [id]);

  // Toggle feature selection
  const toggleFeature = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures((prev) => prev.filter((f) => f !== feature));
    } else {
      setSelectedFeatures((prev) => [...prev, feature]);
    }
  };

  // Add custom feature
  const handleAddCustomFeature = () => {
    if (!customFeatureInput.trim()) return;
    const feat = customFeatureInput.trim();
    if (!selectedFeatures.includes(feat)) {
      setSelectedFeatures((prev) => [...prev, feat]);
    }
    setCustomFeatureInput('');
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    if (selectedImages.length + fileArray.length > 7) {
      window.alert('Maksimal foto yang dapat diunggah adalah 7 foto!');
      return;
    }

    const newImages: string[] = [];
    let count = 0;

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string);
        }
        count++;
        if (count === fileArray.length) {
          setSelectedImages((prev) => [...prev, ...newImages].slice(0, 7));
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Remove single image
  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit Update Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    // Validation min 4 & max 7 images
    if (selectedImages.length < 4) {
      setAlert({
        type: 'error',
        message: `Foto belum memenuhi syarat! Wajib memilih minimal 4 foto (saat ini: ${selectedImages.length} foto).`,
      });
      return;
    }

    if (selectedImages.length > 7) {
      setAlert({
        type: 'error',
        message: `Jumlah foto melebihi batas! Maksimal 7 foto (saat ini: ${selectedImages.length} foto).`,
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          features: JSON.stringify(selectedFeatures),
          images: selectedImages,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal memperbarui data mobil.');
      }

      setAlert({
        type: 'success',
        message: 'Data mobil berhasil diperbarui!',
      });

      setTimeout(() => {
        router.push('/dashboard/admin/cars');
      }, 1200);
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3 max-w-6xl mx-auto">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-800" />
        <p className="text-sm font-medium">Memuat data formulir edit mobil...</p>
      </div>
    );
  }

  if (error || !formData.id) {
    return (
      <div className="p-12 max-w-xl mx-auto space-y-4 text-center">
        <div className="p-6 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl space-y-2 shadow-xs">
          <p className="text-base font-bold">Unit Mobil Tidak Ditemukan</p>
          <p className="text-xs text-amber-800 leading-relaxed">
            Data mobil dengan ID tersebut tidak ditemukan di database. Silakan klik tombol di bawah untuk kembali ke daftar stok.
          </p>
        </div>
        <Link
          href="/dashboard/admin/cars"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Kelola Stok Mobil</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Edit Data Mobil: {formData.title}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Perbarui rincian spesifikasi, fitur, harga, warna, status, dan galeri foto.
            </p>
          </div>

          {/* Action Buttons Header */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard/admin/cars"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <span>Batal & Kembali</span>
            </Link>

            <button
              type="submit"
              disabled={submitting || selectedImages.length < 4 || selectedImages.length > 7}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memperbarui...</span>
                </>
              ) : (
                <span>Perbarui Mobil</span>
              )}
            </button>
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

        {/* Form Sections Grid 2 Cols */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Informasi Utama Kendaraan */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3">
              1. Informasi Utama Kendaraan
            </h3>

            <div className="space-y-4">
              {/* Judul & Plat Nomor Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Judul Listing Mobil *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="sm:col-span-4 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Plat Nomor *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.plateNumber}
                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                    placeholder="B 1234 RFS"
                    className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono font-bold uppercase tracking-wider text-slate-900"
                  />
                </div>
              </div>

              {/* Merek & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">Merek *</label>
                  <div className="relative">
                    <select
                      value={formData.brand}
                      onChange={(e) => handleBrandChange(e.target.value)}
                      className="w-full text-sm pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium appearance-none cursor-pointer"
                    >
                      <option value="Toyota">Toyota</option>
                      <option value="Honda">Honda</option>
                      <option value="Hyundai">Hyundai</option>
                      <option value="BMW">BMW</option>
                      <option value="Mitsubishi">Mitsubishi</option>
                      <option value="Suzuki">Suzuki</option>
                      <option value="Daihatsu">Daihatsu</option>
                      <option value="Nissan">Nissan</option>
                      <option value="Mazda">Mazda</option>
                      <option value="Mercedes-Benz">Mercedes-Benz</option>
                      <option value="Lexus">Lexus</option>
                      <option value="Wuling">Wuling</option>
                      <option value="Chery">Chery</option>
                      <option value="BYD">BYD</option>
                      <option value="MG">MG</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">Model *</label>
                    {modelSuggestions.length > 0 && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {modelSuggestions.length} Model {formData.brand} Tersedia
                      </span>
                    )}
                  </div>

                  {!isCustomModelInput && modelSuggestions.length > 0 ? (
                    <div className="relative">
                      <select
                        value={formData.model}
                        onChange={(e) => {
                          if (e.target.value === 'CUSTOM_MODEL') {
                            setIsCustomModelInput(true);
                            setFormData({ ...formData, model: '' });
                          } else {
                            handleModelSelect(e.target.value);
                          }
                        }}
                        className="w-full text-sm pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold appearance-none cursor-pointer text-slate-900"
                      >
                        <option value="">-- Pilih Model {formData.brand} --</option>
                        {modelSuggestions.map((m) => (
                          <option key={m.id} value={m.name}>
                            {m.name} ({m.bodyType || 'Mobil'})
                          </option>
                        ))}
                        <option value="CUSTOM_MODEL">+ Ketik Model Manual / Kustom...</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          required
                          list="edit-brand-model-list"
                          value={formData.model}
                          onChange={(e) => handleModelSelect(e.target.value)}
                          placeholder={`Pilih / ketik model ${formData.brand}...`}
                          className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold"
                        />
                        {modelSuggestions.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setIsCustomModelInput(false)}
                            className="absolute right-2 px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors cursor-pointer"
                          >
                            Pilih Dropdown
                          </button>
                        )}
                      </div>
                      <datalist id="edit-brand-model-list">
                        {modelSuggestions.map((m) => (
                          <option key={m.id} value={m.name}>
                            {m.name} ({m.bodyType || 'Mobil'})
                          </option>
                        ))}
                      </datalist>
                    </div>
                  )}
                </div>
              </div>

              {/* Tahun, Kapasitas Kursi, Harga, KM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">Tahun *</label>
                  <input
                    type="number"
                    required
                    min="1990"
                    max="2030"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide whitespace-nowrap">
                    Kapasitas Kursi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                    placeholder="5"
                    className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Harga Cash (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold"
                  />
                  {formData.price && (
                    <p className="text-[11px] font-bold text-slate-600 mt-0.5">
                      Pratinjau: {formatRupiah(parseFloat(formData.price))}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Kilometer (KM) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                    className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Spesifikasi Teknis, Warna & Lokasi */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3">
              2. Spesifikasi Teknis, Warna & Lokasi
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Transmisi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">Transmisi *</label>
                <div className="relative">
                  <select
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className="w-full text-sm pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium appearance-none cursor-pointer"
                  >
                    <option value="Automatic">Otomatis</option>
                    <option value="Manual">Manual</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Bahan Bakar */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">Bahan Bakar *</label>
                <div className="relative">
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full text-sm pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium appearance-none cursor-pointer"
                  >
                    <option value="Pertalite/Bensin">Bensin</option>
                    <option value="Solar/Diesel">Diesel</option>
                    <option value="Listrik/EV">Listrik</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Tipe Bodi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">Tipe Bodi *</label>
                <div className="relative">
                  <select
                    value={isCustomBodyType ? 'CUSTOM' : (PRESET_BODY_TYPES.includes(formData.bodyType) ? formData.bodyType : 'CUSTOM')}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') {
                        setIsCustomBodyType(true);
                        setFormData({ ...formData, bodyType: customBodyType });
                      } else {
                        setIsCustomBodyType(false);
                        setFormData({ ...formData, bodyType: e.target.value });
                      }
                    }}
                    className="w-full text-sm pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium appearance-none cursor-pointer"
                  >
                    {PRESET_BODY_TYPES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                    <option value="CUSTOM">+ Tambah Tipe Bodi Lainnya (Kustom)...</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {isCustomBodyType && (
                  <input
                    type="text"
                    required
                    value={formData.bodyType}
                    onChange={(e) => {
                      setCustomBodyType(e.target.value);
                      setFormData({ ...formData, bodyType: e.target.value });
                    }}
                    placeholder="Ketik tipe bodi baru (misal: Roadster, Campervan, Minibus)..."
                    className="w-full text-sm px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 mt-1.5 font-medium"
                  />
                )}
              </div>


              {/* Status Mobil */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">Status Mobil *</label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full text-sm pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium appearance-none cursor-pointer"
                  >
                    <option value="AVAILABLE">Tersedia</option>
                    <option value="RESERVED">Dipesan</option>
                    <option value="SOLD">Terjual</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Warna Bodi Eksterior dengan Color Swatches & Native RGB/Hex Color Picker */}
              <div className="sm:col-span-2 space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    <span>Warna Bodi Eksterior *</span>
                  </label>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                    <span>Pratinjau Kode Hex:</span>
                    <div
                      className="w-4 h-4 rounded-full border border-slate-300 shadow-xs shrink-0"
                      style={{ backgroundColor: colorHex }}
                    />
                    <span className="font-mono text-[11px] font-bold text-slate-800 uppercase">{colorHex}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Text Input Nama Warna */}
                  <div className="sm:col-span-8 space-y-1">
                    <input
                      type="text"
                      required
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="Ketik nama warna (misal: Putih Pearl, Obsidian Black)..."
                      className="w-full text-sm px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                    />
                  </div>

                  {/* Native RGB / Hex Color Picker Trigger */}
                  <div className="sm:col-span-4 flex items-center gap-2">
                    <div className="relative w-full flex items-center bg-white border border-slate-300 hover:border-slate-800 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-slate-900 cursor-pointer transition-colors shadow-2xs">
                      <input
                        type="color"
                        id="custom-color-picker-edit"
                        value={colorHex}
                        onChange={(e) => {
                          const newHex = e.target.value;
                          setColorHex(newHex);
                          if (!formData.color || formData.color.includes('(#')) {
                            setFormData({ ...formData, color: `Warna Kustom (${newHex.toUpperCase()})` });
                          }
                        }}
                        className="w-6 h-6 rounded-md border-0 cursor-pointer p-0 bg-transparent shrink-0"
                      />
                      <label htmlFor="custom-color-picker-edit" className="ml-2 text-xs font-bold text-slate-700 cursor-pointer flex-1 select-none">
                        Pilih Kode Hex
                      </label>
                    </div>
                  </div>
                </div>

                {/* Swatches Palet Warna Dasar (Solid) & Tipe Finishing */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  {/* 1. Pilih Warna Dasar */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                      1. Pilih Warna Dasar (Solid Color):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SOLID_COLORS.map((c) => {
                        const isBaseSelected = selectedBaseColor === c.name || formData.color.toLowerCase().startsWith(c.name.toLowerCase());
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => {
                              setSelectedBaseColor(c.name);
                              setColorHex(c.hex);
                              const finishText = selectedFinish ? ` ${selectedFinish}` : '';
                              setFormData({ ...formData, color: `${c.name}${finishText}` });
                            }}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                              isBaseSelected
                                ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/20'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded-full shrink-0 ${c.border ? 'border border-slate-300' : ''}`}
                              style={{ backgroundColor: c.hex }}
                            />
                            <span>{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Pilih Tipe Finishing Cat (Opsional) */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                      2. Pilih Tipe Finishing / Cat (Opsional):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_FINISHES.map((f) => {
                        const isFinishSelected = selectedFinish === f.suffix;
                        return (
                          <button
                            key={f.suffix}
                            type="button"
                            onClick={() => {
                              const base = selectedBaseColor || 'Putih';
                              if (selectedFinish === f.suffix) {
                                // Toggle off if clicked again
                                setSelectedFinish('');
                                setFormData({ ...formData, color: base });
                              } else {
                                setSelectedFinish(f.suffix);
                                setFormData({ ...formData, color: `${base} ${f.suffix}` });
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                              isFinishSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span>{f.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>



              {/* Lokasi Showroom */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">Lokasi Showroom *</label>
                <div className="relative">
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full text-sm pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium appearance-none cursor-pointer"
                  >
                    <option value="Showroom Utama Jakarta">Showroom Utama Jakarta</option>
                    <option value="Showroom Branch Tangerang">Showroom Branch Tangerang</option>
                    <option value="Showroom Branch Bekasi">Showroom Branch Bekasi</option>
                    <option value="Showroom Branch Surabaya">Showroom Branch Surabaya</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Unggah Multi-Foto (File Explorer: Min 4, Max 7) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              3. Galeri Foto Kendaraan (Wajib Minimal 4, Maksimal 7 Foto)
            </h3>
            <span
              className={`text-xs font-bold ${
                selectedImages.length >= 4 && selectedImages.length <= 7
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}
            >
              {selectedImages.length} / 7 Foto Terpilih (Min 4, Maks 7)
            </span>
          </div>

          {/* File Upload Button */}
          {selectedImages.length < 7 && (
            <div>
              <input
                type="file"
                id="edit-car-file-input"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="edit-car-file-input"
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-slate-900 bg-slate-50 hover:bg-slate-100/80 rounded-2xl cursor-pointer transition-all text-center space-y-2"
              >
                <ImagePlus className="w-9 h-9 text-slate-700" />
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Pilih Foto dari Galeri / File Komputer
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Minimal 4 foto dan maksimal 7 foto mobil (.jpg, .png, .webp)
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Warning Alert if < 4 */}
          {selectedImages.length < 4 && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Harap tambahkan minimal 4 foto ({4 - selectedImages.length} foto lagi dibutuhkan untuk memperbarui).
              </span>
            </div>
          )}

          {/* Preview Grid */}
          {selectedImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2">
              {selectedImages.map((imgUrl, idx) => (
                <div key={idx} className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgUrl} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs ${
                    idx === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-900/80 text-white'
                  }`}>
                    {idx === 0 ? 'Foto Utama' : `#${idx + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                    title="Hapus foto ini"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 4: Deskripsi Lengkap Mobil */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              4. Deskripsi & Catatan Lengkap Mobil
            </h3>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  description:
                    `Kondisi unit mulus terawat seperti baru, interior bersih wangi, mesin halus siap pakai jarak jauh. Terjamin bebas banjir dan bebas bekas tabrakan. Dokumen STNK, BPKB, dan Faktur lengkap. Bergaransi resmi showroom 12 bulan.`,
                })
              }
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>+ Gunakan Template Deskripsi Standar Showroom</span>
            </button>
          </div>

          <textarea
            rows={5}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Tuliskan deskripsi lengkap kondisi fisik kendaraan, catatan servis rutin, kelengkapan surat-surat, dan garansi..."
            className="w-full text-sm p-4 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed font-medium"
          />
        </div>

        {/* Action Bar Bottom */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">
              Perbarui Data Kendaraan
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Pastikan minimal 4 foto telah dipilih sebelum menekan tombol perbarui.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard/admin/cars"
              className="inline-flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold text-sm rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <span>Batal</span>
            </Link>

            <button
              type="submit"
              disabled={submitting || selectedImages.length < 4 || selectedImages.length > 7}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memperbarui...</span>
                </>
              ) : (
                <span>Perbarui Mobil</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
