'use client';

import Link from 'next/link';
import { useComparison } from '@/context/ComparisonContext';
import { Scale, X, SlidersHorizontal, Frown, CheckCircle2 } from 'lucide-react';
import { formatRupiah, formatNumber } from '@/lib/utils';

export default function ComparePage() {
  const { comparisonList, removeFromComparison, clearComparison } = useComparison();

  if (comparisonList.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[70vh] flex flex-col justify-center">
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 w-full">
          <Frown className="w-10 h-10 text-slate-400 stroke-[1.5]" />
          <div className="space-y-1.5 max-w-md">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Belum Ada Mobil Dibandingkan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Pilih unit dari katalog untuk membandingkan harga dan spesifikasi secara side-by-side.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/cars"
              className="inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-[14px] px-6 py-2.5 rounded-[10px] border border-slate-300 transition-all shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Lihat Katalog Mobil</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Spec Rows Definition - Styled matching car detail page tables
  const specRows = [
    {
      label: 'Merek & Model',
      render: (car: (typeof comparisonList)[0]) => (
        <span className="font-bold text-slate-900">{car.brand} {car.model}</span>
      ),
    },
    {
      label: 'Tahun Pembuatan',
      render: (car: (typeof comparisonList)[0]) => (
        <span className="font-semibold text-slate-900">{car.year}</span>
      ),
    },
    {
      label: 'Jarak Tempuh (Odometer)',
      render: (car: (typeof comparisonList)[0]) => (
        <span className="font-semibold text-slate-900">{formatNumber(car.mileage)} km</span>
      ),
    },
    {
      label: 'Transmisi',
      render: (car: (typeof comparisonList)[0]) => (
        <span className="font-semibold text-slate-900">{car.transmission}</span>
      ),
    },
    {
      label: 'Bahan Bakar',
      render: (car: (typeof comparisonList)[0]) => (
        <span className="font-semibold text-slate-900">{car.fuelType}</span>
      ),
    },
    {
      label: 'Tipe Bodi',
      render: (car: (typeof comparisonList)[0]) => (
        <span className="font-semibold text-slate-900">{car.bodyType || '-'}</span>
      ),
    },
    {
      label: 'Warna Eksterior',
      render: (car: (typeof comparisonList)[0]) => (
        <span className="font-semibold text-slate-900">{car.color}</span>
      ),
    },
    {
      label: 'Plat Nomor',
      render: (car: (typeof comparisonList)[0]) => (
        <span className="font-bold text-slate-900">{car.plateNumber || 'B 888 EV'}</span>
      ),
    },
  ];

  return (
    <div className="bg-slate-50/50 py-10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Komparasi Spesifikasi Mobil
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Membandingkan <strong className="text-slate-900">{comparisonList.length}</strong> dari maksimal 3 mobil pilihan Anda side-by-side.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearComparison}
              className="text-xs font-bold text-slate-900 bg-white px-4 py-2.5 rounded-none border border-slate-200 cursor-pointer hover:-translate-y-1 transition-transform"
            >
              Hapus Semua
            </button>
            <Link
              href="/cars"
              className="text-xs font-bold text-white bg-slate-900 px-4 py-2.5 rounded-none cursor-pointer hover:-translate-y-1 transition-transform inline-block"
            >
              + Tambah Mobil Lain
            </Link>
          </div>
        </div>

        {/* Comparison Table Container - Matching Car Detail Table Style */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden text-xs border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-900 border-b border-slate-200">
                  <th className="p-3.5 bg-slate-100 font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 border-r border-slate-200 w-48 min-w-[180px] sticky left-0 z-20">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-slate-700" />
                      <span>Fitur & Spesifikasi</span>
                    </div>
                  </th>
                  {comparisonList.map((car) => {
                    let displayTitle = car.title;
                    displayTitle = displayTitle.replace(/\s*[-–—]?\s*Garansi\s*[\w\d\s]*$/i, '');
                    if (car.year) {
                      displayTitle = displayTitle.replace(new RegExp(`\\b${car.year}\\b`, 'g'), '');
                    }
                    displayTitle = displayTitle.replace(/\b(19|20)\d{2}\b/g, '');
                    if (car.color) {
                      displayTitle = displayTitle.replace(new RegExp(`\\b${car.color}\\b`, 'gi'), '');
                    }
                    const colorsToRemove = [
                      'Gray', 'Grey', 'Abu-abu', 'White', 'Putih', 'Black', 'Hitam',
                      'Silver', 'Perak', 'Red', 'Rallye Red', 'Merah', 'Blue', 'Biru',
                      'Gold', 'Gravity Gold', 'Emas', 'Green', 'Hijau', 'Yellow', 'Kuning',
                      'Matte', 'Metallic'
                    ];
                    colorsToRemove.forEach((c) => {
                      displayTitle = displayTitle.replace(new RegExp(`\\b${c}\\b`, 'gi'), '');
                    });
                    displayTitle = displayTitle.replace(/\s*[-–—]\s*/g, ' ').replace(/\s+/g, ' ').trim();
                    if (!displayTitle) displayTitle = `${car.brand} ${car.model}`;

                    return (
                      <th
                        key={car.id}
                        className="p-4 bg-white border-r border-slate-100 last:border-r-0 min-w-[280px] relative group align-top"
                      >
                        {/* Floating Remove Button */}
                        <button
                          onClick={() => removeFromComparison(car.id)}
                          className="absolute top-3.5 right-3.5 z-10 w-7 h-7 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center transition-all shadow-md backdrop-blur-xs cursor-pointer"
                          title="Hapus dari komparasi"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <Link
                          href={`/cars/${car.id}`}
                          className="block space-y-3 cursor-pointer group"
                        >
                          {/* Image Container */}
                          <div className="relative aspect-[16/10] h-44 w-full overflow-hidden rounded-xl bg-slate-100 shadow-xs">
                            <img
                              src={
                                car.images && car.images.length > 0
                                  ? car.images[0].url
                                  : 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80'
                              }
                              alt={car.title}
                              className="w-full h-44 object-cover"
                            />
                          </div>

                          {/* Info Title & Price */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              {car.brand}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug hover:text-slate-700 transition-colors">
                              {displayTitle}
                            </h4>
                            <p className="text-lg font-black text-slate-900 tracking-tight pt-1">
                              {formatRupiah(car.price)}
                            </p>
                          </div>
                        </Link>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {specRows.map((row, idx) => (
                  <tr
                    key={row.label}
                    className={idx % 2 === 1 ? 'bg-slate-50/40 hover:bg-slate-50/80 transition-colors' : 'hover:bg-slate-50/80 transition-colors'}
                  >
                    <td className="p-3.5 font-semibold text-slate-600 border-r border-slate-100 bg-slate-50/60 sticky left-0 z-10">
                      {row.label}
                    </td>
                    {comparisonList.map((car) => (
                      <td
                        key={car.id}
                        className="p-3.5 text-xs font-semibold text-slate-900 border-r border-slate-100 last:border-r-0 align-middle"
                      >
                        {row.render(car)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
