import { z } from 'zod';

const emptyToUndefined = (v: unknown) => (v === '' || v == null ? undefined : v);

export const blogPostSchema = z.object({
  categoryId: z.string().min(1, 'Kateqoriya seçin'),
  title: z.string().trim().min(3, 'Başlıq ən azı 3 simvol olmalıdır').max(140),
  excerpt: z.preprocess(emptyToUndefined, z.string().trim().max(300).optional()),
  content: z.string().trim().min(20, 'Məzmun ən azı 20 simvol olmalıdır').max(20000),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;
