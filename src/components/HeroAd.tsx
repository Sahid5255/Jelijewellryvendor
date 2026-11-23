import { ArrowRight, Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { heroSlides, heroVideo, SLIDE_MS } from '../data/heroAd';
import { img } from '../data/productImages';

/** Homepage hero: a short, tasteful jewellery advert (slow cross-fading photos, or a video if configured). */
export default function HeroAd() {
  const [index, setIndex] = useState(0);
  // Respect visitors who prefer reduced motion: start paused for them.
  const [playing, setPlaying] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [videoFailed, setVideoFailed] = useState(false);
  const useVideo = Boolean(heroVideo) && !videoFailed;
  const slides = heroSlides;

  useEffect(() => {
    if (!playing || useVideo || slides.length < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [playing, useVideo, slides.length]);

  const current = slides[index] ?? slides[0];

  return (
    <section className="relative isolate overflow-hidden bg-beige" aria-labelledby="hero-title">
      {/* Advert media */}
      {useVideo ? (
        <video
          className="absolute inset-0 -z-10 h-full w-full object-cover object-center md:object-right"
          src={heroVideo}
          poster={slides[0] ? img(slides[0].photo) : undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          onError={() => setVideoFailed(true)}
        />
      ) : (
        slides.map((s, i) => (
          <img
            key={s.photo}
            src={img(s.photo)}
            alt=""
            aria-hidden="true"
            loading={i === 0 ? 'eager' : 'lazy'}
            className={`absolute inset-0 -z-10 h-full w-full object-cover object-center transition-all duration-[1600ms] ease-out md:object-right ${
              i === index ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
            }`}
          />
        ))
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cream/95 via-cream/70 to-transparent sm:via-cream/40" aria-hidden="true" />

      {/* Headline */}
      <div className="container-x flex min-h-[560px] items-center py-20 sm:min-h-[680px]">
        <div className="max-w-xl animate-fade-up">
          <p className="eyebrow mb-5">Jeli Jewellery Vendor</p>
          <h1 id="hero-title" className="text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
            Elegance in Every Detail.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink/75 sm:text-lg">
            Discover jewellery designed to celebrate your beauty, confidence and individuality.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/shop" className="btn-primary">
              Shop Collection
            </Link>
            <Link to="/about" className="btn-outline">
              Our Story
            </Link>
          </div>
        </div>
      </div>

      {/* Advert caption + controls (slideshow only) */}
      {!useVideo && current && slides.length > 1 && (
        <div className="container-x absolute inset-x-0 bottom-6 flex items-center justify-between gap-4">
          <Link
            to={current.to}
            className="group inline-flex items-center gap-2 bg-white/85 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-ink backdrop-blur transition hover:bg-white"
          >
            {current.label}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2" role="group" aria-label="Choose advert slide">
              {slides.map((s, i) => (
                <button
                  key={s.photo}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show ${s.label}`}
                  aria-current={i === index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-ink' : 'w-3 bg-ink/35 hover:bg-ink/60'}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pause advert' : 'Play advert'}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-ink backdrop-blur transition hover:bg-white"
            >
              {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
