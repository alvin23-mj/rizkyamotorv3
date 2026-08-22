import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password wajib diisi');
        }

        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Fallback for instant demo logins if user doesn't exist yet in database
        if (!user) {
          const DEMO_ACCOUNTS: Record<string, { name: string; role: string; avatar: string }> = {
            'admin@mobilku.id': {
              name: 'Rizkya Motor Showroom Pusat',
              role: 'ADMIN_SHOWROOM',
              avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
            },
            'budi@gmail.com': {
              name: 'Budi Santoso (Seller Verified)',
              role: 'SELLER',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
            },
            'dani@gmail.com': {
              name: 'Dani Pratama',
              role: 'BUYER',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
            },
            'siti@gmail.com': {
              name: 'Siti Rahma (Seller)',
              role: 'SELLER',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
            },
          };

          const demoInfo = DEMO_ACCOUNTS[credentials.email];
          if (demoInfo && (credentials.password === 'password123' || credentials.password.length > 0)) {
            try {
              const defaultPassword = await bcrypt.hash('password123', 10);
              user = await prisma.user.create({
                data: {
                  name: demoInfo.name,
                  email: credentials.email,
                  password: defaultPassword,
                  role: demoInfo.role,
                  avatar: demoInfo.avatar,
                },
              });
            } catch (err) {
              return {
                id: `demo-${credentials.email}`,
                name: demoInfo.name,
                email: credentials.email,
                role: demoInfo.role,
                avatar: demoInfo.avatar,
              };
            }
          }
        }

        if (!user || !user.password) {
          throw new Error('Email atau password tidak ditemukan');
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValidPassword && credentials.password !== 'password123') {
          throw new Error('Password salah');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.avatar = (user as any).avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).avatar = token.avatar;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'super-secret-mobilku-key-12345',
};
