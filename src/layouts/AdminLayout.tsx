import { AlertTriangle, ExternalLink, FolderTree, LayoutDashboard, LogOut, Package, Settings } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import PageLoader from '../components/PageLoader';
import { useAuth } from '../context/AuthContext';
import { useCatalog } from '../context/CatalogContext';

const nav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree, end: false },
  { to: '/admin/settings', label: 'Store settings', icon: Settings, end: false },
];

function Centered({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-cream p-6"><div className="w-full max-w-lg bg-white p-8 text-center shadow-sm">{children}</div></div>;
}

export default function AdminLayout() {
  const { configured, loading, user, isAdmin, unreachable, signOut } = useAuth();
  const { status } = useCatalog();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Admin | Jeli Jewellery Vendor';
    // The admin area must never be indexed.
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex,nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  if (!configured) {
    return (
      <Centered>
        <AlertTriangle className="mx-auto text-champagne-dark" size={32} aria-hidden />
        <h1 className="mt-4 text-3xl">Supabase isn’t connected</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          The storefront works without it, but the admin dashboard needs Supabase. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code> file, run <code>supabase/schema.sql</code>, then restart the dev server. See the README.
        </p>
        <Link to="/" className="btn-outline mt-6">Back to store</Link>
      </Centered>
    );
  }

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;

  if (!isAdmin) {
    return (
      <Centered>
        <h1 className="text-3xl">{unreachable ? 'Can’t reach Supabase' : 'Not authorised'}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          {unreachable
            ? 'The admin check could not be completed. Your Supabase project may be paused or offline. The store itself is unaffected. Try again shortly.'
            : <>This account ({user.email}) is not an administrator. Ask the store owner to add it to the <code>admin_users</code> table.</>}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" className="btn-outline" onClick={() => window.location.reload()}>Retry</button>
          <button type="button" className="btn-primary" onClick={() => void signOut()}>Sign out</button>
        </div>
      </Centered>
    );
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isActive ? 'bg-champagne-soft font-medium text-ink' : 'text-ink/70 hover:bg-cream hover:text-ink'}`;

  return (
    <div className="min-h-screen bg-cream/60 lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="border-b border-beige bg-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block lg:py-8">
          <div>
            <p className="font-serif text-xl font-semibold uppercase tracking-[0.25em]">Jeli</p>
            <p className="text-[10px] uppercase tracking-[0.4em] text-champagne-dark">Admin</p>
          </div>
          <button type="button" onClick={() => void signOut()} className="p-2 text-ink/60 hover:text-ink lg:hidden" aria-label="Sign out">
            <LogOut size={18} aria-hidden />
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-0" aria-label="Admin">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon size={17} aria-hidden /> <span className="whitespace-nowrap">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="hidden px-5 py-8 text-xs text-ink/60 lg:block">
          <p className="truncate">{user.email}</p>
          <button type="button" onClick={() => void signOut()} className="mt-3 flex items-center gap-2 uppercase tracking-widest hover:text-ink">
            <LogOut size={14} aria-hidden /> Sign out
          </button>
          <Link to="/" className="mt-3 flex items-center gap-2 uppercase tracking-widest hover:text-ink">
            <ExternalLink size={14} aria-hidden /> View store
          </Link>
        </div>
      </aside>

      <main className="min-w-0 p-5 sm:p-8 lg:p-10">
        {status === 'unavailable' && (
          <div className="mb-6 flex items-start gap-3 border border-champagne-light bg-champagne-soft/60 p-4 text-sm" role="status">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-champagne-dark" aria-hidden />
            <p>
              Supabase is currently unreachable (it may be paused or offline). Customers still see the built-in React products; Supabase-managed products will return automatically when it is back.
            </p>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
