import NextAuth, {
  type DefaultSession,
  type NextAuthConfig,
  type NextAuthResult,
} from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma, type Role, type AccountType } from '@mypet/db';
import { verifyPassword } from './password';
import { loginSchema } from './schemas';

// Module augmentation — carry role/accountType (orthogonal, PLAN.md §4) on the
// session and JWT so both apps can gate by them.
declare module 'next-auth' {
  interface User {
    role: Role;
    accountType: AccountType;
  }
  interface Session {
    user: {
      id: string;
      role: Role;
      accountType: AccountType;
    } & DefaultSession['user'];
  }
}

// Social providers are only enabled when their env credentials are present, so
// an unconfigured environment builds/runs without crashing (PLAN.md §2.8).
const providers: Provider[] = [
  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(raw) {
      const parsed = loginSchema.safeParse(raw);
      if (!parsed.success) return null;

      const { email, password } = parsed.data;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        accountType: user.accountType,
      };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google);
}
if (process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET) {
  providers.push(Facebook);
}

// Shared session across mypet.az + vet.mypet.az via a parent-domain cookie
// (set AUTH_COOKIE_DOMAIN=".mypet.az" in production; unset for localhost).
const cookieDomain = process.env.AUTH_COOKIE_DOMAIN;

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  // JWT strategy is required for the Credentials provider.
  session: { strategy: 'jwt' },
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  providers,
  cookies: cookieDomain
    ? {
        sessionToken: {
          options: {
            domain: cookieDomain,
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: true,
          },
        },
      }
    : undefined,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.accountType = user.accountType;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.accountType = token.accountType as AccountType;
      }
      return session;
    },
  },
};

// Explicit annotations avoid TS2742 (non-portable inferred types) when this
// package is consumed across the pnpm monorepo.
const nextAuth = NextAuth(authConfig);
export const handlers: NextAuthResult['handlers'] = nextAuth.handlers;
export const auth: NextAuthResult['auth'] = nextAuth.auth;
export const signIn: NextAuthResult['signIn'] = nextAuth.signIn;
export const signOut: NextAuthResult['signOut'] = nextAuth.signOut;
