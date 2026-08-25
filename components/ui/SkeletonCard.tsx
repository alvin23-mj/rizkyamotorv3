'use client';

import { Loader2 } from 'lucide-react';

export default function SkeletonCard() {
  return (
    <div className="py-16 flex flex-col items-center justify-center space-y-3 w-full">
      <Loader2 className="w-8 h-8 text-slate-800 animate-spin" />
      <p className="text-xs font-semibold text-slate-600 tracking-wider">Memuat...</p>
    </div>
  );
}
