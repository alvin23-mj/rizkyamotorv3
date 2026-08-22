export default function SkeletonCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg animate-pulse flex flex-col h-full">
      <div className="aspect-[16/10] w-full bg-slate-800" />
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="h-3 w-1/3 bg-slate-800 rounded" />
          <div className="h-5 w-3/4 bg-slate-800 rounded" />
          <div className="h-4 w-1/2 bg-slate-800 rounded" />
        </div>
        <div className="h-10 w-full bg-slate-800 rounded-xl" />
        <div className="pt-3 border-t border-slate-800 flex justify-between">
          <div className="h-4 w-20 bg-slate-800 rounded" />
          <div className="h-7 w-16 bg-slate-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
