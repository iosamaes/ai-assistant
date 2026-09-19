import { supabase } from './client';

export type PrivacyFailureKind = 'not-configured' | 'export-failed' | 'delete-failed';

export type PrivacyResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { kind: PrivacyFailureKind } };

export type PortableAccountExport = Record<string, unknown> & {
  account?: {
    email: string | null;
    created_at: string | null;
  };
};

function unavailable<T>(): PrivacyResult<T> {
  return { ok: false, error: { kind: 'not-configured' } };
}

async function sessionForUser(expectedUserId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error || data.session?.user.id !== expectedUserId) return null;
  return data.session;
}

export async function exportMyData(expectedUserId: string): Promise<PrivacyResult<PortableAccountExport>> {
  if (!supabase) return unavailable();

  const sessionBefore = await sessionForUser(expectedUserId);
  if (!sessionBefore) return { ok: false, error: { kind: 'export-failed' } };

  const { data, error } = await supabase.rpc('export_my_data');
  if (error || !data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, error: { kind: 'export-failed' } };
  }

  // Re-check identity after the RPC. A session switch while the export was in
  // flight must discard the old user's payload rather than attach a new user's
  // account metadata or return the payload to a different active session.
  const sessionAfter = await sessionForUser(expectedUserId);
  if (!sessionAfter) return { ok: false, error: { kind: 'export-failed' } };
  const user = sessionAfter.user;

  return {
    ok: true,
    value: {
      ...(data as Record<string, unknown>),
      account: {
        email: user.email ?? null,
        created_at: user.created_at ?? null,
      },
    },
  };
}

export async function deleteMyAccount(expectedUserId: string): Promise<PrivacyResult<null>> {
  if (!supabase) return unavailable();

  const sessionBefore = await sessionForUser(expectedUserId);
  if (!sessionBefore) return { ok: false, error: { kind: 'delete-failed' } };

  const { error } = await supabase.functions.invoke('delete-account', {
    body: { confirmation: 'DELETE' },
  });
  if (error) {
    return { ok: false, error: { kind: 'delete-failed' } };
  }

  // The server has already hard-deleted the authenticated user. Clear the
  // local session only if the same user is still active; never sign out a new
  // user that may have become active while the deletion request was in flight.
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user.id === expectedUserId) {
    await supabase.auth.signOut({ scope: 'local' });
  }
  return { ok: true, value: null };
}
