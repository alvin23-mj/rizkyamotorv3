import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      bookingDate,
      bookingTime,
      carListingId,
      status,
      notes,
      hasDp,
    } = body;

    const booking = await prisma.testDriveBooking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: 'Booking tidak ditemukan.' }, { status: 404 });
    }

    const updateData: any = {};
    if (customerName !== undefined) updateData.customerName = customerName;
    if (customerPhone !== undefined) updateData.customerPhone = customerPhone;
    if (customerEmail !== undefined) updateData.customerEmail = customerEmail;
    if (bookingDate !== undefined) updateData.bookingDate = bookingDate;
    if (bookingTime !== undefined) updateData.bookingTime = bookingTime;
    if (carListingId !== undefined) updateData.carListingId = carListingId;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.testDriveBooking.update({
      where: { id },
      data: updateData,
      include: {
        carListing: true,
      },
    });

    // Sync car listing status automatically:
    // - If booking is WITH DP and status is CONFIRMED / CONFIRMED_DP: Set car status to RESERVED (Dipesan)
    // - If status is COMPLETED: Set car status to SOLD (Terjual)
    // - If status is CANCELLED or Tanpa DP with PENDING/WAITING_WA/CONFIRMED: Set car status to AVAILABLE (Tersedia)
    const targetCarId = carListingId || booking.carListingId;
    const targetStatus = status || booking.status;
    const isWithDp = hasDp !== undefined ? Boolean(hasDp) : (Boolean(booking.notes?.toLowerCase().includes('dp')));

    if (targetCarId && targetStatus) {
      if (targetStatus === 'COMPLETED') {
        await prisma.carListing.update({
          where: { id: targetCarId },
          data: { status: 'SOLD' },
        });
      } else if (targetStatus === 'CANCELLED') {
        await prisma.carListing.update({
          where: { id: targetCarId },
          data: { status: 'AVAILABLE' },
        });
      } else if (isWithDp && (targetStatus === 'CONFIRMED' || targetStatus === 'CONFIRMED_DP')) {
        await prisma.carListing.update({
          where: { id: targetCarId },
          data: { status: 'RESERVED' },
        });
      } else if (!isWithDp && (targetStatus === 'PENDING' || targetStatus === 'WAITING_WA' || targetStatus === 'CONFIRMED')) {
        await prisma.carListing.update({
          where: { id: targetCarId },
          data: { status: 'AVAILABLE' },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui data booking.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await prisma.testDriveBooking.findUnique({ where: { id } });
    
    // Restore car status to AVAILABLE if booking is deleted
    if (booking && booking.carListingId) {
      await prisma.carListing.update({
        where: { id: booking.carListingId },
        data: { status: 'AVAILABLE' },
      });
    }

    await prisma.testDriveBooking.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Gagal menghapus booking.' }, { status: 500 });
  }
}
