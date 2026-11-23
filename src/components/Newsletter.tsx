import { useState, type FormEvent } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Frontend-only newsletter form. No service is connected, so NOTHING is stored or sent.
 * To collect real emails later, connect a provider (Mailchimp, Brevo, Buttondown…) in handleSubmit.
 */
export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError('Please enter a valid email address.');
      setDone(false);
      return;
    }
    setError('');
    setDone(true);
    setEmail('');
  };

  return (
    <section className="bg-cream" aria-labelledby="newsletter-title">
      <div className="container-x section text-center">
        <p className="eyebrow mb-3">Stay in touch</p>
        <h2 id="newsletter-title" className="text-3xl sm:text-4xl">
          Join the Jeli circle
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-ink/70">
          Be the first to hear about new collections and private offers.
        </p>
        <form onSubmit={handleSubmit} noValidate className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row">
          <div className="flex-1 text-left">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="input"
              autoComplete="email"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'newsletter-error' : 'newsletter-note'}
            />
            {error && (
              <p id="newsletter-error" className="field-error" role="alert">
                {error}
              </p>
            )}
          </div>
          <button type="submit" className="btn-primary sm:py-3.5">
            Subscribe
          </button>
        </form>
        {done && (
          <p className="mx-auto mt-4 max-w-lg text-sm text-champagne-dark" role="status">
            Thank you. This is a demonstration form: no email service is connected yet, so your address was not saved.
          </p>
        )}
        <p id="newsletter-note" className="mx-auto mt-4 max-w-lg text-xs text-ink/50">
          Demo notice: collecting real subscribers requires a connected email service.
        </p>
      </div>
    </section>
  );
}
