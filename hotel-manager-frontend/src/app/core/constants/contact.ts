/** Número do WhatsApp para contato (formato: 55 + DDD + número, sem espaços). Altere para o número real do hotel. */
export const WHATSAPP_NUMBER = '5511999999999';

export function getWhatsAppUrl(message?: string): string {
  const text = message ? `&text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${WHATSAPP_NUMBER}${text}`;
}
