import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { listAllRemoteProducts } from '../../services/adminService';
import { localProducts } from '../../services/productService';
import type { Product } from '../../types';
import { formatDate } from '../../utils/format';

export default function AdminDashboard() {
  const { categories, status, refresh } = useCatalog();
  const [remote, setRemote] = useState<Product[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    listAllRemoteProducts()
      .then((p) => active && setRemote(p))
      .catch(() => active && setError('Could not load Supabase products.'));
    return () => {
      active = false;
    };
  }, []);

  // Rows copied from React products replace them in the storefront, so don't double count them.
  const migrated = new Set((remote ?? []).map((p) => p.legacyId).filter(Boolean));
  const reactCount = localProducts.filter((p) => !migrated.has(p.id)).length;
  const remoteCount = remote?.length ?? 0;
  const all = [...localProducts.filter((p) => !migrated.has(p.id)), ...(remote ?? [])];
  const featured = all.filter((p) => p.isFeatured).length;
  const recent = (remote ?? []).slice(0, 6);

  const stats = [
    { label: 'Total products', value: remote ? all.length : '…' },
    { label: 'React products', value: reactCount, hint: 'Protected, shipped with the site' },
    { label: 'Supabase products', value: remote ? remoteCount : '…', hint: 'Managed here' },
    { label: 'Categories', value: categories.length },
    { label: 'Featured products', value: remote ? featured : '…' },
  ];

  return (
    <div>
      <h1 className="text-4xl">Overview</h1>
      <p className="mt-2 text-sm text-ink/60">
        Supabase status:{' '}
        <span className={status === 'ok' ? 'text-green-700' : 'text-red-700'}>
          {status === 'ok' ? 'connected' : status === 'loading' ? 'connecting…' : 'unavailable'}
        </span>{' '}
        {status === 'unavailable' && (
          <button type="button" className="ml-2 underline" onClick={() => void refresh()}>Retry</button>
        )}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="border border-beige bg-white p-5">
            <p className="text-xs uppercase tracking-widest text-ink/60">{s.label}</p>
            <p className="mt-2 font-serif text-4xl">{s.value}</p>
            {'hint' in s && s.hint && <p className="mt-1 text-xs text-ink/50">{s.hint}</p>}
          </div>
        ))}
      </div>

      {error && <p className="mt-6 text-sm text-red-700" role="alert">{error}</p>}

      <section className="mt-10 border border-beige bg-white">
        <div className="flex items-center justify-between border-b border-beige px-5 py-4">
          <h2 className="font-serif text-2xl">Recent product updates</h2>
          <Link to="/admin/products/new" className="btn-primary px-4 py-2.5">Add product</Link>
        </div>
        {recent.length === 0 ? (
          <p className="p-6 text-sm text-ink/60">No Supabase products yet. Products you add in the dashboard will appear here.</p>
        ) : (
          <ul className="divide-y divide-beige">
            {recent.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <Link to={`/admin/products/${p.remoteId}`} className="font-medium hover:text-champagne-dark">{p.name}</Link>
                <span className="text-ink/60">Updated {formatDate(p.updatedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
