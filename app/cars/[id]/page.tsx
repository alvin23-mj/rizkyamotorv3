'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Heart,
  Scale,
  Gauge,
  Fuel,
  Calendar,
  MapPin,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  PhoneCall,
  Award,
  CalendarCheck,
  X,
  XCircle,
  Loader2,
  FileText,
  FileCheck,
  BadgeCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { CarListing } from '@/types';
import { formatRupiah, formatNumber } from '@/lib/utils';
import { useComparison } from '@/context/ComparisonContext';
import { useSession } from '@/components/providers/AuthProvider';
import { useFavorites } from '@/context/FavoritesContext';
import CarCard from '@/components/cars/CarCard';

const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const carId = params.id as string;
  const { data: session } = useSession();
  const { addToComparison, removeFromComparison, isInComparison } = useComparison();
  const { toggleFavorite, isFavorited: checkIsFavorited } = useFavorites();

  const [car, setCar] = useState<CarListing | null>(null);
  const [relatedCars, setRelatedCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const isFavorited = car ? checkIsFavorited(car.id) : false;

  const handleFavoriteClick = () => {
    if (car) toggleFavorite(car);
  };

  // Test Drive & Booking Modal state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [hasDp, setHasDp] = useState<boolean>(true);
  const [bookingName, setBookingName] = useState(session?.user?.name || '');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingDate, setBookingDate] = useState(getTomorrowDateString());
  const [bookingTime, setBookingTime] = useState('09:00 - 10:30 WIB');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isLockedByDp, setIsLockedByDp] = useState(false);
  const [existingBookingsForDate, setExistingBookingsForDate] = useState<any[]>([]);
  const [operatingHours, setOperatingHours] = useState<{ timeSlot: string; maxQuota: number }[]>([]);

  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setBookingName(session.user.name);
      if ((session.user as any)?.phone) setBookingPhone((session.user as any).phone);
      fetch('/api/profile')
        .then((res) => res.json())
        .then((data) => {
          if (data.name) setBookingName(data.name);
          if (data.phone) setBookingPhone(data.phone);
        })
        .catch(console.error);
    }
  }, [session]);

  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('/api/schedule-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.operatingHours && data.operatingHours.length > 0) {
          const activeHours = data.operatingHours.filter((s: any) => s.isActive);
          if (activeHours.length > 0) {
            setOperatingHours(activeHours);
            setBookingTime(activeHours[0].timeSlot);
          }
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!bookingDate) return;
    async function fetchBookingsForDate() {
      try {
        const res = await fetch(`/api/bookings?date=${bookingDate}`);
        if (res.ok) {
          const data = await res.json();
          setExistingBookingsForDate(data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchBookingsForDate();
  }, [bookingDate]);

  useEffect(() => {
    async function fetchCarDetail() {
      setLoading(true);
      try {
        const res = await fetch(`/api/cars/${carId}`);
        const data = await res.json();
        if (res.ok) {
          setCar(data.car);
          setRelatedCars(data.relatedCars || []);
        }
      } catch (e) {
        console.error('Failed to load car detail', e);
      } finally {
        setLoading(false);
      }
    }
    if (carId) {
      fetchCarDetail();
    }
  }, [carId]);

  useEffect(() => {
    if (car && typeof document !== 'undefined') {
      document.title = `${car.title || `${car.brand} ${car.model}`} | Rizkya Motor`;
    }
  }, [car]);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-slate-500 bg-white min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Memuat spesifikasi unit showroom...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16 text-center bg-white text-slate-900">
        <h2 className="text-2xl font-bold">Mobil Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 mt-2">
          Stok mobil ini mungkin sudah terjual atau tidak lagi tersedia.
        </p>
        <Link
          href="/cars"
          className="inline-block mt-4 text-xs font-bold text-slate-900 hover:underline"
        >
          &larr; Kembali ke Katalog Showroom
        </Link>
      </div>
    );
  }

  const images =
    car.images && car.images.length > 0
      ? car.images.map((img) => img.url)
      : ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80'];

  const inCompare = isInComparison(car.id);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingDate < getTomorrowDateString()) {
      alert('Booking unit minimal H-1 hari (mulai besok).');
      return;
    }
    setBookingLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carListingId: car.id,
          customerName: bookingName,
          customerPhone: bookingPhone,
          bookingDate,
          bookingTime,
          hasDp: false,
          notes: bookingNotes || 'Booking Kunjungan & Test Drive (Gratis)',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookingSuccess(true);
        setIsLockedByDp(false);
      } else {
        alert(data.error || 'Gagal membuat booking.');
      }
    } catch (err) {
      alert('Gagal mengirim janji temu.');
    } finally {
      setBookingLoading(false);
    }
  };

  const waText = encodeURIComponent(
    `Halo Rizkya Motor Showroom, saya berminat dengan unit "${car.title}" (Rp ${formatNumber(car.price)}). Bisakah konsultasi mengenai unit ini?`
  );

  let carFeatures: string[] = [];
  let docFeatures: string[] = [];

  if (car?.features) {
    try {
      const parsed = typeof car.features === 'string' ? JSON.parse(car.features) : car.features;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        carFeatures = parsed.carFeatures || [];
        docFeatures = parsed.legalDocs || [];
      } else if (Array.isArray(parsed)) {
        const docKeywords = ['stnk', 'bpkb', 'faktur', 'kwitansi', 'buku', 'kunci', 'sertifikat', 'form a', 'dokumen', 'surat'];
        docFeatures = parsed.filter((f: string) => docKeywords.some((k) => f.toLowerCase().includes(k)));
        carFeatures = parsed.filter((f: string) => !docKeywords.some((k) => f.toLowerCase().includes(k)));
      }
    } catch (e) {
      console.error('Error parsing car features', e);
    }
  }

  return (
    <div className="bg-white min-h-screen pb-16 text-slate-800">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Gallery & Main Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Multi-photo viewer */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="relative aspect-[16/10] w-full bg-slate-100 rounded-xl overflow-hidden shadow-md">
              <img
                src={images[activeImageIndex]}
                alt={car.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop';
                }}
                className="w-full h-full object-cover"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white shadow-md transition-all cursor-pointer z-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white shadow-md transition-all cursor-pointer z-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails (Grid 4 Kolom dengan Shadow & Badge "+N Foto") */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 pt-2">
                {images.slice(0, 4).map((imgUrl, index) => {
                  const isLastSlot = index === 3;
                  const hasMoreImages = images.length > 4;
                  const remainingCount = images.length - 3;
                  const isActive =
                    activeImageIndex === index || (isLastSlot && hasMoreImages && activeImageIndex >= 3);

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (isLastSlot && hasMoreImages) {
                          // Jika diklik slot ke-4 dengan sisa foto, geser foto utama ke index 3 atau selanjutnya
                          setActiveImageIndex((prev) =>
                            prev >= 3 && prev < images.length - 1 ? prev + 1 : 3
                          );
                        } else {
                          setActiveImageIndex(index);
                        }
                      }}
                      className={`relative aspect-[16/10] w-full rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'shadow-xl shadow-slate-900/25 scale-[1.03] opacity-100'
                          : 'shadow-md shadow-slate-900/10 opacity-55 hover:opacity-100 hover:shadow-lg'
                      }`}
                    >
                      <img
                        src={isLastSlot && activeImageIndex >= 3 ? images[activeImageIndex] : imgUrl}
                        alt={`Thumbnail ${index + 1}`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop';
                        }}
                        className="w-full h-full object-cover"
                      />

                      {/* Icon Mata Samar 50% untuk Foto yang Sedang Dilihat */}
                      {isActive && !(isLastSlot && hasMoreImages) && (
                        <div className="absolute inset-0 bg-slate-900/25 flex items-center justify-center pointer-events-none">
                          <div className="p-1.5 rounded-full bg-slate-900/60 text-white opacity-50 flex items-center justify-center shadow-xs">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Overlay Badge "+N Foto" pada Slot Ke-4 jika foto > 4 */}
                      {isLastSlot && hasMoreImages && (
                        <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-xs flex flex-col items-center justify-center text-white font-black shadow-inner transition-opacity">
                          <span className="text-base sm:text-lg leading-tight">+{remainingCount}</span>
                          <span className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">Foto</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Price & CTA Card */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white rounded-xl p-6 shadow-md space-y-5 h-full flex flex-col justify-between">
              <div className="space-y-4">
                {/* Header: Car Title & Action Icons */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                      {car.title}
                    </h1>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 opacity-50 mt-1 select-none" title="Jumlah Dilihat">
                      <Eye className="w-4 h-4 shrink-0" />
                      <span className="font-bold">{car.viewsCount}</span>
                    </div>
                  </div>

                  {/* Favorite & Compare Action Buttons */}
                  <div className="flex items-center gap-2.5 shrink-0 pt-1">
                    <button
                      onClick={handleFavoriteClick}
                      className="p-1 cursor-pointer transition-transform active:scale-95"
                      title={isFavorited ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isFavorited ? 'text-rose-600 fill-rose-600' : 'text-slate-700'
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => (inCompare ? removeFromComparison(car.id) : addToComparison(car))}
                      className="p-1 cursor-pointer transition-transform active:scale-95"
                      title={inCompare ? 'Hapus dari Komparasi' : 'Tambah ke Komparasi'}
                    >
                      <Scale
                        className={`w-5 h-5 ${
                          inCompare ? 'text-blue-600 fill-blue-600' : 'text-slate-700'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Price Section */}
                <div>
                  <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
                    Harga
                  </span>
                  <div className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                    {formatRupiah(car.price)}
                  </div>
                </div>
              </div>

              {/* Specification Grid Pills (Tanpa garis border-y) */}
              <div className="grid grid-cols-2 gap-3 py-2 text-xs">
                <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-lg border-none shadow-none">
                  <CalendarCheck className="w-4 h-4 text-slate-800 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400">Tahun Pembuatan</span>
                    <strong className="text-slate-800">{car.year}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-lg border-none shadow-none">
                  <Gauge className="w-4 h-4 text-slate-800 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400">Kilometer</span>
                    <strong className="text-slate-800">{formatNumber(car.mileage)} km</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-lg border-none shadow-none">
                  <Fuel className="w-4 h-4 text-slate-800 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400">Bahan Bakar</span>
                    <strong className="text-slate-800">{car.fuelType}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-lg border-none shadow-none">
                  <ShieldCheck className="w-4 h-4 text-slate-800 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400">Transmisi</span>
                    <strong className="text-slate-800">{car.transmission}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-lg border-none shadow-none">
                  <FileText className="w-4 h-4 text-slate-800 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400">Plat Nomor</span>
                    <strong className="text-slate-800">{car.plateNumber || 'B 888 EV'}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-lg border-none shadow-none">
                  <Users className="w-4 h-4 text-slate-800 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400">Kapasitas Kursi</span>
                    <strong className="text-slate-800">
                      {(car as any).seats
                        ? `${(car as any).seats} Kursi`
                        : car.bodyType?.toLowerCase().includes('mpv') || car.model?.toLowerCase().includes('innova') || car.model?.toLowerCase().includes('avanza') || car.model?.toLowerCase().includes('ertiga')
                        ? '7 Kursi'
                        : '5 Kursi'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (!session) {
                      alert('Harap login terlebih dahulu untuk melakukan booking unit & test drive.');
                      router.push(`/login?callbackUrl=/cars/${car.id}`);
                      return;
                    }
                    setBookingModalOpen(true);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center transition-all cursor-pointer"
                >
                  <span>Booking Unit & Jadwalkan Test Drive</span>
                </button>

                <a
                  href={`https://wa.me/${(settings?.whatsapp || settings?.phone || '6281299887766').replace(/[^0-9]/g, '')}?text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Hubungi Sales Showroom (WhatsApp)</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Specs, Description & Legality Section */}
        <div className="space-y-8 pt-6 border-t border-slate-200">
          {/* Deskripsi Unit */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Deskripsi & Catatan Unit</h3>
            <div className="bg-white rounded-xl p-6 shadow-md text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {car.description}
            </div>
          </div>

          {/* 3 Tables Grid (Spesifikasi Teknis, Kelengkapan Surat, & Fitur Utama Kendaraan) */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Spesifikasi Teknis, Legalitas & Fitur Kendaraan
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {/* Table 1: Spesifikasi Teknis (Kiri) */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 border-b border-slate-200">
                      <th colSpan={2} className="p-3.5 bg-slate-100 font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200">
                        1. Spesifikasi Teknis Kendaraan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-semibold text-slate-600 border-r border-slate-100 w-5/12 bg-slate-50/60">Merek Kendaraan</td>
                      <td className="p-3.5 text-slate-900 font-bold">{car.brand}</td>
                    </tr>
                    <tr className="bg-slate-50/40 hover:bg-slate-50/80">
                      <td className="p-3.5 font-semibold text-slate-600 border-r border-slate-100 bg-slate-50/60">Model & Varian</td>
                      <td className="p-3.5 text-slate-900 font-semibold">{car.model}</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-semibold text-slate-600 border-r border-slate-100 bg-slate-50/60">Tahun Pembuatan</td>
                      <td className="p-3.5 text-slate-900 font-semibold">{car.year}</td>
                    </tr>
                    <tr className="bg-slate-50/40 hover:bg-slate-50/80">
                      <td className="p-3.5 font-semibold text-slate-600 border-r border-slate-100 bg-slate-50/60">Jarak Tempuh (Odometer)</td>
                      <td className="p-3.5 text-slate-900 font-semibold">{formatNumber(car.mileage)} km</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-semibold text-slate-600 border-r border-slate-100 bg-slate-50/60">Transmisi</td>
                      <td className="p-3.5 text-slate-900 font-semibold">{car.transmission}</td>
                    </tr>
                    <tr className="bg-slate-50/40 hover:bg-slate-50/80">
                      <td className="p-3.5 font-semibold text-slate-600 border-r border-slate-100 bg-slate-50/60">Bahan Bakar</td>
                      <td className="p-3.5 text-slate-900 font-semibold">{car.fuelType}</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-semibold text-slate-600 border-r border-slate-100 bg-slate-50/60">Tipe Bodi</td>
                      <td className="p-3.5 text-slate-900 font-semibold">{car.bodyType || '-'}</td>
                    </tr>
                    <tr className="bg-slate-50/40 hover:bg-slate-50/80">
                      <td className="p-3.5 font-semibold text-slate-600 border-r border-slate-100 bg-slate-50/60">Kapasitas Kursi</td>
                      <td className="p-3.5 text-slate-900 font-semibold">
                        {(car as any).seats ? `${(car as any).seats} Kursi` : '5 Kursi'}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-semibold text-slate-600 border-r border-slate-100 bg-slate-50/60">Warna Eksterior</td>
                      <td className="p-3.5 text-slate-900 font-semibold">{car.color}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Table 2: Kelengkapan Dokumen & Legalitas */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 border-b border-slate-200">
                      <th colSpan={2} className="p-3.5 bg-slate-100 font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200">
                        2. Kelengkapan Dokumen & Legalitas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {docFeatures.length > 0 ? (
                      docFeatures.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/40 hover:bg-slate-50/80' : 'hover:bg-slate-50/80'}>
                          <td className="p-3.5 font-semibold text-slate-600 border-r border-slate-100 bg-slate-50/60">
                            {item}
                          </td>
                          <td className="p-3.5 text-center w-12">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="p-5 text-center text-slate-500 font-medium text-xs">
                          Informasi dokumen legal belum diatur.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table 3: Fitur Utama Kendaraan (Digabung Semua) */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 border-b border-slate-200">
                      <th colSpan={2} className="p-3.5 bg-slate-100 font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200">
                        3. Fitur Utama Kendaraan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {carFeatures.length > 0 ? (
                      carFeatures.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/40 hover:bg-slate-50/80' : 'hover:bg-slate-50/80'}>
                          <td className="p-3.5 font-semibold text-slate-600 border-r border-slate-100 bg-slate-50/60">
                            {item}
                          </td>
                          <td className="p-3.5 text-center w-12">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="p-5 text-center text-slate-500 font-medium text-xs">
                          Informasi fitur kendaraan belum diatur.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Related Cars Section */}
        {relatedCars.length > 0 && (
          <div className="pt-10 border-t border-slate-200 space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Stok Mobil Serupa Di Showroom</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedCars.map((relCar) => (
                <CarCard key={relCar.id} car={relCar} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking Test Drive & DP Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative space-y-5">
            <button
              onClick={() => {
                setBookingModalOpen(false);
                setBookingSuccess(false);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  Reservasi Test Drive Berhasil (Gratis)!
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Terima kasih, janji temu test drive unit <strong>{car.title}</strong> pada tanggal{' '}
                  <strong>{bookingDate}</strong> jam <strong>{bookingTime.replace(/\s*WIB/gi, '')} WIB</strong> telah terdaftar secara <strong>Gratis</strong> (Tanpa Biaya DP).
                  Sales consultant kami akan menghubungi Anda via WhatsApp.
                </p>
                <button
                  onClick={() => {
                    setBookingModalOpen(false);
                    setBookingSuccess(false);
                  }}
                  className="mt-4 bg-slate-900 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Selesai
                </button>
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    Booking Test Drive & Kunjungan (Gratis)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Isi formulir di bawah ini untuk mengonfirmasi jadwal kunjungan gratis Anda.
                  </p>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp</label>
                    <input
                      type="tel"
                      required
                      placeholder="0812..."
                      value={bookingPhone}
                      onChange={(e) => setBookingPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Tanggal Kunjungan <span className="text-[10px] text-slate-500 font-normal">(Min H-1)</span>
                      </label>
                      <input
                        type="date"
                        required
                        min={getTomorrowDateString()}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Pilih Jam</label>
                      <select
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium text-xs"
                      >
                        {(operatingHours.length > 0
                          ? operatingHours
                          : [
                              { timeSlot: '09:00 - 10:30 WIB', maxQuota: 1 },
                              { timeSlot: '11:00 - 12:30 WIB', maxQuota: 1 },
                              { timeSlot: '13:00 - 14:30 WIB', maxQuota: 1 },
                              { timeSlot: '15:00 - 16:30 WIB', maxQuota: 1 },
                              { timeSlot: '17:00 - 18:30 WIB', maxQuota: 1 },
                            ]
                        ).map((slotObj) => {
                          const slotTime = slotObj.timeSlot;
                          const maxQuota = slotObj.maxQuota || 1;
                          const prefix = slotTime.split(' ')[0];
                          const count = existingBookingsForDate.filter(
                            (b) => b.bookingTime?.includes(prefix) || slotTime.includes(b.bookingTime)
                          ).length;
                          const isFull = count >= maxQuota;
                          return (
                            <option key={slotTime} value={slotTime} disabled={isFull}>
                              {slotTime} {isFull ? '(Sudah Penuh)' : count > 0 ? `(Sisa ${maxQuota - count} Slot)` : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                    <textarea
                      rows={2}
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Konfirmasi Booking Unit'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

