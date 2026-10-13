// Centralized WhatsApp Integration Utility for HomeEase
// Primary Direct WhatsApp Line: 9016526419

export const WHATSAPP_NUMBER = '9016526419';
export const WHATSAPP_DISPLAY = '+91 90165 26419';

export interface WhatsAppMessageDetails {
  serviceTitle?: string;
  seats?: number;
  quantity?: number;
  price?: number;
  date?: string;
  timeSlot?: string;
  city?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  notes?: string;
  customMessage?: string;
}

/**
 * Builds a friendly, structured WhatsApp message for customers to send.
 */
export function buildWhatsAppMessage(details?: WhatsAppMessageDetails): string {
  if (details?.customMessage) {
    return details.customMessage;
  }

  if (!details || !details.serviceTitle) {
    return `Hello HomeEase! 👋 I want to book a home service. Please share details and availability.`;
  }

  const lines: string[] = [
    `*HomeEase Service Booking Inquiry* 🛠️`,
    `--------------------------------`,
    `📌 *Service:* ${details.serviceTitle}`,
  ];

  if (details.seats) {
    lines.push(`🛋️ *Capacity:* ${details.seats} Seater`);
  }

  if (details.quantity && details.quantity > 1) {
    lines.push(`🔢 *Quantity:* ${details.quantity}`);
  }

  if (details.price) {
    lines.push(`💰 *Estimated Amount:* ₹${details.price}`);
  }

  if (details.date) {
    lines.push(`📅 *Preferred Date:* ${details.date}`);
  }

  if (details.timeSlot) {
    lines.push(`⏰ *Preferred Slot:* ${details.timeSlot}`);
  }

  if (details.city) {
    lines.push(`📍 *City:* ${details.city}, Gujarat`);
  }

  if (details.customerName) {
    lines.push(`👤 *Customer Name:* ${details.customerName}`);
  }

  if (details.phone) {
    lines.push(`📞 *Phone Number:* ${details.phone}`);
  }

  if (details.address) {
    lines.push(`🏠 *Address:* ${details.address}`);
  }

  if (details.notes) {
    lines.push(`📝 *Note:* ${details.notes}`);
  }

  lines.push(`--------------------------------`);
  lines.push(`Please confirm my appointment slot and technician dispatch. Thank you!`);

  return lines.join('\n');
}

/**
 * Constructs the direct WhatsApp URL for 9016526419.
 */
export function getWhatsAppUrl(detailsOrMessage?: string | WhatsAppMessageDetails): string {
  const text = typeof detailsOrMessage === 'string'
    ? detailsOrMessage
    : buildWhatsAppMessage(detailsOrMessage);

  return `https://wa.me/91${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/**
 * Opens WhatsApp directly in a new tab or app for 9016526419.
 */
export function openWhatsApp(detailsOrMessage?: string | WhatsAppMessageDetails): void {
  const url = getWhatsAppUrl(detailsOrMessage);
  window.open(url, '_blank', 'noopener,noreferrer');
}
