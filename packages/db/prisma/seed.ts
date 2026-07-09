import { PrismaClient, PetCategoryFieldType, ContentBlockPage, ContentBlockType } from '@prisma/client';
import { slugify } from '../src/slug';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Cities (PLAN.md §4 — City)
// ---------------------------------------------------------------------------
const CITIES = [
  'Bakı',
  'Gəncə',
  'Sumqayıt',
  'Mingəçevir',
  'Naxçıvan',
  'Şirvan',
  'Şəki',
  'Yevlax',
  'Lənkəran',
  'Naftalan',
  'Xankəndi',
  'Quba',
  'Qəbələ',
  'Zaqatala',
  'Şamaxı',
  'Ağdam',
  'Xaçmaz',
  'Salyan',
  'Biləsuvar',
  'İmişli',
];

// ---------------------------------------------------------------------------
// Categories + breeds (PLAN.md §2.2 / §2.2.1)
// "Qarışıq/Bilinmir" is intentionally kept last in every list (see §2.2.1).
// ---------------------------------------------------------------------------
interface CategorySeed {
  slug: string;
  name: string;
  emoji: string;
  order: number;
  freeTextBreed?: boolean;
  breeds: string[];
}

const CATEGORIES: CategorySeed[] = [
  {
    slug: 'it',
    name: 'İt',
    emoji: '🐕',
    order: 1,
    breeds: [
      'Alman Çoban İti',
      'Qafqaz Çoban İti (Alabaş)',
      'Orta Asiya Çoban İti (Alabai)',
      'Golden Retriever',
      'Labrador Retriever',
      'Pudel',
      'Yorkshire Terrier',
      'Chihuahua',
      'Pomeranian (Şpits)',
      'Sibir Haskisi',
      'Rottweiler',
      'Fransız Buldoqu',
      'Şi-Tzu',
      'Dratxar',
      'Qarışıq/Bilinmir',
    ],
  },
  {
    slug: 'pisik',
    name: 'Pişik',
    emoji: '🐈',
    order: 2,
    breeds: [
      'Fars',
      'Britan Qısa Tüklü',
      'Şotland Qıvrıq Qulaqlı',
      'Siam',
      'Sfinks',
      'Meyn Kun',
      'Qızıl Şinşilla',
      'Van Pişiyi',
      'Benqal',
      'Reqdoll',
      'Yerli/Adi Pişik',
      'Qarışıq/Bilinmir',
    ],
  },
  {
    slug: 'dovsan',
    name: 'Dovşan',
    emoji: '🐇',
    order: 3,
    breeds: [
      'Holland Lop',
      'Angora Dovşanı',
      'Flamand Nəhəngi',
      'Reks',
      'Karlik Dovşan (Netherland Dwarf)',
      'Himalay Dovşanı',
      'Yerli Dovşan',
      'Qarışıq/Bilinmir',
    ],
  },
  {
    slug: 'gemiriciler',
    name: 'Gəmiricilər (Xomyak və bənzərləri)',
    emoji: '🐹',
    order: 4,
    breeds: [
      'Suriya Xomyakı',
      'Cungar Xomyakı',
      'Roborovski Xomyakı',
      'Dəniz Donuzu (Guinea Pig)',
      'Çinçilla',
      'Cerbil',
      'Dequ',
      'Qarışıq/Bilinmir',
    ],
  },
  {
    slug: 'baliq',
    name: 'Balıq',
    emoji: '🐠',
    order: 5,
    breeds: [
      'Qızıl Balıq',
      'Betta (Döyüşçü Balıq)',
      'Guppi',
      'Neon Tetra',
      'Skalyariya',
      'Karp Koi',
      'Som Balığı',
      'Oskar',
      'Papağan Balığı (Flowerhorn)',
      'Qarışıq/Digər',
    ],
  },
  {
    slug: 'qus',
    name: 'Quş',
    emoji: '🐦',
    order: 6,
    breeds: [
      'Dalğalı Tutuquşu (Budgie)',
      'Kakadu',
      'Ara Papağan (Macaw)',
      'Afrika Boz Tutuquşusu',
      'Lovbird',
      'Konur',
      'Kanareya',
      'Bülbül',
      'Dekorativ Toyuq',
      'Göyərçin',
      'Qarışıq/Bilinmir',
    ],
  },
  {
    slug: 'diger',
    name: 'Digər',
    emoji: '🔹',
    order: 7,
    freeTextBreed: true,
    breeds: [],
  },
];

// ---------------------------------------------------------------------------
// Category-specific dynamic fields (PLAN.md §2.2 table / §4.1)
// Representative examples — admins add more without code changes.
// ---------------------------------------------------------------------------
type FieldSeed = {
  fieldName: string;
  label: string;
  type: PetCategoryFieldType;
  options?: string[];
  required?: boolean;
};

const CAT_AND_DOG_FIELDS: FieldSeed[] = [
  { fieldName: 'coatLength', label: 'Tük uzunluğu', type: 'SELECT', options: ['Qısa', 'Orta', 'Uzun'] },
  { fieldName: 'neutered', label: 'Kastrasiya/sterilizasiya olunub', type: 'BOOL' },
  { fieldName: 'size', label: 'Ölçü', type: 'SELECT', options: ['Kiçik', 'Orta', 'Böyük'] },
  { fieldName: 'temperament', label: 'Xasiyyət', type: 'TEXT' },
];

const FIELDS_BY_CATEGORY: Record<string, FieldSeed[]> = {
  it: CAT_AND_DOG_FIELDS,
  pisik: CAT_AND_DOG_FIELDS,
  dovsan: [
    { fieldName: 'coatType', label: 'Tük növü', type: 'SELECT', options: ['Qısa', 'Uzun (Angora)'] },
    { fieldName: 'sizeCategory', label: 'Ölçü kateqoriyası', type: 'SELECT', options: ['Karlik', 'Orta', 'Nəhəng'] },
  ],
  gemiriciler: [
    {
      fieldName: 'subType',
      label: 'Alt növ',
      type: 'SELECT',
      options: ['Xomyak', 'Dəniz donuzu', 'Çinçilla', 'Cerbil', 'Dequ'],
    },
    { fieldName: 'coatType', label: 'Tük növü', type: 'TEXT' },
    { fieldName: 'cageType', label: 'Qəfəs növü', type: 'TEXT' },
  ],
  baliq: [
    { fieldName: 'waterType', label: 'Su növü', type: 'SELECT', options: ['Şirin su', 'Şor su'] },
    { fieldName: 'aquariumSize', label: 'Akvarium həcmi (litr)', type: 'NUMBER' },
    { fieldName: 'tempRequirement', label: 'Temperatur/pH tələbi', type: 'TEXT' },
  ],
  qus: [
    { fieldName: 'subType', label: 'Alt növ', type: 'TEXT' },
    { fieldName: 'wingClipped', label: 'Qanadı kəsilib', type: 'BOOL' },
    {
      fieldName: 'talkAbility',
      label: 'Danışma/oxuma qabiliyyəti',
      type: 'SELECT',
      options: ['Yoxdur', 'Zəif', 'Yaxşı'],
    },
  ],
  diger: [], // free-form key-value pairs handled in the UI (PLAN.md §2.2)
};

// ---------------------------------------------------------------------------
// Service + Blog categories (PLAN.md §2.7 / §2.12)
// ---------------------------------------------------------------------------
const SERVICE_CATEGORIES = [
  'Qromer',
  'Pet otel',
  'Kinoloq/Heyvan təlimçisi',
  'Gəzdirmə xidməti',
  'Digər',
];

const BLOG_CATEGORIES = ['Qulluq', 'Qidalanma', 'Sağlamlıq', 'Tərbiyə', 'Hekayələr'];

// ---------------------------------------------------------------------------
// CMS content blocks (PLAN.md §2.10). Admin edits values without a deploy.
// ---------------------------------------------------------------------------
type BlockSeed = { key: string; page: string; type: string; value: string; order: number };
const CONTENT_BLOCKS: BlockSeed[] = [
  { key: 'hero_title', page: 'HOME', type: 'TEXT', value: 'Sənə yeni dost tapaq', order: 0 },
  { key: 'hero_subtitle', page: 'HOME', type: 'TEXT', value: 'Azərbaycanda ev heyvanları üçün hər şey bir yerdə', order: 1 },
  { key: 'hero_image', page: 'HOME', type: 'IMAGE', value: '', order: 2 },
  { key: 'about_content', page: 'ABOUT', type: 'RICHTEXT', value: 'mypet.az — Azərbaycanda ev heyvanları üçün portal.', order: 0 },
  { key: 'contact_content', page: 'CONTACT', type: 'RICHTEXT', value: 'Bizimlə əlaqə: info@mypet.az', order: 0 },
  { key: 'footer_address', page: 'FOOTER', type: 'TEXT', value: 'Bakı, Azərbaycan', order: 0 },
  { key: 'footer_phone', page: 'FOOTER', type: 'TEXT', value: '+994 12 000 00 00', order: 1 },
  { key: 'footer_email', page: 'FOOTER', type: 'TEXT', value: 'info@mypet.az', order: 2 },
  { key: 'footer_instagram', page: 'FOOTER', type: 'URL', value: '', order: 3 },
  { key: 'footer_facebook', page: 'FOOTER', type: 'URL', value: '', order: 4 },
  // Ad zones (PLAN.md §5.1) — managed via CMS in Phase 1 (step 17).
  { key: 'ad_header', page: 'GLOBAL', type: 'IMAGE', value: '', order: 0 },
  { key: 'ad_header_link', page: 'GLOBAL', type: 'URL', value: '', order: 1 },
  { key: 'ad_background', page: 'GLOBAL', type: 'IMAGE', value: '', order: 2 },
  { key: 'ad_background_link', page: 'GLOBAL', type: 'URL', value: '', order: 3 },
];

async function main() {
  console.log('[seed] cities…');
  for (const [i, name] of CITIES.entries()) {
    await prisma.city.upsert({
      where: { name },
      update: { order: i },
      create: { name, slug: slugify(name), order: i },
    });
  }

  console.log('[seed] categories + breeds…');
  for (const cat of CATEGORIES) {
    const category = await prisma.petCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, emoji: cat.emoji, order: cat.order, freeTextBreed: !!cat.freeTextBreed },
      create: {
        slug: cat.slug,
        name: cat.name,
        emoji: cat.emoji,
        order: cat.order,
        freeTextBreed: !!cat.freeTextBreed,
      },
    });

    for (const [i, breedName] of cat.breeds.entries()) {
      const breedSlug = slugify(breedName);
      await prisma.breed.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: breedSlug } },
        update: { name: breedName, order: i },
        create: { categoryId: category.id, name: breedName, slug: breedSlug, order: i },
      });
    }

    const fields = FIELDS_BY_CATEGORY[cat.slug] ?? [];
    for (const [i, f] of fields.entries()) {
      await prisma.petCategoryField.upsert({
        where: { categoryId_fieldName: { categoryId: category.id, fieldName: f.fieldName } },
        update: { label: f.label, type: f.type, options: f.options ?? undefined, required: !!f.required, order: i },
        create: {
          categoryId: category.id,
          fieldName: f.fieldName,
          label: f.label,
          type: f.type,
          options: f.options ?? undefined,
          required: !!f.required,
          order: i,
        },
      });
    }
  }

  console.log('[seed] service categories…');
  for (const [i, name] of SERVICE_CATEGORIES.entries()) {
    const slug = slugify(name);
    await prisma.serviceCategory.upsert({
      where: { slug },
      update: { name, order: i },
      create: { name, slug, order: i },
    });
  }

  console.log('[seed] blog categories…');
  for (const [i, name] of BLOG_CATEGORIES.entries()) {
    const slug = slugify(name);
    await prisma.blogCategory.upsert({
      where: { slug },
      update: { name, order: i },
      create: { name, slug, order: i },
    });
  }

  console.log('[seed] content blocks…');
  for (const b of CONTENT_BLOCKS) {
    await prisma.contentBlock.upsert({
      where: { key: b.key },
      update: { page: b.page as ContentBlockPage, type: b.type as ContentBlockType, order: b.order },
      create: {
        key: b.key,
        page: b.page as ContentBlockPage,
        type: b.type as ContentBlockType,
        value: b.value,
        order: b.order,
      },
    });
  }

  console.log('[seed] done ✅');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
