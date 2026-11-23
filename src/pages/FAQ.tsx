import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

// SAMPLE ANSWERS: update these to match your real policies before launch.
const faqs = [
  { q: 'How do I place an order?', a: 'Add pieces to your bag, go to checkout and enter your name, phone number and delivery address. We will open WhatsApp with your order request ready to send. Your order is only confirmed once our team replies to you.' },
  { q: 'How do I pay?', a: 'There is no online payment on this website. After you send your order on WhatsApp, we will confirm availability and share payment instructions with you directly.' },
  { q: 'How much is delivery and how long does it take?', a: 'Delivery fees and timing depend on your location and are confirmed with you on WhatsApp before you pay.' },
  { q: 'Can I return or exchange a piece?', a: 'Please contact us on WhatsApp as soon as possible if something isn’t right. Our team will explain the available options for your order.' },
  { q: 'How do I choose my ring or bracelet size?', a: 'Select your size on the product page. If you are unsure, message us before ordering and we will help you find the right fit.' },
  { q: 'How should I care for my jewellery?', a: 'Keep pieces dry, apply perfume and lotion before putting jewellery on, and store each piece separately in its pouch.' },
  { q: 'Do you store my personal details?', a: 'No. Your cart and wishlist stay in your own browser, and checkout details only go into the WhatsApp message you choose to send. See our Privacy Policy for more.' },
];

export default function FAQ() {
  usePageMeta('Frequently Asked Questions', 'Answers about ordering, WhatsApp checkout, delivery, sizing and jewellery care at Jeli Jewellery Vendor.');
  return (
    <>
      <section className="bg-cream">
        <div className="container-x py-14 text-center sm:py-20">
          <p className="eyebrow mb-3">Help</p>
          <h1 className="text-4xl sm:text-5xl">Frequently Asked Questions</h1>
        </div>
      </section>
      <div className="container-x section max-w-3xl">
        <div className="divide-y divide-beige border-y border-beige">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-xl [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus size={18} className="shrink-0 text-champagne-dark transition-transform group-open:rotate-45" aria-hidden />
              </summary>
              <p className="mt-3 leading-relaxed text-ink/70">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-10 text-center text-ink/70">
          Still have a question?{' '}
          <Link to="/contact" className="text-champagne-dark underline">
            Contact us
          </Link>
          .
        </p>
      </div>
    </>
  );
}
