'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useComparison } from '@/context/ComparisonContext';
import { X, ArrowRight } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

export default function ComparisonDrawer() {
  const pathname = usePathname();
  const { comparisonList, removeFromComparison, clearComparison } = useComparison();

  if (pathname === '/compare' || pathname === '/login' || pathname === '/register' || comparisonList.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-20 lg:bottom-4 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[95vw] bg-white text-slate-900 border border-slate-200/90 rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5 shadow-2xl shadow-slate-900/15 backdrop-blur-md transition-all duration-300">
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* List of selected cars */}
        <div className="flex items-center gap-1.5 sm:gap-2 max-w-[50vw] sm:max-w-[70vw] overflow-x-auto py-0.5 scrollbar-none">
          {comparisonList.map((car) => (
            <div
              key={car.id}
              className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl border border-slate-200 text-xs shrink-0 hover:border-slate-300 transition-all shadow-2xs"
            >
              <img
                src={
                  car.images && car.images.length > 0
                    ? car.images[0].url
                    : 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80'
                }
                alt={car.title}
                className="w-6 h-6 sm:w-7 sm:h-7 object-cover rounded-md border border-slate-200 shrink-0"
              />
              <div className="max-w-[75px] sm:max-w-[130px] truncate">
                <p className="font-bold text-slate-900 truncate leading-tight text-[10px] sm:text-xs">
                  {car.brand} {car.model}
                </p>
                <p className="text-[9px] sm:text-[10px] text-slate-500 font-semibold truncate">{formatRupiah(car.price)}</p>
              </div>
              <button
                onClick={() => removeFromComparison(car.id)}
                className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors rounded-full hover:bg-slate-200/60"
                title="Hapus"
              >
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Separator Divider */}
        <div className="h-5 sm:h-6 w-px bg-slate-200 shrink-0" />

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={clearComparison}
            className="text-[11px] sm:text-[13px] text-slate-500 hover:text-rose-600 px-1.5 py-1 sm:px-2.5 sm:py-1.5 font-bold transition-colors cursor-pointer"
          >
            Bersihkan
          </button>
          <Link
            href="/compare"
            className="inline-flex items-center gap-1 sm:gap-1.5 bg-slate-900 text-white hover:bg-slate-800 text-[11px] sm:text-[13px] font-bold px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-[10px] transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <span>Bandingkan</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
}
