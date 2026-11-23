import { useState, type ImgHTMLAttributes } from 'react';

const FALLBACK = '/images/placeholder.svg';

/** Lazy-loaded image with a graceful fallback if the file is missing or the remote URL fails. */
export default function SmartImage({ src, alt, className = '', onError, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed || !src ? FALLBACK : src}
      alt={alt ?? ''}
      loading="lazy"
      decoding="async"
      className={className}
      onError={(e) => {
        setFailed(true);
        onError?.(e);
      }}
      {...rest}
    />
  );
}
