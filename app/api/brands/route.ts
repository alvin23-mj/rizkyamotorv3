import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

const DEFAULT_BRANDS = [
  { name: 'Toyota', logoUrl: '/brands/toyota.svg', description: 'Kendaraan Tangguh & Efisien' },
  { name: 'Honda', logoUrl: '/brands/honda.svg', description: 'Desain Sporty & Teknologi Masa Kini' },
  { name: 'BMW', logoUrl: '/brands/bmw.svg', description: 'Mobil Mewah Performa Tinggi' },
  { name: 'Mercedes-Benz', logoUrl: '/brands/mercedes.svg', description: 'Simbol Kemewahan & Kenyamanan' },
  { name: 'Mitsubishi', logoUrl: '/brands/mitsubishi.svg', description: 'Tangguh Berpetualang' },
  { name: 'Hyundai', logoUrl: '/brands/hyundai.svg', description: 'Inovasi Futuristik & Mobil EV' },
  { name: 'Suzuki', logoUrl: '/brands/suzuki.svg', description: 'Irit & Handal Harian' },
  { name: 'Mazda', logoUrl: '/brands/mazda.svg', description: 'Filosofi Jinba Ittai' },
  { name: 'Audi', logoUrl: '/brands/audi.svg', description: 'Teknologi Quattro & Kemewahan' },
  { name: 'Ford', logoUrl: '/brands/ford.svg', description: 'Performa & Ketangguhan Amerika' },
  { name: 'Nissan', logoUrl: '/brands/nissan.svg', description: 'Inovasi Yang Mengagumkan' },
  { name: 'Ferrari', logoUrl: '/brands/ferrari.svg', description: 'Supercar Eksklusif Italia' },
  { name: 'Porsche', logoUrl: '/brands/porsche.svg', description: 'Mobil Sport Legendaris' },
  { name: 'Lexus', logoUrl: '/brands/lexus.svg', description: 'Kemewahan & Kenyamanan Jepang' },
  { name: 'Tesla', logoUrl: '/brands/tesla.svg', description: 'Pionir Mobil Listrik Canggih' },
  { name: 'Chevrolet', logoUrl: '/brands/chevrolet.svg', description: 'Ketahanan & Kenyamanan' },
  { name: 'Aston Martin', logoUrl: '/brands/astonmartin.svg', description: 'Kemewahan & Kecepatan Britania' },
];

export async function GET() {
  try {
    let brands = await (prisma as any).brand.findMany({
      orderBy: { order: 'asc' },
    });

    if (!brands || brands.length === 0) {
      for (let i = 0; i < DEFAULT_BRANDS.length; i++) {
        const b = DEFAULT_BRANDS[i];
        await (prisma as any).brand.create({
          data: {
            name: b.name,
            logoUrl: b.logoUrl,
            description: b.description,
            order: i + 1,
            isFeatured: true,
          },
        });
      }
      brands = await (prisma as any).brand.findMany({ orderBy: { order: 'asc' } });
    }

    return NextResponse.json(brands);
  } catch (error: any) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Gagal memuat merek.' }, { status: 500 });
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
    const { name, logoUrl, description, order, isFeatured } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nama merek wajib diisi.' }, { status: 400 });
    }

    const brand = await (prisma as any).brand.create({
      data: {
        name,
        logoUrl: logoUrl || null,
        description: description || null,
        order: order ? parseInt(order, 10) : 0,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : true,
      },
    });

    return NextResponse.json({ message: 'Merek berhasil ditambahkan!', brand });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menambahkan merek.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'ADMIN' && role !== 'ADMIN_SHOWROOM')) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, logoUrl, description, order, isFeatured } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID merek wajib diisi.' }, { status: 400 });
    }

    const brand = await (prisma as any).brand.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        description: description !== undefined ? description : undefined,
        order: order !== undefined ? parseInt(order, 10) : undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
      },
    });

    return NextResponse.json({ message: 'Merek berhasil diperbarui!', brand });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memperbarui merek.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'ADMIN' && role !== 'ADMIN_SHOWROOM')) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID tidak boleh kosong.' }, { status: 400 });
    }

    await (prisma as any).brand.delete({ where: { id } });

    return NextResponse.json({ message: 'Merek berhasil dihapus.' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus merek.' }, { status: 500 });
  }
}
