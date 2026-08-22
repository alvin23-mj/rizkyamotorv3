'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BrandItem {
  id?: string;
  name: string;
  logoUrl?: string;
  description?: string;
}

export default function BrandCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [brands, setBrands] = useState<BrandItem[]>([]);

  useEffect(() => {
    fetch('/api/brands')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const featured = data.filter((b: any) => b.isFeatured !== false);
          setBrands(featured.length > 0 ? featured : data);
        }
      })
      .catch(console.error);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

      if (direction === 'right' && scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Auto-scroll loop every 2.5 seconds, pauses when user hovers
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 220, behavior: 'smooth' });
        }
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Scroll Left Button */}
      <button
        onClick={() => handleScroll('left')}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-slate-300 shadow-md flex items-center justify-center text-slate-800 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
        aria-label="Gulir Kiri"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Horizontal Scrollable Brands Track */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3.5 overflow-x-auto scroll-smooth py-2 px-1 scrollbar-none snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {(brands.length > 0
          ? brands
          : [
              { name: 'Toyota', logoUrl: '/brands/toyota.svg' },
              { name: 'Honda', logoUrl: '/brands/honda.svg' },
              { name: 'BMW', logoUrl: '/brands/bmw.svg' },
              { name: 'Mercedes-Benz', logoUrl: '/brands/mercedes.svg' },
              { name: 'Mitsubishi', logoUrl: '/brands/mitsubishi.svg' },
              { name: 'Hyundai', logoUrl: '/brands/hyundai.svg' },
              { name: 'Suzuki', logoUrl: '/brands/suzuki.svg' },
              { name: 'Mazda', logoUrl: '/brands/mazda.svg' },
              { name: 'Audi', logoUrl: '/brands/audi.svg' },
              { name: 'Ford', logoUrl: '/brands/ford.svg' },
              { name: 'Nissan', logoUrl: '/brands/nissan.svg' },
              { name: 'Ferrari', logoUrl: '/brands/ferrari.svg' },
            ]
        ).map((brand) => (
          <Link
            key={brand.name}
            href={`/cars?brand=${encodeURIComponent(brand.name)}`}
            className="w-32 sm:w-36 shrink-0 snap-start group/card bg-white p-3.5 rounded-[14px] shadow-md hover:shadow-xl transition-all flex flex-col items-center justify-center text-center border-0"
          >
            <div className="w-14 h-14 flex items-center justify-center text-slate-900 transition-transform duration-300 group-hover/card:scale-110 mb-2 p-1">
              {brand.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  {brand.name.charAt(0)}
                </div>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate w-full">
              {brand.name}
            </h3>
          </Link>
        ))}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => handleScroll('right')}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-slate-300 shadow-md flex items-center justify-center text-slate-800 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
        aria-label="Gulir Kanan"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
