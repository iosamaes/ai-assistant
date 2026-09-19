import type { AuthChangeEvent, AuthError, Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

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

function readRedirectParam(url: string, key: string) {
  const match = url.match(new RegExp(`[?#&]${key}=([^&#]+)`));
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1].replace(/\+/g, ' '));
  } catch {
    return match[1];
  }
}

export function authRedirectUrl(path: '/' | '/update-password') {
  return Linking.createURL(path);
}

export async function getCurrentSession(): Promise<AuthResult<Session | null>> {
  if (!supabase) return unavailable();
  const { data, error } = await supabase.auth.getSession();
  if (error) return authFailure(error);
  return { ok: true, value: data.session };
}

export async function consumeAuthRedirectUrl(url: string): Promise<AuthResult<Session | null>> {
  if (!supabase) return unavailable();

  const errorCode = readRedirectParam(url, 'error_code');
  if (errorCode) return { ok: false, error: { kind: 'unknown', code: errorCode } };

  const accessToken = readRedirectParam(url, 'access_token');
  const refreshToken = readRedirectParam(url, 'refresh_token');
  if (!accessToken && !refreshToken) return { ok: true, value: null };
  if (!accessToken || !refreshToken) return { ok: false, error: { kind: 'unknown', code: 'incomplete_redirect_session' } };

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
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
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { emailRedirectTo: authRedirectUrl('/') },
  });
  if (error) return authFailure(error);
  return { ok: true, value: data.session };
}

export async function requestPasswordReset(email: string, redirectTo = authRedirectUrl('/update-password')): Promise<AuthResult<null>> {
  if (!supabase) return unavailable();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
  if (error) return authFailure(error);
  return { ok: true, value: null };
}

export async function updatePassword(password: string, expectedUserId: string): Promise<AuthResult<null>> {
  if (!supabase) return unavailable();
  if (password.length < 8 || !expectedUserId) {
    return { ok: false, error: { kind: 'unknown', code: 'invalid_password_request' } };
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) return authFailure(sessionError);
  if (sessionData.session?.user.id !== expectedUserId) {
    return { ok: false, error: { kind: 'unknown', code: 'account_changed' } };
  }

  const { error } = await supabase.functions.invoke('update-password', {
    body: {
      expected_user_id: expectedUserId,
      password,
    },
  });
  if (error) return { ok: false, error: { kind: 'unknown', code: 'password_update_failed' } };
  return { ok: true, value: null };
}

export async function signOut(): Promise<AuthResult<null>> {
  if (!supabase) return unavailable();
  const { error } = await supabase.auth.signOut();
  if (error) return authFailure(error);
  return { ok: true, value: null };
}

export function subscribeToAuthSession(listener: (event: AuthChangeEvent, session: Session | null) => void) {
  if (!supabase) return () => undefined;
  const { data } = supabase.auth.onAuthStateChange((event, session) => listener(event, session));
  return () => data.subscription.unsubscribe();
}
