import { Lock, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SmartImage from '../../components/SmartImage';
import { useCatalog } from '../../context/CatalogContext';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { deleteProduct, importReactProducts, listAllRemoteProducts } from '../../services/adminService';
import { localProducts } from '../../services/productService';
import type { Product } from '../../types';

export default function AdminProducts() {
  const { getCategory, refresh } = useCatalog();
  const { money } = useSettings();
  const { notify } = useToast();
  const [remote, setRemote] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setRemote(await listAllRemoteProducts());
      setError('');
    } catch {
      setError('Could not load Supabase products. Only the protected React products are shown.');
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const migrated = useMemo(() => new Set(remote.map((p) => p.legacyId).filter(Boolean)), [remote]);
  const rows = useMemo(() => {
    const all = [...remote, ...localProducts.filter((p) => !migrated.has(p.id))];
    const q = filter.trim().toLowerCase();
    return q ? all.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(q)) : all;
  }, [remote, migrated, filter]);

  const remaining = localProducts.filter((p) => !migrated.has(p.id)).length;

  const onDelete = async (p: Product) => {
    if (!window.confirm(`Delete “${p.name}”? This permanently removes it and its uploaded images.`)) return;
    try {
      await deleteProduct(p);
      notify('Product deleted');
      await load();
      await refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not delete the product', 'error');
    }
  };

  const onImport = async () => {
    const ok = window.confirm(
      `Copy ${remaining} React product(s) into Supabase?\n\n• Your original React data file is not changed.\n• Products already copied are skipped (no duplicates).\n• Copies replace the originals in the storefront so nothing is listed twice, and become editable here.`,
    );
    if (!ok) return;
    setBusy(true);
    try {
      const { imported, skipped } = await importReactProducts();
      notify(`Imported ${imported} product(s), skipped ${skipped} already in Supabase`);
      await load();
      await refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Import failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">Products</h1>
          <p className="mt-2 text-sm text-ink/60">
            <Lock size={12} className="mr-1 inline" aria-hidden /> React products are protected and read-only here. Supabase products are fully editable.
          </p>
        </div>
        <Link to="/admin/products/new" className="btn-primary"><Plus size={14} aria-hidden /> Add product</Link>
      </div>

      {error && <p className="mt-6 border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}

      <div className="mt-6">
        <label htmlFor="admin-filter" className="sr-only">Filter products</label>
        <input id="admin-filter" className="input max-w-sm" placeholder="Filter by name or category" value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>

      <div className="mt-4 overflow-x-auto border border-beige bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-beige bg-cream text-xs uppercase tracking-widest text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige">
            {!loaded && <tr><td colSpan={6} className="px-4 py-8 text-center text-ink/60">Loading…</td></tr>}
            {loaded && rows.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-ink/60">No products match.</td></tr>}
            {rows.map((p) => {
              const isLocal = p.source === 'local';
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <SmartImage src={p.image} alt="" className="h-12 w-10 object-cover" />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{getCategory(p.category)?.name ?? p.category}</td>
                  <td className="px-4 py-3">{money(p.price)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 text-[10px] uppercase tracking-wider">
                      {!p.isPublished && <span className="bg-ink px-2 py-0.5 text-white">Hidden</span>}
                      {!p.isAvailable && <span className="bg-red-100 px-2 py-0.5 text-red-800">Sold out</span>}
                      {p.isFeatured && <span className="bg-champagne-soft px-2 py-0.5">Featured</span>}
                      {p.isNewArrival && <span className="bg-champagne-soft px-2 py-0.5">New</span>}
                      {p.isOnSale && <span className="bg-champagne-soft px-2 py-0.5">Sale</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {isLocal ? (
                      <span className="inline-flex items-center gap-1 text-ink/60"><Lock size={12} aria-hidden /> React</span>
                    ) : (
                      <span className="text-champagne-dark">Supabase</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {isLocal ? (
                        <span className="px-2 text-xs text-ink/40">Protected</span>
                      ) : (
                        <>
                          <Link to={`/admin/products/${p.remoteId}`} className="p-2 hover:text-champagne-dark" aria-label={`Edit ${p.name}`}><Pencil size={16} aria-hidden /></Link>
                          <button type="button" onClick={() => void onDelete(p)} className="p-2 hover:text-red-700" aria-label={`Delete ${p.name}`}><Trash2 size={16} aria-hidden /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="mt-10 border border-beige bg-white p-6">
        <h2 className="font-serif text-2xl">Optional: migrate React products to Supabase</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70">
          Copies the built-in catalogue into Supabase so you can edit it from this dashboard. It never edits your React data file and never creates duplicates. {remaining === 0 ? 'All React products have already been copied.' : `${remaining} product(s) remain to be copied.`}
        </p>
        <button type="button" className="btn-outline mt-5" disabled={busy || remaining === 0 || Boolean(error)} onClick={() => void onImport()}>
          {busy ? 'Importing…' : 'Copy React products to Supabase'}
        </button>
      </section>
    </div>
  );
}
