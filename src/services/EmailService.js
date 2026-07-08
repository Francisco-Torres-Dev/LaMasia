import { BUSINESS_INFO } from '../data/constants';

/**
 * Prepara el payload del pedido para futura integración con backend Spring Boot.
 * No envía correo directamente — listo para POST a API REST.
 */
export const EmailService = {
  /**
   * @param {Object} orderData
   * @param {Array} orderData.items
   * @param {number} orderData.subtotal
   * @param {number} orderData.discount
   * @param {number} orderData.total
   * @param {string|null} orderData.couponCode
   * @param {Object|null} orderData.customer - Datos del cliente (opcional)
   * @returns {Object} Payload listo para API
   */
  buildOrderPayload({ items, subtotal, discount, total, couponCode, customer = null, delivery = null, note = null, deliveryFee = 0 }) {
    return {
      businessName: BUSINESS_INFO.name,
      businessEmail: BUSINESS_INFO.email,
      orderDate: new Date().toISOString(),
      customer: customer || {
        name: 'Cliente Web',
        phone: null,
        email: null,
      },
      items: items.map((item) => ({
        productId: item.productId || item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        details: item.details || null,
        category: item.category || 'general',
      })),
      pricing: {
        subtotal,
        discount,
        total,
        couponCode: couponCode || null,
        currency: 'CLP',
      },
      delivery: delivery || {
        type: 'pickup',
        address: BUSINESS_INFO.address,
      },
      note,
      deliveryFee,
      metadata: {
        source: 'web-frontend',
        version: '1.0.0',
      },
    };
  },

  /**
   * Simula envío — en producción reemplazar por fetch a API.
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async sendOrderEmail(payload) {
    console.info('[EmailService] Payload listo para backend:', payload);

    return {
      success: true,
      message: 'Pedido preparado para envío por correo (integración backend pendiente)',
      payload,
      endpoint: '/api/orders/email',
      method: 'POST',
    };
  },
};

export default EmailService;
