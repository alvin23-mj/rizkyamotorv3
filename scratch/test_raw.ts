import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const slots: any = await prisma.$queryRaw`SELECT * FROM "OperatingHour" ORDER BY "timeSlot" ASC`;
  const closures: any = await prisma.$queryRaw`SELECT * FROM "ShowroomClosure" ORDER BY "closedDate" ASC`;
  console.log('RAW QUERY SLOTS:', slots);
  console.log('RAW QUERY CLOSURES:', closures);
}

main();
