import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

/** The Jeli monogram: a thin gold ring with a small gem and a "J". Pure SVG, so it stays sharp at any size. */
function Mark({ light, className = '' }: { light: boolean; className?: string }) {
  const ink = light ? '#FFFFFF' : '#161412';
  const gold = light ? '#D9C29A' : '#B8975A';
  return (
    <svg viewBox="310 44 180 196" className={className} aria-hidden="true" focusable="false">
      <path d="M422.26 66.93 A86 86 0 1 1 377.74 66.93" fill="none" stroke={gold} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M400 49.38 L411.7 64 L400 78.62 L388.3 64 Z" fill={gold} />
      <path
        d="M406.88 115 V165.48 Q406.88 193 389.68 193 Q369.04 193 369.04 168.92"
        fill="none"
        stroke={ink}
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M389.68 110.44 H424.08" stroke={ink} strokeWidth="7.8" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ light = false, className = '' }: { light?: boolean; className?: string }) {
  const { settings } = useSettings();
  const [first, ...rest] = settings.storeName.split(' ');
  return (
    <Link to="/" aria-label={`${settings.storeName} home`} className={`inline-flex items-center gap-3 leading-none ${className}`}>
      {settings.logoUrl ? (
        <img src={settings.logoUrl} alt={settings.storeName} className="h-10 w-auto object-contain" />
      ) : (
        <>
          <Mark light={light} className="h-10 w-auto sm:h-12" />
          <span className="flex flex-col items-center">
            <span className={`font-serif text-2xl font-semibold uppercase tracking-[0.32em] sm:text-[28px] ${light ? 'text-white' : 'text-ink'}`}>
              {first}
            </span>
            {rest.length > 0 && (
              <span className={`mt-1 text-[9px] uppercase tracking-[0.5em] ${light ? 'text-champagne-light' : 'text-champagne-dark'}`}>
                {rest.join(' ')}
              </span>
            )}
          </span>
        </>
      )}
    </Link>
  );
}
