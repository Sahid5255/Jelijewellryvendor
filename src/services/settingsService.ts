import type { StoreSettings } from '../types';
import { supabase, withTimeout } from './supabase';

interface SettingsRow {
  store_name: string | null;
  logo_url: string | null;
  whatsapp_number: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  currency: string | null;
  announcement: string | null;
}

/** Only non-empty saved values override the built-in defaults. */
export function mergeSettings(base: StoreSettings, row: Partial<SettingsRow> | null): StoreSettings {
  if (!row) return base;
  const pick = (saved: string | null | undefined, fallback: string) => (saved && saved.trim() ? saved.trim() : fallback);
  return {
    storeName: pick(row.store_name, base.storeName),
    logoUrl: pick(row.logo_url, base.logoUrl),
    whatsappNumber: pick(row.whatsapp_number, base.whatsappNumber).replace(/\D/g, ''),
    email: pick(row.email, base.email),
    phone: pick(row.phone, base.phone),
    address: pick(row.address, base.address),
    instagram: pick(row.instagram, base.instagram),
    facebook: pick(row.facebook, base.facebook),
    tiktok: pick(row.tiktok, base.tiktok),
    currency: pick(row.currency, base.currency).toUpperCase(),
    announcement: pick(row.announcement, base.announcement),
  };
}

export async function fetchRemoteSettings(): Promise<Partial<SettingsRow> | null> {
  if (!supabase) return null;
  const { data, error } = await withTimeout(supabase.from('store_settings').select('*').eq('id', 1).maybeSingle());
  if (error) throw error;
  return (data as Partial<SettingsRow> | null) ?? null;
}

export async function saveRemoteSettings(s: StoreSettings): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await withTimeout(
    supabase.from('store_settings').upsert({
      id: 1,
      store_name: s.storeName,
      logo_url: s.logoUrl,
      whatsapp_number: s.whatsappNumber.replace(/\D/g, ''),
      email: s.email,
      phone: s.phone,
      address: s.address,
      instagram: s.instagram,
      facebook: s.facebook,
      tiktok: s.tiktok,
      currency: s.currency.toUpperCase(),
      announcement: s.announcement,
    }),
  );
  if (error) throw error;
}
