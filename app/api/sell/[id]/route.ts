import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== 'ADMIN' && userRole !== 'ADMIN_SHOWROOM')) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Admin yang dapat mengelola pengajuan jual.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.sellSubmission.update({
      where: { id },
      data: {
        status: body.status,
        offerPrice: body.offerPrice !== undefined ? parseFloat(body.offerPrice) : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
        inspectionDate: body.inspectionDate !== undefined ? body.inspectionDate : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui pengajuan jual' }, { status: 500 });
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
      return NextResponse.json({ error: 'Akses ditolak. Hanya Admin yang dapat menghapus pengajuan jual.' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.sellSubmission.delete({ where: { id } });

    return NextResponse.json({ message: 'Pengajuan jual mobil berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus pengajuan jual' }, { status: 500 });
  }
}
