'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  Clock,
  Car,
  CheckCircle2,
  AlertCircle,
  EyeOff,
  User,
  Phone,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
  Loader2,
} from 'lucide-react';
import { CarListing } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { useSession } from '@/components/providers/AuthProvider';

interface BookingItem {
  id: string;
  customerName: string;
  customerPhone: string;
  bookingDate: string;
  bookingTime: string;
  status: string;
  notes?: string;
  carListing?: {
    id: string;
    title: string;
    brand: string;
    model: string;
    price: number;
    status: string;
  };
}

export default function SchedulePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();
  const [selectedDate, setSelectedDate] = useState(tomorrowStr);

  const [cars, setCars] = useState<CarListing[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Time Slots for the Day
  const defaultSlots = [
    '09:00 - 10:30 WIB',
    '11:00 - 12:30 WIB',
    '13:00 - 14:30 WIB',
    '15:00 - 16:30 WIB',
    '17:00 - 18:30 WIB',
  ];

  // Booking Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState('');
  const [selectedCarId, setSelectedCarId] = useState('');
  const [customerName, setCustomerName] = useState(session?.user?.name || '');
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setCustomerName(session.user.name);
      if ((session.user as any)?.phone) setCustomerPhone((session.user as any).phone);
      fetch('/api/profile')
        .then((res) => res.json())
        .then((data) => {
          if (data.name) setCustomerName(data.name);
          if (data.phone) setCustomerPhone(data.phone);
        })
        .catch(console.error);
    }
  }, [session]);
  const [bookingMode, setBookingMode] = useState<'NODP' | 'WITHDP'>('NODP');
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ isDp: boolean; carTitle: string } | null>(null);

  const [operatingHours, setOperatingHours] = useState<{ timeSlot: string; maxQuota: number; isActive: boolean }[]>(
    defaultSlots.map((s) => ({ timeSlot: s, maxQuota: 1, isActive: true }))
  );
  const [closures, setClosures] = useState<any[]>([]);
  const [heroBannerUrl, setHeroBannerUrl] = useState('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [carsRes, bookingsRes, settingsRes] = await Promise.all([
          fetch('/api/cars'),
          fetch(`/api/bookings?date=${selectedDate}`),
          fetch('/api/schedule-settings'),
        ]);

        if (carsRes.ok) {
          const carsData = await carsRes.json();
          setCars(carsData);
          if (carsData.length > 0 && !selectedCarId) {
            setSelectedCarId(carsData[0].id);
          }
        }

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData);
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setClosures(settingsData.closures || []);
          if (settingsData.settings?.heroScheduleUrl) {
            setHeroBannerUrl(settingsData.settings.heroScheduleUrl);
          }
          if (settingsData.operatingHours && settingsData.operatingHours.length > 0) {
            const activeHours = settingsData.operatingHours.filter((s: any) => s.isActive);
            if (activeHours.length > 0) {
              setOperatingHours(activeHours);
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedDate]);

  // Helper to check bookings for a slot
  const getSlotBookings = (slotTime: string) => {
    const timePrefix = slotTime.split(' ')[0]; // e.g. "09:00"
    return bookings.filter(
      (b) => b.bookingTime.includes(timePrefix) || slotTime.includes(b.bookingTime)
    );
  };

  const handleOpenBookingModal = (slotTime: string) => {
    if (!session) {
      alert('Harap login terlebih dahulu untuk melakukan booking jadwal test drive.');
      router.push('/login?callbackUrl=/schedule');
      return;
    }
    setSelectedSlotForBooking(slotTime);
    setModalOpen(true);
    setSuccessInfo(null);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCarId) {
      alert('Silakan pilih unit mobil terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    const targetCar = cars.find((c) => c.id === selectedCarId);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carListingId: selectedCarId,
          customerName,
          customerPhone,
          bookingDate: selectedDate,
          bookingTime: selectedSlotForBooking,
          hasDp: false,
          dpAmount: 0,
        }),
      });

      if (res.ok) {
        setSuccessInfo({
          isDp: false,
          carTitle: targetCar?.title || 'Mobil',
        });

        // Refresh data
        const [carsRes, bookingsRes] = await Promise.all([
          fetch('/api/cars'),
          fetch(`/api/bookings?date=${selectedDate}`),
        ]);
        if (carsRes.ok) setCars(await carsRes.json());
        if (bookingsRes.ok) setBookings(await bookingsRes.json());
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal membuat booking.');
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Date Navigation
  const changeDateByDays = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    const nextDateStr = current.toISOString().split('T')[0];
    if (nextDateStr < tomorrowStr) {
      alert('Booking jadwal minimal H-1 hari (mulai besok).');
      return;
    }
    setSelectedDate(nextDateStr);
  };

  return (
    <div className="bg-white min-h-screen pb-16 text-slate-800">
      {/* Pure Hero Image Banner (Without Text) */}
      <div className="w-full h-40 sm:h-56 md:h-64 lg:h-72 overflow-hidden bg-slate-900 border-b border-slate-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroBannerUrl}
          alt="Hero Banner Jadwal"
          className="w-full h-full object-cover object-center"
        />
      </div>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        {/* Combined Date Selector & Legend Card (White, No Outline, With Shadow) */}
        <div className="bg-white rounded-lg p-5 sm:p-6 shadow-md space-y-4">
          {/* Top Row: Date Selector & Input */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeDateByDays(-1)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
                title="Hari Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4 text-slate-700" />
              </button>

              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-md text-xs font-extrabold text-slate-900">
                <CalendarIcon className="w-4 h-4 text-slate-800" />
                <span>Tanggal: {selectedDate}</span>
              </div>

              <button
                onClick={() => changeDateByDays(1)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
                title="Hari Berikutnya"
              >
                <ChevronRight className="w-4 h-4 text-slate-700" />
              </button>
            </div>

            {/* Quick Date Selector Input */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <input
                type="date"
                min={tomorrowStr}
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value >= tomorrowStr) {
                    setSelectedDate(e.target.value);
                  } else {
                    alert('Booking jadwal minimal H-1 hari (mulai besok).');
                  }
                }}
                className="bg-slate-50 border border-slate-200 text-xs rounded-md px-3 py-2 text-slate-900 font-medium cursor-pointer"
              />
            </div>
          </div>

          {/* NB Note Keterangan */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span className="font-bold text-amber-600">NB:</span>
            <span>Jadwal kunjungan & test drive hanya dapat dilihat mulai H-1 (mulai besok).</span>
          </div>
        </div>

        {/* Time Slots Schedule Grid */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 space-y-3">
            <Loader2 className="w-8 h-8 text-slate-800 animate-spin mx-auto" />
            <p>Memuat ketersediaan jadwal tanggal {selectedDate}...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {operatingHours.map((slotObj) => {
              const slotTime = slotObj.timeSlot;
              const MAX_CAPACITY = slotObj.maxQuota || 1;
              const slotBookings = getSlotBookings(slotTime);
              const isFull = slotBookings.length >= MAX_CAPACITY;
              const remainingSlots = Math.max(0, MAX_CAPACITY - slotBookings.length);
              const isClosed = Boolean(closures.find((c) => c.closedDate === selectedDate));

              return (
                <div
                  key={slotTime}
                  className={`relative !rounded-none p-5 flex flex-col justify-between text-center min-h-[250px] sm:min-h-[280px] transition-all select-none overflow-hidden ${
                    isFull
                      ? 'bg-slate-100/90 text-slate-900 shadow-2xs opacity-70 cursor-default'
                      : 'bg-white text-slate-900 shadow-md cursor-default'
                  }`}
                  style={{ borderRadius: 0 }}
                >
                  {/* Top Ticket Stub Header: Time */}
                  <div className="pb-3.5 border-b-2 border-dashed border-slate-200/80 relative">
                    <span className="block font-black text-xs sm:text-sm text-slate-900 tracking-wider">
                      {slotTime}
                    </span>
                  </div>

                  {/* Ticket Notch Semicircular Cutouts on Left & Right */}
                  <div className="absolute top-[38px] -left-2.5 w-5 h-5 rounded-full bg-slate-50 shadow-inner pointer-events-none" />
                  <div className="absolute top-[38px] -right-2.5 w-5 h-5 rounded-full bg-slate-50 shadow-inner pointer-events-none" />

                  {/* Middle Ticket Section: Status Badge */}
                  <div className="py-3 flex justify-center">
                    {isFull ? (
                      <span
                        className="bg-slate-200 text-slate-700 text-[11px] font-extrabold px-3 py-1 !rounded-none tracking-wider uppercase"
                        style={{ borderRadius: 0 }}
                      >
                        Sudah Penuh
                      </span>
                    ) : slotBookings.length > 0 ? (
                      <span
                        className="bg-amber-50 text-amber-700 border border-amber-300 text-[11px] font-extrabold px-3 py-1 !rounded-none tracking-wider uppercase"
                        style={{ borderRadius: 0 }}
                      >
                        Dipesan
                      </span>
                    ) : (
                      <span
                        className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[11px] font-extrabold px-3 py-1 !rounded-none tracking-wider uppercase"
                        style={{ borderRadius: 0 }}
                      >
                        Tersedia
                      </span>
                    )}
                  </div>

                  {/* Bottom Ticket Stub Body: Details */}
                  <div className="pt-2">
                    {slotBookings.length > 0 ? (
                      <div>
                        {!isFull ? (
                          <p className="text-[11px] text-slate-900 font-semibold leading-snug">
                            Masih tersedia di jam ini untuk Anda.
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-600 font-medium leading-snug">
                            Seluruh kuota di jam ini telah terisi.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-extrabold text-slate-900 text-xs tracking-tight">
                          Waktu Siap Dipesan
                        </p>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Silakan pesan untuk jadwal kunjungan & test drive.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Booking Modal for Selected Time Slot */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative space-y-5">
            <button
              onClick={() => {
                setModalOpen(false);
                setSuccessInfo(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            {successInfo ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-sm flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Reservasi Kunjungan Berhasil (Gratis)!</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unit <strong>{successInfo.carTitle}</strong> untuk jadwal tanggal <strong>{selectedDate}</strong> jam <strong>{selectedSlotForBooking}</strong> telah terdaftar secara <strong>Gratis</strong>.
                </p>

                <div className="bg-slate-50 border border-slate-200 text-slate-800 p-3.5 rounded-sm text-xs text-left space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Status: Terdaftar (Gratis & Tanpa DP)
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    Sales consultant showroom kami akan menghubungi WhatsApp Anda untuk konfirmasi kedatangan.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setModalOpen(false);
                    setSuccessInfo(null);
                  }}
                  className="mt-4 bg-slate-900 text-white font-bold text-xs px-6 py-2.5 rounded-sm"
                >
                  Tutup & Kembali ke Jadwal
                </button>
              </div>
            ) : (
              <>
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Booking Slot Jam {selectedSlotForBooking} (Gratis)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Tanggal Kunjungan: <strong>{selectedDate}</strong>
                  </p>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                  {/* Pilih Mobil */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pilih Unit Mobil *</label>
                    <select
                      required
                      value={selectedCarId}
                      onChange={(e) => setSelectedCarId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-sm px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-900"
                    >
                      {cars.map((car) => (
                        <option key={car.id} value={car.id}>
                          {car.brand} {car.model} ({car.year}) — {formatRupiah(car.price)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nama & WA */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama Anda"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-sm px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0812..."
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-sm px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 px-4 rounded-sm shadow-xs transition-all flex items-center justify-center cursor-pointer mt-2"
                  >
                    <span>{submitting ? 'Memproses Booking...' : 'Konfirmasi Booking Jam Ini'}</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
