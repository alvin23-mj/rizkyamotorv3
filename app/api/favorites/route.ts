import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        carListing: {
          include: {
            images: { orderBy: { order: 'asc' } },
            createdBy: {
              select: { name: true, role: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(favorites);
  } catch (error: any) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Gagal mengambil favorit' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Harap login terlebih dahulu' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { carListingId } = await request.json();

    if (!carListingId) {
      return NextResponse.json({ error: 'ID mobil diperlukan' }, { status: 400 });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_carListingId: {
          userId,
          carListingId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ favorited: false, message: 'Dihapus dari favorit' });
    } else {
      await prisma.favorite.create({
        data: {
          userId,
          carListingId,
        },
      });
      return NextResponse.json({ favorited: true, message: 'Ditambahkan ke favorit' });
    }
  } catch (error: any) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json({ error: 'Gagal mengubah favorit' }, { status: 500 });
  }
}
