import { z } from 'zod';

// Auth form validation. Messages are in Azerbaijani (user-facing, PLAN.md §2.8).
export const registerSchema = z.object({
  name: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır'),
  email: z.string().email('Düzgün e-poçt ünvanı daxil edin'),
  password: z.string().min(8, 'Şifrə ən azı 8 simvol olmalıdır'),
});

export const loginSchema = z.object({
  email: z.string().email('Düzgün e-poçt ünvanı daxil edin'),
  password: z.string().min(1, 'Şifrə tələb olunur'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
