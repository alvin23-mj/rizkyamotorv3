import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database for Showroom Mobil Bekas...');

  // Clean existing data
  await prisma.favorite.deleteMany();
  await prisma.comparison.deleteMany();
  await prisma.testDriveBooking.deleteMany();
  await prisma.sellSubmission.deleteMany();
  await prisma.carImage.deleteMany();
  await prisma.carListing.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Create Showroom Admin & Customer Users
  const adminShowroom = await prisma.user.create({
    data: {
      name: 'Rizkya Motor Showroom Pusat',
      email: 'admin@mobilku.id',
      password: defaultPassword,
      role: 'ADMIN',
      phone: '0812-9988-7766',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    },
  });

  const buyerDani = await prisma.user.create({
    data: {
      name: 'Dani Pratama',
      email: 'dani@gmail.com',
      password: defaultPassword,
      role: 'USER',
      phone: '0819-0011-2233',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    },
  });

  // 2. Create Showroom Official Stock Inventory
  const carsData: any[] = [
    {
      title: 'Toyota Innova Zenix 2.0 Q Hybrid Modellista',
      brand: 'Toyota',
      model: 'Innova Zenix Hybrid',
      year: 2023,
      price: 565000000,
      mileage: 14000,
      transmission: 'Automatic',
      fuelType: 'Hybrid',
      bodyType: 'MPV',
      color: 'Hitam Metalik',
      plateNumber: 'B 1988 RZK',
      location: 'Showroom Pusat Jakarta',
      status: 'AVAILABLE',
      description: 'Unit tangan pertama dari baru. Tipe Q Hybrid CVT Modellista tertinggi. Garansi baterai hybrid resmi aktif. Bebas banjir & laka. Interior mewah panoramic sunroof.',
      images: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      title: 'Honda HR-V 1.5 SE CVT Panoramic',
      brand: 'Honda',
      model: 'HR-V 1.5 SE',
      year: 2022,
      price: 345000000,
      mileage: 22000,
      transmission: 'Automatic',
      fuelType: 'Pertalite/Bensin',
      bodyType: 'SUV',
      color: 'Putih Pearl',
      plateNumber: 'B 2411 HND',
      location: 'Showroom Pusat Jakarta',
      status: 'SOLD',
      description: 'Honda HR-V SE panoramic roof, kondisi mulus terawat seperti baru. Servis berkala teratur di bengkel resmi Honda.',
      images: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      title: 'Hyundai Ioniq 5 Signature Long Range EV',
      brand: 'Hyundai',
      model: 'Ioniq 5 Signature',
      year: 2022,
      price: 685000000,
      mileage: 11000,
      transmission: 'Automatic',
      fuelType: 'Electric',
      bodyType: 'Crossover',
      color: 'Gravity Gold Matte',
      plateNumber: 'B 888 EV',
      location: 'Showroom Cabang Jakarta',
      status: 'AVAILABLE',
      description: 'Mobil listrik futuristik Hyundai Ioniq 5 Signature Long Range. Fitur V2L aktif, garansi baterai resmi 8 tahun. Bebas ganjil genap.',
      images: [
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      title: 'Mitsubishi Pajero Sport 2.4 Dakar Ultimate 4x2',
      brand: 'Mitsubishi',
      model: 'Pajero Sport Dakar',
      year: 2021,
      price: 495000000,
      mileage: 38000,
      transmission: 'Automatic',
      fuelType: 'Diesel',
      bodyType: 'SUV',
      color: 'Hitam',
      plateNumber: 'B 1789 PJR',
      location: 'Showroom Pusat Jakarta',
      status: 'SOLD',
      description: 'Pajero Sport Dakar Ultimate facelift. Power tailgate foot sensor, sunroof, fitur ADAS keselamatan lengkap. Kaki-kaki empuk & hening.',
      images: [
        'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      title: 'BMW 320i Sport G20',
      brand: 'BMW',
      model: '320i Sport G20',
      year: 2020,
      price: 620000000,
      mileage: 29000,
      transmission: 'Automatic',
      fuelType: 'Pertalite/Bensin',
      bodyType: 'Sedan',
      color: 'Alpine White',
      plateNumber: 'B 320 BMW',
      location: 'Showroom Pusat Jakarta',
      status: 'AVAILABLE',
      description: 'BMW 320i Sport G20 NIK 2020. Cat 100% orisinil, interior wangi & sangat bersih, track record BMW Indonesia lengkap.',
      images: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      title: 'Toyota Fortuner 2.8 VRZ 4x2 AT Diesel',
      brand: 'Toyota',
      model: 'Fortuner 2.8 VRZ',
      year: 2022,
      price: 525000000,
      mileage: 18000,
      transmission: 'Automatic',
      fuelType: 'Diesel',
      bodyType: 'SUV',
      color: 'Hitam',
      plateNumber: 'B 2888 VRZ',
      location: 'Showroom Pusat Jakarta',
      status: 'SOLD',
      description: 'Mesin 2.800cc Diesel 1GD bertenaga melimpah (204 PS). Tipe VRZ terlengkap, surat-surat dijamin 100% absah dan siap pakai.',
      images: [
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop'
      ]
    }
  ];

  for (const carItem of carsData) {
    const { images, ...carProps } = carItem;
    const createdCar = await prisma.carListing.create({
      data: {
        ...carProps,
        createdById: adminShowroom.id,
      },
    });

    for (let i = 0; i < images.length; i++) {
      await prisma.carImage.create({
        data: {
          carListingId: createdCar.id,
          url: images[i],
          isPrimary: i === 0,
          order: i,
        },
      });
    }
  }

  // 3. Create Sample Customer Sell Submission
  await prisma.sellSubmission.create({
    data: {
      user: { connect: { id: buyerDani.id } },
      customerName: 'Dani Pratama',
      customerPhone: '0819-0011-2233',
      brand: 'Toyota',
      model: 'Yaris Heykers AT',
      year: 2017,
      transmission: 'Automatic',
      fuelType: 'Pertalite/Bensin',
      mileage: 54000,
      expectedPrice: 145000000,
      city: 'Jakarta Selatan',
      notes: 'Pajak hidup panjang, baru ganti oli & aki baru.',
      status: 'PENDING',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
