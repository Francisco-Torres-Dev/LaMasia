import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaTimes, FaWhatsapp, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { sendWhatsAppOrder } from '../../services/WhatsAppService';
import EmailService from '../../services/EmailService';
import '../ui/components.css';

const CartDrawer = ({ isOpen, onClose }) => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    appliedCoupon,
    rawSubtotal,
    promo2x1Discount,
    couponDiscount,
    discount,
    subtotal,
    total,
    clearCart,
    createOrder,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');

  const handleApplyCoupon = () => {
    const result = applyCoupon(couponCode);
    if (result.success) {
      Swal.fire({ icon: 'success', title: result.message, timer: 2000, showConfirmButton: false });
      setCouponCode('');
    } else {
      Swal.fire({ icon: 'error', title: result.message, timer: 2000, showConfirmButton: false });
    }
  };

  const handleWhatsAppOrder = async () => {
    if (items.length === 0) return;

    const totals = {
      rawSubtotal,
      promo2x1Discount,
      couponDiscount,
      total,
    };

    createOrder(totals);

    const payload = EmailService.buildOrderPayload({
      items,
      subtotal,
      discount,
      total,
      couponCode: appliedCoupon?.code,
    });

    await EmailService.sendOrderEmail(payload);
    sendWhatsAppOrder(items, total, { promo2x1Discount });

    Swal.fire({
      icon: 'success',
      title: '¡Pedido enviado!',
      text: 'Tu pedido fue registrado y serás redirigido a WhatsApp.',
      timer: 2500,
      showConfirmButton: false,
    });

    clearCart();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="cart-drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="cart-drawer-header">
              <h3>Tu Pedido</h3>
              <button type="button" className="cart-close-btn" onClick={onClose} aria-label="Cerrar carrito">
                <FaTimes />
              </button>
            </div>

            <div className="cart-drawer-body">
              {items.length === 0 ? (
                <div className="cart-empty">
                  <p>Tu carrito está vacío</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Agrega productos desde la carta</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.cartKey} className="cart-item">
                    {item.image && (
                      <div className="cart-item-image">
                        <img src={item.image} alt={item.name} />
                      </div>
                    )}
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      {(item.size || item.details) && (
                        <div className="cart-item-details">
                          {[item.size, item.details].filter(Boolean).join(' · ')}
                        </div>
                      )}
                      <div className="cart-item-controls">
                        <button type="button" className="qty-btn" onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}>-</button>
                        <span className="qty-value">{item.quantity}</span>
                        <button type="button" className="qty-btn" onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}>+</button>
                      </div>
                      <button type="button" className="cart-item-remove" onClick={() => removeFromCart(item.cartKey)}>
                        <FaTrash /> Eliminar
                      </button>
                    </div>
                    <div className="cart-item-price">
                      <div className="cart-item-total">{formatCurrency(item.price * item.quantity)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <>
                <div className="cart-coupon">
                  {appliedCoupon ? (
                    <div className="cart-coupon-applied">
                      <span>Cupón: {appliedCoupon.code}</span>
                      <button type="button" className="cart-item-remove" onClick={removeCoupon}>Quitar</button>
                    </div>
                  ) : (
                    <div className="cart-coupon-form">
                      <input
                        type="text"
                        className="form-control-masia"
                        placeholder="Código de cupón"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <button type="button" className="btn-outline-masia btn-sm" onClick={handleApplyCoupon}>
                        Aplicar
                      </button>
                    </div>
                  )}
                </div>

                <div className="cart-drawer-footer">
                  <div className="cart-summary-row">
                    <span>Subtotal</span>
                    <span>{formatCurrency(rawSubtotal)}</span>
                  </div>
                  {promo2x1Discount > 0 && (
                    <div className="cart-summary-row discount">
                      <span>Promo 2x1</span>
                      <span>-{formatCurrency(promo2x1Discount)}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="cart-summary-row discount">
                      <span>Cupón</span>
                      <span>-{formatCurrency(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="cart-summary-row total">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="cart-actions">
                    <button type="button" className="btn-green-masia" onClick={handleWhatsAppOrder}>
                      <FaWhatsapp /> Pedir por WhatsApp
                    </button>
                    <button type="button" className="btn-outline-masia btn-sm" onClick={clearCart}>
                      Vaciar carrito
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
