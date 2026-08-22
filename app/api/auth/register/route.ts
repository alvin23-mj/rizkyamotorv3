import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama, email, dan kata sandi wajib diisi' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    let existingUser: any = null;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
    } catch (e) {
      const rawRes: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "User" WHERE "email" = ? LIMIT 1`, cleanEmail);
      if (rawRes && rawRes.length > 0) existingUser = rawRes[0];
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar di sistem. Silakan login.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let newUser: any = null;

    try {
      newUser = await prisma.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          password: hashedPassword,
          role: 'USER',
          phone: phone ? phone.trim() : null,
        },
      });
    } catch (prismaErr: any) {
      // Raw SQL Fallback if Prisma delegate is locked
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const now = new Date().toISOString();
      await prisma.$executeRawUnsafe(
        `INSERT INTO "User" ("id", "name", "email", "password", "role", "phone", "createdAt", "updatedAt") 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        userId,
        name.trim(),
        cleanEmail,
        hashedPassword,
        'USER',
        phone ? phone.trim() : null,
        now,
        now
      );
      newUser = { id: userId, name: name.trim(), email: cleanEmail, role: 'USER' };
    }

    return NextResponse.json(
      {
        message: 'Pendaftaran akun berhasil!',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mendaftarkan akun baru.' },
      { status: 500 }
    );
  }
}
