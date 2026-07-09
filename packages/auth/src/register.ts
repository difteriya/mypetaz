import { prisma } from '@mypet/db';
import { hashPassword } from './password';
import { registerSchema, type RegisterInput } from './schemas';

/** Email/password registration (PLAN.md §2.8). Throws on duplicate email. */
export async function registerUser(input: RegisterInput) {
  const data = registerSchema.parse(input);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new Error('Bu e-poçt ünvanı artıq qeydiyyatdan keçib');
  }

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, passwordHash },
    select: { id: true, name: true, email: true },
  });

  return user;
}
