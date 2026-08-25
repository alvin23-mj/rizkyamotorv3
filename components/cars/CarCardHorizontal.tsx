'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Scale } from 'lucide-react';
import { CarListing } from '@/types';
import { formatRupiah, formatNumber } from '@/lib/utils';
import { useComparison } from '@/context/ComparisonContext';
import { useSession } from '@/components/providers/AuthProvider';

interface CarCardHorizontalProps {
  car: CarListing;
  isFavoritedInitial?: boolean;
  onFavoriteToggle?: (carId: string, newState: boolean) => void;
}

const getColorInfo = (colorStr?: string) => {
  if (!colorStr) return { label: 'Lainnya', dotBg: '#64748b' };
  const lower = colorStr.toLowerCase();

  if (lower.includes('gray') || lower.includes('grey') || lower.includes('abu')) {
    return { label: 'Abu-abu', dotBg: '#64748b' };
  }
  if (lower.includes('white') || lower.includes('putih')) {
    return { label: 'Putih', dotBg: '#ffffff' };
  }
  if (lower.includes('black') || lower.includes('hitam')) {
    return { label: 'Hitam', dotBg: '#0f172a' };
  }
  if (lower.includes('silver') || lower.includes('perak')) {
    return { label: 'Silver', dotBg: '#cbd5e1' };
  }
  if (lower.includes('red') || lower.includes('merah')) {
    return { label: 'Merah', dotBg: '#f43f5e' };
  }
  if (lower.includes('blue') || lower.includes('biru')) {
    return { label: 'Biru', dotBg: '#3b82f6' };
  }
  if (lower.includes('gold') || lower.includes('emas')) {
    return { label: 'Emas', dotBg: '#fbbf24' };
  }
  if (lower.includes('green') || lower.includes('hijau')) {
    return { label: 'Hijau', dotBg: '#10b981' };
  }

  return { label: colorStr, dotBg: '#64748b' };
};

import { useFavorites } from '@/context/FavoritesContext';

export default function CarCardHorizontal({
  car,
  isFavoritedInitial = true,
  onFavoriteToggle,
}: CarCardHorizontalProps) {
  const { data: session } = useSession();
  const { addToComparison, removeFromComparison, isInComparison } = useComparison();
  const { toggleFavorite, isFavorited: checkIsFavorited } = useFavorites();
  
  const isFavorited = checkIsFavorited(car.id);

  const primaryImage =
    car.images && car.images.length > 0
      ? car.images[0].url
      : 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80';

  const inCompare = isInComparison(car.id);
  const colorInfo = getColorInfo(car.color);

  // Clean title
  const cleanTitle = () => {
    let t = car.title || `${car.brand} ${car.model}`;
    if (car.brand) {
      t = t.replace(new RegExp(`^${car.brand}\\s*`, 'i'), '');
    }
    t = t.replace(/\s*[-–—]?\s*Garansi\s*[\w\d\s]*$/i, '');
    if (car.year) {
      t = t.replace(new RegExp(`\\b${car.year}\\b`, 'g'), '');
    }
    t = t.replace(/\b(19|20)\d{2}\b/g, '');
    if (car.color) {
      t = t.replace(new RegExp(`\\b${car.color}\\b`, 'gi'), '');
    }
    const colorsToRemove = [
      'Gray', 'Grey', 'Abu-abu', 'White', 'Putih', 'Black', 'Hitam',
      'Silver', 'Perak', 'Red', 'Rallye Red', 'Merah', 'Blue', 'Biru',
      'Gold', 'Gravity Gold', 'Emas', 'Green', 'Hijau', 'Yellow', 'Kuning'
    ];
    colorsToRemove.forEach((c) => {
      t = t.replace(new RegExp(`\\b${c}\\b`, 'gi'), '');
    });
    t = t.replace(/\s*[-–—]\s*/g, ' ').replace(/\s+/g, ' ').trim();
    return t || car.model || car.title;
  };

  const displayTitle = cleanTitle();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(car);
    if (onFavoriteToggle) onFavoriteToggle(car.id, !isFavorited);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeFromComparison(car.id);
    } else {
      addToComparison(car);
    }
  };

  return (
    <div className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-stretch w-full">
      {/* Left: Image Banner */}
      <Link
        href={`/cars/${car.id}`}
        className="relative w-full md:w-80 lg:w-96 shrink-0 aspect-[16/10] md:aspect-auto bg-slate-100 overflow-hidden block"
      >
        <img
          src={primaryImage}
          alt={car.title}
          className="w-full h-full object-cover"
        />

        {/* Color Badge Overlay on Image */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-900/80 text-white backdrop-blur-xs shadow-2xs">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: colorInfo.dotBg }}
            />
            {colorInfo.label}
          </span>
        </div>
      </Link>

      {/* Right: Content Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Brand & Year Header */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {car.brand}
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-md">
              Tahun {car.year}
            </span>
          </div>

          {/* Title */}
          <Link href={`/cars/${car.id}`}>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {displayTitle}
            </h3>
          </Link>

          {/* Quick Specifications Row without icons */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium mt-2 pt-2 border-t border-slate-100">
            <span>{formatNumber(car.mileage)} km</span>
            <span className="text-slate-300">•</span>
            <span>{car.transmission}</span>
            <span className="text-slate-300">•</span>
            <span>{car.fuelType}</span>
            {car.bodyType && (
              <>
                <span className="text-slate-300">•</span>
                <span>{car.bodyType}</span>
              </>
            )}
          </div>
        </div>

        {/* Bottom Row: Price & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none mb-1">
              Harga Cash
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {formatRupiah(car.price)}
            </span>
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            {/* Compare Button */}
            <button
              onClick={handleCompareClick}
              className={`h-[38px] w-[38px] flex items-center justify-center rounded-[10px] border text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                inCompare
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
              }`}
              title={inCompare ? 'Hapus dari Komparasi' : 'Tambah ke Komparasi'}
            >
              <Scale className="w-4 h-4" />
            </button>

            {/* Remove from Favorite Button */}
            <button
              onClick={handleFavoriteClick}
              className="h-[38px] px-4 inline-flex items-center justify-center rounded-[10px] bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Hapus dari Favorit"
            >
              Hapus
            </button>

            {/* View Detail Link */}
            <Link
              href={`/cars/${car.id}`}
              className="h-[38px] px-4 inline-flex items-center justify-center rounded-[10px] bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Detail Unit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
