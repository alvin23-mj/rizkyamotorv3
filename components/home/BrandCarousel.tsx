'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';

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
      {/* Horizontal Scrollable Brands Track */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3.5 overflow-x-auto scroll-smooth py-3 px-1 scrollbar-none snap-x"
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
            className="w-38 sm:w-44 shrink-0 snap-start bg-white py-5 px-4 rounded-md border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1.5 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer"
          >
            <div className="w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center text-slate-900 mb-3 p-1">
              {brand.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div
                  className="w-14 h-14 bg-slate-900 text-white flex items-center justify-center font-extrabold text-lg rounded-md"
                >
                  {brand.name.charAt(0)}
                </div>
              )}
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-[15px] truncate w-full">
              {brand.name}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
