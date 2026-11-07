import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import {
  FaChartLine,
  FaBoxes,
  FaPizzaSlice,
  FaTags,
  FaTicketAlt,
  FaClipboardList,
} from 'react-icons/fa';
import { useAdmin } from '../context/AdminContext';
import { useCart } from '../context/CartContext';
import { ADMIN_ROUTE } from '../data/constants';
import { generateId } from '../utils/generateId';
import { formatCurrency } from '../utils/formatCurrency';
import AdminOrders from '../components/admin/AdminOrders';
import AdminInventory from '../components/admin/AdminInventory';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import { IMAGES } from '../data/catalog';
import '../components/ui/components.css';

/**
 * Dashboard administrador con analítica de negocio, control de inventario en gramos,
 * gestión de pedidos, productos, promociones y cupones.
 */
const AdminDashboard = () => {
  const { isAuthenticated, logout, session } = useAdmin();
  const {
    products,
    promotions,
    coupons,
    setProducts,
    setPromotions,
    setCoupons,
  } = useCart();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ADMIN_ROUTE);
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate(ADMIN_ROUTE);
  };

  // --- Products CRUD ---
  const onProductSubmit = (data) => {
    const existingProduct = editingId ? products.find((p) => p.id === editingId) : null;
    const basePrice = Number(data.price) || 14000;
    const isPizzaCat = data.category === 'pizza' || data.category === 'pizzas-casa';

    const product = {
      id: editingId || generateId(),
      name: data.name,
      category: data.category || 'pizza',
      description: data.description,
      ingredients: data.ingredients ? data.ingredients.split(',').map((i) => i.trim()) : [],
      price: basePrice,
      prices: isPizzaCat
        ? existingProduct?.prices || {
            I: Math.round(basePrice * 0.35),
            M: basePrice,
            F: Math.round(basePrice * 1.28),
          }
        : undefined,
      image: data.image || IMAGES.pizza,
      tag: data.tag || null,
      active: data.active !== 'false',
    };

    if (editingId) {
      setProducts(products.map((p) => (p.id === editingId ? product : p)));
    } else {
      setProducts([...products, product]);
    }

    Swal.fire({ icon: 'success', title: editingId ? 'Producto actualizado' : 'Producto creado', timer: 1500, showConfirmButton: false });
    resetForm();
  };

  const editProduct = (product) => {
    setEditingId(product.id);
    setValue('name', product.name);
    setValue('category', product.category);
    setValue('description', product.description);
    setValue('ingredients', product.ingredients?.join(', '));
    setValue('price', product.price ?? product.prices?.M ?? 0);
    setValue('image', product.image);
    setValue('tag', product.tag || '');
    setValue('active', String(product.active));
  };

  const deleteProduct = (id) => {
    Swal.fire({
      title: '¿Eliminar producto?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#CD212A',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        setProducts(products.filter((p) => p.id !== id));
      }
    });
  };

  // --- Promotions CRUD ---
  const onPromoSubmit = (data) => {
    const promo = {
      id: editingId || generateId(),
      name: data.title,
      title: data.title,
      category: 'promocion',
      description: data.description,
      price: Number(data.price),
      size: data.size,
      type: '2x1',
      tier: data.tier,
      includes: data.options ? data.options.split(',').map((o) => o.trim()) : [],
      options: data.options ? data.options.split(',').map((o) => o.trim()) : [],
      tag: data.tag || null,
      active: data.active !== 'false',
      image: IMAGES.promo,
    };

    if (editingId) {
      setPromotions(promotions.map((p) => (p.id === editingId ? promo : p)));
    } else {
      setPromotions([...promotions, promo]);
    }

    Swal.fire({ icon: 'success', title: editingId ? 'Promoción actualizada' : 'Promoción creada', timer: 1500, showConfirmButton: false });
    resetForm();
  };

  const editPromo = (promo) => {
    setEditingId(promo.id);
    setValue('title', promo.title || promo.name);
    setValue('description', promo.description);
    setValue('price', promo.price);
    setValue('size', promo.size || 'Familiar');
    setValue('tier', promo.tier || 'basica');
    setValue('options', (promo.options || promo.includes)?.join(', '));
    setValue('tag', promo.tag || '');
    setValue('active', String(promo.active));
  };

  const togglePromo = (id) => {
    setPromotions(promotions.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  };

  const deletePromo = (id) => {
    setPromotions(promotions.filter((p) => p.id !== id));
  };

  // --- Coupons CRUD ---
  const onCouponSubmit = (data) => {
    const coupon = {
      id: editingId || generateId(),
      code: data.code.toUpperCase(),
      type: data.type,
      value: Number(data.value),
      expirationDate: data.expirationDate,
      usageLimit: Number(data.usageLimit),
      currentUses: editingId ? coupons.find((c) => c.id === editingId)?.currentUses || 0 : 0,
      active: data.active !== 'false',
    };

    if (editingId) {
      setCoupons(coupons.map((c) => (c.id === editingId ? coupon : c)));
    } else {
      setCoupons([...coupons, coupon]);
    }

    Swal.fire({ icon: 'success', title: editingId ? 'Cupón actualizado' : 'Cupón creado', timer: 1500, showConfirmButton: false });
    resetForm();
  };

  const editCoupon = (coupon) => {
    setEditingId(coupon.id);
    setValue('code', coupon.code);
    setValue('type', coupon.type);
    setValue('value', coupon.value);
    setValue('expirationDate', coupon.expirationDate);
    setValue('usageLimit', coupon.usageLimit);
    setValue('active', String(coupon.active));
  };

  const toggleCoupon = (id) => {
    setCoupons(coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
  };

  const deleteCoupon = (id) => {
    setCoupons(coupons.filter((c) => c.id !== id));
  };

  const resetForm = () => {
    reset();
    setEditingId(null);
  };

  return (
    <div className="admin-page">
      <div className="admin-dashboard">
        <div className="admin-header">
          <div>
            <h1>Panel Administrador — La Masia</h1>
            <p style={{ color: 'var(--color-light-gray)', fontSize: '0.85rem' }}>
              {session?.role} · {session?.username}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button type="button" className="btn-outline-masia btn-sm" onClick={() => navigate('/')}>
              Ver Carta Web
            </button>
            <button type="button" className="btn-outline-masia btn-sm" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="admin-tabs">
          {[
            { id: 'analytics', label: 'Dashboard y Gráficos', icon: <FaChartLine /> },
            { id: 'inventory', label: 'Inventario e Insumos', icon: <FaBoxes /> },
            { id: 'orders', label: 'Pedidos y Comandas', icon: <FaClipboardList /> },
            { id: 'products', label: 'Productos', icon: <FaPizzaSlice /> },
            { id: 'promotions', label: 'Promociones', icon: <FaTags /> },
            { id: 'coupons', label: 'Cupones', icon: <FaTicketAlt /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.id); resetForm(); }}
            >
              <span style={{ marginRight: '0.4rem', display: 'inline-flex', alignItems: 'center' }}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Analytics / Charts Tab */}
        {activeTab === 'analytics' && <AdminAnalytics />}

        {/* Inventory Control Tab */}
        {activeTab === 'inventory' && <AdminInventory />}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            <div className="admin-form-card">
              <h3>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <form onSubmit={handleSubmit(onProductSubmit)}>
                <div className="admin-form-grid">
                  <div className="form-group">
                    <label>Nombre</label>
                    <input className="form-control-masia" {...register('name', { required: true })} />
                  </div>
                  <div className="form-group">
                    <label>Categoría</label>
                    <select className="form-control-masia" {...register('category')}>
                      <option value="pizza">Pizzas de la Casa</option>
                      <option value="acompanamiento">Acompañamiento</option>
                      <option value="papas">Papas Fritas</option>
                      <option value="salsa">Salsas / Otros</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Precio (Base o Mediana)</label>
                    <input type="number" className="form-control-masia" {...register('price', { required: true })} />
                  </div>
                  <div className="form-group">
                    <label>Etiqueta</label>
                    <select className="form-control-masia" {...register('tag')}>
                      <option value="">Ninguna</option>
                      <option value="mas-vendida">Más Vendida</option>
                      <option value="chef">Recomendación del Chef</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Descripción</label>
                    <input className="form-control-masia" {...register('description')} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Ingredientes (separados por coma)</label>
                    <input className="form-control-masia" {...register('ingredients')} />
                  </div>
                  <div className="form-group">
                    <label>URL Imagen</label>
                    <input className="form-control-masia" {...register('image')} />
                  </div>
                  <div className="form-group">
                    <label>Estado</label>
                    <select className="form-control-masia" {...register('active')}>
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn-primary-masia btn-sm">
                    {editingId ? 'Actualizar' : 'Crear'}
                  </button>
                  {editingId && (
                    <button type="button" className="btn-outline-masia btn-sm" onClick={resetForm}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precios</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <img
                          src={p.image}
                          alt={p.name}
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                      </td>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.category}</td>
                      <td>
                        {p.prices
                          ? `I: ${formatCurrency(p.prices.I)} · M: ${formatCurrency(p.prices.M)} · F: ${formatCurrency(p.prices.F)}`
                          : formatCurrency(p.price || 0)}
                      </td>
                      <td>
                        <span className={`status-badge ${p.active ? 'status-active' : 'status-inactive'}`}>
                          {p.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="admin-actions">
                        <button type="button" className="admin-btn admin-btn-edit" onClick={() => editProduct(p)}>Editar</button>
                        <button type="button" className="admin-btn admin-btn-delete" onClick={() => deleteProduct(p.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <>
            <div className="admin-form-card">
              <h3>{editingId ? 'Editar Promoción' : 'Nueva Promoción'}</h3>
              <form onSubmit={handleSubmit(onPromoSubmit)}>
                <div className="admin-form-grid">
                  <div className="form-group">
                    <label>Título</label>
                    <input className="form-control-masia" {...register('title', { required: true })} />
                  </div>
                  <div className="form-group">
                    <label>Precio</label>
                    <input type="number" className="form-control-masia" {...register('price', { required: true })} />
                  </div>
                  <div className="form-group">
                    <label>Tamaño</label>
                    <select className="form-control-masia" {...register('size')}>
                      <option value="Mediana">Mediana</option>
                      <option value="Familiar">Familiar</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Categoría</label>
                    <select className="form-control-masia" {...register('tier')}>
                      <option value="basica">Básica</option>
                      <option value="intermedia">Intermedia</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Descripción</label>
                    <input className="form-control-masia" {...register('description')} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Opciones / Incluye (separadas por coma)</label>
                    <input className="form-control-masia" {...register('options')} />
                  </div>
                  <div className="form-group">
                    <label>Etiqueta</label>
                    <select className="form-control-masia" {...register('tag')}>
                      <option value="">Ninguna</option>
                      <option value="mas-vendida">Más Vendida</option>
                      <option value="chef">Recomendación del Chef</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Estado</label>
                    <select className="form-control-masia" {...register('active')}>
                      <option value="true">Activa</option>
                      <option value="false">Inactiva</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn-primary-masia btn-sm">
                    {editingId ? 'Actualizar' : 'Crear'}
                  </button>
                  {editingId && (
                    <button type="button" className="btn-outline-masia btn-sm" onClick={resetForm}>Cancelar</button>
                  )}
                </div>
              </form>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Descripción</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((p) => (
                    <tr key={p.id}>
                      <td><strong>{p.title || p.name}</strong></td>
                      <td>{p.description}</td>
                      <td>{formatCurrency(p.price)}</td>
                      <td>
                        <span className={`status-badge ${p.active ? 'status-active' : 'status-inactive'}`}>
                          {p.active ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="admin-actions">
                        <button type="button" className="admin-btn admin-btn-edit" onClick={() => editPromo(p)}>Editar</button>
                        <button type="button" className="admin-btn admin-btn-toggle" onClick={() => togglePromo(p.id)}>
                          {p.active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button type="button" className="admin-btn admin-btn-delete" onClick={() => deletePromo(p.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Coupons Tab */}
        {activeTab === 'coupons' && (
          <>
            <div className="admin-form-card">
              <h3>{editingId ? 'Editar Cupón' : 'Nuevo Cupón'}</h3>
              <form onSubmit={handleSubmit(onCouponSubmit)}>
                <div className="admin-form-grid">
                  <div className="form-group">
                    <label>Código</label>
                    <input className="form-control-masia" {...register('code', { required: true })} />
                  </div>
                  <div className="form-group">
                    <label>Tipo</label>
                    <select className="form-control-masia" {...register('type')}>
                      <option value="percentage">Porcentaje</option>
                      <option value="fixed">Monto Fijo</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Valor</label>
                    <input type="number" className="form-control-masia" {...register('value', { required: true })} />
                  </div>
                  <div className="form-group">
                    <label>Fecha Expiración</label>
                    <input type="date" className="form-control-masia" {...register('expirationDate', { required: true })} />
                  </div>
                  <div className="form-group">
                    <label>Límite de Usos</label>
                    <input type="number" className="form-control-masia" {...register('usageLimit', { required: true })} />
                  </div>
                  <div className="form-group">
                    <label>Estado</label>
                    <select className="form-control-masia" {...register('active')}>
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn-primary-masia btn-sm">
                    {editingId ? 'Actualizar' : 'Crear'}
                  </button>
                  {editingId && (
                    <button type="button" className="btn-outline-masia btn-sm" onClick={resetForm}>Cancelar</button>
                  )}
                </div>
              </form>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Expira</th>
                    <th>Usos</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.code}</strong></td>
                      <td>{c.type === 'percentage' ? 'Porcentaje' : 'Monto Fijo'}</td>
                      <td>{c.type === 'percentage' ? `${c.value}%` : formatCurrency(c.value)}</td>
                      <td>{c.expirationDate}</td>
                      <td>{c.currentUses}/{c.usageLimit}</td>
                      <td>
                        <span className={`status-badge ${c.active ? 'status-active' : 'status-inactive'}`}>
                          {c.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="admin-actions">
                        <button type="button" className="admin-btn admin-btn-edit" onClick={() => editCoupon(c)}>Editar</button>
                        <button type="button" className="admin-btn admin-btn-toggle" onClick={() => toggleCoupon(c.id)}>
                          {c.active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button type="button" className="admin-btn admin-btn-delete" onClick={() => deleteCoupon(c.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'orders' && <AdminOrders />}
      </div>
    </div>
  );
};

export default AdminDashboard;
