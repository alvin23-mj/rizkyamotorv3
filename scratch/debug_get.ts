import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_SLOTS = [
  '09:00 - 10:30 WIB',
  '11:00 - 12:30 WIB',
  '13:00 - 14:30 WIB',
  '15:00 - 16:30 WIB',
  '17:00 - 18:30 WIB',
];

async function testGet() {
  try {
    let slots = await prisma.operatingHour.findMany({ orderBy: { timeSlot: 'asc' } });
    if (slots.length === 0) {
      for (const slotStr of DEFAULT_SLOTS) {
        await prisma.operatingHour.upsert({
          where: { timeSlot: slotStr },
          update: {},
          create: { timeSlot: slotStr, maxQuota: 3, isActive: true },
        });
      }
      slots = await prisma.operatingHour.findMany({ orderBy: { timeSlot: 'asc' } });
    }
    const closures = await prisma.showroomClosure.findMany({ orderBy: { closedDate: 'asc' } });
    console.log('SUCCESS GET:', { slots, closures });
  } catch (err) {
    console.error('Test error:', err);
  }
}

testGet();
