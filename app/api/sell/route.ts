import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const {
      customerName,
      customerPhone,
      customerEmail,
      brand,
      model,
      year,
      transmission,
      fuelType,
      mileage,
      expectedPrice,
      city,
      description,
      inspectionDate,
      inspectionTime,
      images,
    } = body;

    if (!customerName || !customerPhone || !brand || !model || !year || !expectedPrice) {
      return NextResponse.json(
        { error: 'Harap lengkapi semua kolom wajib (Nama, WhatsApp, Merek, Model, Tahun, Ekspektasi Harga).' },
        { status: 400 }
      );
    }

    if (!images || !Array.isArray(images) || images.length < 2) {
      return NextResponse.json(
        { error: 'Harap unggah minimal 2 foto kondisi unit mobil Anda (misal: Tampak Depan & Interior/STNK).' },
        { status: 400 }
      );
    }

    const submission = await prisma.sellSubmission.create({
      data: {
        userId: (session?.user as any)?.id || null,
        customerName,
        customerPhone,
        customerEmail: customerEmail || session?.user?.email || null,
        brand,
        model,
        year: parseInt(year, 10),
        transmission: transmission || 'Automatic',
        fuelType: fuelType || 'Pertalite/Bensin',
        mileage: parseInt(mileage || '0', 10),
        expectedPrice: parseFloat(expectedPrice),
        city: city || 'Jakarta',
        description: description || '',
        inspectionDate: inspectionDate || null,
        inspectionTime: inspectionTime || null,
        images: JSON.stringify(images),
        status: 'PENDING',
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error('Error creating sell submission:', error);
    return NextResponse.json(
      { error: 'Gagal mengirim pengajuan jual mobil. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const myParam = searchParams.get('my');

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Harap login terlebih dahulu' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;
    const userEmail = session.user.email;

    const whereCondition: any = {};

    if (myParam === 'true' || (userRole !== 'ADMIN' && userRole !== 'ADMIN_SHOWROOM')) {
      whereCondition.OR = [
        ...(userId ? [{ userId }] : []),
        ...(userEmail ? [{ customerEmail: userEmail }] : []),
      ];
    }

    const submissions = await prisma.sellSubmission.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data pengajuan jual mobil.' }, { status: 500 });
  }
}
