import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'ADMIN' && role !== 'ADMIN_SHOWROOM')) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Admin yang dapat mengelola pengguna.' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Gagal memuat daftar pengguna.' }, { status: 500 });
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
    const { name, email, password, role: userRole, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nama, email, dan kata sandi wajib diisi.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole || 'USER',
        phone: phone || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ message: 'Pengguna baru berhasil dibuat!', user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menambahkan pengguna.' }, { status: 500 });
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
    const { id, name, role: userRole, phone, password } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID pengguna wajib diisi.' }, { status: 400 });
    }

    let updateData: any = {
      name: name !== undefined ? name : undefined,
      role: userRole !== undefined ? userRole : undefined,
      phone: phone !== undefined ? phone : undefined,
    };

    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ message: 'Data pengguna berhasil diperbarui!', user });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memperbarui pengguna.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id;
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'ADMIN' && role !== 'ADMIN_SHOWROOM')) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID pengguna tidak boleh kosong.' }, { status: 400 });
    }

    if (id === currentUserId) {
      return NextResponse.json({ error: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: 'Pengguna berhasil dihapus.' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus pengguna.' }, { status: 500 });
  }
}
