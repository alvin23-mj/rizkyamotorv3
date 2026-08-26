'use client';

import Link from 'next/link';
import { Frown } from 'lucide-react';
import CarCard from '@/components/cars/CarCard';
import { useFavorites } from '@/context/FavoritesContext';

export default function FavoritesPage() {
  const { favoriteList, clearFavorites } = useFavorites();

  if (favoriteList.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[70vh] flex flex-col justify-center">
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 w-full">
          <Frown className="w-10 h-10 text-slate-400 stroke-[1.5]" />
          <div className="space-y-1.5 max-w-md">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Belum Ada Mobil Favorit
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Klik ikon hati pada mobil pilihan Anda di katalog untuk menyimpannya ke daftar favorit.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/cars"
              className="inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-[14px] px-6 py-2.5 rounded-[10px] border border-slate-300 transition-all shadow-2xs cursor-pointer"
            >
              <span>Lihat Katalog Mobil</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 py-10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Mobil Favorit Saya
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearFavorites}
              className="text-xs font-bold text-rose-600 hover:bg-rose-50 bg-white px-4 py-2.5 rounded-xl border border-slate-200 cursor-pointer"
            >
              Hapus Semua
            </button>
            <Link
              href="/cars"
              className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2.5 rounded-xl cursor-pointer"
            >
              + Tambah Mobil Lain
            </Link>
          </div>
        </div>

        {/* Favorite Cars Display - Horizontal Scroll on Mobile, Grid on Desktop */}
        <>
          {/* Mobile View: Horizontal Scroll */}
          <div className="flex md:hidden overflow-x-auto gap-4 pb-4 scrollbar-none snap-x snap-mandatory pt-1">
            {favoriteList.map((car) => (
              <div key={car.id} className="w-[270px] shrink-0 snap-start">
                <CarCard car={car} />
              </div>
            ))}
          </div>

          {/* Desktop View: Grid Layout (4 Columns) */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {favoriteList.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </>
      </div>
    </div>
  );
}
