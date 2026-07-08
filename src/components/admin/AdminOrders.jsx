import { useState } from 'react';
import Swal from 'sweetalert2';
import { FaCheck, FaPrint, FaSearch } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';

const STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'aceptado', label: 'Aceptado' },
  { value: 'en-preparacion', label: 'En preparación' },
  { value: 'listo', label: 'Listo' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
];

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/**
 * Pestaña de gestión de pedidos y comandas del panel admin.
 */
const AdminOrders = () => {
  const {
    orders,
    comandas,
    updateOrderStatus,
    acceptOrder,
    updateOrder,
    exportOrdersTxt,
    refreshOrders,
    deliverySettings,
    setDeliverySettings,
  } = useCart();

  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
  const [localDeliverySettings, setLocalDeliverySettings] = useState(deliverySettings);

  const handleDeliveryTierChange = (tierIndex, field, value) => {
    setLocalDeliverySettings((prev) => {
      const updatedTiers = prev.tiers.map((tier, index) =>
        index === tierIndex ? { ...tier, [field]: field === 'value' ? Number(value) : value } : tier
      );
      return { ...prev, tiers: updatedTiers };
    });
  };

  const handleOutsideRangeFeeChange = (value) => {
    setLocalDeliverySettings((prev) => ({ ...prev, outsideRangeFee: Number(value) }));
  };

  const saveDeliverySettings = () => {
    setDeliverySettings(localDeliverySettings);
    Swal.fire({ icon: 'success', title: 'Tarifas de envío actualizadas', timer: 2000, showConfirmButton: false });
  };

  const filteredOrders = filterDate
    ? orders.filter((o) => o.createdAt.slice(0, 10) === filterDate)
    : orders;

  const handleAccept = (orderId) => {
    const result = acceptOrder(orderId);
    if (result?.comanda) {
      Swal.fire({
        icon: 'success',
        title: 'Comanda creada',
        html: `<strong>ID:</strong> ${result.comanda.id}<br><strong>Total:</strong> ${formatCurrency(result.comanda.total)}<br><strong>Hora:</strong> ${result.comanda.time}`,
        timer: 3000,
      });
    }
    refreshOrders();
  };

  const handlePrint = () => {
    if (filteredOrders.length === 0) {
      Swal.fire({ icon: 'info', title: 'Sin pedidos', text: 'No hay pedidos para la fecha seleccionada.' });
      return;
    }
    exportOrdersTxt(filterDate);
    Swal.fire({ icon: 'success', title: 'Archivo generado', text: 'Se descargó el reporte en formato .txt', timer: 2000, showConfirmButton: false });
  };

  return (
    <div>
      <div className="admin-form-card">
        <h3>Buscar pedidos por fecha</h3>
        <div className="admin-orders-toolbar">
          <input
            type="date"
            className="form-control-masia"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <button type="button" className="btn-primary-masia btn-sm" onClick={handlePrint}>
            <FaPrint /> Imprimir pedidos
          </button>
          <button type="button" className="btn-outline-masia btn-sm" onClick={refreshOrders}>
            <FaSearch /> Actualizar
          </button>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-light-gray)', marginTop: '0.75rem' }}>
          {filteredOrders.length} pedido(s) encontrado(s) para {filterDate}
        </p>
      </div>

      <div className="admin-form-card">
        <h3>Configuración de Envío</h3>
        <div className="admin-form-grid">
          {localDeliverySettings?.tiers?.map((tier, index) => (
            <div key={tier.id} className="form-group">
              <label>{tier.label}</label>
              <input
                type="text"
                className="form-control-masia"
                value={tier.label}
                onChange={(e) => handleDeliveryTierChange(index, 'label', e.target.value)}
              />
              <input
                type="number"
                className="form-control-masia"
                value={tier.value}
                onChange={(e) => handleDeliveryTierChange(index, 'value', e.target.value)}
                style={{ marginTop: '0.5rem' }}
              />
            </div>
          ))}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Tarifa fuera de rango</label>
            <input
              type="number"
              className="form-control-masia"
              value={localDeliverySettings?.outsideRangeFee || 0}
              onChange={(e) => handleOutsideRangeFeeChange(e.target.value)}
            />
          </div>
        </div>
        <button type="button" className="btn-primary-masia btn-sm" onClick={saveDeliverySettings}>
          Guardar configuración de envío
        </button>
      </div>

      <div className="admin-table-wrapper" style={{ marginBottom: '2rem' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Fecha/Hora</th>
              <th>Detalle</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Comanda</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-light-gray)' }}>
                  No hay pedidos para esta fecha
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontSize: '0.75rem' }}>{order.id.slice(-8)}</td>
                  <td>{formatDateTime(order.createdAt)}</td>
                  <td>
                    <ul className="order-items-list">
                      {order.items.map((item, i) => (
                        <li key={i}>
                          {item.quantity}x {item.name}
                          {item.size ? ` (${item.size})` : ''}
                        </li>
                      ))}
                    </ul>
                    {order.promo2x1Discount > 0 && (
                      <small style={{ color: 'var(--color-italian-green)', display: 'block' }}>
                        2x1: -{formatCurrency(order.promo2x1Discount)}
                      </small>
                    )}
                    {order.customer?.name && (
                      <small style={{ display: 'block', marginTop: '0.35rem' }}>
                        Cliente: {order.customer.name}{order.customer?.phone ? ` / ${order.customer.phone}` : ''}
                      </small>
                    )}
                    {order.delivery && (
                      <>
                        <small style={{ display: 'block', marginTop: '0.25rem' }}>
                          {order.delivery.type === 'delivery' ? 'Envío' : 'Retiro'} - {order.delivery.address || ''}
                        </small>
                        {order.delivery.distanceLabel && (
                          <small style={{ display: 'block', marginTop: '0.15rem', color: 'var(--color-light-gray)' }}>
                            Rango: {order.delivery.distanceLabel}
                          </small>
                        )}

                        {order.delivery.type === 'delivery' && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Asignar rango / tarifa</label>
                            <select
                              className="form-control-masia"
                              value={order.delivery?.tierId || deliverySettings?.tiers?.find((t) => t.label === order.delivery?.distanceLabel)?.id || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (!val) return;
                                if (val === '__outside__') {
                                  const fee = deliverySettings?.outsideRangeFee || 0;
                                  const updated = updateOrder(order.id, {
                                    delivery: { ...order.delivery, tierId: val, distanceLabel: 'Fuera de rango' },
                                    deliveryFee: fee,
                                  });
                                  Swal.fire({ icon: 'success', title: 'Rango asignado', timer: 1500, showConfirmButton: false });
                                  return;
                                }
                                const tier = deliverySettings?.tiers?.find((t) => t.id === val);
                                if (!tier) return;
                                updateOrder(order.id, {
                                  delivery: { ...order.delivery, tierId: tier.id, distanceLabel: tier.label },
                                  deliveryFee: tier.value,
                                });
                                Swal.fire({ icon: 'success', title: 'Rango asignado', timer: 1500, showConfirmButton: false });
                              }}
                            >
                              <option value="">— Seleccionar —</option>
                              {deliverySettings?.tiers?.map((tier) => (
                                <option key={tier.id} value={tier.id}>{tier.label} — {formatCurrency(tier.value)}</option>
                              ))}
                              <option value="__outside__">Fuera de rango — {formatCurrency(deliverySettings?.outsideRangeFee || 0)}</option>
                            </select>
                          </div>
                        )}
                      </>
                    )}
                    {order.note && (
                      <small style={{ display: 'block', marginTop: '0.25rem' }}>
                        Nota: {order.note}
                      </small>
                    )}
                    {order.deliveryFee > 0 && (
                      <small style={{ display: 'block', marginTop: '0.25rem' }}>
                        Envío: {formatCurrency(order.deliveryFee)}
                      </small>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.85rem' }}>Subtotal: {formatCurrency(order.rawSubtotal ?? 0)}</span>
                      {order.promo2x1Discount > 0 && (
                        <span style={{ color: 'var(--color-italian-green)', fontSize: '0.85rem' }}>2x1: -{formatCurrency(order.promo2x1Discount)}</span>
                      )}
                      {order.couponDiscount > 0 && (
                        <span style={{ color: 'var(--color-italian-green)', fontSize: '0.85rem' }}>Cupón: -{formatCurrency(order.couponDiscount)}</span>
                      )}
                      {order.deliveryFee > 0 && (
                        <span style={{ fontSize: '0.85rem' }}>Envío: {formatCurrency(order.deliveryFee)}</span>
                      )}
                      <strong style={{ marginTop: '0.25rem' }}>{formatCurrency(order.total)}</strong>
                    </div>
                  </td>
                  <td>
                    <select
                      className="form-control-masia admin-status-select"
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>{order.comandaId || '—'}</td>
                  <td className="admin-actions">
                    {order.status === 'pendiente' && (
                      <button type="button" className="admin-btn admin-btn-toggle" onClick={() => handleAccept(order.id)}>
                        <FaCheck /> Aceptar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Comandas generadas</h3>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID Comanda</th>
              <th>Hora</th>
              <th>Pedido</th>
              <th>Detalle</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {comandas.filter((c) => !filterDate || c.createdAt.slice(0, 10) === filterDate).length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-light-gray)' }}>
                  No hay comandas para esta fecha
                </td>
              </tr>
            ) : (
              comandas
                .filter((c) => !filterDate || c.createdAt.slice(0, 10) === filterDate)
                .map((comanda) => (
                  <tr key={comanda.id}>
                    <td><strong>{comanda.id}</strong></td>
                    <td>{comanda.time}</td>
                    <td style={{ fontSize: '0.75rem' }}>{comanda.orderId.slice(-8)}</td>
                    <td>
                      <ul className="order-items-list">
                        {comanda.items.map((item, i) => (
                          <li key={i}>{item.quantity}x {item.name}</li>
                        ))}
                      </ul>
                    </td>
                    <td>{formatCurrency(comanda.total)}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
