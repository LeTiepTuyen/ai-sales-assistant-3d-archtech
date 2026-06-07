import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const PLACEHOLDER_VALUES = new Set(["", "NEEDS_INPUT", "YOUR_SUPABASE_URL", "YOUR_SUPABASE_KEY"]);

let cachedClient: SupabaseClient | null = null;

function configuredValue(value: string | undefined) {
  const clean = value?.trim() ?? "";
  return PLACEHOLDER_VALUES.has(clean) ? null : clean;
}

export function isSupabaseServerConfigured() {
  return Boolean(
    configuredValue(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      configuredValue(process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

export function getSupabaseServerClient() {
  const url = configuredValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = configuredValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url || !serviceRoleKey) {
    return null;
  }

  cachedClient ??= createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return cachedClient;
}
