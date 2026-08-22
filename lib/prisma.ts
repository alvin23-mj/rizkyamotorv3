import { PrismaClient } from '@prisma/client';
import path from 'path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl() {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && !envUrl.startsWith('file:.')) {
    return envUrl;
  }
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  return `file:${dbPath}`;
}

let prismaInstance = globalForPrisma.prisma;
if (!prismaInstance || !(prismaInstance as any).operatingHour || !(prismaInstance as any).carModel) {
  prismaInstance = new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: ['query', 'error', 'warn'],
  });
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
