'use server';

import {
  AuthError,
  signIn,
  signOut,
  registerUser,
  loginSchema,
  registerSchema,
} from '@mypet/auth';

export type AuthActionState = { error?: string } | undefined;

const GENERIC_LOGIN_ERROR = 'E-poçt və ya şifrə yanlışdır';

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { error: GENERIC_LOGIN_ERROR };

  try {
    await signIn('credentials', { ...parsed.data, redirectTo: '/dashboard' });
  } catch (err) {
    if (err instanceof AuthError) return { error: GENERIC_LOGIN_ERROR };
    throw err; // re-throw NEXT_REDIRECT so navigation happens
  }
  return undefined;
}

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    accountType: formData.get('accountType') ?? 'INDIVIDUAL',
    businessName: formData.get('businessName'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Məlumatlar yanlışdır' };
  }

  try {
    await registerUser(parsed.data);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Qeydiyyat zamanı xəta baş verdi' };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      // Business accounts land on their business dashboard.
      redirectTo: parsed.data.accountType === 'BUSINESS' ? '/biz' : '/dashboard',
    });
  } catch (err) {
    if (err instanceof AuthError) return { error: GENERIC_LOGIN_ERROR };
    throw err;
  }
  return undefined;
}

export async function googleSignIn() {
  await signIn('google', { redirectTo: '/dashboard' });
}

export async function facebookSignIn() {
  await signIn('facebook', { redirectTo: '/dashboard' });
}

export async function logoutAction() {
  await signOut({ redirectTo: '/' });
}
