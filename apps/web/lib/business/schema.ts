import { z } from 'zod';

const emptyToUndefined = (v: unknown) => (v === '' || v == null ? undefined : v);

export const businessProfileSchema = z.object({
  name: z.string().trim().min(2, 'Ad ən azı 2 simvol olmalıdır').max(100),
  description: z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional()),
  cityId: z.preprocess(emptyToUndefined, z.string().optional()),
  address: z.preprocess(emptyToUndefined, z.string().trim().max(200).optional()),
  lat: z.preprocess(emptyToUndefined, z.coerce.number().min(-90).max(90).optional()),
  lng: z.preprocess(emptyToUndefined, z.coerce.number().min(-180).max(180).optional()),
  phone: z.preprocess(emptyToUndefined, z.string().trim().max(20).optional()),
  instagram: z.preprocess(emptyToUndefined, z.string().trim().max(200).optional()),
  facebook: z.preprocess(emptyToUndefined, z.string().trim().max(200).optional()),
  tiktok: z.preprocess(emptyToUndefined, z.string().trim().max(200).optional()),
  website: z.preprocess(emptyToUndefined, z.string().trim().max(200).optional()),
});

export const serviceOfferingSchema = z.object({
  name: z.string().trim().min(1, 'Xidmət adı tələb olunur').max(100),
  price: z.preprocess(emptyToUndefined, z.coerce.number().nonnegative().max(1_000_000).optional()),
  description: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
});

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;
export type ServiceOfferingInput = z.infer<typeof serviceOfferingSchema>;
