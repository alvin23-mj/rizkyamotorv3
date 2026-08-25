'use client';

import { useState, useEffect } from 'react';
import { Search, RotateCcw, SlidersHorizontal, X, Filter, ChevronDown, Check } from 'lucide-react';
import { CarListing, CarFilterState } from '@/types';

interface CarFilterBarProps {
  filters: CarFilterState;
  onFilterChange: (newFilters: CarFilterState) => void;
  onReset: () => void;
  totalResults?: number;
  availableCars?: CarListing[];
}

export default function CarFilterBar({
  filters,
  onFilterChange,
  onReset,
  totalResults = 0,
  availableCars,
}: CarFilterBarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [catalogCars, setCatalogCars] = useState<CarListing[]>(availableCars || []);

  useEffect(() => {
    if (availableCars && availableCars.length > 0) {
      setCatalogCars(availableCars);
    } else {
      fetch('/api/cars')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setCatalogCars(data);
          }
        })
        .catch(console.error);
    }
  }, [availableCars]);

  // Dynamic Options derived from Catalog Cars
  const bodyTypes = (() => {
    if (!catalogCars || catalogCars.length === 0) {
      return ['Semua', 'SUV', 'Sedan', 'MPV', 'Hatchback', 'Crossover'];
    }
    const set = new Set(catalogCars.map((c) => c.bodyType).filter((b): b is string => Boolean(b)));
    return ['Semua', ...Array.from(set)];
  })();

  const brandsList = (() => {
    if (!catalogCars || catalogCars.length === 0) {
      return ['Semua Merek', 'Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Mitsubishi', 'Hyundai', 'Suzuki', 'Mazda'];
    }
    const set = new Set(catalogCars.map((c) => c.brand).filter((b): b is string => Boolean(b)));
    return ['Semua Merek', ...Array.from(set)];
  })();

  const transmissions = (() => {
    if (!catalogCars || catalogCars.length === 0) {
      return [
        { label: 'Semua', value: '' },
        { label: 'Automatic', value: 'Automatic' },
        { label: 'Manual', value: 'Manual' },
      ];
    }
    const set = new Set(catalogCars.map((c) => c.transmission).filter((t): t is string => Boolean(t)));
    return [
      { label: 'Semua', value: '' },
      ...Array.from(set).map((t) => ({ label: t, value: t })),
    ];
  })();

  const fuelTypes = (() => {
    if (!catalogCars || catalogCars.length === 0) {
      return [
        { label: 'Semua', value: '' },
        { label: 'Bensin', value: 'Bensin' },
        { label: 'Diesel', value: 'Diesel' },
        { label: 'Hybrid', value: 'Hybrid' },
        { label: 'Electric', value: 'Electric' },
      ];
    }
    const set = new Set(
      catalogCars.map((c) => (c.fuelType === 'Pertalite/Bensin' ? 'Bensin' : c.fuelType)).filter((f): f is string => Boolean(f))
    );
    return [
      { label: 'Semua', value: '' },
      ...Array.from(set).map((f) => ({ label: f, value: f })),
    ];
  })();

  const handleChange = (field: keyof CarFilterState, value: string) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  // Count active filters
  const activeCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy') return value !== 'newest' && value !== '';
    return value !== '';
  }).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search Input */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Cari Unit
        </label>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Alphard, BMW, Pajero..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white transition-all shadow-2xs"
          />
          {filters.search && (
            <button
              onClick={() => handleChange('search', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Body Type Pills */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Tipe Bodi
        </label>
        <div className="flex flex-wrap gap-1.5">
          {bodyTypes.map((body) => {
            const val = body === 'Semua' ? '' : body;
            const isSelected = filters.bodyType === val;
            return (
              <button
                key={body}
                onClick={() => handleChange('bodyType', val)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                }`}
              >
                {body}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand Select */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Merek Mobil
        </label>
        <div className="relative">
          <select
            value={filters.brand}
            onChange={(e) =>
              handleChange('brand', e.target.value === 'Semua Merek' ? '' : e.target.value)
            }
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-800 appearance-none shadow-2xs cursor-pointer"
          >
            {brandsList.map((b) => (
              <option key={b} value={b === 'Semua Merek' ? '' : b}>
                {b}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Transmission Options */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Transmisi
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {transmissions.map((item) => {
            const isSelected = filters.transmission === item.value;
            return (
              <button
                key={item.label}
                onClick={() => handleChange('transmission', item.value)}
                className={`py-2 px-2 text-center rounded-md text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fuel Type Options */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Bahan Bakar
        </label>
        <div className="flex flex-wrap gap-1.5">
          {fuelTypes.map((item) => {
            const isSelected = filters.fuelType === item.value;
            return (
              <button
                key={item.label}
                onClick={() => handleChange('fuelType', item.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Urutkan Berdasarkan
        </label>
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-800 appearance-none shadow-2xs cursor-pointer"
          >
            <option value="newest">Terbaru Ditambahkan</option>
            <option value="price_asc">Harga: Termurah</option>
            <option value="price_desc">Harga: Termahal</option>
            <option value="year_desc">Tahun: Terbaru</option>
            <option value="mileage_asc">Kilometer: Terendah</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden mb-5 w-full">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="w-full flex items-center justify-between bg-slate-100 hover:bg-slate-200/80 text-slate-900 px-4 py-3.5 rounded-xl text-xs font-bold shadow-xs active:scale-[0.99] transition-all cursor-pointer border border-slate-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <SlidersHorizontal className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900">Filter & Urutkan Mobil</span>
                {activeCount > 0 && (
                  <span className="bg-rose-500 text-white rounded-full px-2 py-0.5 text-[10px] font-extrabold shadow-xs">
                    {activeCount} Aktif
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                Klik untuk menyaring merek, bodi & harga
              </p>
            </div>
          </div>

          <div className="flex items-center pl-2 shrink-0">
            <ChevronDown className="w-5 h-5 text-slate-500" />
          </div>
        </button>
      </div>

      {/* Mobile Modal Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-[85%] max-w-sm h-full p-6 overflow-y-auto ml-auto flex flex-col justify-between shadow-2xl relative">
            <div>
              <div className="sticky top-0 bg-white pt-1 pb-4 mb-4 border-b border-slate-200 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-slate-900" />
                  <h3 className="font-extrabold text-slate-900 text-base">Filter Katalog</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                  title="Tutup Filter"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterContent />
            </div>

            <div className="pt-4 mt-6 border-t border-slate-200 flex gap-2 sticky bottom-0 bg-white pb-2 z-10">
              <button
                type="button"
                onClick={() => {
                  onReset();
                  setIsMobileOpen(false);
                }}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
              >
                <RotateCcw className="w-4 h-4 text-slate-600" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar Panel */}
      <div className="hidden lg:block bg-white border border-slate-200 rounded-xl p-5 shadow-xs w-full">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-900" />
            <h3 className="font-bold text-slate-900 text-sm">Filter Unit</h3>
          </div>
          {activeCount > 0 && (
            <button
              onClick={onReset}
              className="text-[11px] font-bold text-rose-600 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>

        <FilterContent />
      </div>
    </>
  );
}
