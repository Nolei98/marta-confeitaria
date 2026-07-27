// Single source of truth for the shop's WhatsApp contact. Kept here so the
// number never drifts between the header, footer, forms and the checkout
// fallback — a wrong number silently sends customers nowhere.
export const WHATSAPP_NUMBER = "5587999021574";

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

/** Same number, formatted for display in page copy. */
export const WHATSAPP_DISPLAY = "(87) 99902-1574";

/** Same number in E.164, for schema.org / tel: links. */
export const WHATSAPP_E164 = "+55 87 99902-1574";

/** Builds a wa.me link with a pre-filled message. */
export function whatsappLink(message: string) {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}
