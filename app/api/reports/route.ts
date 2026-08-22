import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || (role !== 'ADMIN' && role !== 'ADMIN_SHOWROOM')) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya Admin yang memiliki wewenang untuk mengakses laporan showroom.' },
        { status: 401 }
      );
    }

    // Fetch all cars inventory
    const cars = await prisma.carListing.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        brand: true,
        model: true,
        year: true,
        price: true,
        mileage: true,
        transmission: true,
        fuelType: true,
        bodyType: true,
        color: true,
        plateNumber: true,
        location: true,
        status: true,
        isVisible: true,
        warrantyMonths: true,
        isCertified: true,
        viewsCount: true,
        createdAt: true,
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    // Fetch all sell submissions
    const sellSubmissions = await prisma.sellSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        brand: true,
        model: true,
        year: true,
        transmission: true,
        fuelType: true,
        mileage: true,
        expectedPrice: true,
        offerPrice: true,
        city: true,
        inspectionDate: true,
        inspectionTime: true,
        status: true,
        notes: true,
        createdAt: true,
        user: {
          select: { name: true, email: true },
        },
      },
    });

    // Fetch test drive bookings
    const testDriveBookings = await prisma.testDriveBooking.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        bookingDate: true,
        bookingTime: true,
        status: true,
        notes: true,
        createdAt: true,
        carListing: {
          select: {
            id: true,
            title: true,
            brand: true,
            model: true,
            plateNumber: true,
            price: true,
          },
        },
      },
    });

    // Fetch users
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    // Compute aggregated metrics
    const summary = {
      cars: {
        total: cars.length,
        available: cars.filter((c) => c.status === 'AVAILABLE').length,
        reserved: cars.filter((c) => c.status === 'RESERVED' || c.status === 'BOOKED').length,
        sold: cars.filter((c) => c.status === 'SOLD').length,
        totalValuationAvailable: cars
          .filter((c) => c.status === 'AVAILABLE')
          .reduce((acc, c) => acc + c.price, 0),
        totalValuationAll: cars.reduce((acc, c) => acc + c.price, 0),
      },
      submissions: {
        total: sellSubmissions.length,
        pending: sellSubmissions.filter((s) => s.status === 'PENDING').length,
        contacted: sellSubmissions.filter((s) => s.status === 'CONTACTED').length,
        inspecting: sellSubmissions.filter((s) => s.status === 'INSPECTING').length,
        offered: sellSubmissions.filter((s) => s.status === 'OFFERED').length,
        accepted: sellSubmissions.filter((s) => s.status === 'ACCEPTED').length,
        rejected: sellSubmissions.filter((s) => s.status === 'REJECTED').length,
        totalExpectedValue: sellSubmissions.reduce((acc, s) => acc + s.expectedPrice, 0),
      },
      testDrives: {
        total: testDriveBookings.length,
        pending: testDriveBookings.filter((b) => b.status === 'PENDING').length,
        confirmed: testDriveBookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'CONFIRMED_DP').length,
        completed: testDriveBookings.filter((b) => b.status === 'COMPLETED').length,
        cancelled: testDriveBookings.filter((b) => b.status === 'CANCELLED').length,
      },
      users: {
        total: users.length,
        adminCount: users.filter((u) => u.role === 'ADMIN' || u.role === 'ADMIN_SHOWROOM').length,
        userCount: users.filter((u) => u.role === 'USER').length,
      },
    };

    return NextResponse.json({
      summary,
      cars,
      sellSubmissions,
      testDriveBookings,
      users,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching report data:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data laporan showroom. Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
