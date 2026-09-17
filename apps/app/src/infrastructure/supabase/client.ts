import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { readSupabasePublicConfig } from './config';
import { sessionStorage } from './session-storage';

export const supabaseConfig = readSupabasePublicConfig();

export const supabase = supabaseConfig.ok
  ? createClient(supabaseConfig.value.url, supabaseConfig.value.publishableKey, {
      auth: {
        storage: sessionStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    })
  : null;
