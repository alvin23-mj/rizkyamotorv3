const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing descriptions for all brands in DB...');
  await prisma.brand.updateMany({
    data: { description: null },
  });
  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
