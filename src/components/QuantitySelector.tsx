import { Minus, Plus } from 'lucide-react';

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}

export default function QuantitySelector({ value, onChange, min = 1, max = 20, size = 'md' }: Props) {
  const btn = `flex items-center justify-center text-ink transition-colors hover:bg-champagne-soft disabled:opacity-30 disabled:hover:bg-transparent ${
    size === 'sm' ? 'h-8 w-8' : 'h-11 w-11'
  }`;
  return (
    <div className="inline-flex items-center border border-beige" role="group" aria-label="Quantity">
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Decrease quantity">
        <Minus size={14} aria-hidden />
      </button>
      <span className={`text-center text-sm font-medium tabular-nums ${size === 'sm' ? 'w-8' : 'w-10'}`} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Increase quantity">
        <Plus size={14} aria-hidden />
      </button>
    </div>
  );
}
