'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, ExternalLink } from 'lucide-react';

const DEFAULT_CATEGORY_CARDS = [
  {
    id: 'brand',
    title: 'Kategori Merek',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000&auto=format&fit=crop',
    desc: 'Temukan unit mobil impian berdasarkan merek pabrikan ternama dengan garansi resmi.',
    href: '/cars',
  },
  {
    id: 'body',
    title: 'Kategori Tipe Bodi',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000&auto=format&fit=crop',
    desc: 'Pilih model kendaraan yang sesuai dengan kebutuhan keluarga dan gaya hidup Anda.',
    href: '/cars',
  },
  {
    id: 'compare',
    title: 'Komparasi Mobil',
    image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1000&auto=format&fit=crop',
    desc: 'Bandingkan spesifikasi, harga, dan fitur antar 2 atau lebih unit mobil secara lengkap.',
    href: '/compare',
  },
  {
    id: 'schedule',
    title: 'Lihat Jadwal',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop',
    desc: 'Jadwalkan kunjungan test drive dan janji temu dengan tim konsultan showroom kami.',
    href: '/schedule',
  },
  {
    id: 'event',
    title: 'Acara Showroom',
    image: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?q=80&w=1000&auto=format&fit=crop',
    desc: 'Ikuti event seru jalan santai komunitas, promo diskon spesial, dan test drive weekend.',
    href: '/events',
  },
];

export default function CategoryCardsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [cards, setCards] = useState(DEFAULT_CATEGORY_CARDS);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          const s = data.settings;
          setCards([
            {
              ...DEFAULT_CATEGORY_CARDS[0],
              image: s.categoryBrandUrl || DEFAULT_CATEGORY_CARDS[0].image,
            },
            {
              ...DEFAULT_CATEGORY_CARDS[1],
              image: s.categoryBodyUrl || DEFAULT_CATEGORY_CARDS[1].image,
            },
            {
              ...DEFAULT_CATEGORY_CARDS[2],
              image: s.categoryCompareUrl || DEFAULT_CATEGORY_CARDS[2].image,
            },
            {
              ...DEFAULT_CATEGORY_CARDS[3],
              image: s.categoryScheduleUrl || DEFAULT_CATEGORY_CARDS[3].image,
            },
            {
              ...DEFAULT_CATEGORY_CARDS[4],
              image: s.categoryEventUrl || DEFAULT_CATEGORY_CARDS[4].image,
            },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header Title & Scroll Controls - Inset max-w-[1180px] */}
      <div className="max-w-[1180px] mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Eksplorasi Showroom Kami
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Geser untuk menjelajahi kategori merek, tipe bodi, komparasi mobil, dan acara komunitas.
            </p>
          </div>

          {/* Scroll Navigation Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => scroll('left')}
              aria-label="Scroll Kiri"
              className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => scroll('right')}
              aria-label="Scroll Kanan"
              className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-xs"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Feature Cards Grid - Inset max-w-[1180px] */}
      <div className="max-w-[1180px] mx-auto">
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scroll-smooth pb-4 pt-1 snap-x scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {cards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="shrink-0 w-[280px] sm:w-[310px] md:w-[340px] relative h-80 sm:h-96 md:h-[390px] rounded-[22px] overflow-hidden text-left transition-all group cursor-pointer border border-slate-200 shadow-md hover:shadow-xl hover:border-slate-300 block snap-start"
            >
              {/* Background Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />

              {/* Top Right External Link Icon Badge */}
              <div className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl bg-slate-950/60 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-slate-950 group-hover:border-white shadow-md">
                <ExternalLink className="w-4.5 h-4.5" />
              </div>

              {/* Content Overlay Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-5 z-10 space-y-1.5 text-white">
                <h3 className="text-xl font-extrabold tracking-tight text-white transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed opacity-90">
                  {card.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
