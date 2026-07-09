'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma, Prisma, slugify } from '@mypet/db';
import { auth } from '@mypet/auth';
import { processImage, removeImage } from '@/lib/uploads';
import { DAYS } from './hours';
import { businessProfileSchema, serviceOfferingSchema } from './schema';

export type BusinessActionState = { error?: string; ok?: string } | undefined;

function buildSocialLinks(d: Record<string, string | undefined>) {
  const out: Record<string, string> = {};
  for (const k of ['instagram', 'facebook', 'tiktok', 'website'] as const) {
    if (d[k]) out[k] = d[k]!;
  }
  return out;
}

function buildBusinessHours(formData: FormData) {
  const hours: Record<string, { open: string; close: string } | null> = {};
  for (const { key } of DAYS) {
    const open = String(formData.get(`open_${key}`) ?? '').trim();
    const close = String(formData.get(`close_${key}`) ?? '').trim();
    hours[key] = open && close ? { open, close } : null;
  }
  return hours;
}

async function processOptionalImage(formData: FormData, field: string, name: string) {
  const file = formData.get(field);
  if (file instanceof File && file.size > 0) {
    return (await processImage(file, 'business', `${name}-${field}`)).stem;
  }
  return undefined;
}

export async function saveBusinessProfileAction(
  _prev: BusinessActionState,
  formData: FormData,
): Promise<BusinessActionState> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const parsed = businessProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Məlumatlar yanlışdır' };
  const d = parsed.data;

  const socialLinks = buildSocialLinks({
    instagram: d.instagram,
    facebook: d.facebook,
    tiktok: d.tiktok,
    website: d.website,
  }) as Prisma.InputJsonObject;
  const businessHours = buildBusinessHours(formData) as Prisma.InputJsonObject;
  const existing = await prisma.businessProfile.findUnique({ where: { userId: session.user.id } });

  let banner: string | undefined;
  let logo: string | undefined;
  try {
    banner = await processOptionalImage(formData, 'banner', d.name);
    logo = await processOptionalImage(formData, 'logo', d.name);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Şəkil yüklənmədi' };
  }

  const common = {
    name: d.name,
    description: d.description ?? null,
    cityId: d.cityId ?? null,
    address: d.address ?? null,
    lat: d.lat ?? null,
    lng: d.lng ?? null,
    phone: d.phone ?? null,
    socialLinks,
    businessHours,
  };

  if (existing) {
    if (banner && existing.banner) await removeImage(existing.banner);
    if (logo && existing.logo) await removeImage(existing.logo);
    await prisma.businessProfile.update({
      where: { id: existing.id },
      data: {
        ...common,
        ...(banner ? { banner, bannerAlt: `${d.name} banner` } : {}),
        ...(logo ? { logo, logoAlt: `${d.name} loqo` } : {}),
      },
    });
  } else {
    const slug = `${slugify(d.name) || 'biznes'}-${randomBytes(3).toString('hex')}`;
    await prisma.$transaction([
      prisma.businessProfile.create({
        data: {
          ...common,
          userId: session.user.id,
          slug,
          banner: banner ?? null,
          bannerAlt: banner ? `${d.name} banner` : null,
          logo: logo ?? null,
          logoAlt: logo ? `${d.name} loqo` : null,
          // status defaults to PENDING — visible after admin approval (PLAN.md §2.7)
        },
      }),
      prisma.user.update({ where: { id: session.user.id }, data: { accountType: 'BUSINESS' } }),
    ]);
  }

  revalidatePath('/dashboard/business');
  redirect('/dashboard/business');
}

export async function setServiceCategoriesAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const business = await prisma.businessProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!business) redirect('/become-business');

  const ids = formData.getAll('serviceCategoryId').map(String).filter(Boolean);
  await prisma.$transaction([
    prisma.businessServiceCategory.deleteMany({ where: { businessId: business.id } }),
    prisma.businessServiceCategory.createMany({
      data: ids.map((serviceCategoryId) => ({ businessId: business.id, serviceCategoryId })),
      skipDuplicates: true,
    }),
  ]);
  revalidatePath('/dashboard/business');
}

export async function addServiceOfferingAction(
  _prev: BusinessActionState,
  formData: FormData,
): Promise<BusinessActionState> {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const business = await prisma.businessProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, _count: { select: { serviceOfferings: true } } },
  });
  if (!business) return { error: 'Əvvəlcə biznes profili yaradın' };

  const parsed = serviceOfferingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Məlumatlar yanlışdır' };

  await prisma.serviceOffering.create({
    data: {
      businessId: business.id,
      name: parsed.data.name,
      price: parsed.data.price ?? null,
      description: parsed.data.description ?? null,
      order: business._count.serviceOfferings,
    },
  });
  revalidatePath('/dashboard/business');
  return { ok: 'Xidmət əlavə edildi' };
}

export async function deleteServiceOfferingAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const id = String(formData.get('offeringId') ?? '');
  const offering = await prisma.serviceOffering.findFirst({
    where: { id, business: { userId: session.user.id } },
    select: { id: true },
  });
  if (offering) {
    await prisma.serviceOffering.delete({ where: { id: offering.id } });
    revalidatePath('/dashboard/business');
  }
}
