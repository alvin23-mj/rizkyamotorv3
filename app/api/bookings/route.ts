import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const {
      carListingId,
      customerName,
      customerPhone,
      customerEmail,
      bookingDate,
      bookingTime,
      hasDp,
      dpAmount,
      notes,
    } = body;

    if (!carListingId || !customerName || !customerPhone || !bookingDate || !bookingTime) {
      return NextResponse.json(
        { error: 'Harap lengkapi Nama, WhatsApp, Tanggal, dan Jam kunjungan.' },
        { status: 400 }
      );
    }

    // Validate H-1 minimum booking date (must be starting from tomorrow)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDateObj = new Date(bookingDate.includes('T') ? bookingDate : `${bookingDate}T00:00:00`);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (bookingDateObj < tomorrow) {
      return NextResponse.json(
        { error: 'Booking kunjungan minimal H-1 hari (mulai besok).' },
        { status: 400 }
      );
    }

    const isDp = Boolean(hasDp);

    // Create booking (Always starts at PENDING / Menunggu Respon)
    const booking = await prisma.testDriveBooking.create({
      data: {
        carListingId,
        userId: (session?.user as any)?.id || null,
        customerName,
        customerPhone,
        customerEmail: customerEmail || session?.user?.email || null,
        bookingDate,
        bookingTime,
        notes: notes || (isDp ? 'Booking dengan DP Tanda Jadi (Unit Disimpan)' : 'Booking Tanpa DP'),
        status: 'PENDING',
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('Error creating test drive booking:', error);
    return NextResponse.json(
      { error: 'Gagal membuat janji temu test drive.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const myParam = searchParams.get('my');

    const whereCondition: any = {};
    if (dateParam) {
      whereCondition.bookingDate = dateParam;
    }

    if (myParam === 'true' && session?.user) {
      const userId = (session.user as any).id;
      const userEmail = session.user.email;
      whereCondition.OR = [
        ...(userId ? [{ userId }] : []),
        ...(userEmail ? [{ customerEmail: userEmail }] : []),
      ];
    }

    const bookings = await prisma.testDriveBooking.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: {
        carListing: {
          select: {
            id: true,
            title: true,
            brand: true,
            model: true,
            location: true,
            price: true,
            status: true,
            images: { take: 1, orderBy: { order: 'asc' } },
          },
        },
      },
    });

    // Auto-sync car status for confirmed bookings with DP
    await Promise.all(
      bookings.map(async (b) => {
        const isWithDp = Boolean(b.notes?.toLowerCase().includes('dp'));
        if (b.carListingId && isWithDp && (b.status === 'CONFIRMED' || b.status === 'CONFIRMED_DP') && b.carListing?.status === 'AVAILABLE') {
          await prisma.carListing.update({
            where: { id: b.carListingId },
            data: { status: 'RESERVED' },
          });
        }
      })
    );

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch test drive bookings' }, { status: 500 });
  }
}
