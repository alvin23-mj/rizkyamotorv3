import Link from 'next/link';
import { ChevronRight, Frown } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import CarCard from '@/components/cars/CarCard';

import HeroCarousel from '@/components/home/HeroCarousel';
import BrandCarousel from '@/components/home/BrandCarousel';
import CategoryCardsSection from '@/components/home/CategoryCardsSection';

export const revalidate = 0;

export default async function HomePage() {
  let featuredCars: any[] = [];
  let heroBannerUrls: string[] = [];

  try {
    featuredCars = await prisma.carListing.findMany({
      where: { status: 'AVAILABLE', isVisible: true },
      include: {
        images: { orderBy: { order: 'asc' } },
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    const activeBanners = await prisma.heroBanner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    heroBannerUrls = activeBanners.map((b) => b.imageUrl);
  } catch (error) {
    console.error('Failed to fetch data for homepage:', error);
  }

  return (
    <div className="space-y-6 md:space-y-16 pb-0 md:pb-16 bg-white text-slate-800">
      {/* 1. Pure Image Hero Carousel Banner Slider */}
      <HeroCarousel banners={heroBannerUrls.length > 0 ? heroBannerUrls : undefined} />

      {/* 2. Brand Carousel Slider - Placed directly under Hero Banner */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <BrandCarousel />
      </section>

      {/* 3. Featured Showroom Inventory Section (Mobil Terbaru) */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h2 className="text-xl sm:text-[24px] font-extrabold text-slate-900 tracking-tight">
            Mobil Terbaru
          </h2>
          <Link
            href="/cars"
            className="inline-flex items-center text-slate-900 hover:text-black font-extrabold text-sm sm:text-[15px] transition-colors cursor-pointer shrink-0"
          >
            <span>Lihat Semua</span>
          </Link>
        </div>

        {featuredCars.length > 0 ? (
          <>
            {/* Mobile View: Horizontal Scroll for 5 cards */}
            <div className="flex md:hidden overflow-x-auto gap-4 pb-4 scrollbar-none snap-x snap-mandatory pt-1">
              {featuredCars.slice(0, 5).map((car: any) => (
                <div key={car.id} className="w-[270px] shrink-0 snap-start">
                  <CarCard car={car} />
                </div>
              ))}
            </div>

            {/* Desktop View: Grid Layout (4 Columns) */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCars.slice(0, 4).map((car: any) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white border border-dashed border-slate-300 rounded-md p-12 text-center flex flex-col items-center justify-center">
            <Frown className="w-10 h-10 text-slate-400 mx-auto mb-3 stroke-[1.5]" />
            <p className="text-sm font-medium text-slate-600">Belum ada unit mobil yang ditampilkan.</p>
          </div>
        )}
      </section>

      {/* 4. Category / Exploration Cards Section (Eksplorasi Showroom - Dipindah di bawah Katalog) */}
      <CategoryCardsSection />
    </div>
  );
}
