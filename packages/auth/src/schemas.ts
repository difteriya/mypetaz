import { z } from 'zod';

// Auth form validation. Messages are in Azerbaijani (user-facing, PLAN.md §2.8).
export const registerSchema = z.object({
  name: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır'),
  email: z.string().email('Düzgün e-poçt ünvanı daxil edin'),
  password: z.string().min(8, 'Şifrə ən azı 8 simvol olmalıdır'),
  // Account-type choice at sign-up: INDIVIDUAL (default) or BUSINESS.
  accountType: z.enum(['INDIVIDUAL', 'BUSINESS']).default('INDIVIDUAL'),
  // Required when accountType is BUSINESS (minimal storefront, completed later).
  businessName: z.preprocess(
    (v) => (v === '' || v == null ? undefined : v),
    z.string().trim().min(2, 'Biznes adı ən azı 2 simvol olmalıdır').max(100).optional(),
  ),
});

export const loginSchema = z.object({
  email: z.string().email('Düzgün e-poçt ünvanı daxil edin'),
  password: z.string().min(1, 'Şifrə tələb olunur'),
});

export type RegisterInput = z.input<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
