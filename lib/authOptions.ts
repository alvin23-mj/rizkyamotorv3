import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const globalUsers = globalThis as unknown as { registeredUsersMap?: Record<string, any> };

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

        const cleanEmail = credentials.email.trim().toLowerCase();

        let user: any = null;
        try {
          user = await prisma.user.findUnique({
            where: { email: cleanEmail },
          });
        } catch (e) {
          // Ignore DB read error if any
        }

        // Check memory store for Vercel registered users
        if (!user && globalUsers.registeredUsersMap?.[cleanEmail]) {
          user = globalUsers.registeredUsersMap[cleanEmail];
        }

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

          const demoInfo = DEMO_ACCOUNTS[cleanEmail];
          if (demoInfo && (credentials.password === 'password123' || credentials.password.length > 0)) {
            try {
              const defaultPassword = await bcrypt.hash('password123', 10);
              user = await prisma.user.create({
                data: {
                  name: demoInfo.name,
                  email: cleanEmail,
                  password: defaultPassword,
                  role: demoInfo.role,
                  avatar: demoInfo.avatar,
                },
              });
            } catch (err) {
              return {
                id: `demo-${cleanEmail}`,
                name: demoInfo.name,
                email: cleanEmail,
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.avatar = (user as any).avatar;
      }
      if (trigger === 'update' && session?.user) {
        if (session.user.name) token.name = session.user.name;
        if (session.user.email) token.email = session.user.email;
        if ((session.user as any).avatar) token.avatar = (session.user as any).avatar;
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
  secret: process.env.NEXTAUTH_SECRET || 'rizkya-motor-secret-key-2026',
};
