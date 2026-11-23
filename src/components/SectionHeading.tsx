import type { ReactNode } from 'react';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  align?: 'center' | 'left';
  className?: string;
}

export default function SectionHeading({ eyebrow, title, subtitle, align = 'center', className = '' }: Props) {
  return (
    <div className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-2xl ${className}`}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-3xl leading-tight sm:text-4xl lg:text-[44px]">{title}</h2>
      <span className={`mt-5 block h-px w-14 bg-champagne ${align === 'center' ? 'mx-auto' : ''}`} aria-hidden />
      {subtitle && <p className="mt-5 leading-relaxed text-ink/70">{subtitle}</p>}
    </div>
  );
}
