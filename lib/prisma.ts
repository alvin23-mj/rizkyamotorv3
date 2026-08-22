import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if cached instance is missing new models, recreate if needed
let prismaInstance = globalForPrisma.prisma;
if (!prismaInstance || !(prismaInstance as any).operatingHour || !(prismaInstance as any).carModel) {
  prismaInstance = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
