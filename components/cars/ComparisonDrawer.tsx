'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useComparison } from '@/context/ComparisonContext';
import { X, ArrowRight } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

export default function ComparisonDrawer() {
  const pathname = usePathname();
  const { comparisonList, removeFromComparison, clearComparison } = useComparison();

  if (pathname === '/login' || pathname === '/register' || comparisonList.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[95vw] bg-white text-slate-900 border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xl shadow-slate-900/15 backdrop-blur-md transition-all duration-300">
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* List of selected cars */}
        <div className="flex items-center gap-2 max-w-[55vw] sm:max-w-[70vw] overflow-x-auto py-0.5 scrollbar-none">
          {comparisonList.map((car) => (
            <div
              key={car.id}
              className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs shrink-0 hover:border-slate-300 transition-all shadow-2xs"
            >
              <img
                src={
                  car.images && car.images.length > 0
                    ? car.images[0].url
                    : 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80'
                }
                alt={car.title}
                className="w-7 h-7 object-cover rounded-lg border border-slate-200"
              />
              <div className="max-w-[100px] sm:max-w-[130px] truncate">
                <p className="font-bold text-slate-900 truncate leading-tight text-[11px] sm:text-xs">
                  {car.brand} {car.model}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold">{formatRupiah(car.price)}</p>
              </div>
              <button
                onClick={() => removeFromComparison(car.id)}
                className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors rounded-full hover:bg-slate-200/60"
                title="Hapus"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Separator Divider */}
        <div className="h-6 w-px bg-slate-200 shrink-0" />

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={clearComparison}
            className="text-[14px] text-slate-500 hover:text-rose-600 px-3 py-2.5 font-bold transition-colors"
          >
            Bersihkan
          </button>
          <Link
            href="/compare"
            className="inline-flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 text-[14px] font-bold px-4 py-2.5 rounded-[10px] transition-all shadow-xs shrink-0"
          >
            <span>Bandingkan</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
}
