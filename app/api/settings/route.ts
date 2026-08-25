import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

async function ensureCategoryColumnsExist() {
  const alterStatements = [
    'ALTER TABLE "ShowroomSetting" ADD COLUMN "categoryBrandUrl" TEXT',
    'ALTER TABLE "ShowroomSetting" ADD COLUMN "categoryBodyUrl" TEXT',
    'ALTER TABLE "ShowroomSetting" ADD COLUMN "categoryCompareUrl" TEXT',
    'ALTER TABLE "ShowroomSetting" ADD COLUMN "categoryScheduleUrl" TEXT',
    'ALTER TABLE "ShowroomSetting" ADD COLUMN "categoryEventUrl" TEXT',
    'ALTER TABLE "ShowroomSetting" ADD COLUMN "email" TEXT',
  ];

  for (const sql of alterStatements) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (e) {
      // Column already exists in SQLite table
    }
  }
}

export async function GET() {
  try {
    await ensureCategoryColumnsExist();

    let settings: any = null;
    try {
      const rawRes: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "ShowroomSetting" LIMIT 1`);
      if (rawRes && rawRes.length > 0) {
        settings = rawRes[0];
      }
    } catch (e) {
      // Fallback to prisma ORM
      settings = await (prisma as any).showroomSetting.findFirst();
    }

    if (!settings) {
      settings = await (prisma as any).showroomSetting.create({
        data: {
          name: 'Rizkya Motor',
          logoUrl: '/logo.png',
          address: 'Jl. Raya Otomotif No. 88, Jakarta',
          phone: '0812-9988-7766',
          whatsapp: '6281299887766',
          operatingHoursText: '08:30 - 18:00 WIB',
          heroHomeUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop',
          heroCatalogUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2070&auto=format&fit=crop',
          heroSellUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop',
          heroScheduleUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2070&auto=format&fit=crop',
        },
      });
    } else if (!settings.logoUrl) {
      settings = await (prisma as any).showroomSetting.update({
        where: { id: settings.id },
        data: { logoUrl: '/logo.png' },
      });
    }

    let locations = await (prisma as any).showroomLocation.findMany({
      orderBy: { createdAt: 'asc' },
    });

    if (!locations || locations.length === 0) {
      await (prisma as any).showroomLocation.createMany({
        data: [
          { name: 'Showroom Utama Jakarta', address: 'Jl. Raya Otomotif No. 88, Jakarta Selatan', city: 'Jakarta', phone: '0812-9988-7766' },
          { name: 'Branch Showroom Tangerang', address: 'Jl. Boulevard Gading Serpong No. 12, Tangerang', city: 'Tangerang', phone: '0813-8877-6655' },
        ],
      });
      locations = await (prisma as any).showroomLocation.findMany({ orderBy: { createdAt: 'asc' } });
    }

    let heroBanners = await (prisma as any).heroBanner.findMany({
      orderBy: { order: 'asc' },
    });

    if (!heroBanners || heroBanners.length === 0) {
      await (prisma as any).heroBanner.createMany({
        data: [
          { imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop', order: 1, isActive: true },
          { imageUrl: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?q=80&w=2070&auto=format&fit=crop', order: 2, isActive: true },
          { imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070&auto=format&fit=crop', order: 3, isActive: true },
        ],
      });
      heroBanners = await (prisma as any).heroBanner.findMany({ orderBy: { order: 'asc' } });
    }

    return NextResponse.json({ settings, locations, heroBanners });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Gagal memuat pengaturan showroom.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'ADMIN' && role !== 'ADMIN_SHOWROOM')) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    await ensureCategoryColumnsExist();
    const body = await request.json();
    const { action } = body;

    if (action === 'UPDATE_SETTINGS') {
      const {
        name,
        logoUrl,
        address,
        phone,
        whatsapp,
        email,
        operatingHoursText,
        heroHomeUrl,
        heroCatalogUrl,
        heroSellUrl,
        heroScheduleUrl,
        categoryBrandUrl,
        categoryBodyUrl,
        categoryCompareUrl,
        categoryScheduleUrl,
        categoryEventUrl,
        instagramUrl,
        facebookUrl,
        tiktokUrl,
        youtubeUrl,
      } = body;

      let existing: any = null;
      try {
        const rawList: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "ShowroomSetting" LIMIT 1`);
        if (rawList && rawList.length > 0) existing = rawList[0];
      } catch (e) {
        existing = await (prisma as any).showroomSetting.findFirst();
      }

      let updated: any = null;
      const now = new Date().toISOString();

      if (existing) {
        try {
          updated = await (prisma as any).showroomSetting.update({
            where: { id: existing.id },
            data: {
              name: name !== undefined ? name : undefined,
              logoUrl: logoUrl !== undefined ? logoUrl : undefined,
              address: address !== undefined ? address : undefined,
              phone: phone !== undefined ? phone : undefined,
              whatsapp: whatsapp !== undefined ? whatsapp : undefined,
              email: email !== undefined ? email : undefined,
              operatingHoursText: operatingHoursText !== undefined ? operatingHoursText : undefined,
              heroHomeUrl: heroHomeUrl !== undefined ? heroHomeUrl : undefined,
              heroCatalogUrl: heroCatalogUrl !== undefined ? heroCatalogUrl : undefined,
              heroSellUrl: heroSellUrl !== undefined ? heroSellUrl : undefined,
              heroScheduleUrl: heroScheduleUrl !== undefined ? heroScheduleUrl : undefined,
              categoryBrandUrl: categoryBrandUrl !== undefined ? categoryBrandUrl : undefined,
              categoryBodyUrl: categoryBodyUrl !== undefined ? categoryBodyUrl : undefined,
              categoryCompareUrl: categoryCompareUrl !== undefined ? categoryCompareUrl : undefined,
              categoryScheduleUrl: categoryScheduleUrl !== undefined ? categoryScheduleUrl : undefined,
              categoryEventUrl: categoryEventUrl !== undefined ? categoryEventUrl : undefined,
              instagramUrl: instagramUrl !== undefined ? instagramUrl : undefined,
              facebookUrl: facebookUrl !== undefined ? facebookUrl : undefined,
              tiktokUrl: tiktokUrl !== undefined ? tiktokUrl : undefined,
              youtubeUrl: youtubeUrl !== undefined ? youtubeUrl : undefined,
            },
          });
        } catch (prismaErr) {
          // Dual-layer fallback using Raw SQL execution when Prisma Client DTO type is locked
          await prisma.$executeRawUnsafe(
            `UPDATE "ShowroomSetting" SET 
              "name" = ?, "logoUrl" = ?, "address" = ?, "phone" = ?, "whatsapp" = ?, "email" = ?,
              "operatingHoursText" = ?, "heroHomeUrl" = ?, "heroCatalogUrl" = ?, "heroSellUrl" = ?, "heroScheduleUrl" = ?,
              "categoryBrandUrl" = ?, "categoryBodyUrl" = ?, "categoryCompareUrl" = ?, "categoryScheduleUrl" = ?, "categoryEventUrl" = ?,
              "instagramUrl" = ?, "facebookUrl" = ?, "tiktokUrl" = ?, "youtubeUrl" = ?, "updatedAt" = ?
             WHERE "id" = ?`,
            name ?? existing.name ?? 'Rizkya Motor',
            logoUrl ?? existing.logoUrl ?? '',
            address ?? existing.address ?? '',
            phone ?? existing.phone ?? '',
            whatsapp ?? existing.whatsapp ?? '',
            email ?? existing.email ?? 'info@rizkyamotor.com',
            operatingHoursText ?? existing.operatingHoursText ?? '',
            heroHomeUrl ?? existing.heroHomeUrl ?? '',
            heroCatalogUrl ?? existing.heroCatalogUrl ?? '',
            heroSellUrl ?? existing.heroSellUrl ?? '',
            heroScheduleUrl ?? existing.heroScheduleUrl ?? '',
            categoryBrandUrl ?? existing.categoryBrandUrl ?? '',
            categoryBodyUrl ?? existing.categoryBodyUrl ?? '',
            categoryCompareUrl ?? existing.categoryCompareUrl ?? '',
            categoryScheduleUrl ?? existing.categoryScheduleUrl ?? '',
            categoryEventUrl ?? existing.categoryEventUrl ?? '',
            instagramUrl ?? existing.instagramUrl ?? '',
            facebookUrl ?? existing.facebookUrl ?? '',
            tiktokUrl ?? existing.tiktokUrl ?? '',
            youtubeUrl ?? existing.youtubeUrl ?? '',
            now,
            existing.id
          );
          const rawResult: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "ShowroomSetting" WHERE "id" = ? LIMIT 1`, existing.id);
          updated = rawResult?.[0];
        }
      } else {
        updated = await (prisma as any).showroomSetting.create({
          data: {
            name: name || 'Rizkya Motor',
            logoUrl: logoUrl || '/logo.png',
            address: address || '',
            phone: phone || '',
            whatsapp: whatsapp || '',
            email: email || 'info@rizkyamotor.com',
            operatingHoursText: operatingHoursText || '',
            heroHomeUrl: heroHomeUrl || '',
            heroCatalogUrl: heroCatalogUrl || '',
            heroSellUrl: heroSellUrl || '',
            heroScheduleUrl: heroScheduleUrl || '',
            categoryBrandUrl: categoryBrandUrl || '',
            categoryBodyUrl: categoryBodyUrl || '',
            categoryCompareUrl: categoryCompareUrl || '',
            categoryScheduleUrl: categoryScheduleUrl || '',
            categoryEventUrl: categoryEventUrl || '',
            instagramUrl: instagramUrl || '',
            facebookUrl: facebookUrl || '',
            tiktokUrl: tiktokUrl || '',
            youtubeUrl: youtubeUrl || '',
          },
        });
      }

      return NextResponse.json({ message: 'Pengaturan showroom berhasil disimpan!', settings: updated });
    }

    if (action === 'ADD_HERO_BANNER') {
      const { imageUrl } = body;
      const count = await (prisma as any).heroBanner.count();
      const banner = await (prisma as any).heroBanner.create({
        data: {
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop',
          order: count + 1,
          isActive: true,
        },
      });
      return NextResponse.json({ message: 'Slide carousel beranda berhasil ditambahkan!', banner });
    }

    if (action === 'UPDATE_HERO_BANNER') {
      const { id, imageUrl, isActive, order } = body;
      if (!id) return NextResponse.json({ error: 'ID banner wajib diisi.' }, { status: 400 });

      const banner = await (prisma as any).heroBanner.update({
        where: { id },
        data: {
          imageUrl: imageUrl !== undefined ? imageUrl : undefined,
          isActive: isActive !== undefined ? Boolean(isActive) : undefined,
          order: order !== undefined ? Number(order) : undefined,
        },
      });
      return NextResponse.json({ message: 'Banner slide beranda berhasil diperbarui!', banner });
    }

    if (action === 'DELETE_HERO_BANNER') {
      const { id } = body;
      if (!id) return NextResponse.json({ error: 'ID banner wajib diisi.' }, { status: 400 });

      await (prisma as any).heroBanner.delete({ where: { id } });
      return NextResponse.json({ message: 'Slide banner beranda berhasil dihapus.' });
    }

    if (action === 'ADD_LOCATION') {
      const { name, address, city, phone, mapUrl } = body;
      if (!name || !address || !city) {
        return NextResponse.json({ error: 'Nama, alamat, dan kota lokasi wajib diisi.' }, { status: 400 });
      }

      const loc = await (prisma as any).showroomLocation.create({
        data: { name, address, city, phone: phone || null, mapUrl: mapUrl || null, isActive: true },
      });
      return NextResponse.json({ message: 'Lokasi cabang baru berhasil ditambahkan!', location: loc });
    }

    if (action === 'UPDATE_LOCATION') {
      const { id, name, address, city, phone, mapUrl, isActive } = body;
      if (!id) return NextResponse.json({ error: 'ID lokasi wajib diisi.' }, { status: 400 });

      const loc = await (prisma as any).showroomLocation.update({
        where: { id },
        data: {
          name: name !== undefined ? name : undefined,
          address: address !== undefined ? address : undefined,
          city: city !== undefined ? city : undefined,
          phone: phone !== undefined ? phone : undefined,
          mapUrl: mapUrl !== undefined ? mapUrl : undefined,
          isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        },
      });
      return NextResponse.json({ message: 'Lokasi cabang berhasil diperbarui!', location: loc });
    }

    if (action === 'DELETE_LOCATION') {
      const { id } = body;
      if (!id) return NextResponse.json({ error: 'ID lokasi wajib diisi.' }, { status: 400 });

      await (prisma as any).showroomLocation.delete({ where: { id } });
      return NextResponse.json({ message: 'Lokasi cabang berhasil dihapus.' });
    }

    return NextResponse.json({ error: 'Aksi tidak dikenali.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in settings API:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan sistem saat memperbarui pengaturan.' }, { status: 500 });
  }
}
