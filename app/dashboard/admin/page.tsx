'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  CarFront,
  Award,
  Layers,
  Handshake,
  CalendarClock,
  FileSpreadsheet,
  TrendingUp,
  Eye,
  Clock,
  Loader2,
  Plus,
  ArrowRight,
  Flame,
  ShoppingBag,
} from 'lucide-react';
import { formatRupiah, formatNumber } from '@/lib/utils';
import PopUpAlert from '@/components/ui/PopUpAlert';

interface CarItem {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  transmission: string;
  fuelType: string;
  bodyType?: string;
  color: string;
  plateNumber?: string;
  location: string;
  status: string;
  isVisible: boolean;
  viewsCount: number;
  createdAt: string;
}

interface SellSubmissionItem {
  id: string;
  customerName: string;
  brand: string;
  model: string;
  expectedPrice: number;
  status: string;
  createdAt: string;
}

interface TestDriveItem {
  id: string;
  customerName: string;
  bookingDate: string;
  bookingTime: string;
  status: string;
  carListing?: {
    title: string;
    brand: string;
    model: string;
  };
}

export default function AdminShowroomDashboard() {
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState<CarItem[]>([]);
  const [submissions, setSubmissions] = useState<SellSubmissionItem[]>([]);
  const [testDrives, setTestDrives] = useState<TestDriveItem[]>([]);
  const [modelsCount, setModelsCount] = useState(0);
  const [brandsCount, setBrandsCount] = useState(0);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [resReports, resModels, resBrands] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/models'),
        fetch('/api/brands'),
      ]);

      if (resReports.ok) {
        const reportData = await resReports.json();
        setCars(reportData.cars || []);
        setSubmissions(reportData.sellSubmissions || []);
        setTestDrives(reportData.testDriveBookings || []);
      }

      if (resModels.ok) {
        const mData = await resModels.json();
        setModelsCount(Array.isArray(mData) ? mData.length : 0);
      }

      if (resBrands.ok) {
        const bData = await resBrands.json();
        setBrandsCount(Array.isArray(bData) ? bData.length : 0);
      }
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      setAlert({ type: 'error', message: 'Gagal memuat data ringkasan dashboard.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalCars = cars.length;
    const availableCars = cars.filter((c) => c.status === 'AVAILABLE').length;
    const reservedCars = cars.filter((c) => c.status === 'RESERVED' || c.status === 'BOOKED').length;
    const soldCars = cars.filter((c) => c.status === 'SOLD').length;
    const totalAssetValue = cars
      .filter((c) => c.status === 'AVAILABLE' || c.status === 'RESERVED')
      .reduce((sum, c) => sum + (c.price || 0), 0);
    const totalSoldValue = cars
      .filter((c) => c.status === 'SOLD')
      .reduce((sum, c) => sum + (c.price || 0), 0);

    const pendingSubmissions = submissions.filter((s) => s.status === 'PENDING').length;
    const pendingTestDrives = testDrives.filter((t) => t.status === 'PENDING').length;

    return {
      totalCars,
      availableCars,
      reservedCars,
      soldCars,
      totalAssetValue,
      totalSoldValue,
      pendingSubmissions,
      pendingTestDrives,
    };
  }, [cars, submissions, testDrives]);

  // Model Popularity Analysis (Most Viewed & Most Sold)
  const popularModelsAnalysis = useMemo(() => {
    const map: Record<
      string,
      {
        brand: string;
        model: string;
        totalUnits: number;
        soldUnits: number;
        availableUnits: number;
        totalViews: number;
        totalRevenue: number;
      }
    > = {};

    cars.forEach((car) => {
      const key = `${car.brand} ${car.model}`.trim();
      if (!map[key]) {
        map[key] = {
          brand: car.brand,
          model: car.model,
          totalUnits: 0,
          soldUnits: 0,
          availableUnits: 0,
          totalViews: 0,
          totalRevenue: 0,
        };
      }

      map[key].totalUnits += 1;
      map[key].totalViews += car.viewsCount || 0;

      if (car.status === 'SOLD') {
        map[key].soldUnits += 1;
        map[key].totalRevenue += car.price || 0;
      } else if (car.status === 'AVAILABLE') {
        map[key].availableUnits += 1;
      }
    });

    const list = Object.values(map);

    // Most Viewed Models
    const mostViewed = [...list].sort((a, b) => b.totalViews - a.totalViews).slice(0, 5);

    // Most Sold Models
    const mostSold = [...list].sort((a, b) => b.soldUnits - a.soldUnits || b.totalUnits - a.totalUnits).slice(0, 5);

    return { mostViewed, mostSold };
  }, [cars]);

  return (
    <div className="w-full p-6 space-y-6">
      {/* PopUp Toast Alert */}
      {alert && <PopUpAlert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Header Dashboard Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ringkasan Dashboard Admin</h1>
          <p className="text-sm text-slate-500 mt-1">
            Ringkasan eksekutif seluruh modul showroom Rizkya Motor: stok kendaraan, penjualan, pengajuan jual, & statistik model populer.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/dashboard/admin/cars"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mobil Baru</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-500 space-y-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-800" />
          <p className="text-sm font-medium">Memuat ringkasan data eksekutif showroom...</p>
        </div>
      ) : (
        <>
          {/* Top KPI Metrics Cards (Monochrome Slate & White) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Stok Inventori */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Stok Inventori</span>
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
                  <CarFront className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">{metrics.totalCars} Unit</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  <span className="text-slate-700 font-bold">{metrics.availableCars} Ready</span> •{' '}
                  <span className="text-slate-700 font-bold">{metrics.reservedCars} Dipesan</span> •{' '}
                  <span className="text-slate-700 font-bold">{metrics.soldCars} Terjual</span>
                </p>
              </div>
            </div>

            {/* Card 2: Nilai Aset Stok */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nilai Aset Stok Active</span>
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">{formatRupiah(metrics.totalAssetValue)}</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Nilai Terjual: <span className="font-bold text-slate-900">{formatRupiah(metrics.totalSoldValue)}</span>
                </p>
              </div>
            </div>

            {/* Card 3: Pengajuan Jual Pelanggan */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pengajuan Jual</span>
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
                  <Handshake className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">{submissions.length} Pengajuan</h3>
                <p className="text-xs text-slate-600 font-semibold mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {metrics.pendingSubmissions} Menunggu Respon Showroom
                </p>
              </div>
            </div>

            {/* Card 4: Jadwal Test Drive */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Test Drive</span>
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
                  <CalendarClock className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">{testDrives.length} Booking</h3>
                <p className="text-xs text-slate-600 font-semibold mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {metrics.pendingTestDrives} Jadwal Perlu Konfirmasi
                </p>
              </div>
            </div>
          </div>

          {/* FEATURED CARD: Penjualan & Popularitas Model Mobil (Monochrome Gray & White) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-300 text-[10px] font-extrabold uppercase tracking-wider">
                    Statistik Showroom
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    Model Mobil Terpopuler & Paling Laris
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Analisis minat pembeli berdasarkan jumlah unit terjual dan jumlah pengunjung yang melihat katalog model.
                </p>
              </div>

              <Link
                href="/dashboard/admin/models"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <span>Kelola Model Mobil</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Seksi 1: Model Mobil Paling Laris (Terjual) */}
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Model Mobil Paling Laris (Terjual)
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    Total {metrics.soldCars} Unit Terjual
                  </span>
                </div>

                {popularModelsAnalysis.mostSold.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-medium">
                    Belum ada data penjualan unit mobil.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {popularModelsAnalysis.mostSold.map((m, idx) => {
                      const pct = Math.round((m.soldUnits / (metrics.soldCars || 1)) * 100);
                      return (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
                                #{idx + 1}
                              </span>
                              <div>
                                <span className="font-extrabold text-slate-900">
                                  {m.brand} {m.model}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-slate-900 block">
                                {m.soldUnits} Unit Terjual
                              </span>
                              {m.totalRevenue > 0 && (
                                <span className="text-[10px] text-slate-500 font-semibold">
                                  Omset: {formatRupiah(m.totalRevenue)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-slate-900 h-full rounded-full transition-all"
                              style={{ width: `${Math.max(pct, 15)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Seksi 2: Model Mobil Paling Populer (Banyak Dilihat) */}
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                      <Flame className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Model Mobil Paling Banyak Dilihat (Popularity)
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    Berdasarkan Viewers Katalog
                  </span>
                </div>

                {popularModelsAnalysis.mostViewed.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-medium">
                    Belum ada data tampilan produk.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {popularModelsAnalysis.mostViewed.map((m, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <div>
                              <span className="font-extrabold text-slate-900">
                                {m.brand} {m.model}
                              </span>
                              <p className="text-[10px] text-slate-500 font-medium">
                                Total Stok: {m.totalUnits} Unit ({m.availableUnits} Ready)
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-slate-900 flex items-center justify-end gap-1">
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              {formatNumber(m.totalViews)} Dilihat
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Shortcuts grid for all Admin Modules (Monochrome Gray & White) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Akses Cepat Modul Panel Admin
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Link
                href="/dashboard/admin/cars"
                className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs transition-all flex flex-col items-center text-center space-y-2 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CarFront className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">Kelola Mobil</span>
                <span className="text-[10px] text-slate-500 font-semibold">{cars.length} Unit</span>
              </Link>

              <Link
                href="/dashboard/admin/brands"
                className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs transition-all flex flex-col items-center text-center space-y-2 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">Kelola Merek</span>
                <span className="text-[10px] text-slate-500 font-semibold">{brandsCount} Merek</span>
              </Link>

              <Link
                href="/dashboard/admin/models"
                className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs transition-all flex flex-col items-center text-center space-y-2 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">Kelola Model</span>
                <span className="text-[10px] text-slate-500 font-semibold">{modelsCount} Model</span>
              </Link>

              <Link
                href="/dashboard/admin/submissions"
                className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs transition-all flex flex-col items-center text-center space-y-2 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Handshake className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">Pengajuan Jual</span>
                <span className="text-[10px] text-slate-600 font-semibold">{metrics.pendingSubmissions} Pending</span>
              </Link>

              <Link
                href="/dashboard/admin/testdrives"
                className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs transition-all flex flex-col items-center text-center space-y-2 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">Test Drive</span>
                <span className="text-[10px] text-slate-600 font-semibold">{metrics.pendingTestDrives} Pending</span>
              </Link>

              <Link
                href="/dashboard/admin/reports"
                className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs transition-all flex flex-col items-center text-center space-y-2 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">Laporan</span>
                <span className="text-[10px] text-slate-500 font-semibold">Cetak Excel</span>
              </Link>
            </div>
          </div>

          {/* Stok Unit Kendaraan Terbaru (Monochrome Gray & White Table) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Stok Unit Kendaraan Terbaru</h3>
                <p className="text-xs text-slate-500">Daftar unit inventori mobil yang baru didaftarkan ke showroom.</p>
              </div>

              <Link
                href="/dashboard/admin/cars"
                className="text-xs font-bold text-slate-800 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua Unit ({cars.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="p-3">Mobil</th>
                    <th className="p-3">Merek / Model</th>
                    <th className="p-3">Tahun</th>
                    <th className="p-3">Harga Cash</th>
                    <th className="p-3">Dilihat</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {cars.slice(0, 5).map((car) => (
                    <tr key={car.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div>
                          <p className="font-bold text-slate-900 text-sm line-clamp-1">{car.title}</p>
                          <p className="text-[10px] text-slate-500">{car.plateNumber || '-'}</p>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        {car.brand} <span className="text-slate-500">({car.model})</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{car.year}</td>
                      <td className="p-3 font-bold text-slate-900">{formatRupiah(car.price)}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {car.viewsCount}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold border bg-slate-100 border-slate-300 text-slate-800">
                          {car.status === 'AVAILABLE' ? 'Tersedia' : car.status === 'SOLD' ? 'Terjual' : 'Dipesan'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          href={`/dashboard/admin/cars/${car.id}/edit`}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <span>Edit Unit</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
