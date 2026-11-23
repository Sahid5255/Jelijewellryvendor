import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Logo from './Logo';
import SearchOverlay from './SearchOverlay';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop', end: false },
  { to: '/about', label: 'About Us', end: false },
  { to: '/contact', label: 'Contact', end: false },
];

function Badge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne-dark px-1 text-[10px] font-medium text-white">
      {n > 99 ? '99+' : n}
    </span>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count: cartCount } = useCart();
  const { count: wishCount } = useWishlist();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `link-underline text-[12px] font-medium uppercase tracking-[0.2em] transition-colors hover:text-champagne-dark ${
      isActive ? 'text-champagne-dark after:w-full' : 'text-ink'
    }`;

  const iconBtn = 'relative p-2 transition-colors hover:text-champagne-dark';

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur transition-shadow ${scrolled ? 'shadow-[0_1px_0_0_#EFE6D6]' : ''}`}>
      <div className="container-x flex h-[72px] items-center justify-between gap-4">
        <div className="flex flex-1 items-center lg:hidden">
          <button type="button" className={iconBtn} onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}>
            <Menu size={22} aria-hidden />
          </button>
        </div>

        <nav className="hidden flex-1 items-center gap-8 lg:flex" aria-label="Main">
          {links.slice(0, 3).map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={navClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <Logo className="shrink-0" />

        <nav className="hidden flex-1 items-center justify-end gap-8 lg:flex" aria-label="Secondary">
          {links.slice(3).map((l) => (
            <NavLink key={l.to} to={l.to} className={navClass}>
              {l.label}
            </NavLink>
          ))}
          <span className="h-5 w-px bg-beige" aria-hidden />
          <div className="flex items-center gap-1">
            <button type="button" className={iconBtn} onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={20} aria-hidden />
            </button>
            <NavLink to="/wishlist" className={iconBtn} aria-label={`Wishlist, ${wishCount} items`}>
              <Heart size={20} aria-hidden />
              <Badge n={wishCount} />
            </NavLink>
            <NavLink to="/cart" className={iconBtn} aria-label={`Shopping bag, ${cartCount} items`}>
              <ShoppingBag size={20} aria-hidden />
              <Badge n={cartCount} />
            </NavLink>
          </div>
        </nav>

        <div className="flex flex-1 items-center justify-end gap-0.5 lg:hidden">
          <button type="button" className={iconBtn} onClick={() => setSearchOpen(true)} aria-label="Search">
            <Search size={20} aria-hidden />
          </button>
          <NavLink to="/wishlist" className={`${iconBtn} hidden sm:inline-flex`} aria-label={`Wishlist, ${wishCount} items`}>
            <Heart size={20} aria-hidden />
            <Badge n={wishCount} />
          </NavLink>
          <NavLink to="/cart" className={iconBtn} aria-label={`Shopping bag, ${cartCount} items`}>
            <ShoppingBag size={20} aria-hidden />
            <Badge n={cartCount} />
          </NavLink>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 animate-fade-in bg-ink/50" onClick={() => setMenuOpen(false)} aria-label="Close menu" />
          <div className="relative flex h-full w-[85%] max-w-sm animate-slide-in flex-col bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <Logo />
              <button type="button" className="p-2" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X size={22} aria-hidden />
              </button>
            </div>
            <nav className="mt-10 flex flex-col" aria-label="Mobile">
              {[...links, { to: '/wishlist', label: 'Wishlist', end: false }].map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `border-b border-beige py-4 font-serif text-2xl ${isActive ? 'text-champagne-dark' : 'text-ink'}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
