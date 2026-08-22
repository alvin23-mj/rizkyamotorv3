'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  CarFront,
  Handshake,
  CalendarClock,
  Users,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Tag,
  ChevronDown,
  Loader2,
  ArrowUpRight,
  ShieldCheck,
  Award,
  Layers,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatRupiah, formatNumber, formatDate } from '@/lib/utils';

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'cars' | 'sell' | 'testdrive' | 'users' | 'executive'>('cars');

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [carStatusFilter, setCarStatusFilter] = useState('SOLD');
  const [carBrandFilter, setCarBrandFilter] = useState('ALL');
  const [sellStatusFilter, setSellStatusFilter] = useState('ALL');
  const [testDriveStatusFilter, setTestDriveStatusFilter] = useState('ALL');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch reports data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // Filtered datasets
  const filteredCars = useMemo(() => {
    if (!data?.cars) return [];
    return data.cars.filter((c: any) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.plateNumber && c.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = carStatusFilter === 'ALL' || c.status === carStatusFilter;
      const matchesBrand = carBrandFilter === 'ALL' || c.brand === carBrandFilter;

      return matchesSearch && matchesStatus && matchesBrand;
    });
  }, [data?.cars, searchQuery, carStatusFilter, carBrandFilter]);

  const filteredSellSubmissions = useMemo(() => {
    if (!data?.sellSubmissions) return [];
    return data.sellSubmissions.filter((s: any) => {
      const matchesSearch =
        s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.customerPhone.includes(searchQuery) ||
        s.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.model.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = sellStatusFilter === 'ALL' || s.status === sellStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data?.sellSubmissions, searchQuery, sellStatusFilter]);

  const filteredTestDrives = useMemo(() => {
    if (!data?.testDriveBookings) return [];
    return data.testDriveBookings.filter((b: any) => {
      const matchesSearch =
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customerPhone.includes(searchQuery) ||
        (b.carListing?.title && b.carListing.title.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = testDriveStatusFilter === 'ALL' || b.status === testDriveStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data?.testDriveBookings, searchQuery, testDriveStatusFilter]);

  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];
    return data.users.filter((u: any) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.phone && u.phone.includes(searchQuery));

      const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [data?.users, searchQuery, userRoleFilter]);

  // Unique Brands list
  const uniqueBrands = useMemo(() => {
    if (!data?.cars) return [];
    return Array.from(new Set(data.cars.map((c: any) => c.brand))) as string[];
  }, [data?.cars]);

  // Top Brands Statistics
  const topBrandsStats = useMemo(() => {
    if (!data?.cars) return [];
    const map: Record<string, number> = {};
    data.cars.forEach((car: any) => {
      const b = car.brand || 'Lainnya';
      map[b] = (map[b] || 0) + 1;
    });
    return Object.entries(map)
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count);
  }, [data?.cars]);

  // Top Models Statistics
  const topModelsStats = useMemo(() => {
    if (!data?.cars) return [];
    const map: Record<string, { brand: string; model: string; count: number; totalViews: number }> = {};
    data.cars.forEach((car: any) => {
      const key = `${car.brand} ${car.model}`;
      if (!map[key]) {
        map[key] = { brand: car.brand, model: car.model, count: 0, totalViews: 0 };
      }
      map[key].count += 1;
      map[key].totalViews += car.viewsCount || 0;
    });
    return Object.values(map)
      .sort((a, b) => b.count - a.count || b.totalViews - a.totalViews)
      .slice(0, 6);
  }, [data?.cars]);

  // Status mapping helper
  const translateStatus = (status: string, type: 'car' | 'sell' | 'testdrive' | 'user') => {
    if (type === 'car') {
      switch (status) {
        case 'AVAILABLE':
          return 'Tersedia';
        case 'RESERVED':
        case 'BOOKED':
          return 'Dipesan';
        case 'SOLD':
          return 'Terjual';
        default:
          return status;
      }
    }
    if (type === 'sell') {
      switch (status) {
        case 'PENDING':
          return 'Menunggu Respon';
        case 'CONTACTED':
          return 'Sudah Dihubungi';
        case 'INSPECTING':
          return 'Proses Inspeksi';
        case 'OFFERED':
          return 'Penawaran Dibuat';
        case 'ACCEPTED':
          return 'Disetujui / Dibeli';
        case 'REJECTED':
          return 'Ditolak';
        default:
          return status;
      }
    }
    if (type === 'testdrive') {
      switch (status) {
        case 'PENDING':
          return 'Menunggu Respon';
        case 'CONFIRMED':
        case 'CONFIRMED_DP':
          return 'Terkonfirmasi (DP)';
        case 'COMPLETED':
          return 'Selesai';
        case 'CANCELLED':
          return 'Dibatalkan';
        default:
          return status;
      }
    }
    return status;
  };

  // Helper function to set column widths automatically
  const applyAutofitColumns = (ws: XLSX.WorkSheet, dataRows: any[]) => {
    if (!dataRows || dataRows.length === 0) return;
    const keys = Object.keys(dataRows[0]);
    const colWidths = keys.map((key) => {
      let maxLen = key.length;
      dataRows.forEach((row) => {
        const valStr = row[key] ? String(row[key]) : '';
        if (valStr.length > maxLen) maxLen = valStr.length;
      });
      return { wch: Math.min(Math.max(maxLen + 4, 12), 45) };
    });
    ws['!cols'] = colWidths;
  };

  // Export Single Tab to Excel
  const exportTabToExcel = (tabType: 'cars' | 'sell' | 'testdrive' | 'users') => {
    if (!data) return;

    const wb = XLSX.utils.book_new();
    const dateStr = new Date().toISOString().split('T')[0];

    if (tabType === 'cars') {
      const rows = filteredCars.map((c: any, index: number) => ({
        'No': index + 1,
        'ID Mobil': c.id,
        'Plat Nomor': c.plateNumber || '-',
        'Nama & Model': c.title,
        'Merek': c.brand,
        'Model': c.model,
        'Tahun': c.year,
        'Harga Cash (Rp)': c.price,
        'Format Harga': formatRupiah(c.price),
        'Jarak Tempuh (KM)': c.mileage,
        'Transmisi': c.transmission,
        'Bahan Bakar': c.fuelType,
        'Tipe Bodi': c.bodyType || '-',
        'Warna': c.color || '-',
        'Lokasi Showroom': c.location || 'Pusat',
        'Status Stok': translateStatus(c.status, 'car'),
        'Tampil Katalog': c.isVisible !== false ? 'Aktif' : 'Disembunyikan',
        'Garansi (Bulan)': c.warrantyMonths || 12,
        'Jumlah Dilihat': c.viewsCount || 0,
        'Tanggal Input': formatDate(c.createdAt),
      }));

      // Add summary row at bottom
      const totalVal = filteredCars.reduce((acc: number, item: any) => acc + item.price, 0);
      rows.push({
        'No': 'TOTAL',
        'ID Mobil': `${filteredCars.length} Unit`,
        'Plat Nomor': '',
        'Nama & Model': '',
        'Merek': '',
        'Model': '',
        'Tahun': '',
        'Harga Cash (Rp)': totalVal,
        'Format Harga': formatRupiah(totalVal),
        'Jarak Tempuh (KM)': 0,
        'Transmisi': '',
        'Bahan Bakar': '',
        'Tipe Bodi': '',
        'Warna': '',
        'Lokasi Showroom': '',
        'Status Stok': '',
        'Tampil Katalog': '',
        'Garansi (Bulan)': 0,
        'Jumlah Dilihat': 0,
        'Tanggal Input': '',
      } as any);

      const ws = XLSX.utils.json_to_sheet(rows);
      applyAutofitColumns(ws, rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Stok Mobil');
      XLSX.writeFile(wb, `Laporan_Stok_Mobil_Rizkya_${dateStr}.xlsx`);
    } else if (tabType === 'sell') {
      const rows = filteredSellSubmissions.map((s: any, index: number) => ({
        'No': index + 1,
        'ID Pengajuan': s.id,
        'Tanggal Pengajuan': formatDate(s.createdAt),
        'Nama Pelanggan': s.customerName,
        'No WhatsApp/HP': s.customerPhone,
        'Email': s.customerEmail || '-',
        'Merek Mobil': s.brand,
        'Model Mobil': s.model,
        'Tahun': s.year,
        'Transmisi': s.transmission,
        'Bahan Bakar': s.fuelType,
        'Kilometer (KM)': s.mileage,
        'Ekspektasi Harga (Rp)': s.expectedPrice,
        'Format Ekspektasi': formatRupiah(s.expectedPrice),
        'Penawaran Showroom (Rp)': s.offerPrice || 0,
        'Format Penawaran': s.offerPrice ? formatRupiah(s.offerPrice) : '-',
        'Kota': s.city || '-',
        'Tanggal Inspeksi': s.inspectionDate || '-',
        'Jam Inspeksi': s.inspectionTime || '-',
        'Status Pengajuan': translateStatus(s.status, 'sell'),
        'Catatan': s.notes || '-',
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      applyAutofitColumns(ws, rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Pengajuan Jual Mobil');
      XLSX.writeFile(wb, `Laporan_Pengajuan_Jual_Rizkya_${dateStr}.xlsx`);
    } else if (tabType === 'testdrive') {
      const rows = filteredTestDrives.map((b: any, index: number) => ({
        'No': index + 1,
        'ID Booking': b.id,
        'Tanggal Dibuat': formatDate(b.createdAt),
        'Nama Pelanggan': b.customerName,
        'No WhatsApp/HP': b.customerPhone,
        'Email': b.customerEmail || '-',
        'Mobil Test Drive': b.carListing?.title || 'Unit Umum',
        'Plat Nomor': b.carListing?.plateNumber || '-',
        'Merek & Model': `${b.carListing?.brand || ''} ${b.carListing?.model || ''}`,
        'Tanggal Booking': b.bookingDate,
        'Jam Kunjungan': b.bookingTime,
        'Status Booking': translateStatus(b.status, 'testdrive'),
        'Catatan / DP': b.notes || '-',
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      applyAutofitColumns(ws, rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Booking Test Drive');
      XLSX.writeFile(wb, `Laporan_Test_Drive_Rizkya_${dateStr}.xlsx`);
    } else if (tabType === 'users') {
      const rows = filteredUsers.map((u: any, index: number) => ({
        'No': index + 1,
        'ID User': u.id,
        'Nama Lengkap': u.name,
        'Email': u.email,
        'No Telepon': u.phone || '-',
        'Role Akses': u.role === 'ADMIN' ? 'Super Admin' : u.role === 'ADMIN_SHOWROOM' ? 'Admin Showroom' : 'User / Pelanggan',
        'Tanggal Registrasi': formatDate(u.createdAt),
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      applyAutofitColumns(ws, rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Data Pengguna');
      XLSX.writeFile(wb, `Laporan_Pengguna_Rizkya_${dateStr}.xlsx`);
    }
  };

  // Export Master Workbook (All 4 sheets in 1 Excel file)
  const exportFullWorkbook = () => {
    if (!data) return;

    const wb = XLSX.utils.book_new();
    const dateStr = new Date().toISOString().split('T')[0];

    // Sheet 1: Stok Mobil
    const carRows = data.cars.map((c: any, index: number) => ({
      'No': index + 1,
      'ID Mobil': c.id,
      'Plat Nomor': c.plateNumber || '-',
      'Nama & Model': c.title,
      'Merek': c.brand,
      'Model': c.model,
      'Tahun': c.year,
      'Harga Cash (Rp)': c.price,
      'Format Harga': formatRupiah(c.price),
      'Jarak Tempuh (KM)': c.mileage,
      'Transmisi': c.transmission,
      'Bahan Bakar': c.fuelType,
      'Tipe Bodi': c.bodyType || '-',
      'Warna': c.color || '-',
      'Lokasi': c.location || 'Pusat',
      'Status': translateStatus(c.status, 'car'),
      'Visibilitas': c.isVisible !== false ? 'Aktif' : 'Disembunyikan',
      'Views': c.viewsCount || 0,
      'Tanggal Input': formatDate(c.createdAt),
    }));
    const wsCars = XLSX.utils.json_to_sheet(carRows);
    applyAutofitColumns(wsCars, carRows);
    XLSX.utils.book_append_sheet(wb, wsCars, 'Stok Mobil');

    // Sheet 2: Pengajuan Jual
    const sellRows = data.sellSubmissions.map((s: any, index: number) => ({
      'No': index + 1,
      'ID Pengajuan': s.id,
      'Tanggal': formatDate(s.createdAt),
      'Nama Pelanggan': s.customerName,
      'No HP': s.customerPhone,
      'Email': s.customerEmail || '-',
      'Merek': s.brand,
      'Model': s.model,
      'Tahun': s.year,
      'Transmisi': s.transmission,
      'Bahan Bakar': s.fuelType,
      'KM': s.mileage,
      'Harga Ekspektasi (Rp)': s.expectedPrice,
      'Format Ekspektasi': formatRupiah(s.expectedPrice),
      'Penawaran (Rp)': s.offerPrice || 0,
      'Kota': s.city || '-',
      'Tanggal Inspeksi': s.inspectionDate || '-',
      'Jam Inspeksi': s.inspectionTime || '-',
      'Status': translateStatus(s.status, 'sell'),
      'Catatan': s.notes || '-',
    }));
    const wsSell = XLSX.utils.json_to_sheet(sellRows);
    applyAutofitColumns(wsSell, sellRows);
    XLSX.utils.book_append_sheet(wb, wsSell, 'Pengajuan Jual');

    // Sheet 3: Booking Test Drive
    const bookingRows = data.testDriveBookings.map((b: any, index: number) => ({
      'No': index + 1,
      'ID Booking': b.id,
      'Tanggal Dibuat': formatDate(b.createdAt),
      'Nama Pelanggan': b.customerName,
      'No HP': b.customerPhone,
      'Email': b.customerEmail || '-',
      'Mobil': b.carListing?.title || 'Unit Umum',
      'Plat Nomor': b.carListing?.plateNumber || '-',
      'Tanggal Booking': b.bookingDate,
      'Jam Kunjungan': b.bookingTime,
      'Status': translateStatus(b.status, 'testdrive'),
      'Catatan': b.notes || '-',
    }));
    const wsBookings = XLSX.utils.json_to_sheet(bookingRows);
    applyAutofitColumns(wsBookings, bookingRows);
    XLSX.utils.book_append_sheet(wb, wsBookings, 'Test Drive');

    // Sheet 4: Data Pengguna
    const userRows = data.users.map((u: any, index: number) => ({
      'No': index + 1,
      'ID User': u.id,
      'Nama': u.name,
      'Email': u.email,
      'No HP': u.phone || '-',
      'Role': u.role === 'ADMIN' ? 'Super Admin' : u.role === 'ADMIN_SHOWROOM' ? 'Admin Showroom' : 'User / Pelanggan',
      'Tanggal Registrasi': formatDate(u.createdAt),
    }));
    const wsUsers = XLSX.utils.json_to_sheet(userRows);
    applyAutofitColumns(wsUsers, userRows);
    XLSX.utils.book_append_sheet(wb, wsUsers, 'Data Pengguna');

    // Save Workbook
    XLSX.writeFile(wb, `Laporan_Lengkap_Showroom_Rizkya_${dateStr}.xlsx`);
  };

  return (
    <div className="w-full p-4 sm:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Laporan Showroom & Ekspor Excel
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau seluruh rekap data inventori, pengajuan jual, test drive, dan user serta unduh file Excel (.xlsx) secara instan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <button
            onClick={fetchReportData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title="Muat ulang data laporan"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Muat Ulang Data</span>
          </button>

          <button
            onClick={exportFullWorkbook}
            disabled={loading || !data}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download Semua Laporan (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stok Mobil */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Inventori Mobil</p>
            <p className="text-2xl font-bold text-slate-900">
              {loading ? '...' : `${data?.summary?.cars?.total || 0} Unit`}
            </p>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <span>{data?.summary?.cars?.available || 0} Unit Tersedia</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">{data?.summary?.cars?.sold || 0} Terjual</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CarFront className="w-6 h-6" />
          </div>
        </div>

        {/* Nilai Stok Active */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nilai Stok Tersedia</p>
            <p className="text-lg sm:text-xl font-bold text-slate-900 truncate">
              {loading ? '...' : formatRupiah(data?.summary?.cars?.totalValuationAvailable || 0)}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Total Seluruh Stok: {loading ? '...' : formatRupiah(data?.summary?.cars?.totalValuationAll || 0)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Pengajuan Jual */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pengajuan Jual Mobil</p>
            <p className="text-2xl font-bold text-slate-900">
              {loading ? '...' : `${data?.summary?.submissions?.total || 0} Pengajuan`}
            </p>
            <p className="text-xs text-amber-600 font-semibold flex items-center gap-1">
              <span>{data?.summary?.submissions?.pending || 0} Menunggu</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-600">{data?.summary?.submissions?.accepted || 0} Disetujui</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Handshake className="w-6 h-6" />
          </div>
        </div>

        {/* Test Drive Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Booking Test Drive</p>
            <p className="text-2xl font-bold text-slate-900">
              {loading ? '...' : `${data?.summary?.testDrives?.total || 0} Kunjungan`}
            </p>
            <p className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
              <span>{data?.summary?.testDrives?.confirmed || 0} Terkonfirmasi</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-600">{data?.summary?.testDrives?.completed || 0} Selesai</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CalendarClock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation Header (Card Filter Style matching Admin Settings - Fit Content) */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/60 shadow-2xs w-fit max-w-full">
        <button
          type="button"
          onClick={() => setActiveTab('cars')}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'cars'
              ? 'bg-white text-slate-900 shadow-md font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold'
          }`}
        >
          <CarFront className="w-4 h-4 text-slate-700" />
          <span>Laporan Mobil Terjual ({filteredCars.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sell')}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'sell'
              ? 'bg-white text-slate-900 shadow-md font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold'
          }`}
        >
          <Handshake className="w-4 h-4 text-slate-700" />
          <span>Pengajuan Jual ({data?.sellSubmissions?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('testdrive')}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'testdrive'
              ? 'bg-white text-slate-900 shadow-md font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold'
          }`}
        >
          <CalendarClock className="w-4 h-4 text-slate-700" />
          <span>Booking Test Drive ({data?.testDriveBookings?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-white text-slate-900 shadow-md font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold'
          }`}
        >
          <Users className="w-4 h-4 text-slate-700" />
          <span>Data Pengguna ({data?.users?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('executive')}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'executive'
              ? 'bg-white text-slate-900 shadow-md font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-slate-700" />
          <span>Ringkasan Eksekutif</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-600" />
            <p className="text-sm font-medium">Memuat data laporan showroom...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: STOK MOBIL */}
            {activeTab === 'cars' && (
              <div className="p-6 space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari mobil, merek, model, atau plat nomor..."
                      className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <select
                        value={carStatusFilter}
                        onChange={(e) => setCarStatusFilter(e.target.value)}
                        className="text-xs sm:text-sm pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium appearance-none cursor-pointer"
                      >
                        <option value="SOLD">Terjual Saja</option>
                        <option value="ALL">Semua Status</option>
                        <option value="AVAILABLE">Tersedia (Ready)</option>
                        <option value="RESERVED">Dipesan</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="relative">
                      <select
                        value={carBrandFilter}
                        onChange={(e) => setCarBrandFilter(e.target.value)}
                        className="text-xs sm:text-sm pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium appearance-none cursor-pointer"
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

                    <button
                      onClick={() => exportTabToExcel('cars')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Excel (.xlsx)</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800 uppercase tracking-wider text-[11px] whitespace-nowrap">
                      <tr>
                        <th className="px-4 py-3.5">No</th>
                        <th className="px-4 py-3.5">Plat Nomor</th>
                        <th className="px-5 py-3.5">Nama & Model</th>
                        <th className="px-4 py-3.5">Merek</th>
                        <th className="px-4 py-3.5">Tahun</th>
                        <th className="px-4 py-3.5">Harga Cash (Rp)</th>
                        <th className="px-4 py-3.5">Transmisi / BB</th>
                        <th className="px-4 py-3.5">KM</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5">Tanggal Input</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCars.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                            Tidak ada data stok mobil yang cocok dengan filter.
                          </td>
                        </tr>
                      ) : (
                        filteredCars.map((car: any, idx: number) => (
                          <tr key={car.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold text-xs rounded-md">
                                {car.plateNumber || 'B 1234 RFS'}
                              </span>
                            </td>
                            <td className="px-5 py-3 font-bold text-slate-900">{car.title}</td>
                            <td className="px-4 py-3 font-semibold text-slate-700">{car.brand}</td>
                            <td className="px-4 py-3 font-semibold text-slate-800">{car.year}</td>
                            <td className="px-4 py-3 font-bold text-slate-900">{formatRupiah(car.price)}</td>
                            <td className="px-4 py-3 text-slate-600">
                              <div>{car.transmission}</div>
                              <div className="text-[11px] text-slate-400">{car.fuelType}</div>
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-700">{formatNumber(car.mileage)}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                                  car.status === 'AVAILABLE'
                                    ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                                    : car.status === 'RESERVED' || car.status === 'BOOKED'
                                    ? 'bg-amber-100 border-amber-200 text-amber-800'
                                    : 'bg-slate-100 border-slate-200 text-slate-700'
                                }`}
                              >
                                {translateStatus(car.status, 'car')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                              {formatDate(car.createdAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: PENGAJUAN JUAL */}
            {activeTab === 'sell' && (
              <div className="p-6 space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari nama pelanggan, WhatsApp, merek, atau model..."
                      className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <select
                        value={sellStatusFilter}
                        onChange={(e) => setSellStatusFilter(e.target.value)}
                        className="text-xs sm:text-sm pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium appearance-none cursor-pointer"
                      >
                        <option value="ALL">Semua Status</option>
                        <option value="PENDING">Menunggu Respon</option>
                        <option value="CONTACTED">Sudah Dihubungi</option>
                        <option value="INSPECTING">Proses Inspeksi</option>
                        <option value="OFFERED">Penawaran Dibuat</option>
                        <option value="ACCEPTED">Disetujui / Dibeli</option>
                        <option value="REJECTED">Ditolak</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <button
                      onClick={() => exportTabToExcel('sell')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Excel (.xlsx)</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800 uppercase tracking-wider text-[11px] whitespace-nowrap">
                      <tr>
                        <th className="px-4 py-3.5">No</th>
                        <th className="px-4 py-3.5">Tanggal</th>
                        <th className="px-5 py-3.5">Pelanggan</th>
                        <th className="px-4 py-3.5">WhatsApp</th>
                        <th className="px-5 py-3.5">Mobil Ditawarkan</th>
                        <th className="px-4 py-3.5">Ekspektasi Harga</th>
                        <th className="px-4 py-3.5">Jadwal Inspeksi</th>
                        <th className="px-4 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSellSubmissions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                            Tidak ada pengajuan jual mobil yang ditemukan.
                          </td>
                        </tr>
                      ) : (
                        filteredSellSubmissions.map((s: any, idx: number) => (
                          <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                              {formatDate(s.createdAt)}
                            </td>
                            <td className="px-5 py-3 font-bold text-slate-900">{s.customerName}</td>
                            <td className="px-4 py-3 font-mono font-medium text-slate-700">{s.customerPhone}</td>
                            <td className="px-5 py-3">
                              <p className="font-semibold text-slate-800">
                                {s.brand} {s.model} ({s.year})
                              </p>
                              <p className="text-xs text-slate-400">
                                {s.transmission} • {formatNumber(s.mileage)} km
                              </p>
                            </td>
                            <td className="px-4 py-3 font-bold text-emerald-700">
                              {formatRupiah(s.expectedPrice)}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">
                              {s.inspectionDate ? `${s.inspectionDate} (${s.inspectionTime || 'Slot Jam'})` : 'Belum diatur'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                                  s.status === 'PENDING'
                                    ? 'bg-amber-100 border-amber-200 text-amber-800'
                                    : s.status === 'ACCEPTED'
                                    ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                                    : s.status === 'REJECTED'
                                    ? 'bg-rose-100 border-rose-200 text-rose-800'
                                    : 'bg-blue-100 border-blue-200 text-blue-800'
                                }`}
                              >
                                {translateStatus(s.status, 'sell')}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: BOOKING TEST DRIVE */}
            {activeTab === 'testdrive' && (
              <div className="p-6 space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari nama pelanggan, WhatsApp, atau mobil..."
                      className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <select
                        value={testDriveStatusFilter}
                        onChange={(e) => setTestDriveStatusFilter(e.target.value)}
                        className="text-xs sm:text-sm pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium appearance-none cursor-pointer"
                      >
                        <option value="ALL">Semua Status</option>
                        <option value="PENDING">Menunggu Respon</option>
                        <option value="CONFIRMED">Terkonfirmasi</option>
                        <option value="COMPLETED">Selesai</option>
                        <option value="CANCELLED">Dibatalkan</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <button
                      onClick={() => exportTabToExcel('testdrive')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Excel (.xlsx)</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800 uppercase tracking-wider text-[11px] whitespace-nowrap">
                      <tr>
                        <th className="px-4 py-3.5">No</th>
                        <th className="px-4 py-3.5">Tgl Booking</th>
                        <th className="px-4 py-3.5">Jam Kunjungan</th>
                        <th className="px-5 py-3.5">Nama Pelanggan</th>
                        <th className="px-4 py-3.5">WhatsApp</th>
                        <th className="px-5 py-3.5">Mobil Di-test Drive</th>
                        <th className="px-4 py-3.5">Plat Nomor</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5">Catatan DP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTestDrives.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                            Tidak ada booking test drive yang ditemukan.
                          </td>
                        </tr>
                      ) : (
                        filteredTestDrives.map((b: any, idx: number) => (
                          <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                            <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                              {b.bookingDate}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                              {b.bookingTime}
                            </td>
                            <td className="px-5 py-3 font-bold text-slate-900">{b.customerName}</td>
                            <td className="px-4 py-3 font-mono font-medium text-slate-700">{b.customerPhone}</td>
                            <td className="px-5 py-3 font-semibold text-slate-800">
                              {b.carListing?.title || 'Unit Umum'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold text-xs rounded-md">
                                {b.carListing?.plateNumber || '-'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                                  b.status === 'PENDING'
                                    ? 'bg-amber-100 border-amber-200 text-amber-800'
                                    : b.status === 'CONFIRMED' || b.status === 'CONFIRMED_DP'
                                    ? 'bg-indigo-100 border-indigo-200 text-indigo-800'
                                    : b.status === 'COMPLETED'
                                    ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                                    : 'bg-rose-100 border-rose-200 text-rose-800'
                                }`}
                              >
                                {translateStatus(b.status, 'testdrive')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 truncate max-w-xs">
                              {b.notes || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: DATA PENGGUNA */}
            {activeTab === 'users' && (
              <div className="p-6 space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari nama, email, atau telepon..."
                      className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="text-xs sm:text-sm pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium appearance-none cursor-pointer"
                      >
                        <option value="ALL">Semua Role</option>
                        <option value="USER">User / Pelanggan</option>
                        <option value="ADMIN">Super Admin</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <button
                      onClick={() => exportTabToExcel('users')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Excel (.xlsx)</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800 uppercase tracking-wider text-[11px] whitespace-nowrap">
                      <tr>
                        <th className="px-4 py-3.5">No</th>
                        <th className="px-5 py-3.5">Nama Lengkap</th>
                        <th className="px-5 py-3.5">Email</th>
                        <th className="px-4 py-3.5">No Telepon</th>
                        <th className="px-4 py-3.5">Role Akses</th>
                        <th className="px-4 py-3.5">Tanggal Registrasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                            Tidak ada data pengguna yang ditemukan.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u: any, idx: number) => (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                            <td className="px-5 py-3 font-bold text-slate-900">{u.name}</td>
                            <td className="px-5 py-3 text-slate-700 font-medium">{u.email}</td>
                            <td className="px-4 py-3 font-mono text-slate-700">{u.phone || '-'}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                                  u.role === 'ADMIN' || u.role === 'ADMIN_SHOWROOM'
                                    ? 'bg-purple-100 border-purple-200 text-purple-800'
                                    : 'bg-slate-100 border-slate-200 text-slate-700'
                                }`}
                              >
                                {u.role === 'ADMIN' ? 'Super Admin' : u.role === 'ADMIN_SHOWROOM' ? 'Admin Showroom' : 'User / Pelanggan'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                              {formatDate(u.createdAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: RINGKASAN EKSEKUTIF */}
            {activeTab === 'executive' && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span>Ringkasan Eksekutif & Distibusi Performa Showroom</span>
                  </h3>
                  <button
                    onClick={exportFullWorkbook}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Master Excel (.xlsx)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status Mobil Breakdown */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Distribusi Status Unit Mobil
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-emerald-500" />
                          <span>Mobil Tersedia (Ready Stock)</span>
                        </span>
                        <span className="font-bold text-slate-800">
                          {data?.summary?.cars?.available || 0} Unit
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{
                            width: `${
                              ((data?.summary?.cars?.available || 0) / (data?.summary?.cars?.total || 1)) * 100
                            }%`,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-medium pt-2">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-amber-500" />
                          <span>Mobil Dipesan</span>
                        </span>
                        <span className="font-bold text-slate-800">
                          {data?.summary?.cars?.reserved || 0} Unit
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all"
                          style={{
                            width: `${
                              ((data?.summary?.cars?.reserved || 0) / (data?.summary?.cars?.total || 1)) * 100
                            }%`,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-medium pt-2">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-slate-700" />
                          <span>Mobil Terjual (Sold Out)</span>
                        </span>
                        <span className="font-bold text-slate-800">
                          {data?.summary?.cars?.sold || 0} Unit
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-slate-700 h-full rounded-full transition-all"
                          style={{
                            width: `${
                              ((data?.summary?.cars?.sold || 0) / (data?.summary?.cars?.total || 1)) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status Pengajuan Jual Breakdown */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Status Pengajuan Jual Pelanggan
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-amber-600 font-semibold">Menunggu Respon (Pending)</span>
                        <span className="font-bold text-slate-800">{data?.summary?.submissions?.pending || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-medium border-t border-slate-200/60 pt-2">
                        <span className="text-blue-600 font-semibold">Proses Kontak & Inspeksi</span>
                        <span className="font-bold text-slate-800">
                          {(data?.summary?.submissions?.contacted || 0) +
                            (data?.summary?.submissions?.inspecting || 0) +
                            (data?.summary?.submissions?.offered || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-medium border-t border-slate-200/60 pt-2">
                        <span className="text-emerald-600 font-semibold">Disetujui / Beli (Accepted)</span>
                        <span className="font-bold text-slate-800">{data?.summary?.submissions?.accepted || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-medium border-t border-slate-200/60 pt-2">
                        <span className="text-rose-600 font-semibold">Ditolak (Rejected)</span>
                        <span className="font-bold text-slate-800">{data?.summary?.submissions?.rejected || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Merek & Model Mobil Populer Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Merek Mobil Populer */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-600" />
                        Merek Mobil Populer (Stok Terbanyak)
                      </h4>
                      <span className="text-xs text-slate-500 font-bold">
                        {topBrandsStats.length} Merek Total
                      </span>
                    </div>
                    <div className="space-y-3">
                      {topBrandsStats.slice(0, 5).map((item, bIdx) => {
                        const totalCars = data?.summary?.cars?.total || 1;
                        const pct = Math.round((item.count / totalCars) * 100);
                        return (
                          <div key={bIdx} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-slate-900 font-bold">{item.brand}</span>
                              <span className="text-slate-700">{item.count} Unit ({pct}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-slate-900 h-full rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Model Mobil Populer */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        Model Mobil Populer di Showroom
                      </h4>
                      <span className="text-xs text-slate-500 font-bold">
                        Top 5 Model
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {topModelsStats.map((mItem, mIdx) => (
                        <div
                          key={mIdx}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
                              #{mIdx + 1}
                            </span>
                            <div className="truncate">
                              <p className="font-bold text-slate-900 truncate">
                                {mItem.brand} {mItem.model}
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium">
                                Merek: {mItem.brand}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-extrabold text-slate-900 block">{mItem.count} Unit</span>
                            <span className="text-[10px] text-slate-500 font-medium">{mItem.totalViews} Dilihat</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* System & Export Banner Info */}
                <div className="p-5 bg-blue-50/80 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-bold text-blue-900">
                        Keamanan & Standar Format Spreadsheet Excel (.xlsx)
                      </h5>
                      <p className="text-xs text-blue-700 mt-0.5">
                        File Excel yang diunduh secara otomatis telah diformat sesuai standar akuntansi rupiah, lebar kolom otomatis, dan kompatibel dengan Microsoft Excel 2016+, Google Sheets, LibreOffice, & Apple Numbers.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={exportFullWorkbook}
                    className="shrink-0 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
                  >
                    Unduh Sekarang
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
