import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { configured, loading, user, isAdmin, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Admin sign in | Jeli Jewellery Vendor';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex,nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  if (!loading && user && isAdmin) return <Navigate to="/admin" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      // Deliberately generic: never reveal whether the email exists.
      const msg = err instanceof Error ? err.message : '';
      setError(/timed out|fetch|network/i.test(msg) ? 'Can’t reach Supabase right now. Please try again shortly.' : 'Sign-in failed. Check your email and password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-6">
      <div className="w-full max-w-md bg-white p-8 shadow-sm sm:p-10">
        <div className="text-center">
          <p className="font-serif text-2xl font-semibold uppercase tracking-[0.3em]">Jeli</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.45em] text-champagne-dark">Admin</p>
        </div>
        {!configured ? (
          <p className="mt-8 text-center text-sm leading-relaxed text-ink/70">
            Supabase isn’t configured. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env</code> and restart.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="admin-email" className="label">Email</label>
              <input id="admin-email" type="email" required autoComplete="username" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label htmlFor="admin-password" className="label">Password</label>
              <input id="admin-password" type="password" required autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
            {user && !isAdmin && !loading && (
              <p className="text-sm text-red-700" role="alert">This account is signed in but is not an administrator.</p>
            )}
            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}
        <Link to="/" className="mt-8 block text-center text-xs uppercase tracking-widest text-ink/60 hover:text-ink">
          ← Back to store
        </Link>
      </div>
    </div>
  );
}
