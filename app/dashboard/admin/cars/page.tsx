'use client';

import { useState, useEffect } from 'react';
import {
  CarFront,
  PlusCircle,
  Search,
  Pencil,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Filter,
  RefreshCw,
  Building2,
  Tag,
  ImagePlus,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { CarListing } from '@/types';
import { formatRupiah, formatNumber } from '@/lib/utils';
import PopUpAlert from '@/components/ui/PopUpAlert';

const INITIAL_FORM = {
  id: '',
  title: '',
  brand: 'Toyota',
  model: '',
  year: new Date().getFullYear().toString(),
  price: '',
  mileage: '',
  plateNumber: 'B 1234 RFS',
  transmission: 'Automatic',
  fuelType: 'Pertalite/Bensin',
  bodyType: 'SUV',
  color: 'Putih',
  location: 'Showroom Utama Jakarta',
  status: 'AVAILABLE',
  description: '',
};

export default function AdminCarCrudPage() {
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('AVAILABLE');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [bodyTypeFilter, setBodyTypeFilter] = useState('ALL');
  const [transmissionFilter, setTransmissionFilter] = useState('ALL');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('ALL');

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCarDetail, setSelectedCarDetail] = useState<any>(null);
  const [activeDetailPhoto, setActiveDetailPhoto] = useState<string>('');

  // Load cars data
  const loadCars = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cars?includeAll=true');
      if (res.ok) {
        const data = await res.json();
        setCars(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  // Open modal for Detail
  const handleOpenDetail = (car: any) => {
    setSelectedCarDetail(car);
    const primary = car.images?.[0]?.url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80';
    setActiveDetailPhoto(primary);
    setDetailModalOpen(true);
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setFormData(INITIAL_FORM);
    setSelectedImages([]);
    setIsEditing(false);
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (car: any) => {
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
      fuelType: car.fuelType || 'Bensin',
      bodyType: car.bodyType || 'SUV',
      color: car.color || 'Putih',
      location: car.location || 'Showroom Utama Jakarta',
      status: car.status || 'AVAILABLE',
      description: car.description || '',
    });

    const imgs = car.images?.map((img: any) => img.url) || [];
    setSelectedImages(imgs.length > 0 ? imgs : ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80']);
    setIsEditing(true);
    setModalOpen(true);
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

  // Handle Save (Create or Update)
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
      const url = isEditing ? `/api/cars/${formData.id}` : '/api/cars';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: selectedImages,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan data mobil.');
      }

      setAlert({
        type: 'success',
        message: isEditing ? 'Data mobil berhasil diperbarui!' : 'Mobil baru berhasil ditambahkan ke stok!',
      });
      setModalOpen(false);
      loadCars();
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (carId: string, carTitle: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${carTitle}" dari inventori?`)) return;

    try {
      const res = await fetch(`/api/cars/${carId}`, { method: 'DELETE' });
      if (res.ok) {
        setCars((prev) => prev.filter((c) => c.id !== carId));
        setAlert({ type: 'success', message: 'Unit mobil berhasil dihapus.' });
      } else {
        const err = await res.json();
        setAlert({ type: 'error', message: err.error || 'Gagal menghapus unit mobil.' });
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan saat menghapus data.' });
    }
  };

  // Handle Toggle Catalog Visibility (On / Off)
  const handleToggleVisibility = async (carId: string, currentIsVisible: boolean) => {
    const nextState = !currentIsVisible;
    try {
      const res = await fetch(`/api/cars/${carId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: nextState }),
      });

      if (res.ok) {
        setCars((prev) =>
          prev.map((c) => (c.id === carId ? { ...c, isVisible: nextState } : c))
        );
        setAlert({
          type: 'success',
          message: nextState
            ? 'Unit mobil sekarang DITAMPILKAN di katalog user.'
            : 'Unit mobil sekarang DISEMBUNYIKAN dari katalog user (Status unit tidak berubah).',
        });
      } else {
        const err = await res.json();
        setAlert({ type: 'error', message: err.error || 'Gagal mengubah status visibilitas katalog.' });
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem saat mengubah visibilitas.' });
    }
  };

  // Handle Status Change Directly from Table
  const handleStatusChange = async (carId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/cars/${carId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setCars((prev) =>
          prev.map((c) => (c.id === carId ? { ...c, status: newStatus } : c))
        );
        setAlert({
          type: 'success',
          message: `Status unit berhasil diubah menjadi "${
            newStatus === 'AVAILABLE' ? 'Tersedia' : newStatus === 'RESERVED' ? 'Dipesan' : 'Terjual'
          }".`,
        });
      } else {
        const err = await res.json();
        setAlert({ type: 'error', message: err.error || 'Gagal mengubah status unit.' });
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem saat mengedit status.' });
    }
  };

  // Filtering
  const filteredCars = cars.filter((car) => {
    const matchSearch =
      !search ||
      car.title.toLowerCase().includes(search.toLowerCase()) ||
      car.brand.toLowerCase().includes(search.toLowerCase()) ||
      car.model.toLowerCase().includes(search.toLowerCase()) ||
      (car.plateNumber && car.plateNumber.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || car.status === statusFilter;
    const matchBrand = brandFilter === 'ALL' || car.brand === brandFilter;
    const matchBody = bodyTypeFilter === 'ALL' || car.bodyType === bodyTypeFilter;
    const matchTrans = transmissionFilter === 'ALL' || car.transmission === transmissionFilter;
    const matchFuel =
      fuelTypeFilter === 'ALL' ||
      car.fuelType === fuelTypeFilter ||
      (fuelTypeFilter === 'Bensin' && car.fuelType === 'Pertalite/Bensin');

    return matchSearch && matchStatus && matchBrand && matchBody && matchTrans && matchFuel;
  });

  // Calculate statistics
  const totalUnits = cars.length;
  const availableUnits = cars.filter((c) => c.status === 'AVAILABLE').length;
  const soldUnits = cars.filter((c) => c.status === 'SOLD').length;
  const totalValue = cars.reduce((acc, c) => acc + (c.status === 'AVAILABLE' ? c.price : 0), 0);

  const uniqueBrands = Array.from(new Set(cars.map((c) => c.brand).filter((b): b is string => Boolean(b))));
  const uniqueBodyTypes = Array.from(new Set(cars.map((c) => c.bodyType).filter((b): b is string => Boolean(b))));
  const uniqueTransmissions = Array.from(new Set(cars.map((c) => c.transmission).filter((t): t is string => Boolean(t))));
  const uniqueFuelTypes = Array.from(
    new Set(cars.map((c) => (c.fuelType === 'Pertalite/Bensin' ? 'Bensin' : c.fuelType)).filter((f): f is string => Boolean(f)))
  );

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Kelola Stok Unit Mobil
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tambah, perbarui, dan kelola seluruh daftar inventori mobil showroom.
          </p>
        </div>

        <Link
          href="/dashboard/admin/add"
          className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg transition-all shadow-sm cursor-pointer shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Tambah Mobil Baru</span>
        </Link>
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
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
            <CarFront className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Inventori</p>
            <p className="text-xl font-bold text-slate-900">{totalUnits} Unit</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Mobil Tersedia</p>
            <p className="text-xl font-bold text-slate-900">{availableUnits} Unit</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Mobil Terjual</p>
            <p className="text-xl font-bold text-slate-900">{soldUnits} Unit</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Nilai Stok Aktif</p>
            <p className="text-base font-bold text-slate-900 truncate">
              {formatRupiah(totalValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, merek, atau model..."
            className="w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-sm text-slate-600 font-semibold shrink-0">
            <Filter className="w-4 h-4" />
            <span>Filter:</span>
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium appearance-none cursor-pointer"
            >
              <option value="AVAILABLE">Tersedia Saja</option>
              <option value="ALL">Semua Status (Tersedia, Dipesan, Terjual)</option>
              <option value="RESERVED">Dipesan</option>
              <option value="SOLD">Terjual</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="text-sm pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium appearance-none cursor-pointer"
            >
              <option value="ALL">Semua Merek</option>
              {uniqueBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={bodyTypeFilter}
              onChange={(e) => setBodyTypeFilter(e.target.value)}
              className="text-sm pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium appearance-none cursor-pointer"
            >
              <option value="ALL">Semua Bodi</option>
              {uniqueBodyTypes.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={transmissionFilter}
              onChange={(e) => setTransmissionFilter(e.target.value)}
              className="text-sm pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium appearance-none cursor-pointer"
            >
              <option value="ALL">Semua Transmisi</option>
              {uniqueTransmissions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={fuelTypeFilter}
              onChange={(e) => setFuelTypeFilter(e.target.value)}
              className="text-sm pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium appearance-none cursor-pointer"
            >
              <option value="ALL">Semua Bahan Bakar</option>
              {uniqueFuelTypes.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={loadCars}
            title="Refresh Data"
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* CRUD Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden w-full">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-slate-600" />
            <p className="text-sm font-medium">Memuat data mobil showroom...</p>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <CarFront className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-800">Tidak ada mobil ditemukan</p>
            <p className="text-sm text-slate-400">Coba ubah kata kunci pencarian atau filter yang aktif.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800 uppercase tracking-wider text-xs whitespace-nowrap">
                <tr>
                  <th className="px-4 py-4">Foto</th>
                  <th className="px-4 py-4">Plat Nomor</th>
                  <th className="px-5 py-4">Nama & Model</th>
                  <th className="px-4 py-4">Merek</th>
                  <th className="px-4 py-4">Warna</th>
                  <th className="px-4 py-4">Tahun</th>
                  <th className="px-5 py-4">Harga Cash</th>
                  <th className="px-4 py-4">Kilometer</th>
                  <th className="px-4 py-4">Transmisi / BB</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-5 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCars.map((car) => {
                  const primaryImg = car.images?.[0]?.url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80';

                  return (
                    <tr key={car.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Foto */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="w-16 h-12 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={primaryImg}
                            alt={car.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Plat Nomor (Badge Abu-Abu) */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold text-xs rounded-md shadow-xs uppercase tracking-wider">
                          {car.plateNumber || 'B 1234 RFS'}
                        </span>
                      </td>

                      {/* Nama & Model */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900 text-sm line-clamp-1">{car.title}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Model: {car.model}
                        </p>
                      </td>

                      {/* Merek (Teks Biasa, Tanpa Badge Box) */}
                      <td className="px-4 py-4 font-semibold text-slate-800 text-xs whitespace-nowrap">
                        {car.brand}
                      </td>

                      {/* Warna */}
                      <td className="px-4 py-4 font-medium text-slate-800 text-xs whitespace-nowrap">
                        {car.color || '-'}
                      </td>

                      {/* Tahun */}
                      <td className="px-4 py-4 font-semibold text-slate-800 whitespace-nowrap">{car.year}</td>

                      {/* Harga */}
                      <td className="px-5 py-4 font-bold text-slate-900 text-sm whitespace-nowrap">
                        {formatRupiah(car.price)}
                      </td>

                      {/* KM */}
                      <td className="px-4 py-4 font-medium text-slate-700 whitespace-nowrap">
                        {formatNumber(car.mileage)}
                      </td>

                      {/* Transmisi */}
                      <td className="px-4 py-4 font-medium text-slate-700 whitespace-nowrap">
                        <div>{car.transmission}</div>
                        <div className="text-xs text-slate-400">{car.fuelType}</div>
                      </td>

                      {/* Status (Interactive Select Dropdown) */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <select
                            value={car.status}
                            onChange={(e) => handleStatusChange(car.id, e.target.value)}
                            title="Klik untuk Mengubah Status Unit"
                            className="w-[105px] px-2 py-1 rounded-md text-xs font-bold border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer focus:outline-none transition-all shadow-2xs"
                          >
                            <option value="AVAILABLE">Tersedia</option>
                            <option value="RESERVED">Dipesan</option>
                            <option value="SOLD">Terjual</option>
                          </select>
                          {car.isVisible === false && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 border border-rose-200 text-rose-700">
                              <EyeOff className="w-3 h-3 text-rose-500" />
                              Katalog OFF
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Aksi (Icon-Only Buttons) */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Toggle Visibilitas Katalog User (On / Off) */}
                          <button
                            onClick={() => handleToggleVisibility(car.id, car.isVisible !== false)}
                            className={`p-2 rounded-md border shadow-xs transition-all cursor-pointer inline-flex items-center justify-center ${
                              car.isVisible !== false
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-300'
                            }`}
                            title={
                              car.isVisible !== false
                                ? 'Katalog ON: Unit Tampil di Katalog User (Klik untuk Sembunyikan)'
                                : 'Katalog OFF: Unit Disembunyikan dari Katalog User (Klik untuk Tampilkan)'
                            }
                          >
                            {car.isVisible !== false ? (
                              <Eye className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-slate-400" />
                            )}
                          </button>

                          <Link
                            href={`/dashboard/admin/cars/${car.id}`}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md shadow-xs transition-all cursor-pointer inline-flex items-center justify-center"
                            title="Lihat Detail Mobil"
                          >
                            <FileText className="w-4 h-4 text-blue-600" />
                          </Link>
                          <Link
                            href={`/dashboard/admin/cars/${car.id}/edit`}
                            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-md shadow-xs transition-all cursor-pointer inline-flex items-center justify-center"
                            title="Edit Data Mobil"
                          >
                            <Pencil className="w-4 h-4 text-amber-600" />
                          </Link>
                          <button
                            onClick={() => handleDelete(car.id, car.title)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md shadow-xs transition-all cursor-pointer inline-flex items-center justify-center"
                            title="Hapus Mobil"
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

      {/* MODAL DETAIL UNIT MOBIL (INTERAKTIF FITUR DARI ATAS KE BAWAH) */}
      {detailModalOpen && selectedCarDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 my-8 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
                  <CarFront className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-snug">
                    Detail Lengkap Unit Mobil
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">ID Unit: {selectedCarDetail.id}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Fitur dari Atas ke Bawah) */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Section 1: Galeri Foto & Informasi Ringkas Utama */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Pratinjau Foto Utama + Thumbnail (7 Cols) */}
                <div className="md:col-span-7 space-y-3">
                  <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeDetailPhoto}
                      alt={selectedCarDetail.title}
                      className="w-full h-full object-cover"
                    />
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-md text-xs font-bold border shadow-xs ${selectedCarDetail.status === 'AVAILABLE'
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : selectedCarDetail.status === 'RESERVED'
                          ? 'bg-amber-600 text-white border-amber-700'
                          : 'bg-slate-700 text-white border-slate-800'
                      }`}>
                      {selectedCarDetail.status === 'AVAILABLE' ? 'Tersedia' : selectedCarDetail.status === 'RESERVED' ? 'Dipesan' : 'Terjual'}
                    </span>
                  </div>

                  {/* Thumbnail Foto Galeri */}
                  {selectedCarDetail.images && selectedCarDetail.images.length > 0 && (
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                      {selectedCarDetail.images.map((imgObj: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => setActiveDetailPhoto(imgObj.url)}
                          className={`w-16 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${activeDetailPhoto === imgObj.url
                              ? 'border-slate-900 ring-2 ring-slate-900/20'
                              : 'border-slate-200 opacity-70 hover:opacity-100'
                            }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imgObj.url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info Ringkas & Harga Cash (5 Cols) */}
                <div className="md:col-span-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-slate-100 border border-slate-200 text-slate-800">
                        {selectedCarDetail.brand}
                      </span>
                      <h1 className="text-xl font-bold text-slate-900 mt-2 leading-snug">
                        {selectedCarDetail.title}
                      </h1>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Model: {selectedCarDetail.model}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Harga Cash Showroom</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatRupiah(selectedCarDetail.price)}
                      </p>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 font-medium pt-1">
                      <div className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Tahun Pembuatan:</span>
                        <span className="font-bold text-slate-800">{selectedCarDetail.year}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Kilometer Jarak Tempuh:</span>
                        <span className="font-bold text-slate-800">{formatNumber(selectedCarDetail.mileage)} km</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Warna Bodi Eksterior:</span>
                        <span className="font-bold text-slate-800">{selectedCarDetail.color || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Lokasi Showroom:</span>
                        <span className="font-bold text-slate-800">{selectedCarDetail.location || 'Showroom Utama'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setDetailModalOpen(false);
                        handleOpenEdit(selectedCarDetail);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                      <span>Edit Data Unit Ini</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 2: Fitur-Fitur Spesifikasi Teknis */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Fitur-Fitur Spesifikasi Teknis Unit
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Transmisi</p>
                    <p className="text-sm font-bold text-slate-800">{selectedCarDetail.transmission}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Bahan Bakar</p>
                    <p className="text-sm font-bold text-slate-800">{selectedCarDetail.fuelType}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Tipe Bodi</p>
                    <p className="text-sm font-bold text-slate-800">{selectedCarDetail.bodyType || '-'}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Garansi Showroom</p>
                    <p className="text-sm font-bold text-emerald-700">
                      {selectedCarDetail.warrantyMonths ? `${selectedCarDetail.warrantyMonths} Bulan` : 'Tersedia'}
                    </p>
                  </div>
                </div>

                {/* Checklist Jaminan & Fitur Standar Showroom */}
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2.5">
                  <p className="text-xs font-bold text-emerald-900">Jaminan Garansi & Standar Inspeksi Showroom:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-emerald-800 font-medium">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Lulus Uji 160 Titik Inspeksi Showroom Resmi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Terjamin 100% Bebas Banjir & Bebas Tabrakan Besar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Dokumen & Surat Legal Lengkap (STNK, BPKB, Faktur)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Kilometer Asli (Bukan Putaran) & Track Record Rutin</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Deskripsi Detail */}
              <div className="space-y-2 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Deskripsi Lengkap Unit Mobil
                </h3>
                <div className="p-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                  {selectedCarDetail.description || 'Tidak ada deskripsi tambahan untuk unit ini.'}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
