import { createClient } from 'npm:@supabase/supabase-js@2.116.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'method_not_allowed' });
  }

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return jsonResponse(401, { error: 'authentication_required' });
  }

  let body: { expected_user_id?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: 'invalid_request' });
  }

  if (typeof body.expected_user_id !== 'string' || body.expected_user_id.length === 0) {
    return jsonResponse(400, { error: 'expected_user_required' });
  }
  if (typeof body.password !== 'string' || body.password.length < 8) {
    return jsonResponse(400, { error: 'invalid_password' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(503, { error: 'service_unavailable' });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const accessToken = authorization.slice('Bearer '.length);
  const { data: userData, error: userError } = await admin.auth.getUser(accessToken);
  if (userError || !userData.user) {
    return jsonResponse(401, { error: 'authentication_required' });
  }

  if (userData.user.id !== body.expected_user_id) {
    return jsonResponse(409, { error: 'account_changed' });
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(userData.user.id, {
    password: body.password,
  });
  if (updateError) {
    return jsonResponse(500, { error: 'password_update_failed' });
  }

  return jsonResponse(200, { ok: true });
});
