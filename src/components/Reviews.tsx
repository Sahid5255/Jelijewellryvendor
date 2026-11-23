import { Star } from 'lucide-react';
import SectionHeading from './SectionHeading';

// DEMONSTRATION CONTENT ONLY: not real customers. Replace with genuine reviews once you have them.
const sampleReviews = [
  {
    name: 'Sample Customer A',
    piece: 'Pearl necklace',
    text: 'Sample review: the kind of understated piece that lifts an entire outfit. Elegant packaging, too.',
  },
  {
    name: 'Sample Customer B',
    piece: 'Drop earrings',
    text: 'Sample review: light to wear all day and they catch the light beautifully. Exactly as pictured.',
  },
  {
    name: 'Sample Customer C',
    piece: 'Bridal set',
    text: 'Sample review: a thoughtful, cohesive set. It felt like a true gift from the moment it was unwrapped.',
  },
];

export default function Reviews() {
  return (
    <section className="container-x section" aria-labelledby="reviews-title">
      <SectionHeading
        eyebrow="Kind Words"
        title="Loved by Our Customers"
        subtitle="Demonstration content: genuine customer reviews will appear here as they are collected."
      />
      <h2 id="reviews-title" className="sr-only">
        Customer reviews (sample)
      </h2>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {sampleReviews.map((r) => (
          <figure key={r.name} className="relative border border-beige bg-white p-8 text-center">
            <span className="absolute right-3 top-3 border border-champagne-light px-2 py-0.5 text-[9px] uppercase tracking-widest text-champagne-dark">
              Sample
            </span>
            <div className="flex justify-center gap-0.5 text-champagne" aria-label="5 out of 5 stars (sample)">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} className="fill-champagne" aria-hidden />
              ))}
            </div>
            <blockquote className="mt-5 font-serif text-xl leading-relaxed text-ink/85">{r.text}</blockquote>
            <figcaption className="mt-6 text-xs uppercase tracking-widest text-ink/60">
              {r.name} · {r.piece}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
