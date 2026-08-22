const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MODEL_PRESETS = [
  {
    brand: 'Toyota',
    models: [
      { name: 'Avanza', bodyType: 'MPV' },
      { name: 'Innova Reborn', bodyType: 'MPV' },
      { name: 'Kijang Innova Zenix', bodyType: 'MPV' },
      { name: 'Fortuner VRZ', bodyType: 'SUV' },
      { name: 'Veloz', bodyType: 'MPV' },
      { name: 'Rush', bodyType: 'SUV' },
      { name: 'Yaris', bodyType: 'Hatchback' },
      { name: 'Camry', bodyType: 'Sedan' },
      { name: 'Alphard', bodyType: 'MPV' },
      { name: 'Raize', bodyType: 'Crossover' },
      { name: 'Voxy', bodyType: 'MPV' },
      { name: 'Corolla Cross', bodyType: 'Crossover' },
      { name: 'Land Cruiser', bodyType: 'SUV' },
    ],
  },
  {
    brand: 'Honda',
    models: [
      { name: 'HR-V', bodyType: 'Crossover' },
      { name: 'CR-V', bodyType: 'SUV' },
      { name: 'Brio RS', bodyType: 'Hatchback' },
      { name: 'Civic Turbo', bodyType: 'Sedan' },
      { name: 'City Hatchback', bodyType: 'Hatchback' },
      { name: 'BR-V', bodyType: 'SUV' },
      { name: 'WR-V', bodyType: 'Crossover' },
      { name: 'Accord', bodyType: 'Sedan' },
      { name: 'Odyssey', bodyType: 'MPV' },
    ],
  },
  {
    brand: 'BMW',
    models: [
      { name: '320i Sport G20', bodyType: 'Sedan' },
      { name: '330i M Sport', bodyType: 'Sedan' },
      { name: '520i M Sport', bodyType: 'Sedan' },
      { name: 'X1 sDrive18i', bodyType: 'SUV' },
      { name: 'X3 xDrive30i', bodyType: 'SUV' },
      { name: 'X5 xDrive40i', bodyType: 'SUV' },
      { name: 'M3 Competition', bodyType: 'Sedan' },
    ],
  },
  {
    brand: 'Mercedes-Benz',
    models: [
      { name: 'C200 Avantgarde', bodyType: 'Sedan' },
      { name: 'C300 AMG Line', bodyType: 'Sedan' },
      { name: 'E300 AMG Line', bodyType: 'Sedan' },
      { name: 'GLA 200', bodyType: 'SUV' },
      { name: 'GLC 300', bodyType: 'SUV' },
      { name: 'CLA 200', bodyType: 'Coupe' },
      { name: 'S450', bodyType: 'Sedan' },
    ],
  },
  {
    brand: 'Mitsubishi',
    models: [
      { name: 'Xpander Ultimate', bodyType: 'MPV' },
      { name: 'Xpander Cross', bodyType: 'MPV' },
      { name: 'Pajero Sport Dakar', bodyType: 'SUV' },
      { name: 'Triton', bodyType: 'Pick Up' },
      { name: 'Xforce', bodyType: 'Crossover' },
    ],
  },
  {
    brand: 'Hyundai',
    models: [
      { name: 'Stargazer', bodyType: 'MPV' },
      { name: 'Creta', bodyType: 'SUV' },
      { name: 'Ioniq 5', bodyType: 'Crossover' },
      { name: 'Palisade', bodyType: 'SUV' },
      { name: 'Santa Fe', bodyType: 'SUV' },
    ],
  },
  {
    brand: 'Suzuki',
    models: [
      { name: 'XL7 Alpha', bodyType: 'SUV' },
      { name: 'Ertiga Hybrid', bodyType: 'MPV' },
      { name: 'Jimny', bodyType: 'SUV' },
      { name: 'Grand Vitara', bodyType: 'SUV' },
      { name: 'Baleno', bodyType: 'Hatchback' },
    ],
  },
  {
    brand: 'Daihatsu',
    models: [
      { name: 'Rocky', bodyType: 'Crossover' },
      { name: 'Terios', bodyType: 'SUV' },
      { name: 'Xenia', bodyType: 'MPV' },
      { name: 'Ayla', bodyType: 'Hatchback' },
      { name: 'Sigra', bodyType: 'MPV' },
    ],
  },
  {
    brand: 'Mazda',
    models: [
      { name: 'Mazda 3 Hatchback', bodyType: 'Hatchback' },
      { name: 'CX-5', bodyType: 'SUV' },
      { name: 'CX-3', bodyType: 'Crossover' },
      { name: 'CX-30', bodyType: 'Crossover' },
      { name: 'Mazda 6', bodyType: 'Sedan' },
    ],
  },
  {
    brand: 'Nissan',
    models: [
      { name: 'Kicks e-POWER', bodyType: 'Crossover' },
      { name: 'Serena e-POWER', bodyType: 'MPV' },
      { name: 'Livina', bodyType: 'MPV' },
      { name: 'Terra', bodyType: 'SUV' },
    ],
  },
];

async function seedModels() {
  console.log('Seeding popular car models per brand...');
  let totalSeeded = 0;

  for (const group of MODEL_PRESETS) {
    let brand = await prisma.brand.findFirst({
      where: { name: { equals: group.brand } },
    });

    if (!brand) {
      brand = await prisma.brand.create({
        data: { name: group.brand },
      });
      console.log(`Created brand: ${group.brand}`);
    }

    for (const m of group.models) {
      const existing = await prisma.carModel.findFirst({
        where: { brandId: brand.id, name: m.name },
      });

      if (!existing) {
        await prisma.carModel.create({
          data: {
            brandId: brand.id,
            name: m.name,
            bodyType: m.bodyType,
          },
        });
        totalSeeded++;
      }
    }
  }

  console.log(`Successfully seeded ${totalSeeded} car models across ${MODEL_PRESETS.length} brands!`);
}

seedModels()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
