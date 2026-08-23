import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

const DEFAULT_EVENTS = [
  {
    title: 'Rizkya Motor Weekend Auto Expo 2026',
    date: '15 - 17 Agustus 2026',
    time: '09.00 - 21.00 WIB',
    location: 'Showroom Utama Rizkya Motor - Jl. Raya Otomotif No. 88, Jakarta',
    category: 'Pameran & Test Drive',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1200&auto=format&fit=crop',
    description: 'Nikmati diskon spesial kemerdekaan hingga Rp 25 Juta, gratis garansi mesin 2 tahun, dan cashback langsung senilai Rp 5 Juta untuk 50 pembeli pertama.',
    badge: 'Terdekat',
    order: 1,
    isVisible: true,
  },
  {
    title: 'Hybrid & EV Innovation Festival',
    date: '28 - 30 Agustus 2026',
    time: '10.00 - 20.00 WIB',
    location: 'Grand Atrium Central Park, Jakarta Barat',
    category: 'Teknologi & Ramah Lingkungan',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=1200&auto=format&fit=crop',
    description: 'Jelajahi dan coba langsung puluhan unit mobil Hybrid dan Listrik (EV) pilihan. Dapatkan voucher charging gratis 1 tahun dan promo DP super ringan.',
    badge: 'Popular',
    order: 2,
    isVisible: true,
  },
  {
    title: 'Pesta Kredit DP Seger & Akselerasi Ringan',
    date: '12 - 14 September 2026',
    time: '08.30 - 18.00 WIB',
    location: 'Seluruh Cabang Rizkya Motor',
    category: 'Promo DP Ringan',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop',
    description: 'Dapatkan kredit DP seger mulai 10% dengan angsuran fleksibel & proses approval cepat tanpa ribet.',
    badge: 'Segera',
    order: 3,
    isVisible: true,
  },
];

let hasInitialSeeded = false;

export async function GET() {
  try {
    let events = await (prisma as any).event.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    if (!hasInitialSeeded && (!events || events.length === 0)) {
      hasInitialSeeded = true;
      await (prisma as any).event.createMany({
        data: DEFAULT_EVENTS,
      });
      events = await (prisma as any).event.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      });
    }

    hasInitialSeeded = true;
    return NextResponse.json({ events });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Gagal memuat daftar event.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'ADMIN' && role !== 'ADMIN_SHOWROOM')) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;
    hasInitialSeeded = true;

    if (action === 'CREATE_EVENT') {
      const { title, category, date, time, location, image, description, badge, hasRegistration } = body;
      if (!title || !date || !location || !description) {
        return NextResponse.json({ error: 'Judul, tanggal, lokasi, dan deskripsi wajib diisi.' }, { status: 400 });
      }

      const event = await (prisma as any).event.create({
        data: {
          title,
          category: category || 'Umum',
          date,
          time: time || '09.00 - 18.00 WIB',
          location,
          image: image || 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1200&auto=format&fit=crop',
          description,
          badge: badge || null,
          hasRegistration: hasRegistration !== undefined ? Boolean(hasRegistration) : true,
          isVisible: true,
        },
      });

      return NextResponse.json({ message: 'Event baru berhasil ditambahkan!', event });
    }

    if (action === 'UPDATE_EVENT') {
      const { id, title, category, date, time, location, image, description, badge, hasRegistration, isVisible } = body;
      if (!id) return NextResponse.json({ error: 'ID Event wajib diisi.' }, { status: 400 });

      const updated = await (prisma as any).event.update({
        where: { id },
        data: {
          title: title !== undefined ? title : undefined,
          category: category !== undefined ? category : undefined,
          date: date !== undefined ? date : undefined,
          time: time !== undefined ? time : undefined,
          location: location !== undefined ? location : undefined,
          image: image !== undefined ? image : undefined,
          description: description !== undefined ? description : undefined,
          badge: badge !== undefined ? badge : undefined,
          hasRegistration: hasRegistration !== undefined ? Boolean(hasRegistration) : undefined,
          isVisible: isVisible !== undefined ? Boolean(isVisible) : undefined,
        },
      });

      return NextResponse.json({ message: 'Data event berhasil diperbarui!', event: updated });
    }

    if (action === 'TOGGLE_VISIBILITY') {
      const { id, isVisible } = body;
      if (!id) return NextResponse.json({ error: 'ID Event wajib diisi.' }, { status: 400 });

      const updated = await (prisma as any).event.update({
        where: { id },
        data: { isVisible: Boolean(isVisible) },
      });

      return NextResponse.json({ message: 'Status visibilitas event berhasil diubah!', event: updated });
    }

    if (action === 'DELETE_EVENT') {
      const { id } = body;
      if (!id) return NextResponse.json({ error: 'ID Event wajib diisi.' }, { status: 400 });

      await (prisma as any).event.delete({ where: { id } });
      return NextResponse.json({ message: 'Event berhasil dihapus.' });
    }

    return NextResponse.json({ error: 'Aksi tidak valid.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error processing event request:', error);
    return NextResponse.json({ error: error.message || 'Gagal memproses event.' }, { status: 500 });
  }
}
