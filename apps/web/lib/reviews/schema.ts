import { z } from 'zod';

export const reviewSchema = z.object({
  targetType: z.enum(['LISTING', 'BUSINESS']),
  targetId: z.string().min(1),
  rating: z.coerce.number().int().min(1, 'Reytinq seçin').max(5),
  content: z.preprocess((v) => (v === '' ? undefined : v), z.string().trim().max(1000).optional()),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
