'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

const DEFAULT_CATEGORY_CARDS = [
  {
    id: 'schedule',
    title: 'Lihat Jadwal',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop',
    desc: 'Jadwalkan kunjungan test drive dan janji temu dengan tim konsultan showroom kami.',
    href: '/schedule',
  },
  {
    id: 'compare',
    title: 'Komparasi Mobil',
    image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1000&auto=format&fit=crop',
    desc: 'Bandingkan spesifikasi, harga, dan fitur antar 2 atau lebih unit mobil secara lengkap.',
    href: '/compare',
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
              image: s.categoryScheduleUrl || DEFAULT_CATEGORY_CARDS[0].image,
            },
            {
              ...DEFAULT_CATEGORY_CARDS[1],
              image: s.categoryCompareUrl || DEFAULT_CATEGORY_CARDS[1].image,
            },
            {
              ...DEFAULT_CATEGORY_CARDS[2],
              image: s.categoryEventUrl || DEFAULT_CATEGORY_CARDS[2].image,
            },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1080px] mx-auto space-y-5">
        {/* Header Title */}
        <div>
          <h2 className="text-2xl sm:text-[24px] font-extrabold text-slate-900 tracking-tight">
            Eksplorasi Showroom Kami
          </h2>
        </div>

        {/* 3 Equal Column Cards Grid (Lihat Jadwal, Komparasi Mobil, Acara Showroom) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="relative w-full h-[380px] sm:h-[430px] !rounded-none overflow-hidden text-left transition-all duration-300 group cursor-pointer border-0 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 flex flex-col justify-end p-6 sm:p-7"
              style={{ borderRadius: 0 }}
            >
              {/* Background Image - Clean without zoom-in */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/10" />

              {/* Top Right External Link Icon */}
              <div
                className="absolute top-4 right-4 z-10 w-9 h-9 !rounded-none bg-slate-950/60 backdrop-blur-md text-white flex items-center justify-center transition-colors group-hover:bg-white group-hover:text-slate-950 shadow-md"
                style={{ borderRadius: 0 }}
              >
                <ExternalLink className="w-4 h-4" />
              </div>

              {/* Content Overlay Bottom */}
              <div className="relative z-10 space-y-2 text-white">
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-200 line-clamp-3 leading-relaxed opacity-95">
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
