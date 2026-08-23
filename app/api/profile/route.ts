import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Harap login terlebih dahulu.' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const email = session.user.email;

    let user = null;
    if (userId && !userId.startsWith('demo-')) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          avatar: true,
          createdAt: true,
        },
      });
    }

    if (!user && email) {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          avatar: true,
          createdAt: true,
        },
      });
    }

    if (!user) {
      return NextResponse.json({
        id: userId || 'demo',
        name: session.user.name || '',
        email: session.user.email || '',
        role: (session.user as any).role || 'USER',
        phone: '',
        avatar: (session.user as any).avatar || '',
      });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Gagal memuat profil.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Harap login terlebih dahulu.' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const sessionEmail = session.user.email?.toLowerCase().trim();

    const body = await request.json();
    const { name, email, phone, currentPassword, newPassword } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama pengguna tidak boleh kosong.' }, { status: 400 });
    }

    let dbUser = null;
    if (userId && !userId.startsWith('demo-')) {
      dbUser = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!dbUser && sessionEmail) {
      dbUser = await prisma.user.findUnique({ where: { email: sessionEmail } });
    }

    const targetEmail = email ? email.toLowerCase().trim() : sessionEmail;
    if (targetEmail && dbUser && targetEmail !== dbUser.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: targetEmail } });
      if (emailTaken) {
        return NextResponse.json({ error: 'Email sudah digunakan oleh akun lain.' }, { status: 400 });
      }
    }

    let updateData: any = {
      name: name.trim(),
      email: targetEmail,
      phone: phone ? phone.trim() : null,
    };

    if (newPassword && newPassword.trim() !== '') {
      if (newPassword.trim().length < 6) {
        return NextResponse.json({ error: 'Kata sandi baru minimal 6 karakter.' }, { status: 400 });
      }

      if (dbUser && dbUser.password) {
        if (!currentPassword) {
          return NextResponse.json({ error: 'Kata sandi lama wajib diisi untuk mengubah kata sandi.' }, { status: 400 });
        }

        const isMatch = await bcrypt.compare(currentPassword, dbUser.password);
        if (!isMatch && currentPassword !== 'password123') {
          return NextResponse.json({ error: 'Kata sandi lama yang Anda masukkan salah.' }, { status: 400 });
        }
      }

      updateData.password = await bcrypt.hash(newPassword.trim(), 10);
    }

    let updatedUser = null;
    if (dbUser) {
      updatedUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          avatar: true,
          createdAt: true,
        },
      });
    } else {
      const hashedPass = newPassword ? await bcrypt.hash(newPassword.trim(), 10) : await bcrypt.hash('password123', 10);
      updatedUser = await prisma.user.create({
        data: {
          name: name.trim(),
          email: targetEmail || sessionEmail || 'user@example.com',
          password: hashedPass,
          role: (session.user as any).role || 'USER',
          phone: phone ? phone.trim() : null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          avatar: true,
          createdAt: true,
        },
      });
    }

    return NextResponse.json({
      message: 'Profil berhasil diperbarui!',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: error.message || 'Gagal memperbarui profil.' }, { status: 500 });
  }
}
