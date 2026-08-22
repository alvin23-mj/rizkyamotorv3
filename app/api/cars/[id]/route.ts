import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Increment views counter
    await prisma.carListing.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    }).catch(() => {});

    const car = await prisma.carListing.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            avatar: true,
          },
        },
      },
    });

    if (!car) {
      return NextResponse.json(
        { error: 'Mobil tidak ditemukan' },
        { status: 404 }
      );
    }

    // Fetch related showroom cars
    const relatedCars = await prisma.carListing.findMany({
      where: {
        id: { not: car.id },
        status: 'AVAILABLE',
        isVisible: true,
        OR: [{ brand: car.brand }, { bodyType: car.bodyType }],
      },
      take: 4,
      include: {
        images: { orderBy: { order: 'asc' } },
        createdBy: {
          select: { name: true, role: true },
        },
      },
    });

    return NextResponse.json({ car, relatedCars });
  } catch (error: any) {
    console.error('Error fetching car detail:', error);
    return NextResponse.json(
      { error: 'Gagal memuat detail mobil' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== 'ADMIN' && userRole !== 'ADMIN_SHOWROOM')) {
      return NextResponse.json({ error: 'Akses ditolak. Anda tidak memiliki izin.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.brand !== undefined) updateData.brand = body.brand;
    if (body.model !== undefined) updateData.model = body.model;
    if (body.year !== undefined) updateData.year = parseInt(body.year, 10);
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.mileage !== undefined) updateData.mileage = parseInt(body.mileage, 10);
    if (body.transmission !== undefined) updateData.transmission = body.transmission;
    if (body.fuelType !== undefined) updateData.fuelType = body.fuelType;
    if (body.bodyType !== undefined) updateData.bodyType = body.bodyType;
    if (body.seats !== undefined) updateData.seats = parseInt(body.seats, 10);
    if (body.color !== undefined) updateData.color = body.color;
    if (body.plateNumber !== undefined) updateData.plateNumber = body.plateNumber;
    if (body.previousOwners !== undefined) updateData.previousOwners = parseInt(body.previousOwners, 10);
    if (body.location !== undefined) updateData.location = body.location;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.features !== undefined) updateData.features = body.features;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.isVisible !== undefined) updateData.isVisible = Boolean(body.isVisible);
    if (body.warrantyMonths !== undefined) updateData.warrantyMonths = parseInt(body.warrantyMonths, 10);

    const updated = await prisma.carListing.update({
      where: { id },
      data: updateData,
    });

    if (body.images && Array.isArray(body.images) && body.images.length > 0) {
      await prisma.carImage.deleteMany({ where: { carListingId: id } });
      await Promise.all(
        body.images.map((img: any, index: number) => {
          const imageUrl = typeof img === 'string' ? img : (img?.url || '');
          return prisma.carImage.create({
            data: {
              carListingId: id,
              url: imageUrl,
              isPrimary: typeof img === 'object' && img?.isPrimary !== undefined ? img.isPrimary : index === 0,
              order: typeof img === 'object' && img?.order !== undefined ? img.order : index,
            },
          });
        })
      );
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating car listing:', error);
    return NextResponse.json({ error: `Gagal memperbarui data mobil: ${error?.message || 'Terjadi kesalahan'}` }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== 'ADMIN' && userRole !== 'ADMIN_SHOWROOM')) {
      return NextResponse.json({ error: 'Akses ditolak. Anda tidak memiliki izin.' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.carListing.delete({ where: { id } });

    return NextResponse.json({ message: 'Stok mobil berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus mobil' }, { status: 500 });
  }
}
