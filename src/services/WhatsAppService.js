import { BUSINESS_INFO } from '../data/constants';
import { formatNumber } from '../utils/formatCurrency';

export const generateWhatsAppMessage = (items, total, options = {}) => {
  const {
    promo2x1Discount = 0,
    customer = null,
    delivery = null,
    note = null,
    deliveryFee = 0,
  } = options;

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

  if (customer) {
    messageLines.push(`Cliente: ${customer.name}`);
    if (customer.phone) {
      messageLines.push(`Teléfono: ${customer.phone}`);
    }
    messageLines.push('');
  }

  if (delivery) {
    messageLines.push(`Tipo de pedido: ${delivery.type === 'delivery' ? 'Envío' : 'Retiro'}`);
    if (delivery.address) {
      messageLines.push(`Dirección: ${delivery.address}`);
    }
    if (delivery.distanceLabel) {
      messageLines.push(`Distancia: ${delivery.distanceLabel}`);
    }
    if (deliveryFee > 0) {
      messageLines.push(`Costo envío: $${formatNumber(deliveryFee)}`);
    }
    messageLines.push('');
  }

  if (note) {
    messageLines.push(`Nota: ${note}`);
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
