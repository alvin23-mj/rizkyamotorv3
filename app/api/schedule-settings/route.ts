import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

const DEFAULT_SLOTS = [
  '09:00 - 10:30 WIB',
  '11:00 - 12:30 WIB',
  '13:00 - 14:30 WIB',
  '15:00 - 16:30 WIB',
  '17:00 - 18:30 WIB',
];

export async function GET() {
  try {
    let slots: any[] = [];
    let closures: any[] = [];

    if ((prisma as any).operatingHour) {
      slots = await (prisma as any).operatingHour.findMany({ orderBy: { timeSlot: 'asc' } });
      closures = await (prisma as any).showroomClosure.findMany({ orderBy: { closedDate: 'asc' } });
    } else {
      slots = await prisma.$queryRaw`SELECT * FROM "OperatingHour" ORDER BY "timeSlot" ASC`;
      closures = await prisma.$queryRaw`SELECT * FROM "ShowroomClosure" ORDER BY "closedDate" ASC`;
    }

    if (!slots || slots.length === 0) {
      for (const slotStr of DEFAULT_SLOTS) {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        await prisma.$executeRaw`INSERT INTO "OperatingHour" ("id", "timeSlot", "maxQuota", "isActive", "createdAt", "updatedAt") VALUES (${id}, ${slotStr}, 3, 1, ${now}, ${now})`;
      }
      slots = await prisma.$queryRaw`SELECT * FROM "OperatingHour" ORDER BY "timeSlot" ASC`;
    }

    // Convert integer boolean 1/0 from SQLite raw query if needed
    const normalizedSlots = slots.map((s) => ({
      ...s,
      isActive: Boolean(s.isActive),
    }));

    return NextResponse.json({ operatingHours: normalizedSlots, closures });
  } catch (error: any) {
    console.error('Error fetching schedule settings:', error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== 'ADMIN' && userRole !== 'ADMIN_SHOWROOM')) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Admin yang dapat mengelola jadwal.' }, { status: 401 });
    }

    const body = await request.json();
    const { action, timeSlot, maxQuota, closedDate, reason } = body;

    // Action 1: Add or Update Operating Hour Time Slot
    if (action === 'ADD_SLOT') {
      if (!timeSlot) {
        return NextResponse.json({ error: 'Jam slot tidak boleh kosong.' }, { status: 400 });
      }

      const quota = maxQuota ? parseInt(maxQuota, 10) : 3;
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      if ((prisma as any).operatingHour) {
        await (prisma as any).operatingHour.upsert({
          where: { timeSlot },
          update: { maxQuota: quota, isActive: true },
          create: { timeSlot, maxQuota: quota, isActive: true },
        });
      } else {
        await prisma.$executeRaw`INSERT INTO "OperatingHour" ("id", "timeSlot", "maxQuota", "isActive", "createdAt", "updatedAt") VALUES (${id}, ${timeSlot}, ${quota}, 1, ${now}, ${now}) ON CONFLICT("timeSlot") DO UPDATE SET "maxQuota" = ${quota}, "isActive" = 1`;
      }
      return NextResponse.json({ message: 'Slot jam berhasil ditambahkan!' });
    }

    // Action 2: Add Emergency Showroom Closure Date ("Tutup Mendadak")
    if (action === 'ADD_CLOSURE') {
      if (!closedDate || !reason) {
        return NextResponse.json({ error: 'Tanggal tutup & alasan wajib diisi.' }, { status: 400 });
      }

      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      if ((prisma as any).showroomClosure) {
        await (prisma as any).showroomClosure.upsert({
          where: { closedDate },
          update: { reason },
          create: { closedDate, reason },
        });
      } else {
        await prisma.$executeRaw`INSERT INTO "ShowroomClosure" ("id", "closedDate", "reason", "createdAt") VALUES (${id}, ${closedDate}, ${reason}, ${now}) ON CONFLICT("closedDate") DO UPDATE SET "reason" = ${reason}`;
      }
      return NextResponse.json({ message: 'Jadwal tutup showroom berhasil ditetapkan!' });
    }

    return NextResponse.json({ error: 'Aksi tidak valid.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating schedule settings:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== 'ADMIN' && userRole !== 'ADMIN_SHOWROOM')) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, isActive, maxQuota } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID slot tidak valid.' }, { status: 400 });
    }

    if ((prisma as any).operatingHour) {
      await (prisma as any).operatingHour.update({
        where: { id },
        data: {
          isActive: isActive !== undefined ? isActive : undefined,
          maxQuota: maxQuota !== undefined ? parseInt(maxQuota, 10) : undefined,
        },
      });
    } else {
      if (isActive !== undefined) {
        const activeVal = isActive ? 1 : 0;
        await prisma.$executeRaw`UPDATE "OperatingHour" SET "isActive" = ${activeVal}, "updatedAt" = ${new Date().toISOString()} WHERE "id" = ${id}`;
      }
      if (maxQuota !== undefined) {
        const quotaVal = parseInt(maxQuota, 10);
        await prisma.$executeRaw`UPDATE "OperatingHour" SET "maxQuota" = ${quotaVal}, "updatedAt" = ${new Date().toISOString()} WHERE "id" = ${id}`;
      }
    }

    return NextResponse.json({ message: 'Slot jam berhasil diperbarui!' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui slot jam.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== 'ADMIN' && userRole !== 'ADMIN_SHOWROOM')) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID tidak boleh kosong.' }, { status: 400 });
    }

    if (type === 'CLOSURE') {
      if ((prisma as any).showroomClosure) {
        await (prisma as any).showroomClosure.delete({ where: { id } });
      } else {
        await prisma.$executeRaw`DELETE FROM "ShowroomClosure" WHERE "id" = ${id}`;
      }
      return NextResponse.json({ message: 'Status libur/tutup berhasil dihapus. Showroom BUKA kembali pada tanggal tersebut.' });
    } else if (type === 'SLOT') {
      if ((prisma as any).operatingHour) {
        await (prisma as any).operatingHour.delete({ where: { id } });
      } else {
        await prisma.$executeRaw`DELETE FROM "OperatingHour" WHERE "id" = ${id}`;
      }
      return NextResponse.json({ message: 'Slot jam berhasil dihapus.' });
    }

    return NextResponse.json({ error: 'Tipe tidak valid.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus data.' }, { status: 500 });
  }
}
