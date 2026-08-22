import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const brand = searchParams.get('brand') || '';
    const model = searchParams.get('model') || '';
    const minYear = searchParams.get('minYear');
    const maxYear = searchParams.get('maxYear');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const transmission = searchParams.get('transmission') || '';
    const fuelType = searchParams.get('fuelType') || '';
    const bodyType = searchParams.get('bodyType') || '';
    const location = searchParams.get('location') || '';
    const sortBy = searchParams.get('sortBy') || 'newest';
    const includeAll = searchParams.get('includeAll') === 'true';

    const where: any = {};
    if (!includeAll) {
      where.status = { in: ['AVAILABLE', 'RESERVED', 'DP_PAID', 'BOOKED'] };
      where.isVisible = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { brand: { contains: search } },
        { model: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (brand) {
      where.brand = { equals: brand };
    }

    if (model) {
      where.model = { contains: model };
    }

    if (minYear || maxYear) {
      where.year = {};
      if (minYear) where.year.gte = parseInt(minYear, 10);
      if (maxYear) where.year.lte = parseInt(maxYear, 10);
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (transmission) {
      where.transmission = { equals: transmission };
    }

    if (fuelType) {
      if (fuelType === 'Bensin' || fuelType === 'Pertalite/Bensin') {
        where.fuelType = { in: ['Pertalite/Bensin', 'Bensin'] };
      } else {
        where.fuelType = { equals: fuelType };
      }
    }

    if (bodyType) {
      where.bodyType = { equals: bodyType };
    }

    if (location) {
      where.location = { contains: location };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sortBy === 'year_desc') {
      orderBy = { year: 'desc' };
    } else if (sortBy === 'mileage_asc') {
      orderBy = { mileage: 'asc' };
    }

    const cars = await prisma.carListing.findMany({
      where,
      orderBy,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil daftar unit mobil' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== 'ADMIN' && userRole !== 'ADMIN_SHOWROOM')) {
      return NextResponse.json(
        { error: 'Akses ditolak. Anda harus login sebagai Admin untuk menambah stok.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      brand,
      model,
      year,
      price,
      mileage,
      transmission,
      fuelType,
      bodyType,
      color,
      previousOwners,
      location,
      description,
      warrantyMonths,
      images,
    } = body;

    let creatorUserId = (session.user as any)?.id;

    // Check if creator user exists in database to avoid foreign key errors
    let userExists = creatorUserId
      ? await prisma.user.findUnique({ where: { id: creatorUserId } })
      : null;

    if (!userExists) {
      let admin = await prisma.user.findFirst({
        where: { role: { in: ['ADMIN', 'ADMIN_SHOWROOM'] } },
      });

      if (!admin) {
        admin = await prisma.user.create({
          data: {
            name: session.user?.name || 'Rizkya Motor Showroom Pusat',
            email: session.user?.email || 'admin@mobilku.id',
            password: '$2a$10$w3X1Yk8R4.vE84r1xH5t0.v3w1Yk8R4vE84r1xH5t0v3w1Yk8R4',
            role: 'ADMIN_SHOWROOM',
          },
        });
      }
      creatorUserId = admin.id;
    }

    const car = await prisma.carListing.create({
      data: {
        createdById: creatorUserId,
        title,
        brand,
        model,
        year: parseInt(year, 10),
        price: parseFloat(price),
        mileage: parseInt(mileage, 10),
        transmission,
        fuelType,
        bodyType,
        seats: parseInt(body.seats || '5', 10),
        color,
        plateNumber: body.plateNumber || 'B 1234 RFS',
        previousOwners: parseInt(previousOwners || '1', 10),
        location,
        description,
        features: typeof body.features === 'string' ? body.features : JSON.stringify(body.features || []),
        warrantyMonths: parseInt(warrantyMonths || '12', 10),
        isCertified: true,
        status: body.status || 'AVAILABLE',
        isVisible: body.isVisible !== undefined ? Boolean(body.isVisible) : true,
      },
    });

    if (images && Array.isArray(images) && images.length > 0) {
      await Promise.all(
        images.map((url: string, index: number) =>
          prisma.carImage.create({
            data: {
              carListingId: car.id,
              url,
              isPrimary: index === 0,
              order: index,
            },
          })
        )
      );
    }

    return NextResponse.json(car, { status: 201 });
  } catch (error: any) {
    console.error('Error creating car listing:', error);
    return NextResponse.json(
      { error: `Gagal menambahkan unit mobil ke database: ${error?.message || 'Terjadi kesalahan sistem.'}` },
      { status: 500 }
    );
  }
}
