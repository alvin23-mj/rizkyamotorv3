'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/providers/AuthProvider';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  X,
  ImageIcon,
} from 'lucide-react';

export default function SellToShowroomPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const getTomorrowStr = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const formatIndonesianDateWithDay = (dateStr: string) => {
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

  const [formData, setFormData] = useState({
    customerName: session?.user?.name || '',
    customerPhone: '',
    customerEmail: session?.user?.email || '',
    brand: '',
    model: '',
    year: '',
    transmission: 'Automatic',
    fuelType: 'Pertalite/Bensin',
    mileage: '',
    expectedPrice: '',
    city: '',
    description: '',
    inspectionDate: getTomorrowStr(),
    inspectionTime: '09:00 - 10:30 WIB',
  });

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        customerName: session.user?.name || prev.customerName,
        customerEmail: session.user?.email || prev.customerEmail,
        customerPhone: (session.user as any)?.phone || prev.customerPhone,
      }));
      fetch('/api/profile')
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setFormData((prev) => ({
              ...prev,
              customerName: data.name || prev.customerName,
              customerEmail: data.email || prev.customerEmail,
              customerPhone: data.phone || prev.customerPhone,
            }));
          }
        })
        .catch(console.error);
    }
  }, [session]);

  const [closures, setClosures] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([
    '09:00 - 10:30 WIB',
    '11:00 - 12:30 WIB',
    '13:00 - 14:30 WIB',
    '15:00 - 16:30 WIB',
    '17:00 - 18:30 WIB',
  ]);

  useEffect(() => {
    fetch('/api/schedule-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.closures) setClosures(data.closures);
        if (data.operatingHours && data.operatingHours.length > 0) {
          const activeOnly = data.operatingHours
            .filter((s: any) => s.isActive)
            .map((s: any) => s.timeSlot);
          if (activeOnly.length > 0) {
            setAvailableSlots(activeOnly);
            setFormData((prev) => ({ ...prev, inspectionTime: activeOnly[0] }));
          }
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [heroBannerUrl, setHeroBannerUrl] = useState('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.heroSellUrl) {
          setHeroBannerUrl(data.settings.heroSellUrl);
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setUploadedImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      alert('Harap login terlebih dahulu untuk mengajukan penjualan mobil ke showroom.');
      router.push('/login?callbackUrl=/sell');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    if (uploadedImages.length < 2) {
      setErrorMsg('Harap unggah minimal 2 foto kondisi unit mobil Anda (misal: Tampak Depan & Interior/STNK).');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: uploadedImages,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setErrorMsg(data.error || 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-16 text-slate-800">
      {/* Pure Hero Image Banner (Without Text) */}
      <div className="w-full h-40 sm:h-56 md:h-64 lg:h-72 overflow-hidden bg-slate-900 border-b border-slate-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroBannerUrl}
          alt="Hero Banner Jual Mobil"
          className="w-full h-full object-cover object-center"
        />
      </div>
      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">

        {/* Form Container */}
        {success ? (
          <div className="bg-slate-50 border border-slate-200 rounded-none p-10 text-center space-y-4 max-w-xl mx-auto">
            <div className="w-14 h-14 bg-slate-900 text-white rounded-none border border-slate-800 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Pengajuan Berhasil Dikirim!</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Terima kasih <strong>{formData.customerName}</strong>. Tim Appraisal Rizkya Motor Showroom 
              akan segera mengontak Anda via WhatsApp (<strong>{formData.customerPhone}</strong>) untuk estimasi penawaran dan jadwal inspeksi unit.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => setSuccess(false)}
                className="bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold px-5 py-2.5 rounded-none border border-slate-300"
              >
                Kirim Mobil Lain
              </button>
              <button
                onClick={() => router.push('/cars')}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-none shadow-xs"
              >
                Lihat Stok Showroom
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-none p-6 sm:p-10 shadow-lg border-0 w-full space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Formulir Penawaran Jual Mobil
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Lengkapi spesifikasi mobil bekas Anda secara akurat untuk estimasi penawaran terbaik.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-none flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Kontak Pemilik */}
              <div>
                <h4 className="text-xs font-extrabold tracking-wider text-slate-900 mb-3 uppercase">
                  1. Informasi Kontak Anda
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={formData.customerName}
                      onChange={handleChange}
                      className="w-full bg-slate-100 border-0 rounded-none px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Nomor WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      required
                      placeholder="Contoh: 08123456789"
                      value={formData.customerPhone}
                      onChange={handleChange}
                      className="w-full bg-slate-100 border-0 rounded-none px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Kota / Domisili Mobil
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Contoh: Jakarta Selatan"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-slate-100 border-0 rounded-none px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Data Spesifikasi Mobil */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-extrabold tracking-wider text-slate-900 mb-3 uppercase">
                  2. Spesifikasi Kendaraan
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Merek Mobil <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="brand"
                      required
                      value={formData.brand}
                      onChange={handleChange}
                      className="w-full bg-slate-100 border-0 rounded-none px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all placeholder:text-slate-400"
                    >
                      <option value="">Pilih Merek</option>
                      <option value="Toyota">Toyota</option>
                      <option value="Honda">Honda</option>
                      <option value="BMW">BMW</option>
                      <option value="Mercedes-Benz">Mercedes-Benz</option>
                      <option value="Mitsubishi">Mitsubishi</option>
                      <option value="Hyundai">Hyundai</option>
                      <option value="Suzuki">Suzuki</option>
                      <option value="Mazda">Mazda</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Model & Varian <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="model"
                      required
                      placeholder="Contoh: Innova Venturer 2.4 AT"
                      value={formData.model}
                      onChange={handleChange}
                      className="w-full bg-slate-100 border-0 rounded-none px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Tahun Pembuatan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="year"
                      required
                      placeholder="Contoh: 2020"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full bg-slate-100 border-0 rounded-none px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Transmisi
                    </label>
                    <select
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleChange}
                      className="w-full bg-slate-100 border-0 rounded-none px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all placeholder:text-slate-400"
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Bahan Bakar
                    </label>
                    <select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleChange}
                      className="w-full bg-slate-100 border-0 rounded-none px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all placeholder:text-slate-400"
                    >
                      <option value="Pertalite/Bensin">Bensin</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric (EV)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Kilometer (Jarak Tempuh)
                    </label>
                    <input
                      type="number"
                      name="mileage"
                      placeholder="Contoh: 35000"
                      value={formData.mileage}
                      onChange={handleChange}
                      className="w-full bg-slate-100 border-0 rounded-none px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Price, Inspection Date & Description */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-extrabold tracking-wider text-slate-900 mb-3 uppercase">
                  3. Ekspektasi Harga & Jadwal Datang Inspeksi
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Ekspektasi Harga Jual (Rp) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="expectedPrice"
                      required
                      placeholder="Contoh: 250000000"
                      value={formData.expectedPrice}
                      onChange={handleChange}
                      className="w-full bg-slate-100 border-0 rounded-none px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Tanggal Datang (H-1 Minimal) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="inspectionDate"
                      required
                      min={getTomorrowStr()}
                      value={formData.inspectionDate}
                      onChange={handleChange}
                      className="w-full bg-slate-100 border-0 rounded-none px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 font-semibold cursor-pointer transition-all placeholder:text-slate-400"
                    />
                    {formData.inspectionDate && (
                      <p className="text-[11px] font-bold text-emerald-700 mt-1">
                        Hari Datang: {formatIndonesianDateWithDay(formData.inspectionDate)}
                      </p>
                    )}
                    {closures.find((c) => c.closedDate === formData.inspectionDate) && (
                      <p className="text-[11px] font-bold text-rose-700 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Showroom TUTUP pada tanggal ini (Alasan: &quot;{closures.find((c) => c.closedDate === formData.inspectionDate)?.reason}&quot;). Silakan pilih tanggal lain.</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Pilih Jam Slot Kedatangan <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="inspectionTime"
                      required
                      value={formData.inspectionTime}
                      onChange={handleChange}
                      className="w-full bg-slate-100 border-0 rounded-none px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 font-semibold cursor-pointer transition-all placeholder:text-slate-400"
                    >
                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Keterangan / Kondisi Tambahan (Opsional)
                    </label>
                    <textarea
                      name="description"
                      rows={2}
                      placeholder="Jelaskan kondisi riil, servis rutin, pajak, atau apakah ada bekas lecet/baret..."
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full bg-slate-100 border-0 rounded-none px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none transition-all placeholder:text-slate-400"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Section 4: Foto Unit Kendaraan */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-extrabold tracking-wider text-slate-900 uppercase flex items-center gap-1.5">
                    <span>4. Unggah Foto Unit Kendaraan (Minimal 2 Foto)</span>
                    <span className="text-rose-500">*</span>
                  </h4>

                  {/* Dynamic Status Counter Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md border w-fit ${
                      uploadedImages.length >= 2
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    {uploadedImages.length >= 2 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>
                      {uploadedImages.length} / 2 Foto Terunggah{' '}
                      {uploadedImages.length >= 2
                        ? '(Syarat Terpenuhi)'
                        : `(Kurang ${2 - uploadedImages.length} Foto)`}
                    </span>
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  Unggah minimal 2 foto unit mobil Anda (misalnya: Tampak Depan Eksterior, Tampak Samping/Belakang, Interior Kebersihan, atau STNK).
                </p>

                {/* Upload Dropzone / Button */}
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-none shadow-md transition-all cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Pilih & Tambah Foto Kendaraan</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  <span className="text-xs text-slate-400 font-medium">
                    Format: JPG, PNG, WEBP (Bisa pilih beberapa foto sekaligus)
                  </span>
                </div>

                {/* Uploaded Thumbnails Grid */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                    {uploadedImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-lg overflow-hidden border border-slate-300 aspect-video bg-slate-100 shadow-2xs"
                      >
                        <img
                          src={imgUrl}
                          alt={`Foto Mobil ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-md transition-transform hover:scale-110 cursor-pointer"
                          title="Hapus foto ini"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Foto #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Full-width Submit Button (Identik dengan formulir Kirimkan Pesan) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm py-3.5 px-6 rounded-none shadow-md tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim Pengajuan...</span>
                    </>
                  ) : (
                    <span>Kirim Pengajuan Ke Showroom</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
