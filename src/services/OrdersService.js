import StorageService from './StorageService';
import InventoryService from './InventoryService';
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
 * Genera pedidos históricos realistas de los últimos 14 días para que el
 * Dashboard Analítico tenga estadísticas reales de ventas desde el inicio.
 */
const buildSeedOrders = () => {
  const now = new Date();
  const makeDate = (daysAgo, hour, minute) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  const sampleBlueprints = [
    // Hoy (daysAgo = 0)
    {
      daysAgo: 0,
      hour: 13,
      minute: 20,
      customer: { name: 'Matías Rojas', phone: '+56 9 8412 3310' },
      delivery: { type: 'delivery', address: 'Av. Concha y Toro 2410, Puente Alto', distanceLabel: 'Hasta 3 km' },
      deliveryFee: 2000,
      status: 'entregado',
      promo2x1Discount: 17900,
      items: [
        { productId: 'pizza-pepperoni', name: 'Pepperoni', category: 'pizza', size: 'Familiar', quantity: 1, price: 17900 },
        { productId: 'pizza-chilena', name: 'Chilena', category: 'pizza', size: 'Familiar', quantity: 1, price: 20900 },
        { productId: 'bebida-familiar', name: 'Bebida familiar', category: 'bebida', size: null, quantity: 1, price: 2600 },
      ],
    },
    {
      daysAgo: 0,
      hour: 14,
      minute: 45,
      customer: { name: 'Valentina Muñoz', phone: '+56 9 7123 9044' },
      delivery: { type: 'pickup', address: BUSINESS_INFO.address, distanceLabel: 'Retiro' },
      deliveryFee: 0,
      status: 'entregado',
      promo2x1Discount: 18900,
      items: [
        { productId: 'pizza-camaron-bacon', name: 'Camarón Bacon', category: 'pizza', size: 'Mediana', quantity: 1, price: 20900 },
        { productId: 'pizza-mechada', name: 'Mechada', category: 'pizza', size: 'Mediana', quantity: 1, price: 18900 },
        { productId: 'palitos-ajo', name: 'Palitos de ajo (6)', category: 'acompanamiento', size: null, quantity: 1, price: 3900 },
      ],
    },
    {
      daysAgo: 0,
      hour: 19,
      minute: 15,
      customer: { name: 'Diego Contreras', phone: '+56 9 6532 1188' },
      delivery: { type: 'delivery', address: 'Camilo Henríquez 3890, Puente Alto', distanceLabel: '3.1 a 4.1 km' },
      deliveryFee: 3000,
      status: 'en-preparacion',
      promo2x1Discount: 24500,
      items: [
        { productId: 'pizza-4-carnes', name: '4 Carnes', category: 'pizza', size: 'Familiar', quantity: 1, price: 28500 },
        { productId: 'pizza-il-bambino', name: 'Il Bambino', category: 'pizza', size: 'Familiar', quantity: 1, price: 24500 },
        { productId: 'stromboli', name: 'Stromboli (6)', category: 'acompanamiento', size: null, quantity: 1, price: 6900 },
      ],
    },
    // Ayer (daysAgo = 1)
    {
      daysAgo: 1,
      hour: 14,
      minute: 10,
      customer: { name: 'Camila Soto', phone: '+56 9 9102 4421' },
      delivery: { type: 'delivery', address: 'Gabriela Oriente 1420', distanceLabel: 'Hasta 3 km' },
      deliveryFee: 2000,
      status: 'entregado',
      promo2x1Discount: 14000,
      items: [
        { productId: 'pizza-pepperoni', name: 'Pepperoni', category: 'pizza', size: 'Mediana', quantity: 2, price: 14000 },
        { productId: 'papas-cheddar-tocino-m', name: 'Papas Cheddar + Tocino Mediana', category: 'papas', size: null, quantity: 1, price: 3900 },
      ],
    },
    {
      daysAgo: 1,
      hour: 19,
      minute: 30,
      customer: { name: 'Sebastián Vera', phone: '+56 9 5441 7762' },
      delivery: { type: 'delivery', address: 'Nonato Coo 2911', distanceLabel: 'Hasta 3 km' },
      deliveryFee: 2000,
      status: 'entregado',
      promo2x1Discount: 20900,
      items: [
        { productId: 'pizza-la-masia', name: 'La Masia', category: 'pizza', size: 'Familiar', quantity: 1, price: 25900 },
        { productId: 'pizza-full-pepperoni', name: 'Full Pepperoni', category: 'pizza', size: 'Familiar', quantity: 1, price: 20900 },
        { productId: 'alitas-bbq', name: 'Alitas BBQ (6)', category: 'acompanamiento', size: null, quantity: 1, price: 5900 },
      ],
    },
    {
      daysAgo: 1,
      hour: 21,
      minute: 15,
      customer: { name: 'Fernanda Lagos', phone: '+56 9 8821 3091' },
      delivery: { type: 'pickup', address: BUSINESS_INFO.address, distanceLabel: 'Retiro' },
      deliveryFee: 0,
      status: 'entregado',
      promo2x1Discount: 17900,
      items: [
        { productId: 'pizza-pollo-bbq', name: 'Pollo BBQ', category: 'pizza', size: 'Familiar', quantity: 1, price: 23600 },
        { productId: 'pizza-margarita', name: 'Margarita', category: 'pizza', size: 'Familiar', quantity: 1, price: 17900 },
      ],
    },
    // Hace 2 días
    {
      daysAgo: 2,
      hour: 18,
      minute: 40,
      customer: { name: 'Nicolás Fuentes', phone: '+56 9 4322 8890' },
      delivery: { type: 'delivery', address: 'Av. San Carlos 1820', distanceLabel: 'Hasta 3 km' },
      deliveryFee: 2000,
      status: 'entregado',
      promo2x1Discount: 20900,
      items: [
        { productId: 'pizza-4-quesos', name: '4 Quesos', category: 'pizza', size: 'Familiar', quantity: 1, price: 25900 },
        { productId: 'pizza-chilena', name: 'Chilena', category: 'pizza', size: 'Familiar', quantity: 1, price: 20900 },
        { productId: 'palitos-ajo', name: 'Palitos de ajo (6)', category: 'acompanamiento', size: null, quantity: 2, price: 3900 },
      ],
    },
    {
      daysAgo: 2,
      hour: 20,
      minute: 50,
      customer: { name: 'Javiera Pino', phone: '+56 9 7781 2201' },
      delivery: { type: 'delivery', address: 'Av. México 4120', distanceLabel: '3.1 a 4.1 km' },
      deliveryFee: 3000,
      status: 'entregado',
      promo2x1Discount: 0,
      items: [
        { productId: 'pizza-pepperoni', name: 'Pepperoni', category: 'pizza', size: 'Individual', quantity: 2, price: 4700 },
        { productId: 'pizza-napolitana', name: 'Napolitana', category: 'pizza', size: 'Individual', quantity: 1, price: 4700 },
        { productId: 'bebida-lata', name: 'Bebida lata', category: 'bebida', size: null, quantity: 3, price: 1400 },
      ],
    },
    {
      daysAgo: 2,
      hour: 21,
      minute: 40,
      customer: { name: 'Cristóbal Bravo', phone: '+56 9 6190 4321' },
      delivery: { type: 'pickup', address: BUSINESS_INFO.address, distanceLabel: 'Retiro' },
      deliveryFee: 0,
      status: 'entregado',
      promo2x1Discount: 25900,
      items: [
        { productId: 'pizza-4-carnes', name: '4 Carnes', category: 'pizza', size: 'Familiar', quantity: 1, price: 28500 },
        { productId: 'pizza-camaron-bacon', name: 'Camarón Bacon', category: 'pizza', size: 'Familiar', quantity: 1, price: 25900 },
      ],
    },
    // Hace 3 días
    {
      daysAgo: 3,
      hour: 13,
      minute: 55,
      customer: { name: 'Andrea Morales', phone: '+56 9 8234 5511' },
      delivery: { type: 'pickup', address: BUSINESS_INFO.address, distanceLabel: 'Retiro' },
      deliveryFee: 0,
      status: 'entregado',
      promo2x1Discount: 14000,
      items: [
        { productId: 'pizza-hawaiana', name: 'Hawaiana', category: 'pizza', size: 'Mediana', quantity: 1, price: 14000 },
        { productId: 'pizza-pepperoni', name: 'Pepperoni', category: 'pizza', size: 'Mediana', quantity: 1, price: 14000 },
      ],
    },
    {
      daysAgo: 3,
      hour: 20,
      minute: 15,
      customer: { name: 'Felipe Araya', phone: '+56 9 9543 1102' },
      delivery: { type: 'delivery', address: 'Los Toros 0441', distanceLabel: 'Hasta 3 km' },
      deliveryFee: 2000,
      status: 'entregado',
      promo2x1Discount: 18900,
      items: [
        { productId: 'pizza-il-bambino', name: 'Il Bambino', category: 'pizza', size: 'Mediana', quantity: 1, price: 18900 },
        { productId: 'pizza-mechada', name: 'Mechada', category: 'pizza', size: 'Mediana', quantity: 1, price: 18900 },
        { productId: 'stromboli', name: 'Stromboli (6)', category: 'acompanamiento', size: null, quantity: 1, price: 6900 },
      ],
    },
    // Hace 4 días
    {
      daysAgo: 4,
      hour: 19,
      minute: 10,
      customer: { name: 'Carolina Tapia', phone: '+56 9 7654 3210' },
      delivery: { type: 'delivery', address: 'Av. Eyzaguirre 1920', distanceLabel: '3.1 a 4.1 km' },
      deliveryFee: 3000,
      status: 'entregado',
      promo2x1Discount: 17900,
      items: [
        { productId: 'pizza-pepperoni', name: 'Pepperoni', category: 'pizza', size: 'Familiar', quantity: 2, price: 17900 },
        { productId: 'pizza-suprema', name: 'Suprema', category: 'pizza', size: 'Familiar', quantity: 1, price: 20900 },
        { productId: 'palitos-ajo', name: 'Palitos de ajo (6)', category: 'acompanamiento', size: null, quantity: 1, price: 3900 },
      ],
    },
    {
      daysAgo: 4,
      hour: 20,
      minute: 35,
      customer: { name: 'Tomás Espinoza', phone: '+56 9 6333 9981' },
      delivery: { type: 'delivery', address: 'Sargento Menadier 1102', distanceLabel: 'Hasta 3 km' },
      deliveryFee: 2000,
      status: 'entregado',
      promo2x1Discount: 20900,
      items: [
        { productId: 'pizza-iberica', name: 'Ibérica', category: 'pizza', size: 'Mediana', quantity: 1, price: 20900 },
        { productId: 'pizza-camaron-bacon', name: 'Camarón Bacon', category: 'pizza', size: 'Mediana', quantity: 1, price: 20900 },
      ],
    },
    // Hace 5 días
    {
      daysAgo: 5,
      hour: 18,
      minute: 20,
      customer: { name: 'Daniela Herrera', phone: '+56 9 8711 4500' },
      delivery: { type: 'pickup', address: BUSINESS_INFO.address, distanceLabel: 'Retiro' },
      deliveryFee: 0,
      status: 'entregado',
      promo2x1Discount: 15900,
      items: [
        { productId: 'pizza-chilena', name: 'Chilena', category: 'pizza', size: 'Mediana', quantity: 1, price: 15900 },
        { productId: 'pizza-espanola', name: 'Española', category: 'pizza', size: 'Mediana', quantity: 1, price: 15900 },
        { productId: 'bebida-familiar', name: 'Bebida familiar', category: 'bebida', size: null, quantity: 1, price: 2600 },
      ],
    },
    {
      daysAgo: 5,
      hour: 21,
      minute: 0,
      customer: { name: 'Ignacio Silva', phone: '+56 9 5120 8741' },
      delivery: { type: 'delivery', address: 'Av. Las Nieves Oriente 2310', distanceLabel: 'Hasta 3 km' },
      deliveryFee: 2000,
      status: 'entregado',
      promo2x1Discount: 23600,
      items: [
        { productId: 'pizza-pollo-bbq', name: 'Pollo BBQ', category: 'pizza', size: 'Familiar', quantity: 1, price: 23600 },
        { productId: 'pizza-4-carnes', name: '4 Carnes', category: 'pizza', size: 'Familiar', quantity: 1, price: 28500 },
        { productId: 'alitas-bbq', name: 'Alitas BBQ (6)', category: 'acompanamiento', size: null, quantity: 1, price: 5900 },
      ],
    },
    // Hace 6 días
    {
      daysAgo: 6,
      hour: 19,
      minute: 45,
      customer: { name: 'Francisca Núñez', phone: '+56 9 9340 1200' },
      delivery: { type: 'delivery', address: 'Creta Norte 882', distanceLabel: 'Hasta 3 km' },
      deliveryFee: 2000,
      status: 'entregado',
      promo2x1Discount: 15900,
      items: [
        { productId: 'pizza-caprese', name: 'Caprese', category: 'pizza', size: 'Mediana', quantity: 1, price: 15900 },
        { productId: 'pizza-vegetariana', name: 'Vegetariana / Vegana', category: 'pizza', size: 'Mediana', quantity: 1, price: 16000 },
      ],
    },
    {
      daysAgo: 6,
      hour: 20,
      minute: 55,
      customer: { name: 'Rodrigo Castro', phone: '+56 9 8001 7412' },
      delivery: { type: 'pickup', address: BUSINESS_INFO.address, distanceLabel: 'Retiro' },
      deliveryFee: 0,
      status: 'entregado',
      promo2x1Discount: 17900,
      items: [
        { productId: 'pizza-pepperoni', name: 'Pepperoni', category: 'pizza', size: 'Familiar', quantity: 1, price: 17900 },
        { productId: 'pizza-full-pepperoni', name: 'Full Pepperoni', category: 'pizza', size: 'Familiar', quantity: 1, price: 20900 },
        { productId: 'papas-supremas', name: 'Papas Supremas', category: 'papas', size: null, quantity: 1, price: 6900 },
      ],
    },
    // Hace 7 a 12 días
    {
      daysAgo: 7,
      hour: 19,
      minute: 30,
      customer: { name: 'Paula Vargas', phone: '+56 9 7110 2299' },
      delivery: { type: 'delivery', address: 'Av. San Carlos 3100', distanceLabel: 'Hasta 3 km' },
      deliveryFee: 2000,
      status: 'entregado',
      promo2x1Discount: 20900,
      items: [
        { productId: 'pizza-especial-mix', name: 'Especial Mix', category: 'pizza', size: 'Familiar', quantity: 1, price: 20900 },
        { productId: 'pizza-la-masia', name: 'La Masia', category: 'pizza', size: 'Familiar', quantity: 1, price: 25900 },
      ],
    },
    {
      daysAgo: 8,
      hour: 20,
      minute: 10,
      customer: { name: 'Gonzalo Riquelme', phone: '+56 9 6234 0019' },
      delivery: { type: 'delivery', address: 'Ejército Libertador 2210', distanceLabel: '3.1 a 4.1 km' },
      deliveryFee: 3000,
      status: 'entregado',
      promo2x1Discount: 17900,
      items: [
        { productId: 'pizza-pepperoni', name: 'Pepperoni', category: 'pizza', size: 'Familiar', quantity: 1, price: 17900 },
        { productId: 'pizza-napolitana', name: 'Napolitana', category: 'pizza', size: 'Familiar', quantity: 1, price: 17900 },
        { productId: 'palitos-ajo', name: 'Palitos de ajo (6)', category: 'acompanamiento', size: null, quantity: 1, price: 3900 },
      ],
    },
    {
      daysAgo: 9,
      hour: 21,
      minute: 20,
      customer: { name: 'Macarena Cortés', phone: '+56 9 8451 6620' },
      delivery: { type: 'pickup', address: BUSINESS_INFO.address, distanceLabel: 'Retiro' },
      deliveryFee: 0,
      status: 'entregado',
      promo2x1Discount: 24500,
      items: [
        { productId: 'pizza-il-bambino', name: 'Il Bambino', category: 'pizza', size: 'Familiar', quantity: 1, price: 24500 },
        { productId: 'pizza-mechada', name: 'Mechada', category: 'pizza', size: 'Familiar', quantity: 1, price: 24500 },
      ],
    },
    {
      daysAgo: 10,
      hour: 19,
      minute: 0,
      customer: { name: 'Claudio Bustamante', phone: '+56 9 9123 7788' },
      delivery: { type: 'delivery', address: 'Av. Concha y Toro 1500', distanceLabel: 'Hasta 3 km' },
      deliveryFee: 2000,
      status: 'entregado',
      promo2x1Discount: 15900,
      items: [
        { productId: 'pizza-chilena', name: 'Chilena', category: 'pizza', size: 'Mediana', quantity: 1, price: 15900 },
        { productId: 'pizza-pollo-bbq', name: 'Pollo BBQ', category: 'pizza', size: 'Mediana', quantity: 1, price: 17900 },
        { productId: 'stromboli', name: 'Stromboli (6)', category: 'acompanamiento', size: null, quantity: 1, price: 6900 },
      ],
    },
    {
      daysAgo: 11,
      hour: 20,
      minute: 40,
      customer: { name: 'Natalia Salazar', phone: '+56 9 7890 1234' },
      delivery: { type: 'delivery', address: 'Av. Gabriela 2190', distanceLabel: 'Hasta 3 km' },
      deliveryFee: 2000,
      status: 'entregado',
      promo2x1Discount: 25900,
      items: [
        { productId: 'pizza-4-carnes', name: '4 Carnes', category: 'pizza', size: 'Familiar', quantity: 1, price: 28500 },
        { productId: 'pizza-4-quesos', name: '4 Quesos', category: 'pizza', size: 'Familiar', quantity: 1, price: 25900 },
      ],
    },
    {
      daysAgo: 12,
      hour: 18,
      minute: 50,
      customer: { name: 'Esteban Garrido', phone: '+56 9 6741 3399' },
      delivery: { type: 'pickup', address: BUSINESS_INFO.address, distanceLabel: 'Retiro' },
      deliveryFee: 0,
      status: 'entregado',
      promo2x1Discount: 14000,
      items: [
        { productId: 'pizza-margarita', name: 'Margarita', category: 'pizza', size: 'Mediana', quantity: 1, price: 14000 },
        { productId: 'pizza-pepperoni', name: 'Pepperoni', category: 'pizza', size: 'Mediana', quantity: 1, price: 14000 },
        { productId: 'bebida-familiar', name: 'Bebida familiar', category: 'bebida', size: null, quantity: 1, price: 2600 },
      ],
    },
  ];

  return sampleBlueprints.map((bp, idx) => {
    const rawSubtotal = bp.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = rawSubtotal - bp.promo2x1Discount + bp.deliveryFee;
    const iso = makeDate(bp.daysAgo, bp.hour, bp.minute);
    const comandaId = `CMD-84${String(30 - idx).padStart(2, '0')}`;
    return {
      id: `ord-seed-${idx + 1}`,
      items: bp.items,
      rawSubtotal,
      promo2x1Discount: bp.promo2x1Discount,
      couponDiscount: 0,
      deliveryFee: bp.deliveryFee,
      total,
      couponCode: null,
      customer: bp.customer,
      delivery: bp.delivery,
      note: null,
      status: bp.status,
      comandaId,
      inventoryDeducted: true,
      createdAt: iso,
      updatedAt: iso,
    };
  });
};

/**
 * Gestión de pedidos y comandas en LocalStorage.
 */
export const OrdersService = {
  getOrders() {
    const seeded = localStorage.getItem(StorageService.keys.ORDERS_SEEDED);
    const existing = StorageService.get(StorageService.keys.ORDERS, []);
    if (!seeded && existing.length === 0) {
      const seedOrders = buildSeedOrders();
      StorageService.set(StorageService.keys.ORDERS, seedOrders);
      localStorage.setItem(StorageService.keys.ORDERS_SEEDED, 'true');
      return seedOrders;
    }
    return existing;
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
    const orderId = generateId();
    const mappedItems = items.map((item) => ({
      productId: item.productId || item.id || null,
      name: item.name,
      category: item.category || 'pizza',
      quantity: item.quantity,
      price: item.price,
      size: item.size || null,
      details: item.details || null,
    }));

    // Descontar automáticamente del inventario de insumos (gramos por receta)
    InventoryService.deductItems(
      mappedItems,
      `Pedido #${orderId.slice(-6)} (${customer?.name || 'Cliente Web'})`
    );

    const order = {
      id: orderId,
      items: mappedItems,
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
      inventoryDeducted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.unshift(order);
    this.saveOrders(orders);
    return order;
  },

  updateOrderStatus(orderId, status) {
    const currentOrders = this.getOrders();
    const targetOrder = currentOrders.find((o) => o.id === orderId);

    // Si pasa a aceptado o en-preparacion y aún no descontó inventario, descontarlo
    let shouldMarkDeducted = false;
    if (
      targetOrder &&
      !targetOrder.inventoryDeducted &&
      (status === 'aceptado' || status === 'en-preparacion' || status === 'listo' || status === 'entregado')
    ) {
      InventoryService.deductItems(
        targetOrder.items,
        `Comanda Pedido #${orderId.slice(-6)}`
      );
      shouldMarkDeducted = true;
    }

    const orders = currentOrders.map((order) =>
      order.id === orderId
        ? {
            ...order,
            status,
            inventoryDeducted: order.inventoryDeducted || shouldMarkDeducted,
            updatedAt: new Date().toISOString(),
          }
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

      const mergedDelivery = { ...(order.delivery || {}), ...(updates.delivery || {}) };

      const merged = {
        ...order,
        ...updates,
        delivery: mergedDelivery,
        updatedAt: new Date().toISOString(),
      };

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

    if (!order.inventoryDeducted) {
      InventoryService.deductItems(
        order.items,
        `Aceptación Pedido #${orderId.slice(-6)}`
      );
    }

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
            inventoryDeducted: true,
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
