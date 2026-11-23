import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

export default function NotFound({ message }: { message?: string }) {
  usePageMeta('Page not found');
  return (
    <section className="container-x section text-center">
      <p className="eyebrow mb-4">Error 404</p>
      <h1 className="text-5xl sm:text-6xl">Page not found</h1>
      <span className="mx-auto mt-6 block h-px w-14 bg-champagne" aria-hidden />
      <p className="mx-auto mt-6 max-w-md text-ink/70">{message ?? 'The page you are looking for has moved or no longer exists.'}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
        <Link to="/shop" className="btn-outline">
          Shop Jewellery
        </Link>
      </div>
    </section>
  );
}
