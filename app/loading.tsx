'use client';

import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center space-y-3 py-24 bg-white text-slate-800">
      <Loader2 className="w-8 h-8 text-slate-800 animate-spin" />
      <p className="text-xs font-bold text-slate-600 tracking-wider">
        Memuat...
      </p>
    </div>
  );
}
