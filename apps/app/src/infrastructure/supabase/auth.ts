import type { AuthError, Session } from '@supabase/supabase-js';

import { supabase } from './client';

export type AuthFailureKind =
  | 'not-configured'
  | 'invalid-credentials'
  | 'email-not-confirmed'
  | 'rate-limited'
  | 'network'
  | 'unknown';

export type AuthResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { kind: AuthFailureKind; code?: string } };

function classifyAuthError(error: AuthError): AuthFailureKind {
  const code = error.code ?? '';
  if (code === 'invalid_credentials') return 'invalid-credentials';
  if (code === 'email_not_confirmed') return 'email-not-confirmed';
  if (code.includes('rate') || error.status === 429) return 'rate-limited';
  if (!error.status || error.status >= 500) return 'network';
  return 'unknown';
}
function authFailure(error: AuthError): AuthResult<never> {
  const code = error.code;
  return {
    ok: false,
    error: code ? { kind: classifyAuthError(error), code } : { kind: classifyAuthError(error) },
  };
}

function unavailable<T>(): AuthResult<T> {
  return { ok: false, error: { kind: 'not-configured' } };
}

export async function getCurrentSession(): Promise<AuthResult<Session | null>> {
  if (!supabase) return unavailable();
  const { data, error } = await supabase.auth.getSession();
  if (error) return authFailure(error);
  return { ok: true, value: data.session };
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResult<Session>> {
  if (!supabase) return unavailable();
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) return authFailure(error);
  if (!data.session) return { ok: false, error: { kind: 'unknown' } };
  return { ok: true, value: data.session };
}
export async function signUpWithPassword(email: string, password: string): Promise<AuthResult<Session | null>> {
  if (!supabase) return unavailable();
  const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
  if (error) return authFailure(error);
  return { ok: true, value: data.session };
}

export async function requestPasswordReset(email: string, redirectTo?: string): Promise<AuthResult<null>> {
  if (!supabase) return unavailable();
  const options = redirectTo ? { redirectTo } : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), options);
  if (error) return authFailure(error);
  return { ok: true, value: null };
}

export async function signOut(): Promise<AuthResult<null>> {
  if (!supabase) return unavailable();
  const { error } = await supabase.auth.signOut();
  if (error) return authFailure(error);
  return { ok: true, value: null };
}

export function subscribeToAuthSession(listener: (session: Session | null) => void) {
  if (!supabase) return () => undefined;
  const { data } = supabase.auth.onAuthStateChange((_event, session) => listener(session));
  return () => data.subscription.unsubscribe();
}
