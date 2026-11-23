import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

function build(): SupabaseClient | null {
  if (!url || !anonKey || url.includes('your-project') || anonKey.startsWith('your-')) return null;
  try {
    // Only the public anon key is ever used here. RLS policies protect all writes.
    return createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });
  } catch (err) {
    console.warn('[veloura] Supabase client could not be created; continuing with React products only.', err);
    return null;
  }
}

/** null when env vars are missing/invalid: the whole app then runs on the React catalogue. */
export const supabase: SupabaseClient | null = build();
export const isSupabaseConfigured = supabase !== null;

export const PRODUCT_BUCKET = 'product-images';

/** Reject if a request hangs (paused projects can stall instead of failing fast). */
export function withTimeout<T>(promise: PromiseLike<T>, ms = 8000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Supabase request timed out')), ms);
    Promise.resolve(promise).then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

/** Returns the client or throws a readable error (used by admin-only code paths). */
export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
  return supabase;
}
