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
    deliverySettings,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [address, setAddress] = useState('');
  // Distance selection removed: admin will assign delivery range/fee in admin panel
  const [note, setNote] = useState('');

  const handleApplyCoupon = () => {
    const result = applyCoupon(couponCode);
    if (result.success) {
      Swal.fire({ icon: 'success', title: result.message, timer: 2000, showConfirmButton: false });
      setCouponCode('');
    } else {
      Swal.fire({ icon: 'error', title: result.message, timer: 2000, showConfirmButton: false });
    }
  };

  const getDeliveryFee = () => {
    // Shipping fee is assigned by admin in the panel; clients do not select a distance.
    return 0;
  };

  const handleWhatsAppOrder = async () => {
    if (items.length === 0) return;
    if (!name.trim() || !phone.trim()) {
      Swal.fire({ icon: 'error', title: 'Nombre y teléfono son requeridos', timer: 2500, showConfirmButton: false });
      return;
    }
    if (deliveryType === 'delivery' && !address.trim()) {
      Swal.fire({ icon: 'error', title: 'La dirección es requerida para envío', timer: 2500, showConfirmButton: false });
      return;
    }

    const deliveryFee = getDeliveryFee();
    const orderTotal = total; // shipping will be added later by admin

    createOrder({
      customer: { name: name.trim(), phone: phone.trim() },
      delivery: {
        type: deliveryType,
        address: deliveryType === 'delivery' ? address.trim() : 'Retiro en local',
        distanceLabel: null,
      },
      note: note.trim() || null,
      deliveryFee,
    });

    const payload = EmailService.buildOrderPayload({
      items,
      subtotal,
      discount,
      total: orderTotal,
      couponCode: appliedCoupon?.code,
      customer: { name: name.trim(), phone: phone.trim() },
      delivery: {
        type: deliveryType,
        address: deliveryType === 'delivery' ? address.trim() : 'Retiro en local',
      },
      note: note.trim() || null,
      deliveryFee,
    });

    await EmailService.sendOrderEmail(payload);
    sendWhatsAppOrder(items, orderTotal, {
      promo2x1Discount,
      customer: { name: name.trim(), phone: phone.trim() },
      delivery: {
        type: deliveryType,
        address: deliveryType === 'delivery' ? address.trim() : 'Retiro en local',
        distanceLabel: null,
      },
      note: note.trim() || null,
      deliveryFee,
    });

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
                <>
                  <div className="cart-section-header">
                    <h4>Detalle del pedido</h4>
                    <p className="cart-section-subtitle">Revisa los productos y cantidades antes de confirmar.</p>
                  </div>
                  <div className="cart-items-wrap">
                    {items.map((item) => (
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
                    ))}
                  </div>
                  <div className="cart-customer-form">
                    <div className="form-group">
                      <label>Nombre</label>
                      <input
                        type="text"
                        className="form-control-masia"
                        placeholder="Nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Teléfono</label>
                      <input
                        type="text"
                        className="form-control-masia"
                        placeholder="+56 9 XXXX XXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Tipo de pedido</label>
                      <select
                        className="form-control-masia"
                        value={deliveryType}
                        onChange={(e) => setDeliveryType(e.target.value)}
                      >
                        <option value="pickup">Retiro</option>
                        <option value="delivery">Envío</option>
                      </select>
                    </div>
                    {deliveryType === 'delivery' && (
                      <div className="form-group">
                        <label>Dirección</label>
                        <input
                          type="text"
                          className="form-control-masia"
                          placeholder="Dirección de envío"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>
                    )}
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Nota para el pedido</label>
                      <textarea
                        className="form-control-masia"
                        rows={3}
                        placeholder="Escribe una nota para el pedido"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </div>
                  </div>
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
