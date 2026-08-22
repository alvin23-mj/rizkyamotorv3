import Link from 'next/link';
import { ArrowRight, Frown, Sparkles, LayoutGrid, Calendar } from 'lucide-react';
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
    <div className="space-y-16 pb-20 bg-white text-slate-800">
      {/* Pure Image Hero Carousel Banner Slider */}
      <HeroCarousel banners={heroBannerUrls.length > 0 ? heroBannerUrls : undefined} />

      {/* Brand Carousel Slider - Placed directly under Hero Banner */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <BrandCarousel />
      </section>

      {/* 3 Image Cards Section (Kategori Merek, Tipe Bodi, Acara Showroom) */}
      <CategoryCardsSection />

      {/* 4. Featured Showroom Inventory Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 mb-8 gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Katalog Pilihan
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Stok Mobil Resmi Terbaru
            </h2>
          </div>
          <Link
            href="/cars"
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 hover:underline"
          >
            <span>Lihat Semua Stok</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {featuredCars.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCars.map((car: any) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-300 rounded-md p-12 text-center flex flex-col items-center justify-center">
            <Frown className="w-10 h-10 text-slate-400 mx-auto mb-3 stroke-[1.5]" />
            <p className="text-sm font-medium text-slate-600">Belum ada unit mobil yang ditampilkan.</p>
          </div>
        )}
      </section>
    </div>
  );
}
