import { useSettings } from '../context/SettingsContext';
import { usePageMeta } from '../hooks/usePageMeta';

export default function Terms() {
  const { settings } = useSettings();
  usePageMeta('Terms & Conditions', 'Terms of use and ordering for Jeli Jewellery Vendor.');
  return (
    <div className="container-x section max-w-3xl">
      <p className="eyebrow mb-3">Legal</p>
      <h1 className="text-4xl sm:text-5xl">Terms &amp; Conditions</h1>
      <p className="mt-4 text-xs text-ink/50">
        Template text: please have it reviewed against your local laws and your actual policies before launch.
      </p>
      <div className="prose-lux mt-8">
        <p>By using this website you agree to these terms. {settings.storeName} may update them from time to time.</p>
        <h2>Ordering</h2>
        <p>Submitting an order through this website means opening a WhatsApp conversation with a prepared order request. It is a request to buy, not a confirmed order. An order is confirmed only when our team confirms it to you directly, including availability, delivery and payment details.</p>
        <h2>Prices and availability</h2>
        <p>The price of each item is confirmed with you on WhatsApp before any payment, and may change without notice. Items may sell out. We may decline or cancel a request if a price or description was published in error.</p>
        <h2>Payment</h2>
        <p>No payment is taken on this website. Payment methods and instructions are agreed with you on WhatsApp.</p>
        <h2>Delivery</h2>
        <p>Delivery costs and timing depend on your location and are confirmed before you pay.</p>
        <h2>Returns</h2>
        <p>If there is a problem with your order, contact us promptly so we can discuss the options available.</p>
        <h2>Product information</h2>
        <p>We aim to describe and photograph our jewellery accurately. Colours may vary slightly between screens.</p>
        <h2>Contact</h2>
        <p>Questions? Email <a href={`mailto:${settings.email}`} className="text-champagne-dark underline">{settings.email}</a>.</p>
      </div>
    </div>
  );
}
