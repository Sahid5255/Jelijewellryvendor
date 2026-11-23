import { useSettings } from '../context/SettingsContext';
import { usePageMeta } from '../hooks/usePageMeta';

export default function Privacy() {
  const { settings } = useSettings();
  usePageMeta('Privacy Policy', 'How Jeli Jewellery Vendor handles your information.');
  return (
    <div className="container-x section max-w-3xl">
      <p className="eyebrow mb-3">Legal</p>
      <h1 className="text-4xl sm:text-5xl">Privacy Policy</h1>
      <p className="mt-4 text-xs text-ink/50">
        Template text: please have it reviewed against your local laws and your actual practices before launch.
      </p>
      <div className="prose-lux mt-8">
        <p>This policy explains how {settings.storeName} handles information when you use this website.</p>
        <h2>Information we do not store</h2>
        <p>This website has no customer database and no online payment system. We do not store your name, phone number, address or order details on the website.</p>
        <h2>Your cart and wishlist</h2>
        <p>Your bag and wishlist are saved only in your own browser (local storage) so they are still there when you return. You can clear them at any time by emptying your bag, removing saved items or clearing your browser data.</p>
        <h2>Orders and messages via WhatsApp</h2>
        <p>When you check out or use the contact form, we open WhatsApp with a message containing the details you entered. That message is sent only if you press send. Once sent, it is handled under WhatsApp’s own terms and privacy policy, and we use your details solely to respond to you and fulfil your order.</p>
        <h2>Newsletter</h2>
        <p>The newsletter form on this website is currently a demonstration and does not collect or store email addresses.</p>
        <h2>Third-party services</h2>
        <p>Product information and images may be provided through Supabase, and fonts may be loaded from Google Fonts. These providers may receive technical information such as your IP address when your browser requests their files.</p>
        <h2>Contact</h2>
        <p>Questions about this policy? Email <a href={`mailto:${settings.email}`} className="text-champagne-dark underline">{settings.email}</a>.</p>
      </div>
    </div>
  );
}
