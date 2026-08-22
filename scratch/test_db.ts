import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tables: any = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`;
  console.log('SQLITE TABLES:', tables);
  console.log('prisma.operatingHour:', (prisma as any).operatingHour);
  console.log('prisma.showroomClosure:', (prisma as any).showroomClosure);
}

main();
