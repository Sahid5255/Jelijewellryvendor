import type { CartItem } from '../types';
import { SHOW_PRICES } from '../data/siteConfig';
import { formatPrice, hasPrice } from './format';

export function normalizePhone(input: string): string {
  return input.replace(/\D/g, '');
}

/** wa.me needs international format, digits only. Anything shorter than 8 digits is almost certainly a typo. */
export function isValidWhatsAppNumber(input: string): boolean {
  const digits = normalizePhone(input);
  return digits.length >= 8 && digits.length <= 15;
}

export interface OrderDetails {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

export interface OrderLine {
  item: CartItem;
  unitPrice: number;
}

function orderRows(lines: OrderLine[], currency: string): string[] {
  return lines.map(({ item, unitPrice }, i) => {
    const variant = item.variant ? ` (${item.variant})` : '';
    if (!SHOW_PRICES) return `${i + 1}. ${item.name}${variant}\n   Quantity: ${item.quantity}`;
    if (!hasPrice(unitPrice)) return `${i + 1}. ${item.name}${variant}\n   Quantity: ${item.quantity} (price to be confirmed)`;
    return `${i + 1}. ${item.name}${variant}\n   ${item.quantity} x ${formatPrice(unitPrice, currency)} = ${formatPrice(unitPrice * item.quantity, currency)}`;
  });
}

/** Short message used by the "Order on WhatsApp" button in the bag: the items only, details are sent in the chat. */
export function buildCartMessage(storeName: string, lines: OrderLine[], total: number, currency: string): string {
  const parts = [`Hello ${storeName}, I would like to order:`, '', ...orderRows(lines, currency), ''];
  if (SHOW_PRICES) parts.push(`*Total: ${formatPrice(total, currency)}*`, '(Excludes delivery fees and any item with a price to be confirmed.)', '');
  parts.push('I will send my name and delivery address here. Please confirm availability, price, delivery cost and payment details. Thank you!');
  return parts.join('\n');
}

export function buildOrderMessage(
  storeName: string,
  customer: OrderDetails,
  lines: OrderLine[],
  total: number,
  currency: string,
): string {
  const rows = orderRows(lines, currency);
  const parts = [
    `Hello ${storeName}, I would like to place an order request.`,
    '',
    '*Customer details*',
    `Name: ${customer.name.trim()}`,
    `Phone: ${customer.phone.trim()}`,
    `Delivery address: ${customer.address.trim()}`,
    '',
    '*Order*',
    ...rows,
    '',
    ...(SHOW_PRICES
      ? [`*Total: ${formatPrice(total, currency)}*`, '(Excludes delivery fees and any item with a price to be confirmed.)']
      : ['Please send me the price for these items.']),
  ];
  if (customer.notes && customer.notes.trim()) {
    parts.push('', '*Notes*', customer.notes.trim());
  }
  parts.push('', 'Please confirm availability, price, delivery cost and payment details. Thank you!');
  return parts.join('\n');
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
}
