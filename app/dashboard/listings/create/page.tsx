'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Car, Upload, Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateListingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    title: '',
    brand: 'Toyota',
    model: '',
    year: '2021',
    price: '',
    mileage: '',
    transmission: 'Automatic',
    fuelType: 'Pertalite/Bensin',
    bodyType: 'SUV',
    color: 'Hitam',
    previousOwners: '1',
    location: 'Jakarta Selatan',
    description: '',
  });

  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    'https://images.unsplash.com/photo-1541348263662-e082662d8296?w=800&q=80',
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80',
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!session) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[65vh] flex flex-col items-center justify-center text-center bg-white">
        <h2 className="text-3xl sm:text-4xl font-semibold text-[#0F172A] tracking-tight">Harap Login</h2>
        <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-md leading-relaxed">
          Anda harus login terlebih dahulu untuk memasang iklan mobil.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center justify-center bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium text-sm px-7 py-3 rounded-2xl shadow-md shadow-slate-900/10 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          Login Sekarang
        </Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (index: number, value: string) => {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  };

  const handleAddImage = () => {
    setImages([...images, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80']);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: images.filter((img) => img.trim() !== ''),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan iklan');
      } else {
        alert('Iklan mobil berhasil diterbitkan!');
        router.push(`/cars/${data.id}`);
      }
    } catch (err: any) {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Dashboard</span>
      </Link>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Car className="w-7 h-7 text-blue-500" />
            Pasang Iklan Mobil Bekas Baru
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Lengkapi data spesifikasi & unggah minimal 5 foto terbaik kendaraan Anda.
          </p>
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-300 text-xs p-4 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Judul Iklan */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Judul Iklan Mobil</label>
            <input
              type="text"
              name="title"
              required
              placeholder="Contoh: Toyota Fortuner 2.8 VRZ 4x2 Automatic 2022 Hitam Mulus"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Grid Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Merek Mobil</label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Toyota">Toyota</option>
                <option value="Honda">Honda</option>
                <option value="BMW">BMW</option>
                <option value="Mercedes-Benz">Mercedes-Benz</option>
                <option value="Hyundai">Hyundai</option>
                <option value="Mitsubishi">Mitsubishi</option>
                <option value="Suzuki">Suzuki</option>
                <option value="Mazda">Mazda</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Model & Varian</label>
              <input
                type="text"
                name="model"
                required
                placeholder="Contoh: Fortuner VRZ"
                value={formData.model}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Tahun Pembuatan</label>
              <input
                type="number"
                name="year"
                required
                placeholder="2022"
                value={formData.year}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Harga Jual (Rp)</label>
              <input
                type="number"
                name="price"
                required
                placeholder="Contoh: 450000000"
                value={formData.price}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Jarak Tempuh (Kilometer)</label>
              <input
                type="number"
                name="mileage"
                required
                placeholder="Contoh: 35000"
                value={formData.mileage}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Transmisi</label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Automatic">Automatic (Matic)</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Bahan Bakar</label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Pertalite/Bensin">Pertalite / Bensin</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric (Mobil Listrik)</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Tipe Bodi</label>
              <select
                name="bodyType"
                value={formData.bodyType}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="MPV">MPV</option>
                <option value="Hatchback">Hatchback</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Warna Bodi</label>
              <input
                type="text"
                name="color"
                required
                placeholder="Contoh: Hitam Metalik"
                value={formData.color}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Lokasi Kota</label>
              <input
                type="text"
                name="location"
                required
                placeholder="Contoh: Jakarta Selatan"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Deskripsi Lengkap Mobil</label>
            <textarea
              name="description"
              rows={4}
              required
              placeholder="Jelaskan kondisi mesin, riwayat servis, pajak, kelengkapan surat BPKB/STNK..."
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Multi-Photo Input Section */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                URL Foto Mobil (Minimal 5 Foto)
              </label>
              <button
                type="button"
                onClick={handleAddImage}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Tambah URL Foto
              </button>
            </div>

            {images.map((imgUrl, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="url"
                  required
                  placeholder={`URL Foto #${index + 1}`}
                  value={imgUrl}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="p-2.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-extrabold text-xs py-4 rounded-xl shadow-xl transition-all"
          >
            {loading ? 'Diterbitkan...' : 'Terbitkan Iklan Mobil Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
}
