const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SVG_MAP = {
  'Toyota': '/brands/toyota.svg',
  'Honda': '/brands/honda.svg',
  'BMW': '/brands/bmw.svg',
  'Mercedes-Benz': '/brands/mercedes.svg',
  'Mitsubishi': '/brands/mitsubishi.svg',
  'Hyundai': '/brands/hyundai.svg',
  'Suzuki': '/brands/suzuki.svg',
  'Mazda': '/brands/mazda.svg',
  'Audi': '/brands/audi.svg',
  'Ford': '/brands/ford.svg',
  'Nissan': '/brands/nissan.svg',
  'Ferrari': '/brands/ferrari.svg',
  'Porsche': '/brands/porsche.svg',
  'Lexus': '/brands/lexus.svg',
  'Tesla': '/brands/tesla.svg',
  'Chevrolet': '/brands/chevrolet.svg',
  'Aston Martin': '/brands/astonmartin.svg',
};

async function main() {
  console.log('Updating brands in database with SVG logos...');
  
  for (const [name, logoUrl] of Object.entries(SVG_MAP)) {
    const existing = await prisma.brand.findUnique({ where: { name } });
    if (existing) {
      await prisma.brand.update({
        where: { name },
        data: { logoUrl },
      });
      console.log(`Updated ${name} -> ${logoUrl}`);
    } else {
      await prisma.brand.create({
        data: {
          name,
          logoUrl,
          description: `Kendaraan ${name}`,
          order: Object.keys(SVG_MAP).indexOf(name) + 1,
          isFeatured: true,
        },
      });
      console.log(`Created ${name} -> ${logoUrl}`);
    }
  }
  
  console.log('Finished updating database!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
