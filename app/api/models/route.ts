import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// GET list of models, optionally filtered by brand name or brandId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandParam = searchParams.get('brand') || searchParams.get('brandName');
    const brandIdParam = searchParams.get('brandId');

    let models: any[] = [];

    if ((prisma as any).carModel) {
      const where: any = {};
      if (brandIdParam) {
        where.brandId = brandIdParam;
      } else if (brandParam) {
        where.brand = {
          name: {
            equals: brandParam,
          },
        };
      }

      models = await (prisma as any).carModel.findMany({
        where,
        orderBy: { name: 'asc' },
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
            },
          },
        },
      });
    } else {
      // Robust raw SQL fallback
      if (brandIdParam) {
        models = await prisma.$queryRawUnsafe(
          `SELECT cm.id, cm.name, cm.bodyType, cm.brandId, b.name as brandName, b.logoUrl as brandLogoUrl
           FROM CarModel cm
           JOIN Brand b ON cm.brandId = b.id
           WHERE cm.brandId = ?
           ORDER BY cm.name ASC`,
          brandIdParam
        );
      } else if (brandParam) {
        models = await prisma.$queryRawUnsafe(
          `SELECT cm.id, cm.name, cm.bodyType, cm.brandId, b.name as brandName, b.logoUrl as brandLogoUrl
           FROM CarModel cm
           JOIN Brand b ON cm.brandId = b.id
           WHERE LOWER(b.name) = LOWER(?)
           ORDER BY cm.name ASC`,
          brandParam
        );
      } else {
        models = await prisma.$queryRawUnsafe(
          `SELECT cm.id, cm.name, cm.bodyType, cm.brandId, b.name as brandName, b.logoUrl as brandLogoUrl
           FROM CarModel cm
           JOIN Brand b ON cm.brandId = b.id
           ORDER BY cm.name ASC`
        );
      }

      models = models.map((m: any) => ({
        id: m.id,
        name: m.name,
        bodyType: m.bodyType,
        brandId: m.brandId,
        brand: {
          id: m.brandId,
          name: m.brandName,
          logoUrl: m.brandLogoUrl,
        },
      }));
    }

    return NextResponse.json(models);
  } catch (error: any) {
    console.error('Error fetching models:', error);
    return NextResponse.json({ error: 'Gagal memuat daftar model mobil.' }, { status: 500 });
  }
}

// POST create model associated with a brand
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== 'ADMIN' && userRole !== 'ADMIN_SHOWROOM')) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const body = await request.json();
    const { brandId, brandName, name, bodyType } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama model mobil wajib diisi.' }, { status: 400 });
    }

    let targetBrand = null;
    if (brandId) {
      targetBrand = await prisma.brand.findUnique({ where: { id: brandId } });
    } else if (brandName) {
      targetBrand = await prisma.brand.findFirst({
        where: { name: brandName.trim() },
      });
      if (!targetBrand) {
        targetBrand = await prisma.brand.create({
          data: { name: brandName.trim() },
        });
      }
    }

    if (!targetBrand) {
      return NextResponse.json({ error: 'Pilih atau tentukan merek yang valid.' }, { status: 400 });
    }

    let newModel: any;

    if ((prisma as any).carModel) {
      const existing = await (prisma as any).carModel.findFirst({
        where: {
          brandId: targetBrand.id,
          name: name.trim(),
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: `Model "${name.trim()}" sudah terdaftar untuk merek ${targetBrand.name}.` },
          { status: 400 }
        );
      }

      newModel = await (prisma as any).carModel.create({
        data: {
          brandId: targetBrand.id,
          name: name.trim(),
          bodyType: bodyType ? bodyType.trim() : null,
        },
        include: {
          brand: true,
        },
      });
    } else {
      const newId = `cm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await prisma.$executeRawUnsafe(
        `INSERT INTO CarModel (id, brandId, name, bodyType, createdAt, updatedAt) VALUES (?, ?, ?, ?, DATETIME('now'), DATETIME('now'))`,
        newId,
        targetBrand.id,
        name.trim(),
        bodyType ? bodyType.trim() : null
      );
      newModel = {
        id: newId,
        brandId: targetBrand.id,
        name: name.trim(),
        bodyType: bodyType ? bodyType.trim() : null,
        brand: targetBrand,
      };
    }

    return NextResponse.json({ message: `Model "${newModel.name}" berhasil ditambahkan!`, model: newModel });
  } catch (error: any) {
    console.error('Error creating model:', error);
    return NextResponse.json({ error: error.message || 'Gagal menyimpan model mobil.' }, { status: 500 });
  }
}

// DELETE model (Single or Bulk)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== 'ADMIN' && userRole !== 'ADMIN_SHOWROOM')) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    const idsParam = searchParams.get('ids');

    let idsToDelete: string[] = [];
    if (idsParam) {
      idsToDelete = idsParam.split(',').filter(Boolean);
    } else if (idParam) {
      idsToDelete = [idParam];
    } else {
      const body = await request.json().catch(() => ({}));
      if (body.ids && Array.isArray(body.ids)) {
        idsToDelete = body.ids;
      }
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json({ error: 'ID model wajib diberikan.' }, { status: 400 });
    }

    if ((prisma as any).carModel) {
      await (prisma as any).carModel.deleteMany({
        where: { id: { in: idsToDelete } },
      });
    } else {
      const placeholders = idsToDelete.map(() => '?').join(',');
      await prisma.$executeRawUnsafe(`DELETE FROM CarModel WHERE id IN (${placeholders})`, ...idsToDelete);
    }

    return NextResponse.json({ message: `${idsToDelete.length} model mobil berhasil dihapus!` });
  } catch (error: any) {
    console.error('Error deleting model:', error);
    return NextResponse.json({ error: 'Gagal menghapus model mobil.' }, { status: 500 });
  }
}
