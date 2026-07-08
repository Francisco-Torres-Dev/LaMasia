/**
 * Calcula descuento promoción 2x1 para pizzas Mediana y Familiar.
 * Regla: cada par del mismo tamaño paga solo la más cara.
 */
const normalizeSize = (size) => {
  if (size === 'Mediana' || size === 'M') return 'M';
  if (size === 'Familiar' || size === 'F') return 'F';
  return size;
};

const is2x1Eligible = (item) => {
  if (item.category === 'promocion') return false;
  if (item.eligible2x1 === false) return false;
  if (item.builder) return false;
  const size = normalizeSize(item.size);
  return size === 'M' || size === 'F';
};

const calculateGroupDiscount = (items) => {
  const unitPrices = [];

  items.forEach((item) => {
    for (let i = 0; i < item.quantity; i += 1) {
      unitPrices.push(item.price);
    }
  });

  if (unitPrices.length < 2) return 0;

  unitPrices.sort((a, b) => b - a);

  const charged = unitPrices
    .filter((_, index) => index % 2 === 0)
    .reduce((sum, price) => sum + price, 0);

  const full = unitPrices.reduce((sum, price) => sum + price, 0);
  return full - charged;
};

export const calculate2x1Discount = (cartItems) => {
  const eligible = cartItems.filter(is2x1Eligible);

  const medianaItems = eligible.filter((item) => normalizeSize(item.size) === 'M');
  const familiarItems = eligible.filter((item) => normalizeSize(item.size) === 'F');

  return calculateGroupDiscount(medianaItems) + calculateGroupDiscount(familiarItems);
};

export const getRawSubtotal = (cartItems) =>
  cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const calculateCouponDiscount = (amount, coupon) => {
  if (!coupon || amount <= 0) return 0;

  if (coupon.type === 'percentage') {
    return Math.round(amount * (coupon.value / 100));
  }

  if (coupon.type === 'fixed') {
    return Math.min(coupon.value, amount);
  }

  return 0;
};

export const calculateCartTotals = (cartItems, appliedCoupon) => {
  const rawSubtotal = getRawSubtotal(cartItems);
  const promo2x1Discount = calculate2x1Discount(cartItems);
  const afterPromo = Math.max(rawSubtotal - promo2x1Discount, 0);
  const couponDiscount = calculateCouponDiscount(afterPromo, appliedCoupon);
  const total = Math.max(afterPromo - couponDiscount, 0);

  return {
    rawSubtotal,
    promo2x1Discount,
    couponDiscount,
    discount: promo2x1Discount + couponDiscount,
    subtotal: afterPromo,
    total,
  };
};

export default {
  calculate2x1Discount,
  calculateCartTotals,
  getRawSubtotal,
};
