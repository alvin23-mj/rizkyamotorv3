'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Users, Compass, Award } from 'lucide-react';

const BODY_TYPES = [
  {
    name: 'SUV',
    label: 'Mobil SUV',
    desc: 'Tangguh, ground clearance tinggi, siap segala medan jalanan.',
    href: '/cars?bodyType=SUV',
    icon: Compass,
    badge: 'Populer',
  },
  {
    name: 'MPV',
    label: 'Mobil MPV',
    desc: 'Kapasitas 7-seater lapang, sangat nyaman untuk perjalanan keluarga.',
    href: '/cars?bodyType=MPV',
    icon: Users,
    badge: 'Keluarga',
  },
  {
    name: 'Sedan',
    label: 'Mobil Sedan',
    desc: 'Elegan, aerodinamis, dan menyajikan kenyamanan berkendara kelas atas.',
    href: '/cars?bodyType=Sedan',
    icon: Award,
    badge: 'Premium',
  },
  {
    name: 'Hatchback',
    label: 'Mobil Hatchback',
    desc: 'Desain Kompak & lincah, sangat efisien untuk mobilitas perkotaan.',
    href: '/cars?bodyType=Hatchback',
    icon: ShieldCheck,
    badge: 'Perkotaan',
  },
  {
    name: 'Hybrid & EV',
    label: 'Hybrid & Mobil Listrik',
    desc: 'Teknologi modern hemat bahan bakar & ramah lingkungan.',
    href: '/cars?fuelType=Hybrid',
    icon: Zap,
    badge: 'Ramah Lingkungan',
  },
];

export default function BodyTypeSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
      {BODY_TYPES.map((item) => {
        const IconComponent = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4 hover:-translate-y-1"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-slate-100 group-hover:bg-slate-900 text-slate-800 group-hover:text-white flex items-center justify-center transition-colors">
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white px-2 py-0.5 rounded-full transition-colors">
                  {item.badge}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-slate-900 transition-colors">
                  {item.label}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors pt-2 border-t border-slate-100">
              <span>Jelajahi Stok</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
