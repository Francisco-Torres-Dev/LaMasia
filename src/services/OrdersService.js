import StorageService from './StorageService';
import { generateId } from '../utils/generateId';
import { BUSINESS_INFO } from '../data/constants';

const formatComandaTime = (date = new Date()) =>
  date.toLocaleString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

/**
 * Gestión de pedidos y comandas en LocalStorage.
 */
export const OrdersService = {
  getOrders() {
    return StorageService.get(StorageService.keys.ORDERS, []);
  },

  saveOrders(orders) {
    StorageService.set(StorageService.keys.ORDERS, orders);
  },

  getComandas() {
    return StorageService.get(StorageService.keys.COMANDAS, []);
  },

  saveComandas(comandas) {
    StorageService.set(StorageService.keys.COMANDAS, comandas);
  },

  createOrder({ items, rawSubtotal, promo2x1Discount, couponDiscount, total, couponCode, customer = null, delivery = null, note = null, deliveryFee = 0 }) {
    const orders = this.getOrders();
    const order = {
      id: generateId(),
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.size || null,
        details: item.details || null,
      })),
      rawSubtotal,
      promo2x1Discount,
      couponDiscount,
      deliveryFee,
      total,
      couponCode: couponCode || null,
      customer: customer || {
        name: 'Cliente Web',
        phone: null,
        email: null,
      },
      delivery: delivery || {
        type: 'pickup',
        address: BUSINESS_INFO.address,
        distanceLabel: 'Retiro',
      },
      note: note || null,
      status: 'pendiente',
      comandaId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.unshift(order);
    this.saveOrders(orders);
    return order;
  },

  updateOrderStatus(orderId, status) {
    const orders = this.getOrders().map((order) =>
      order.id === orderId
        ? { ...order, status, updatedAt: new Date().toISOString() }
        : order
    );
    this.saveOrders(orders);
    return orders.find((o) => o.id === orderId);
  },

  updateOrder(orderId, updates = {}) {
    const orders = this.getOrders();
    let updatedOrder = null;

    const newOrders = orders.map((order) => {
      if (order.id !== orderId) return order;

      // Merge nested delivery safely
      const mergedDelivery = { ...(order.delivery || {}), ...(updates.delivery || {}) };

      const merged = {
        ...order,
        ...updates,
        delivery: mergedDelivery,
        updatedAt: new Date().toISOString(),
      };

      // Recompute total from components if available
      const rawSubtotal = merged.rawSubtotal ?? 0;
      const promo2x1Discount = merged.promo2x1Discount ?? 0;
      const couponDiscount = merged.couponDiscount ?? 0;
      const deliveryFee = merged.deliveryFee ?? 0;

      merged.total = rawSubtotal - promo2x1Discount - couponDiscount + deliveryFee;

      updatedOrder = merged;
      return merged;
    });

    if (updatedOrder) this.saveOrders(newOrders);
    return updatedOrder;
  },

  acceptOrder(orderId) {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    const comandaId = `CMD-${Date.now().toString().slice(-8)}`;
    const now = new Date();

    const comanda = {
      id: comandaId,
      orderId: order.id,
      items: order.items,
      total: order.total,
      promo2x1Discount: order.promo2x1Discount,
      deliveryFee: order.deliveryFee,
      note: order.note,
      delivery: order.delivery,
      customer: order.customer,
      createdAt: now.toISOString(),
      time: formatComandaTime(now),
    };

    const comandas = this.getComandas();
    comandas.unshift(comanda);
    this.saveComandas(comandas);

    const updatedOrders = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status: 'aceptado',
            comandaId,
            updatedAt: now.toISOString(),
          }
        : o
    );
    this.saveOrders(updatedOrders);

    return { order: updatedOrders.find((o) => o.id === orderId), comanda };
  },

  getOrdersByDate(dateStr) {
    if (!dateStr) return this.getOrders();

    return this.getOrders().filter((order) => {
      const orderDate = order.createdAt.slice(0, 10);
      return orderDate === dateStr;
    });
  },

  exportOrdersToTxt(orders, dateLabel) {
    const lines = [
      'LA MASIA PIZZERÍA — REPORTE DE PEDIDOS',
      `Fecha: ${dateLabel}`,
      `Generado: ${formatComandaTime()}`,
      '='.repeat(50),
      '',
    ];

    if (orders.length === 0) {
      lines.push('No hay pedidos para esta fecha.');
    }

    orders.forEach((order, index) => {
      lines.push(`Pedido #${index + 1} — ID: ${order.id}`);
      lines.push(`Estado: ${order.status.toUpperCase()}`);
      if (order.comandaId) lines.push(`Comanda: ${order.comandaId}`);
      lines.push(`Hora: ${formatComandaTime(new Date(order.createdAt))}`);
      lines.push('Detalle:');
      order.items.forEach((item) => {
        const size = item.size ? ` (${item.size})` : '';
        const details = item.details ? ` — ${item.details}` : '';
        lines.push(`  • ${item.quantity}x ${item.name}${size}${details} — $${(item.price * item.quantity).toLocaleString('es-CL')}`);
      });
      if (order.promo2x1Discount > 0) {
        lines.push(`  Promo 2x1: -$${order.promo2x1Discount.toLocaleString('es-CL')}`);
      }
      if (order.couponDiscount > 0) {
        lines.push(`  Cupón${order.couponCode ? ` (${order.couponCode})` : ''}: -$${order.couponDiscount.toLocaleString('es-CL')}`);
      }
      if (order.customer) {
        lines.push(`Cliente: ${order.customer.name}${order.customer.phone ? ` / ${order.customer.phone}` : ''}`);
      }
      if (order.delivery) {
        lines.push(`Tipo de pedido: ${order.delivery.type === 'delivery' ? 'Envío' : 'Retiro'}`);
        if (order.delivery.address) {
          lines.push(`Dirección: ${order.delivery.address}`);
        }
        if (order.delivery.distanceLabel) {
          lines.push(`Distancia: ${order.delivery.distanceLabel}`);
        }
      }
      if (order.note) {
        lines.push(`Nota: ${order.note}`);
      }
      if (order.deliveryFee > 0) {
        lines.push(`Costo envío: $${order.deliveryFee.toLocaleString('es-CL')}`);
      }
      lines.push(`  TOTAL: $${order.total.toLocaleString('es-CL')}`);
      lines.push('-'.repeat(50));
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedidos-lamasia-${dateLabel}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  },
};

export default OrdersService;
