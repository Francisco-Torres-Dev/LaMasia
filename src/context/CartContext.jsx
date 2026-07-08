import { createContext, useContext, useMemo, useCallback, useState } from 'react';
import { generateId } from '../utils/generateId';
import { useLocalStorage } from '../hooks/useLocalStorage';
import StorageService from '../services/StorageService';
import OrdersService from '../services/OrdersService';
import { calculateCartTotals } from '../utils/pricing';
import { SIZE_LABELS } from '../data/catalog';
import {
  initialProducts,
  initialDrinks,
  initialPromotions,
  initialCoupons,
} from '../data/catalog';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useLocalStorage(StorageService.keys.CART, []);
  const [appliedCoupon, setAppliedCoupon] = useLocalStorage(StorageService.keys.COUPON, null);
  const [products, setProductsState] = useLocalStorage(StorageService.keys.PRODUCTS, initialProducts);
  const [drinks, setDrinksState] = useLocalStorage(StorageService.keys.DRINKS, initialDrinks);
  const [promotions, setPromotionsState] = useLocalStorage(StorageService.keys.PROMOTIONS, initialPromotions);
  const [coupons, setCouponsState] = useLocalStorage(StorageService.keys.COUPONS, initialCoupons);
  const [deliverySettings, setDeliverySettings] = useLocalStorage(StorageService.keys.DELIVERY_SETTINGS, {
    tiers: [
      { id: '0-3', label: 'Hasta 3 km', value: 2000 },
      { id: '3.1-4.1', label: '3.1 a 4.1 km', value: 3000 },
      { id: '4.1-5.1', label: '4.1 a 5.1 km', value: 4000 },
    ],
    outsideRangeFee: 0,
  });
  const [orders, setOrdersState] = useState(() => OrdersService.getOrders());
  const [comandas, setComandasState] = useState(() => OrdersService.getComandas());

  const refreshOrders = useCallback(() => {
    setOrdersState(OrdersService.getOrders());
    setComandasState(OrdersService.getComandas());
  }, []);

  const allProducts = useMemo(() => [...products, ...drinks], [products, drinks]);

  const addToCart = useCallback(
    (product, quantity = 1, options = {}) => {
      const size = options.size || null;
      const details = options.details || null;
      const price = options.price ?? product.price ?? product.prices?.[size];

      if (price == null) return;

      const sizeLabel = size ? SIZE_LABELS[size] || size : null;
      const eligible2x1 =
        product.category === 'pizza' &&
        (size === 'M' || size === 'F') &&
        options.eligible2x1 !== false;

      setItems((prev) => {
        const cartKey = `${product.id}-${size || 'default'}-${details || ''}`;
        const existing = prev.find((item) => item.cartKey === cartKey);

        if (existing) {
          return prev.map((item) =>
            item.cartKey === cartKey
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }

        return [
          ...prev,
          {
            cartKey,
            id: generateId(),
            productId: product.id,
            name: product.name,
            price,
            quantity,
            size: sizeLabel || size,
            details,
            category: product.category || 'general',
            eligible2x1,
            image: product.image,
          },
        ];
      });
    },
    [setItems]
  );

  const removeFromCart = useCallback(
    (cartKey) => setItems((prev) => prev.filter((item) => item.cartKey !== cartKey)),
    [setItems]
  );

  const updateQuantity = useCallback(
    (cartKey, quantity) => {
      if (quantity <= 0) {
        setItems((prev) => prev.filter((item) => item.cartKey !== cartKey));
        return;
      }
      setItems((prev) =>
        prev.map((item) => (item.cartKey === cartKey ? { ...item, quantity } : item))
      );
    },
    [setItems]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
  }, [setItems, setAppliedCoupon]);

  const applyCoupon = useCallback(
    (code) => {
      const coupon = coupons.find(
        (c) => c.code.toUpperCase() === code.toUpperCase() && c.active
      );

      if (!coupon) return { success: false, message: 'Cupón no válido' };
      if (new Date(coupon.expirationDate) < new Date()) {
        return { success: false, message: 'Cupón expirado' };
      }
      if (coupon.currentUses >= coupon.usageLimit) {
        return { success: false, message: 'Cupón agotado' };
      }

      setAppliedCoupon(coupon);
      return { success: true, message: `Cupón ${coupon.code} aplicado` };
    },
    [coupons, setAppliedCoupon]
  );

  const removeCoupon = useCallback(() => setAppliedCoupon(null), [setAppliedCoupon]);

  const cartTotals = useMemo(
    () => calculateCartTotals(items, appliedCoupon),
    [items, appliedCoupon]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const createOrder = useCallback(
    (orderData) => {
      const order = OrdersService.createOrder({
        items,
        rawSubtotal: cartTotals.rawSubtotal,
        promo2x1Discount: cartTotals.promo2x1Discount,
        couponDiscount: cartTotals.couponDiscount,
        total: cartTotals.total + (orderData.deliveryFee || 0),
        couponCode: appliedCoupon?.code,
        customer: orderData.customer,
        delivery: orderData.delivery,
        note: orderData.note,
        deliveryFee: orderData.deliveryFee || 0,
      });
      refreshOrders();
      return order;
    },
    [items, appliedCoupon, refreshOrders, cartTotals]
  );

  const updateOrderStatus = useCallback(
    (orderId, status) => {
      OrdersService.updateOrderStatus(orderId, status);
      refreshOrders();
    },
    [refreshOrders]
  );

  const acceptOrder = useCallback(
    (orderId) => {
      const result = OrdersService.acceptOrder(orderId);
      refreshOrders();
      return result;
    },
    [refreshOrders]
  );

  const updateOrder = useCallback(
    (orderId, updates) => {
      const updated = OrdersService.updateOrder(orderId, updates);
      refreshOrders();
      return updated;
    },
    [refreshOrders]
  );

  const getOrdersByDate = useCallback((dateStr) => OrdersService.getOrdersByDate(dateStr), []);

  const exportOrdersTxt = useCallback((dateStr) => {
    const filtered = OrdersService.getOrdersByDate(dateStr);
    OrdersService.exportOrdersToTxt(filtered, dateStr || 'todos');
  }, []);

  const value = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
      appliedCoupon,
      ...cartTotals,
      itemCount,
      products,
      drinks,
      promotions,
      coupons,
      allProducts,
      orders,
      comandas,
      createOrder,
      updateOrderStatus,
      acceptOrder,
      getOrdersByDate,
      exportOrdersTxt,
      refreshOrders,
      deliverySettings,
      setDeliverySettings,
      updateOrder,
      setProducts: setProductsState,
      setDrinks: setDrinksState,
      setPromotions: setPromotionsState,
      setCoupons: setCouponsState,
    }),
    [
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
      appliedCoupon,
      cartTotals,
      itemCount,
      products,
      drinks,
      promotions,
      coupons,
      allProducts,
      orders,
      comandas,
      createOrder,
      updateOrderStatus,
      acceptOrder,
      getOrdersByDate,
      exportOrdersTxt,
      refreshOrders,
      setProductsState,
      setDrinksState,
      setPromotionsState,
      setCouponsState,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};

export default CartContext;
