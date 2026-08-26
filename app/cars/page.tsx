'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CarCard from '@/components/cars/CarCard';
import CarFilterBar from '@/components/cars/CarFilterBar';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { CarListing, CarFilterState } from '@/types';
import { Car, AlertCircle, ShieldCheck, CheckCircle2, Sparkles, X, RotateCcw, Frown, Loader2 } from 'lucide-react';

function CarsContent() {
  const searchParams = useSearchParams();

  const initialBrand = searchParams.get('brand') || '';
  const initialSearch = searchParams.get('search') || '';
  const initialBodyType = searchParams.get('bodyType') || '';

  const [filters, setFilters] = useState<CarFilterState>({
    search: initialSearch,
    brand: initialBrand,
    model: '',
    minYear: '',
    maxYear: '',
    minPrice: '',
    maxPrice: '',
    transmission: '',
    fuelType: '',
    bodyType: initialBodyType,
    location: '',
    sellerType: '',
    sortBy: 'newest',
  });

  const [cars, setCars] = useState<CarListing[]>([]);
  const [allCatalogCars, setAllCatalogCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroBannerUrl, setHeroBannerUrl] = useState('https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=2070&auto=format&fit=crop');

  useEffect(() => {
    Promise.all([
      fetch('/api/settings').then((res) => res.json()),
      fetch('/api/cars').then((res) => res.json()),
    ])
      .then(([settingsData, carsData]) => {
        if (settingsData?.settings?.heroCatalogUrl) {
          setHeroBannerUrl(settingsData.settings.heroCatalogUrl);
        }
        if (Array.isArray(carsData)) {
          setAllCatalogCars(carsData);
        }
      })
      .catch(console.error);
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.brand) params.set('brand', filters.brand);
      if (filters.model) params.set('model', filters.model);
      if (filters.minYear) params.set('minYear', filters.minYear);
      if (filters.maxYear) params.set('maxYear', filters.maxYear);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.transmission) params.set('transmission', filters.transmission);
      if (filters.fuelType) params.set('fuelType', filters.fuelType);
      if (filters.bodyType) params.set('bodyType', filters.bodyType);
      if (filters.location) params.set('location', filters.location);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);

      const res = await fetch(`/api/cars?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setCars(data);
      }
    } catch (e) {
      console.error('Failed to fetch cars', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [filters]);

  const handleReset = () => {
    setFilters({
      search: '',
      brand: '',
      model: '',
      minYear: '',
      maxYear: '',
      minPrice: '',
      maxPrice: '',
      transmission: '',
      fuelType: '',
      bodyType: '',
      location: '',
      sellerType: '',
      sortBy: 'newest',
    });
  };

  const removeSingleFilter = (key: keyof CarFilterState) => {
    setFilters((prev) => ({
      ...prev,
      [key]: key === 'sortBy' ? 'newest' : '',
    }));
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Pure Hero Image Banner (Without Text) */}
      <div className="w-full h-40 sm:h-56 md:h-64 lg:h-72 overflow-hidden bg-slate-900 border-b border-slate-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroBannerUrl}
          alt="Hero Banner Katalog"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Main Container Fluid Layout: Left Sidebar Filter + Right Catalog Grid */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column: Sidebar Filter */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-20 z-20">
            <CarFilterBar
              filters={filters}
              onFilterChange={setFilters}
              onReset={handleReset}
              totalResults={cars.length}
              availableCars={allCatalogCars}
            />
          </aside>

          {/* Right Column: Catalog Grid Content */}
          <main className="flex-1 min-w-0 w-full space-y-6">
            {/* Active Filter Chips (only when filters are active) */}
            {(filters.search || filters.brand || filters.bodyType || filters.transmission || filters.fuelType) && (
              <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Filter Aktif:
                </span>

                {filters.search && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
                    Cari: &quot;{filters.search}&quot;
                    <button onClick={() => removeSingleFilter('search')} className="hover:text-rose-600 ml-0.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {filters.bodyType && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
                    Bodi: {filters.bodyType}
                    <button onClick={() => removeSingleFilter('bodyType')} className="hover:text-rose-600 ml-0.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {filters.brand && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
                    Merek: {filters.brand}
                    <button onClick={() => removeSingleFilter('brand')} className="hover:text-rose-600 ml-0.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {filters.transmission && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
                    Transmisi: {filters.transmission}
                    <button onClick={() => removeSingleFilter('transmission')} className="hover:text-rose-600 ml-0.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {filters.fuelType && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
                    BBM: {filters.fuelType}
                    <button onClick={() => removeSingleFilter('fuelType')} className="hover:text-rose-600 ml-0.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                <button
                  onClick={handleReset}
                  className="text-[11px] font-bold text-rose-600 ml-1"
                >
                  Hapus Semua
                </button>
              </div>
            )}

            {/* Car Grid / Loading Spinner / Empty State */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white text-slate-800 w-full">
                <Loader2 className="w-8 h-8 text-slate-800 animate-spin" />
                <p className="text-xs font-bold text-slate-600 tracking-wider">
                  Memuat Katalog Mobil...
                </p>
              </div>
            ) : cars.length > 0 ? (
              <>
                {/* Mobile View: Consecutive Rows of 5 swipeable cards each */}
                <div className="md:hidden space-y-7">
                  {Array.from({ length: Math.ceil(cars.length / 5) }, (_, i) => {
                    const rowCars = cars.slice(i * 5, (i + 1) * 5);
                    return (
                      <div key={i} className="flex overflow-x-auto gap-4 pb-3 scrollbar-none snap-x snap-mandatory pt-1">
                        {rowCars.map((car) => (
                          <div key={car.id} className="w-[270px] shrink-0 snap-start">
                            <CarCard car={car} />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                {/* Desktop / Tablet View: Multi-Column Responsive Grid */}
                <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {cars.map((car) => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-2 w-full">
                <Frown className="w-10 h-10 text-slate-400 stroke-[1.5] mb-1" />
                <p className="text-sm font-medium text-slate-600">Belum ada unit mobil yang ditampilkan.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function CarsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-semibold">Memuat Katalog Mobil...</div>}>
      <CarsContent />
    </Suspense>
  );
}
