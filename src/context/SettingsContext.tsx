import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { defaultSettings } from '../data/siteConfig';
import { fetchRemoteSettings, mergeSettings } from '../services/settingsService';
import { isSupabaseConfigured } from '../services/supabase';
import type { StoreSettings } from '../types';
import { formatPrice } from '../utils/format';

interface SettingsContextValue {
  settings: StoreSettings;
  /** Re-fetch settings from Supabase (e.g. after the admin saves). Never throws. */
  refreshSettings: () => Promise<void>;
  money: (amount: number) => string;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Built-in defaults render immediately; Supabase values are layered on top if/when they arrive.
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);

  const refreshSettings = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const row = await fetchRemoteSettings();
      setSettings(mergeSettings(defaultSettings, row));
    } catch (err) {
      console.warn('[veloura] Store settings unavailable, using defaults.', err);
    }
  }, []);

  useEffect(() => {
    void refreshSettings();
  }, [refreshSettings]);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, refreshSettings, money: (n: number) => formatPrice(n, settings.currency) }),
    [settings, refreshSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
