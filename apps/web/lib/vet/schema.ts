import { z } from 'zod';

const emptyToUndefined = (v: unknown) => (v === '' || v == null ? undefined : v);

export const vetProfileSchema = z.object({
  clinicName: z.string().trim().min(2, 'Klinika/həkim adı ən azı 2 simvol olmalıdır').max(120),
  specialty: z.preprocess(emptyToUndefined, z.string().trim().max(120).optional()),
  about: z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional()),
  phone: z.preprocess(emptyToUndefined, z.string().trim().max(20).optional()),
  licenseNo: z.preprocess(emptyToUndefined, z.string().trim().max(60).optional()),
  address: z.preprocess(emptyToUndefined, z.string().trim().max(200).optional()),
});

export type VetProfileInput = z.infer<typeof vetProfileSchema>;
