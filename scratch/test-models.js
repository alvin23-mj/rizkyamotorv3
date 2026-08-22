const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing prisma.carModel availability...');
    console.log('prisma.carModel exists?', Boolean(prisma.carModel));

    if (prisma.carModel) {
      const models = await prisma.carModel.findMany({ take: 5 });
      console.log('Models via prisma.carModel:', models);
    } else {
      console.log('prisma.carModel is undefined. Testing raw query...');
      const rawModels = await prisma.$queryRawUnsafe(`
        SELECT cm.id, cm.name, cm.bodyType, cm.brandId, b.name as brandName 
        FROM CarModel cm 
        JOIN Brand b ON cm.brandId = b.id 
        LIMIT 5
      `);
      console.log('Models via raw query:', rawModels);
    }
  } catch (err) {
    console.error('Error in test:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
