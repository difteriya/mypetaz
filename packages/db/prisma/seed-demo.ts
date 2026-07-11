import { PrismaClient } from '@prisma/client';
import { slugify } from '../src/slug';

// Optional demo data for local dev: sample users, listings, a business, a blog
// post, passport + medical records, and a review. Idempotent (safe to re-run).
// Login: admin@mypet.az / user@mypet.az / shop@mypet.az — password: demo1234
const prisma = new PrismaClient();
const PW = '$2b$12$bmfOSaXkZ93trQUBiEdQG.YsgWOouuAfF0FGXz3lMxfL71g4F26/y'; // demo1234

async function main() {
  const emails = ['admin@mypet.az', 'user@mypet.az', 'shop@mypet.az'];
  await prisma.user.deleteMany({ where: { email: { in: emails } } });

  const admin = await prisma.user.create({ data: { email: 'admin@mypet.az', name: 'Admin', passwordHash: PW, role: 'ADMIN' } });
  const user = await prisma.user.create({ data: { email: 'user@mypet.az', name: 'Aysel', passwordHash: PW } });
  const shop = await prisma.user.create({ data: { email: 'shop@mypet.az', name: 'ZooMart', passwordHash: PW, accountType: 'BUSINESS' } });

  const it = await prisma.petCategory.findUniqueOrThrow({ where: { slug: 'it' } });
  const pisik = await prisma.petCategory.findUniqueOrThrow({ where: { slug: 'pisik' } });
  const golden = await prisma.breed.findFirstOrThrow({ where: { categoryId: it.id, slug: 'golden-retriever' } });
  const fars = await prisma.breed.findFirstOrThrow({ where: { categoryId: pisik.id, slug: 'fars' } });
  const baku = await prisma.city.findFirstOrThrow({ where: { slug: 'baki' } });

  const mkListing = async (ownerId: string, categoryId: string, breedId: string, name: string, title: string, price: number, featured = false) => {
    const pet = await prisma.pet.create({ data: { ownerId, categoryId, breedId, name, sex: 'MALE' } });
    const listing = await prisma.listing.create({
      data: {
        type: 'SALE', petId: pet.id, userId: ownerId, cityId: baku.id, title,
        slug: `${slugify(title)}-${pet.id.slice(-4)}`, price, phone: '+994501234567',
        status: 'ACTIVE', featured, description: 'Sağlam, peyvəndli və çox sevimli.',
      },
    });
    return { pet, listing };
  };

  await mkListing(user.id, it.id, golden.id, 'Rex', 'Golden Retriever balası satılır', 450, true);
  await mkListing(user.id, pisik.id, fars.id, 'Pambıq', 'Fars pişiyi yeni yuvaya', 200);

  // Business + service + a business listing with passport & medical records
  const biz = await prisma.businessProfile.create({
    data: { userId: shop.id, name: 'ZooMart Bakı', slug: `zoomart-${shop.id.slice(-4)}`, cityId: baku.id, phone: '+994557778899', status: 'ACTIVE', description: 'Pet mağazası və qrooming xidməti.' },
  });
  await prisma.serviceOffering.create({ data: { businessId: biz.id, name: 'Tam qrooming', price: 30, order: 0 } });
  const { pet: bella } = await mkListing(shop.id, it.id, golden.id, 'Bella', 'Cins Golden Retriever (biznes)', 600);
  await prisma.petPassport.create({ data: { petId: bella.id, documentNo: 'AZ-2024-1188', microchipId: '900215000123456', birthPlace: 'Bakı', issueDate: new Date('2024-02-10') } });
  await prisma.petHealthRecord.createMany({
    data: [
      { petId: bella.id, type: 'VACCINE', name: 'Quduzluq peyvəndi', date: new Date('2024-03-01'), nextDate: new Date('2025-03-01'), source: 'VET' },
      { petId: bella.id, type: 'EXAM', name: 'Ümumi baytar müayinəsi', date: new Date('2024-06-02'), source: 'SELF', addedById: shop.id },
    ],
  });

  // An approved review for the business (+ cached rating)
  await prisma.review.create({ data: { userId: user.id, targetType: 'BUSINESS', targetId: biz.id, rating: 5, content: 'Əla xidmət!', status: 'ACTIVE' } });
  await prisma.businessProfile.update({ where: { id: biz.id }, data: { avgRating: 5, reviewCount: 1 } });

  // Blog post
  await prisma.blogPost.create({
    data: {
      userId: user.id,
      categoryId: (await prisma.blogCategory.findFirstOrThrow({ where: { slug: 'qulluq' } })).id,
      title: 'İt balasına necə qulluq etməli', slug: 'it-balasina-qulluq',
      excerpt: 'Yeni pet sahibləri üçün əsas məsləhətlər.',
      content: 'İt balasının qidalanması, peyvəndləri və gündəlik qayğısı haqqında ətraflı bələdçi...',
      status: 'ACTIVE', publishedAt: new Date(),
    },
  });

  console.log('[seed-demo] hazırdır. Giriş: admin@mypet.az / user@mypet.az / shop@mypet.az — şifrə: demo1234');
  void admin;
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
