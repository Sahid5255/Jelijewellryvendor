import { useState, type FormEvent } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { uploadImage, validateImageFile } from '../../services/adminService';
import { saveRemoteSettings } from '../../services/settingsService';
import type { StoreSettings } from '../../types';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'GHS', 'KES', 'ZAR', 'CAD', 'AUD', 'AED', 'INR'];

export default function AdminSettings() {
  const { settings, refreshSettings } = useSettings();
  const { notify } = useToast();
  const [form, setForm] = useState<StoreSettings>(settings);
  const [logo, setLogo] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof StoreSettings>(k: K, v: StoreSettings[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const digits = form.whatsappNumber.replace(/\D/g, '');
    if (digits && (digits.length < 8 || digits.length > 15)) return setError('WhatsApp number must be in international format, 8 to 15 digits.');
    if (form.currency && !/^[A-Za-z]{3}$/.test(form.currency)) return setError('Currency must be a 3-letter code such as USD.');
    setSaving(true);
    try {
      let logoUrl = form.logoUrl;
      if (logo) logoUrl = await uploadImage(logo, 'branding');
      await saveRemoteSettings({ ...form, logoUrl, whatsappNumber: digits });
      await refreshSettings();
      setLogo(null);
      notify('Settings saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  const text = (k: keyof StoreSettings, label: string, extra: { placeholder?: string; type?: string; hint?: string } = {}) => (
    <div>
      <label htmlFor={`s-${k}`} className="label">{label}</label>
      <input id={`s-${k}`} type={extra.type ?? 'text'} className="input" value={form[k]} placeholder={extra.placeholder} onChange={(e) => set(k, e.target.value)} />
      {extra.hint && <p className="mt-1 text-xs text-ink/50">{extra.hint}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} className="max-w-3xl" noValidate>
      <h1 className="text-4xl">Store settings</h1>
      <p className="mt-2 text-sm text-ink/60">Saved to Supabase and applied across the storefront. Blank fields fall back to the built-in defaults.</p>

      <div className="mt-8 space-y-8">
        <section className="space-y-5 border border-beige bg-white p-6">
          <h2 className="font-serif text-2xl">Brand</h2>
          {text('storeName', 'Store name')}
          <div>
            <label htmlFor="s-logo" className="label">Logo (JPG, PNG or WebP, max 5 MB)</label>
            <input
              id="s-logo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="text-sm"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                const problem = f ? validateImageFile(f) : null;
                if (problem) {
                  setError(problem);
                  e.target.value = '';
                  return;
                }
                setError('');
                setLogo(f);
              }}
            />
            {(logo || form.logoUrl) && (
              <div className="mt-3 flex items-center gap-4">
                <img src={logo ? URL.createObjectURL(logo) : form.logoUrl} alt="Logo preview" className="h-12 w-auto bg-cream p-1" />
                {form.logoUrl && !logo && <button type="button" className="text-xs uppercase tracking-widest text-ink/60 underline" onClick={() => set('logoUrl', '')}>Remove logo</button>}
              </div>
            )}
          </div>
          {text('announcement', 'Announcement bar message', { hint: 'Leave blank to hide the bar.' })}
        </section>

        <section className="space-y-5 border border-beige bg-white p-6">
          <h2 className="font-serif text-2xl">Checkout &amp; pricing</h2>
          {text('whatsappNumber', 'WhatsApp business number', { placeholder: '15550100000', hint: 'International format, digits only: no +, spaces or dashes.' })}
          <div>
            <label htmlFor="s-currency" className="label">Currency</label>
            <input id="s-currency" list="currency-list" className="input max-w-[160px] uppercase" value={form.currency} maxLength={3} onChange={(e) => set('currency', e.target.value.toUpperCase())} />
            <datalist id="currency-list">{CURRENCIES.map((c) => <option key={c} value={c} />)}</datalist>
            <p className="mt-1 text-xs text-ink/50">Changes how prices are displayed. It does not convert amounts.</p>
          </div>
        </section>

        <section className="space-y-5 border border-beige bg-white p-6">
          <h2 className="font-serif text-2xl">Contact &amp; social</h2>
          {text('email', 'Email', { type: 'email' })}
          {text('phone', 'Phone')}
          {text('address', 'Address')}
          {text('instagram', 'Instagram URL', { placeholder: 'https://instagram.com/yourbrand' })}
          {text('facebook', 'Facebook URL', { placeholder: 'https://facebook.com/yourbrand' })}
          {text('tiktok', 'TikTok URL', { placeholder: 'https://tiktok.com/@yourbrand' })}
        </section>
      </div>

      {error && <p className="mt-6 text-sm text-red-700" role="alert">{error}</p>}
      <button type="submit" className="btn-primary mt-8" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button>
    </form>
  );
}
