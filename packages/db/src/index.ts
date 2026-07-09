import { PrismaClient } from '@prisma/client';

// Re-export generated types/enums so apps import everything from '@mypet/db'.
export * from '@prisma/client';

// Shared utilities.
export { slugify } from './slug';

// Singleton PrismaClient — avoids exhausting connections during Next.js
// dev HMR (a new client per reload). See Prisma's Next.js best-practice.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
