// Updated EventsPage layout
import EventCarousel from '@/components/home/EventCarousel';

export const metadata = {
  title: 'Acara & Event Showroom | Rizkya Motor',
  description: 'Jadwal kegiatan komunitas, jalan santai, pameran auto expo, dan promo spesial Rizkya Motor.',
};

export default function EventsPage() {
  return (
    <div className="bg-white min-h-screen py-8 sm:py-12 text-slate-800">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Daftar Acara & Gathering Showroom
          </h1>
        </div>

        <EventCarousel />
      </div>
    </div>
  );
}
