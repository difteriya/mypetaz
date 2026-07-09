import { z } from 'zod';

const emptyToUndefined = (v: unknown) => (v === '' || v == null ? undefined : v);

// Common fields shared across all categories (PLAN.md §2.2). Category-specific
// dynamic fields are validated separately by the engine in ./fields.
export const petBaseSchema = z.object({
  categoryId: z.string().min(1, 'Kateqoriya seçin'),
  breedId: z.preprocess(emptyToUndefined, z.string().optional()),
  breedFreeText: z.preprocess(emptyToUndefined, z.string().trim().max(80).optional()),
  name: z.string().trim().min(1, 'Ad tələb olunur').max(60),
  birthDate: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
  birthApprox: z.boolean().optional().default(false),
  sex: z.enum(['MALE', 'FEMALE', 'UNKNOWN']).default('UNKNOWN'),
  color: z.preprocess(emptyToUndefined, z.string().trim().max(40).optional()),
  weight: z.preprocess(emptyToUndefined, z.coerce.number().positive().max(500).optional()),
  microchipNo: z.preprocess(emptyToUndefined, z.string().trim().max(40).optional()),
  description: z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional()),
});

export type PetBaseInput = z.infer<typeof petBaseSchema>;
