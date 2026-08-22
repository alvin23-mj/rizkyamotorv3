'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroCarouselProps {
  banners?: string[];
}

const DEFAULT_BANNERS = [
  'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=2070&auto=format&fit=crop',
];

export default function HeroCarousel({ banners = DEFAULT_BANNERS }: HeroCarouselProps) {
  const slideList = banners && banners.length > 0 ? banners : DEFAULT_BANNERS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered || slideList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideList.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isHovered, slideList.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slideList.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slideList.length);
  };

  return (
    <section className="w-full bg-slate-900 border-b border-slate-200">
      <div
        className="relative w-full h-[240px] sm:h-[380px] md:h-[480px] lg:h-[540px] xl:h-[600px] overflow-hidden group shadow-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Images Slider (Pure images without text overlays - Full Width) */}
        {slideList.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide}
              alt={`Showroom Banner ${idx + 1}`}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}

        {/* Slide Indicator Dots (Small & Minimalist) */}
        {slideList.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {slideList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? 'w-4 h-1 bg-white'
                    : 'w-1.5 h-1 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to banner ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
