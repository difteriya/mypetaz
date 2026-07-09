import { prisma } from '@mypet/db';
import { processImage } from './lib/uploads';

async function grab(prompt: string, slugBase: string, subdir: string, w = 1200, h = 900) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const { stem } = await processImage(new File([buf], 'x.jpg', { type: 'image/jpeg' }), subdir, slugBase);
  return stem;
}

const CATS: Record<string, string> = {
  it: 'happy golden retriever dog portrait, warm studio, photo',
  pisik: 'cute fluffy cat portrait, warm light, photo',
  dovsan: 'cute rabbit portrait, soft warm, photo',
  gemiriciler: 'cute hamster closeup, warm, photo',
  baliq: 'colorful aquarium fish, vibrant, photo',
  qus: 'colorful parrot bird portrait, photo',
  diger: 'cute small pet animal, warm, photo',
};

async function main() {
  for (const [slug, prompt] of Object.entries(CATS)) {
    try {
      const cat = await prisma.petCategory.findUnique({ where: { slug } });
      if (!cat) continue;
      const stem = await grab(prompt, `kateqoriya-${slug}`, 'categories', 800, 800);
      await prisma.petCategory.update({ where: { id: cat.id }, data: { image: stem, imageAlt: cat.name } });
      console.log('cat', slug, stem);
    } catch (e) {
      console.log('cat', slug, 'skip', String(e));
    }
  }

  // demo pet photos
  const petPrompts: Record<string, string> = {
    Rex: 'happy golden retriever dog in sunny home, photo',
    Pambıq: 'fluffy white persian cat, photo',
    Bella: 'golden retriever puppy portrait, photo',
  };
  const pets = await prisma.pet.findMany({ where: { name: { in: Object.keys(petPrompts) } }, include: { images: true } });
  for (const pet of pets) {
    if (pet.images.length > 0) continue;
    try {
      const stem = await grab(petPrompts[pet.name] ?? 'cute pet', `${pet.name}`, 'pets');
      await prisma.petImage.create({ data: { petId: pet.id, url: stem, alt: pet.name, order: 0 } });
      console.log('pet', pet.name, stem);
    } catch (e) {
      console.log('pet', pet.name, 'skip', String(e));
    }
  }

  // business banner + logo
  const biz = await prisma.businessProfile.findFirst({ where: { name: { contains: 'ZooMart' } } });
  if (biz) {
    try {
      const banner = await grab('pet shop interior warm cozy, photo', 'zoomart-banner', 'business', 1600, 500);
      const logo = await grab('cute paw logo icon, minimal, warm', 'zoomart-logo', 'business', 400, 400);
      await prisma.businessProfile.update({ where: { id: biz.id }, data: { banner, bannerAlt: biz.name, logo, logoAlt: biz.name } });
      console.log('business', banner, logo);
    } catch (e) {
      console.log('business skip', String(e));
    }
  }

  // blog cover
  const post = await prisma.blogPost.findFirst({ where: { slug: 'it-balasina-qulluq' } });
  if (post) {
    try {
      const cover = await grab('puppy care cute dog, warm, photo', 'it-balasi-qulluq', 'blog', 1200, 675);
      await prisma.blogPost.update({ where: { id: post.id }, data: { coverImage: cover, coverAlt: post.title } });
      console.log('blog', cover);
    } catch (e) {
      console.log('blog skip', String(e));
    }
  }

  console.log('done');
}
main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(String(e)); await prisma.$disconnect(); process.exit(1); });
