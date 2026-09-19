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

export async function exportMyData(): Promise<PrivacyResult<PortableAccountExport>> {
  if (!supabase) return unavailable();

  const { data, error } = await supabase.rpc('export_my_data');
  if (error || !data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, error: { kind: 'export-failed' } };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;

  return {
    ok: true,
    value: {
      ...(data as Record<string, unknown>),
      account: {
        email: user?.email ?? null,
        created_at: user?.created_at ?? null,
      },
    },
  };
}

export async function deleteMyAccount(): Promise<PrivacyResult<null>> {
  if (!supabase) return unavailable();

  const { error } = await supabase.functions.invoke('delete-account', {
    body: { confirmation: 'DELETE' },
  });
  if (error) {
    return { ok: false, error: { kind: 'delete-failed' } };
  }

  // The server has already hard-deleted the auth user. Clear only the local
  // client session here; there is no remaining account that needs a remote sign-out.
  await supabase.auth.signOut({ scope: 'local' });
  return { ok: true, value: null };
}
