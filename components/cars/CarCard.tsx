'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Heart,
  Gauge,
  Scale,
  Car,
  Calendar,
  Settings2,
  Fuel,
} from 'lucide-react';
import { CarListing } from '@/types';
import { formatRupiah, formatNumber } from '@/lib/utils';
import { useComparison } from '@/context/ComparisonContext';
import { useSession } from '@/components/providers/AuthProvider';

interface CarCardProps {
  car: CarListing;
  isFavoritedInitial?: boolean;
  onFavoriteToggle?: (carId: string, newState: boolean) => void;
}

const getColorInfo = (colorStr?: string) => {
  if (!colorStr) return { label: 'Lainnya', bgClass: 'bg-slate-700 text-white', dotBg: '#64748b' };
  const lower = colorStr.toLowerCase();

  if (lower.includes('gray') || lower.includes('grey') || lower.includes('abu')) {
    return { label: 'Abu-abu', bgClass: 'bg-slate-600 text-white', dotBg: '#64748b' };
  }
  if (lower.includes('white') || lower.includes('putih')) {
    return { label: 'Putih', bgClass: 'bg-white text-slate-900 border border-slate-300', dotBg: '#ffffff' };
  }
  if (lower.includes('black') || lower.includes('hitam')) {
    return { label: 'Hitam', bgClass: 'bg-slate-900 text-white', dotBg: '#0f172a' };
  }
  if (lower.includes('silver') || lower.includes('perak')) {
    return { label: 'Silver', bgClass: 'bg-slate-400 text-white', dotBg: '#cbd5e1' };
  }
  if (lower.includes('red') || lower.includes('merah')) {
    return { label: 'Merah', bgClass: 'bg-rose-600 text-white', dotBg: '#f43f5e' };
  }
  if (lower.includes('blue') || lower.includes('biru')) {
    return { label: 'Biru', bgClass: 'bg-blue-600 text-white', dotBg: '#3b82f6' };
  }
  if (lower.includes('gold') || lower.includes('emas')) {
    return { label: 'Emas', bgClass: 'bg-amber-500 text-white', dotBg: '#fbbf24' };
  }
  if (lower.includes('green') || lower.includes('hijau')) {
    return { label: 'Hijau', bgClass: 'bg-emerald-600 text-white', dotBg: '#10b981' };
  }
  if (lower.includes('orange') || lower.includes('oranye')) {
    return { label: 'Oranye', bgClass: 'bg-orange-500 text-white', dotBg: '#f97316' };
  }
  if (lower.includes('yellow') || lower.includes('kuning')) {
    return { label: 'Kuning', bgClass: 'bg-yellow-400 text-slate-900', dotBg: '#eab308' };
  }

  return { label: colorStr, bgClass: 'bg-slate-700 text-white', dotBg: '#64748b' };
};

import { useFavorites } from '@/context/FavoritesContext';

export default function CarCard({
  car,
  isFavoritedInitial = false,
  onFavoriteToggle,
}: CarCardProps) {
  const { data: session } = useSession();
  const { addToComparison, removeFromComparison, isInComparison } = useComparison();
  const { toggleFavorite, isFavorited: checkIsFavorited } = useFavorites();
  
  const isFavorited = checkIsFavorited(car.id);

  const DEFAULT_FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop';

  const primaryImage =
    car.images && car.images.length > 0 && car.images[0]?.url
      ? car.images[0].url
      : DEFAULT_FALLBACK_IMAGE;

  const [imgSrc, setImgSrc] = useState(primaryImage);

  const inCompare = isInComparison(car.id);

  // Clean up title by stripping brand, year, color, and garansi phrases to avoid redundancy
  const cleanTitle = () => {
    let t = car.title;

    // 1. Remove brand name from start
    if (car.brand) {
      t = t.replace(new RegExp(`^${car.brand}\\s*`, 'i'), '');
    }

    // 2. Remove "Garansi..." suffix
    t = t.replace(/\s*[-–—]?\s*Garansi\s*[\w\d\s]*$/i, '');

    // 3. Remove 4-digit year (e.g. 2020, 2022)
    if (car.year) {
      t = t.replace(new RegExp(`\\b${car.year}\\b`, 'g'), '');
    }
    t = t.replace(/\b(19|20)\d{2}\b/g, '');

    // 4. Remove color names
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

    // 5. Trim trailing/multiple spaces and dashes
    t = t
      .replace(/\s*[-–—]\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return t || car.model || car.title;
  };

  const displayTitle = cleanTitle();

  const colorInfo = getColorInfo(car.color);

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
    <Link
      href={`/cars/${car.id}`}
      className="group bg-white rounded-md overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full block cursor-pointer border-0"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden block">
        <img
          src={imgSrc}
          alt={car.title}
          onError={() => setImgSrc(DEFAULT_FALLBACK_IMAGE)}
          className="w-full h-full object-cover"
        />
        {(car.status === 'DP_PAID' || car.status === 'RESERVED' || car.status === 'BOOKED') ? (
          <div className="absolute top-2.5 left-2.5 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider z-10">
            Dipesan
          </div>
        ) : null}
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        {/* Top Info */}
        <div className="space-y-1.5">
          {/* Brand Name above Title */}
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
            {car.brand}
          </span>

          {/* Title with Year */}
          <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-2 leading-snug">
            {displayTitle} <span className="text-slate-300 font-normal mx-0.5">|</span> <span className="font-semibold text-slate-600">{car.year}</span>
          </h3>

          {/* Price */}
          <div className="text-lg font-black text-slate-900 tracking-tight leading-none pt-1">
            {formatRupiah(car.price)}
          </div>
        </div>

        {/* Bottom Row: Favorite + Compare Icons (Left) & Color Text (Right) */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
          {/* Favorite & Compare Plain Icons (Left) */}
          <div className="flex items-center gap-2">
            {/* Favorite Icon */}
            <button
              suppressHydrationWarning
              onClick={handleFavoriteClick}
              className="p-1 text-slate-900 hover:text-black transition-colors select-none cursor-pointer"
              title={isFavorited ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
              aria-label={isFavorited ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
            >
              <Heart className={`w-4.5 h-4.5 shrink-0 ${isFavorited ? 'fill-current text-rose-500 text-rose-500' : 'text-slate-900'}`} />
            </button>

            {/* Compare Icon */}
            <button
              suppressHydrationWarning
              onClick={handleCompareClick}
              className="p-1 text-slate-900 hover:text-black transition-colors select-none cursor-pointer"
              title={inCompare ? 'Hapus dari Komparasi' : 'Tambah ke Komparasi'}
              aria-label={inCompare ? 'Hapus dari Komparasi' : 'Tambah ke Komparasi'}
            >
              <Scale className={`w-4.5 h-4.5 shrink-0 ${inCompare ? 'text-blue-600' : 'text-slate-900'}`} />
            </button>
          </div>

          {/* Color Text (Right) - Clean text without badge or dot */}
          <span className="text-[12px] font-semibold text-slate-600 truncate max-w-[120px]">
            {car.color || 'Putih Metalik'}
          </span>
        </div>
      </div>
    </Link>
  );
}
