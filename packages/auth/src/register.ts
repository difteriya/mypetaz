import { randomBytes } from 'node:crypto';
import { prisma, slugify } from '@mypet/db';
import { hashPassword } from './password';
import { registerSchema, type RegisterInput } from './schemas';

/**
 * Email/password registration (PLAN.md §2.8). Throws on duplicate email.
 * When `accountType` is BUSINESS, also creates a minimal PENDING
 * BusinessProfile (name only — completed later from the business dashboard).
 */
export async function registerUser(input: RegisterInput) {
  const data = registerSchema.parse(input);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new Error('Bu e-poçt ünvanı artıq qeydiyyatdan keçib');
  }

  const isBusiness = data.accountType === 'BUSINESS';
  if (isBusiness && !data.businessName) {
    throw new Error('Biznes adı tələb olunur');
  }

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      accountType: isBusiness ? 'BUSINESS' : 'INDIVIDUAL',
    },
    select: { id: true, name: true, email: true },
  });

  if (isBusiness && data.businessName) {
    const slug = `${slugify(data.businessName) || 'biznes'}-${randomBytes(2).toString('hex')}`;
    await prisma.businessProfile.create({
      data: { userId: user.id, name: data.businessName, slug, status: 'PENDING' },
    });
  }

  return user;
}
