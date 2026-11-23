import { Gem, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import SmartImage from '../components/SmartImage';
import { usePageMeta } from '../hooks/usePageMeta';

const values = [
  { icon: Gem, title: 'Quality in every detail', text: 'We obsess over finish, weight and comfort, because jewellery is worn close to the skin and should feel as good as it looks.' },
  { icon: Sparkles, title: 'Timeless by design', text: 'Clean lines, soft light and proportion. Pieces that outlast the season and sit easily beside the things you already own.' },
  { icon: Heart, title: 'Personal by nature', text: 'Jewellery marks moments: a first job, an engagement, a gift. We design for the stories you will attach to each piece.' },
];

export default function About() {
  usePageMeta('About Us', 'The story, philosophy and commitment to quality behind Jeli Jewellery Vendor.');
  return (
    <>
      <section className="bg-cream">
        <div className="container-x grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-4">Our Story</p>
            <h1 className="text-5xl leading-tight sm:text-6xl">Beauty That Lasts Beyond Trends.</h1>
            <span className="mt-6 block h-px w-14 bg-champagne" aria-hidden />
            <p className="mt-6 leading-relaxed text-ink/75">
              Jeli began with a simple belief: luxury is not about being loud, it is about being right. The right proportion, the right glow, the right piece at the right moment.
            </p>
            <p className="mt-4 leading-relaxed text-ink/75">
              Every design starts with a quiet question: will she still love this in ten years? If the answer is yes, it earns its place in the collection.
            </p>
          </div>
          <SmartImage src="/images/banners/about.svg" alt="Jeli jewellery styled on a champagne backdrop" loading="eager" className="mx-auto aspect-[4/5] w-full max-w-md object-cover lg:max-w-none" />
        </div>
      </section>

      <section className="container-x section">
        <SectionHeading eyebrow="Philosophy" title="Elegance in Every Detail" subtitle="Restraint is our signature. We would rather perfect a single curve than add another ornament." />
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {values.map(({ icon: Icon, title, text }) => (
            <div key={title} className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-champagne-light text-champagne-dark">
                <Icon size={22} strokeWidth={1.4} aria-hidden />
              </span>
              <h2 className="mt-6 font-serif text-2xl">{title}</h2>
              <p className="mt-3 leading-relaxed text-ink/70">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="container-x section text-center">
          <h2 className="text-3xl text-white sm:text-4xl">Our Commitment</h2>
          <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-white/75">
            We commit to honest descriptions, careful presentation and personal service. Orders are handled directly with our team on WhatsApp, so a real person is always on the other end of your purchase.
          </p>
          <Link to="/shop" className="btn-gold mt-10">
            Explore the Collection
          </Link>
        </div>
      </section>
    </>
  );
}
