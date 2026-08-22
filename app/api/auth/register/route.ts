import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const globalUsers = globalThis as unknown as { registeredUsersMap?: Record<string, any> };

function getMemoryStore() {
  if (!globalUsers.registeredUsersMap) {
    globalUsers.registeredUsersMap = {};
  }
  return globalUsers.registeredUsersMap;
}

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
    const memoryStore = getMemoryStore();

    // Check if user exists in memory map
    if (memoryStore[cleanEmail]) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar di sistem. Silakan login.' },
        { status: 400 }
      );
    }

    let existingUser: any = null;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
    } catch (e) {
      try {
        const rawRes: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "User" WHERE "email" = ? LIMIT 1`, cleanEmail);
        if (rawRes && rawRes.length > 0) existingUser = rawRes[0];
      } catch (err) {
        // Ignore read errors if any
      }
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar di sistem. Silakan login.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const userPayload = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: 'USER',
      phone: phone ? phone.trim() : null,
    };

    let newUser: any = null;

    try {
      newUser = await prisma.user.create({
        data: userPayload,
      });
    } catch (prismaErr: any) {
      try {
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
        newUser = userPayload;
      } catch (sqlErr) {
        // Vercel read-only filesystem fallback: store in memory map
        newUser = userPayload;
      }
    }

    // Always cache in memory map so user can login immediately on Vercel
    memoryStore[cleanEmail] = newUser;

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
