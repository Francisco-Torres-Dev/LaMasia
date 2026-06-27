import { BUSINESS_INFO } from '../data/constants';
import { formatNumber } from '../utils/formatCurrency';

export const generateWhatsAppMessage = (items, total, options = {}) => {
  const { promo2x1Discount = 0 } = options;

  const lines = items.map(
    (item) => {
      const size = item.size ? ` (${item.size})` : '';
      const details = item.details ? ` — ${item.details}` : '';
      return `• ${item.quantity}x ${item.name}${size}${details}`;
    }
  );

  const messageLines = [
    `Hola ${BUSINESS_INFO.name}.`,
    '',
    'Quisiera realizar el siguiente pedido:',
    '',
    ...lines,
    '',
  ];

  if (promo2x1Discount > 0) {
    messageLines.push(`Promo 2x1 aplicada: -$${formatNumber(promo2x1Discount)}`);
    messageLines.push('');
  }

  messageLines.push(`Total: $${formatNumber(total)}`);
  messageLines.push('');
  messageLines.push('Muchas gracias.');

  return messageLines.join('\n');
};

export const sendWhatsAppOrder = (items, total, options = {}) => {
  const message = generateWhatsAppMessage(items, total, options);
  const encoded = encodeURIComponent(message);
  const phone = BUSINESS_INFO.whatsapp.replace('+', '');
  window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
};

export default { generateWhatsAppMessage, sendWhatsAppOrder };
