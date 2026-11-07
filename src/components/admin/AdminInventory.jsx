import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import {
  FaBoxOpen,
  FaExclamationTriangle,
  FaClock,
  FaPlus,
  FaUtensils,
  FaHistory,
  FaRedo,
  FaSearch,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import InventoryService from '../../services/InventoryService';
import OrdersService from '../../services/OrdersService';
import { INVENTORY_CATEGORIES } from '../../data/inventoryData';
import { SIZE_LABELS } from '../../data/catalog';
import { formatCurrency } from '../../utils/formatCurrency';
import { generateId } from '../../utils/generateId';

const formatGrams = (grams) => {
  const num = Number(grams) || 0;
  if (num >= 1000) {
    return `${num.toLocaleString('es-CL')} g (${(num / 1000).toFixed(2)} kg)`;
  }
  return `${num.toLocaleString('es-CL')} g`;
};

const getDaysUntilExpiration = (expirationDateStr) => {
  if (!expirationDateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(`${expirationDateStr}T00:00:00`);
  const diffMs = exp - today;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const AdminInventory = () => {
  const {
    inventory,
    inventoryMovements,
    setInventory,
    refreshInventory,
    refreshOrders,
    products,
  } = useCart();

  const [subTab, setSubTab] = useState('stock'); // 'stock' | 'simulator' | 'movements'
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'low' | 'expiring'

  // Estado del simulador y editor de recetas
  const pizzasList = useMemo(
    () => products.filter((p) => p.category === 'pizza' || p.category === 'pizzas-casa' || p.category === 'acompanamiento'),
    [products]
  );
  const [selectedProductId, setSelectedProductId] = useState(() => pizzasList[0]?.id || 'pizza-pepperoni');
  const [selectedSize, setSelectedSize] = useState('M');
  const [simQuantity, setSimQuantity] = useState(1);
  const [registerAsSale, setRegisterAsSale] = useState(true);
  const [editingRecipeMode, setEditingRecipeMode] = useState(false);
  const [customRecipeDraft, setCustomRecipeDraft] = useState([]);
  const [newRecipeIngId, setNewRecipeIngId] = useState('');
  const [newRecipeGrams, setNewRecipeGrams] = useState(60);

  const todayStr = new Date().toISOString().slice(0, 10);
  const defaultExpDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().slice(0, 10);
  }, []);

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      name: '',
      category: 'Quesos',
      stockGrams: 5000,
      minStockGrams: 1000,
      costPerKg: 8900,
      arrivalDate: todayStr,
      expirationDate: defaultExpDate,
      supplier: '',
    },
  });

  const watchedGrams = watch('stockGrams');
  const watchedCostPerKg = watch('costPerKg');
  const estimatedBatchCost = useMemo(() => {
    const g = Number(watchedGrams) || 0;
    const c = Number(watchedCostPerKg) || 0;
    return Math.round((g / 1000) * c);
  }, [watchedGrams, watchedCostPerKg]);

  // KPIs de inventario
  const kpis = useMemo(() => {
    let totalGrams = 0;
    let totalValue = 0;
    let lowStockCount = 0;
    let expiringSoonCount = 0;

    inventory.forEach((item) => {
      const g = Number(item.stockGrams) || 0;
      const minG = Number(item.minStockGrams) || 0;
      const costKg = Number(item.costPerKg) || 0;
      totalGrams += g;
      totalValue += Math.round((g / 1000) * costKg);
      if (g <= minG) lowStockCount += 1;
      const daysLeft = getDaysUntilExpiration(item.expirationDate);
      if (daysLeft !== null && daysLeft <= 7) expiringSoonCount += 1;
    });

    return {
      totalItems: inventory.length,
      totalKg: (totalGrams / 1000).toFixed(1),
      totalValue,
      lowStockCount,
      expiringSoonCount,
    };
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.supplier || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'Todas' || item.category === categoryFilter;
      if (!matchesSearch || !matchesCategory) return false;

      if (statusFilter === 'low') {
        return item.stockGrams <= item.minStockGrams;
      }
      if (statusFilter === 'expiring') {
        const days = getDaysUntilExpiration(item.expirationDate);
        return days !== null && days <= 7;
      }
      return true;
    });
  }, [inventory, searchTerm, categoryFilter, statusFilter]);

  const onSubmitInventory = (data) => {
    const stockGrams = Math.max(0, Number(data.stockGrams));
    const minStockGrams = Math.max(0, Number(data.minStockGrams));
    const costPerKg = Math.max(0, Number(data.costPerKg));

    const itemPayload = {
      id: editingId || `inv-${generateId()}`,
      name: data.name.trim(),
      category: data.category,
      stockGrams,
      initialStockGrams: editingId
        ? Math.max(
            inventory.find((i) => i.id === editingId)?.initialStockGrams || stockGrams,
            stockGrams
          )
        : Math.max(stockGrams, minStockGrams * 3),
      minStockGrams,
      costPerKg,
      arrivalDate: data.arrivalDate,
      expirationDate: data.expirationDate,
      supplier: data.supplier?.trim() || 'Proveedor General',
    };

    if (editingId) {
      setInventory(inventory.map((i) => (i.id === editingId ? itemPayload : i)));
      Swal.fire({
        icon: 'success',
        title: 'Insumo actualizado',
        text: `${itemPayload.name} (${formatGrams(itemPayload.stockGrams)})`,
        timer: 1600,
        showConfirmButton: false,
      });
    } else {
      const updated = [itemPayload, ...inventory];
      setInventory(updated);
      const movements = InventoryService.getMovements();
      movements.unshift({
        id: generateId(),
        timestamp: new Date().toISOString(),
        type: 'ingreso',
        reason: `Nuevo insumo ingresado — ${itemPayload.name} (+${stockGrams.toLocaleString('es-CL')} g)`,
        items: [{ inventoryId: itemPayload.id, name: itemPayload.name, grams: stockGrams }],
      });
      InventoryService.saveMovements(movements);
      refreshInventory();
      Swal.fire({
        icon: 'success',
        title: 'Insumo agregado al inventario',
        text: `${itemPayload.name} — ${formatGrams(itemPayload.stockGrams)}`,
        timer: 1600,
        showConfirmButton: false,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    reset({
      name: '',
      category: 'Quesos',
      stockGrams: 5000,
      minStockGrams: 1000,
      costPerKg: 8900,
      arrivalDate: todayStr,
      expirationDate: defaultExpDate,
      supplier: '',
    });
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setValue('name', item.name);
    setValue('category', item.category);
    setValue('stockGrams', item.stockGrams);
    setValue('minStockGrams', item.minStockGrams);
    setValue('costPerKg', item.costPerKg);
    setValue('arrivalDate', item.arrivalDate);
    setValue('expirationDate', item.expirationDate);
    setValue('supplier', item.supplier || '');
    window.scrollTo({ top: 160, behavior: 'smooth' });
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: `¿Eliminar ${item.name}?`,
      text: 'Se quitará este insumo del control de inventario.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#CD212A',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Eliminar',
    }).then((res) => {
      if (res.isConfirmed) {
        setInventory(inventory.filter((i) => i.id !== item.id));
      }
    });
  };

  const handleQuickRestock = async (item) => {
    const { value: formValues } = await Swal.fire({
      title: `Reponer ${item.name}`,
      html: `
        <div style="text-align: left; display: grid; gap: 0.75rem;">
          <div>
            <label style="font-size: 0.82rem; color: #bbb; display: block; margin-bottom: 0.25rem;">Gramos que ingresan (ej: 5000 = 5 kg)</label>
            <input id="swal-grams" type="number" class="swal2-input" value="5000" min="50" step="50" style="margin: 0; width: 100%;" />
          </div>
          <div>
            <label style="font-size: 0.82rem; color: #bbb; display: block; margin-bottom: 0.25rem;">Fecha de llegada</label>
            <input id="swal-arrival" type="date" class="swal2-input" value="${todayStr}" style="margin: 0; width: 100%;" />
          </div>
          <div>
            <label style="font-size: 0.82rem; color: #bbb; display: block; margin-bottom: 0.25rem;">Nueva fecha de vencimiento</label>
            <input id="swal-exp" type="date" class="swal2-input" value="${item.expirationDate || defaultExpDate}" style="margin: 0; width: 100%;" />
          </div>
          <div>
            <label style="font-size: 0.82rem; color: #bbb; display: block; margin-bottom: 0.25rem;">Costo por Kg ($ CLP)</label>
            <input id="swal-cost" type="number" class="swal2-input" value="${item.costPerKg || 0}" style="margin: 0; width: 100%;" />
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Ingresar lote',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const addedGrams = Number(document.getElementById('swal-grams')?.value || 0);
        const arrivalDate = document.getElementById('swal-arrival')?.value;
        const expirationDate = document.getElementById('swal-exp')?.value;
        const costPerKg = Number(document.getElementById('swal-cost')?.value || 0);
        if (addedGrams <= 0) {
          Swal.showValidationMessage('Ingresa una cantidad en gramos mayor a 0');
          return false;
        }
        return { addedGrams, arrivalDate, expirationDate, costPerKg };
      },
    });

    if (formValues) {
      InventoryService.restockItem(item.id, formValues.addedGrams, formValues);
      refreshInventory();
      Swal.fire({
        icon: 'success',
        title: 'Stock actualizado',
        text: `Se sumaron ${formatGrams(formValues.addedGrams)} a ${item.name}`,
        timer: 1800,
        showConfirmButton: false,
      });
    }
  };

  // Producto seleccionado en el simulador/recetario
  const selectedProduct = useMemo(
    () => pizzasList.find((p) => p.id === selectedProductId) || pizzasList[0],
    [pizzasList, selectedProductId]
  );

  const isSelectedPizza =
    selectedProduct?.category === 'pizza' || selectedProduct?.category === 'pizzas-casa';

  const currentRecipe = useMemo(() => {
    if (!selectedProduct) return [];
    return InventoryService.getRecipeForProduct(
      selectedProduct,
      isSelectedPizza ? selectedSize : 'M'
    );
  }, [selectedProduct, selectedSize, isSelectedPizza, inventory]);

  const totalRecipeCostPerUnit = useMemo(
    () => currentRecipe.reduce((acc, r) => acc + r.estimatedCost, 0),
    [currentRecipe]
  );

  const unitSalePrice = useMemo(() => {
    if (!selectedProduct) return 0;
    if (selectedProduct.prices && isSelectedPizza) {
      return selectedProduct.prices[selectedSize] || selectedProduct.prices.M || 0;
    }
    return selectedProduct.price || 0;
  }, [selectedProduct, selectedSize, isSelectedPizza]);

  const startEditingRecipe = () => {
    if (!selectedProduct) return;
    // Cargamos la receta en base Mediana ('M') para que escale proporcionalmente
    const baseRecipe = InventoryService.getRecipeForProduct(selectedProduct, 'M');
    setCustomRecipeDraft(
      baseRecipe.map((r) => ({
        inventoryId: r.inventoryId,
        name: r.name,
        baseGrams: r.grams,
      }))
    );
    setNewRecipeIngId(inventory[0]?.id || '');
    setEditingRecipeMode(true);
  };

  const handleSaveCustomRecipe = () => {
    if (!selectedProduct) return;
    InventoryService.saveCustomRecipe(selectedProduct.id, customRecipeDraft);
    setEditingRecipeMode(false);
    refreshInventory();
    Swal.fire({
      icon: 'success',
      title: 'Receta guardada',
      text: `Se actualizaron los gramos base para ${selectedProduct.name}`,
      timer: 1600,
      showConfirmButton: false,
    });
  };

  const handleSimulatePreparation = () => {
    if (!selectedProduct) return;
    const qty = Math.max(1, Number(simQuantity) || 1);
    const sizeKey = isSelectedPizza ? selectedSize : null;
    const sizeLabel = sizeKey ? SIZE_LABELS[sizeKey] || sizeKey : null;

    if (registerAsSale) {
      // Crea el pedido real (que a su vez descuenta el inventario automáticamente y suma a las estadísticas)
      const total = unitSalePrice * qty;
      OrdersService.createOrder({
        items: [
          {
            productId: selectedProduct.id,
            name: selectedProduct.name,
            category: selectedProduct.category || 'pizza',
            quantity: qty,
            price: unitSalePrice,
            size: sizeLabel,
          },
        ],
        rawSubtotal: total,
        promo2x1Discount: 0,
        couponDiscount: 0,
        total,
        customer: { name: 'Venta en Local (Cocina)', phone: null },
        delivery: { type: 'pickup', address: 'Local La Masia', distanceLabel: 'mostrador' },
      });
      refreshOrders();
    } else {
      InventoryService.deductItems(
        [
          {
            product: selectedProduct,
            productId: selectedProduct.id,
            name: selectedProduct.name,
            size: sizeKey || 'M',
            quantity: qty,
          },
        ],
        `Preparación cocina: ${qty}x ${selectedProduct.name}${sizeLabel ? ` (${sizeLabel})` : ''}`
      );
      refreshInventory();
    }

    const deductedSummary = currentRecipe
      .map((r) => `• <strong>${r.name}:</strong> -${(r.grams * qty).toLocaleString('es-CL')} g`)
      .join('<br/>');

    Swal.fire({
      icon: 'success',
      title: '¡Pizza preparada y descontada!',
      html: `
        <p style="margin-bottom: 0.75rem; color: #ccc;">
          Se descontaron los insumos para <strong>${qty}x ${selectedProduct.name}${sizeLabel ? ` (${sizeLabel})` : ''}</strong>:
        </p>
        <div style="text-align: left; background: #141414; padding: 0.85rem; border-radius: 8px; font-size: 0.88rem; line-height: 1.6;">
          ${deductedSummary}
        </div>
      `,
    });
  };

  const handleResetDemoInventory = () => {
    Swal.fire({
      title: '¿Restaurar stock inicial de demostración?',
      text: 'Todos los insumos volverán a sus cantidades iniciales de fábrica.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar',
    }).then((res) => {
      if (res.isConfirmed) {
        InventoryService.resetInventoryToDefaults();
        refreshInventory();
        Swal.fire({ icon: 'success', title: 'Inventario restaurado', timer: 1500, showConfirmButton: false });
      }
    });
  };

  return (
    <div>
      {/* Tarjetas de Resumen KPI */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'rgba(0, 140, 69, 0.15)', color: 'var(--color-italian-green)' }}>
            <FaBoxOpen />
          </div>
          <div>
            <span className="admin-kpi-label">Insumos en Bodega</span>
            <h3 className="admin-kpi-value">{kpis.totalItems} productos</h3>
            <small className="admin-kpi-sub">{kpis.totalKg} kg totales disponibles</small>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'rgba(201, 169, 98, 0.15)', color: 'var(--color-gold)' }}>
            <FaUtensils />
          </div>
          <div>
            <span className="admin-kpi-label">Valorización Inventario</span>
            <h3 className="admin-kpi-value">{formatCurrency(kpis.totalValue)}</h3>
            <small className="admin-kpi-sub">Costo total en stock actual</small>
          </div>
        </div>

        <div
          className="admin-kpi-card"
          style={{ cursor: 'pointer', borderColor: kpis.lowStockCount > 0 ? 'var(--color-italian-red)' : undefined }}
          onClick={() => { setSubTab('stock'); setStatusFilter(statusFilter === 'low' ? 'all' : 'low'); }}
        >
          <div className="admin-kpi-icon" style={{ background: 'rgba(205, 33, 42, 0.15)', color: 'var(--color-italian-red)' }}>
            <FaExclamationTriangle />
          </div>
          <div>
            <span className="admin-kpi-label">Alertas Stock Bajo</span>
            <h3 className="admin-kpi-value">{kpis.lowStockCount} insumos</h3>
            <small className="admin-kpi-sub">Clic para filtrar críticos</small>
          </div>
        </div>

        <div
          className="admin-kpi-card"
          style={{ cursor: 'pointer', borderColor: kpis.expiringSoonCount > 0 ? '#e67e22' : undefined }}
          onClick={() => { setSubTab('stock'); setStatusFilter(statusFilter === 'expiring' ? 'all' : 'expiring'); }}
        >
          <div className="admin-kpi-icon" style={{ background: 'rgba(230, 126, 34, 0.15)', color: '#e67e22' }}>
            <FaClock />
          </div>
          <div>
            <span className="admin-kpi-label">Por Vencer (≤ 7 días)</span>
            <h3 className="admin-kpi-value">{kpis.expiringSoonCount} lotes</h3>
            <small className="admin-kpi-sub">Control de fechas de vencimiento</small>
          </div>
        </div>
      </div>

      {/* Sub-navegación de Inventario */}
      <div className="admin-subtabs">
        <button
          type="button"
          className={`admin-subtab ${subTab === 'stock' ? 'active' : ''}`}
          onClick={() => setSubTab('stock')}
        >
          <FaBoxOpen /> Control de Bodega e Insumos
        </button>
        <button
          type="button"
          className={`admin-subtab ${subTab === 'simulator' ? 'active' : ''}`}
          onClick={() => setSubTab('simulator')}
        >
          <FaUtensils /> Recetas en Gramos y Simulador de Descuento
        </button>
        <button
          type="button"
          className={`admin-subtab ${subTab === 'movements' ? 'active' : ''}`}
          onClick={() => setSubTab('movements')}
        >
          <FaHistory /> Historial de Descuentos ({inventoryMovements.length})
        </button>
      </div>

      {/* SUB-TAB 1: BODEGA E INSUMOS */}
      {subTab === 'stock' && (
        <>
          <div className="admin-form-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>
                {editingId ? 'Editar Insumo de Inventario' : 'Agregar Producto / Lote al Inventario'}
              </h3>
              <button type="button" className="btn-outline-masia btn-sm" onClick={handleResetDemoInventory}>
                <FaRedo /> Restaurar Stock Demo
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitInventory)}>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label>Producto / Insumo (ej: Queso Mozzarella, Carne Mechada)</label>
                  <input
                    className="form-control-masia"
                    placeholder="Ej: Queso Mozzarella"
                    {...register('name', { required: true })}
                  />
                </div>

                <div className="form-group">
                  <label>Categoría</label>
                  <select className="form-control-masia" {...register('category')}>
                    {INVENTORY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Cantidad en Gramos{' '}
                    <span style={{ color: 'var(--color-italian-green)', fontWeight: 600 }}>
                      ({((Number(watchedGrams) || 0) / 1000).toFixed(2)} kg)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    className="form-control-masia"
                    {...register('stockGrams', { required: true })}
                  />
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                    {[1000, 2500, 5000, 10000, 20000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className="admin-preset-chip"
                        onClick={() => setValue('stockGrams', preset)}
                      >
                        {preset / 1000} kg ({preset.toLocaleString('es-CL')}g)
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Stock Mínimo de Alerta (Gramos)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    className="form-control-masia"
                    {...register('minStockGrams', { required: true })}
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Llegada / Recepción</label>
                  <input
                    type="date"
                    className="form-control-masia"
                    {...register('arrivalDate', { required: true })}
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Vencimiento</label>
                  <input
                    type="date"
                    className="form-control-masia"
                    {...register('expirationDate', { required: true })}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Costo por Kg ($ CLP){' '}
                    <span style={{ color: 'var(--color-gold)', fontSize: '0.78rem' }}>
                      · Valor lote: {formatCurrency(estimatedBatchCost)}
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    className="form-control-masia"
                    {...register('costPerKg', { required: true })}
                  />
                </div>

                <div className="form-group">
                  <label>Proveedor / Origen</label>
                  <input
                    className="form-control-masia"
                    placeholder="Ej: Lácteos del Sur / Producción Propia"
                    {...register('supplier')}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary-masia btn-sm">
                  <FaPlus /> {editingId ? 'Actualizar Insumo' : 'Guardar en Inventario'}
                </button>
                {editingId && (
                  <button type="button" className="btn-outline-masia btn-sm" onClick={resetForm}>
                    Cancelar Edición
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Barra de Filtros de Inventario */}
          <div className="admin-inventory-filters">
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-light-gray)' }} />
              <input
                type="text"
                className="form-control-masia"
                style={{ paddingLeft: '2.2rem' }}
                placeholder="Buscar queso, carne, masa, proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="form-control-masia"
              style={{ maxWidth: '210px' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="Todas">Todas las categorías</option>
              {INVENTORY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              className="form-control-masia"
              style={{ maxWidth: '210px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="low">Solo Stock Bajo / Crítico</option>
              <option value="expiring">Por Vencer (≤ 7 días)</option>
            </select>
          </div>

          {/* Tabla de Inventario */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Insumo / Proveedor</th>
                  <th>Categoría</th>
                  <th>Stock Disponible</th>
                  <th>Llegada</th>
                  <th>Vencimiento</th>
                  <th>Costo / Kg</th>
                  <th>Valor Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-light-gray)' }}>
                      No se encontraron insumos con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => {
                    const isLow = item.stockGrams <= item.minStockGrams;
                    const isCritical = item.stockGrams <= item.minStockGrams * 0.5;
                    const maxRef = Math.max(item.initialStockGrams || item.minStockGrams * 3, item.stockGrams, 1);
                    const pct = Math.min(100, Math.round((item.stockGrams / maxRef) * 100));
                    const daysLeft = getDaysUntilExpiration(item.expirationDate);
                    const totalItemCost = Math.round(((item.stockGrams || 0) / 1000) * (item.costPerKg || 0));

                    let barColor = 'var(--color-italian-green)';
                    if (isCritical) barColor = 'var(--color-italian-red)';
                    else if (isLow) barColor = '#e67e22';

                    return (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.name}</strong>
                          <small style={{ display: 'block', color: 'var(--color-light-gray)', fontSize: '0.75rem' }}>
                            {item.supplier || 'Proveedor General'}
                          </small>
                        </td>
                        <td>
                          <span className="inventory-cat-badge">{item.category}</span>
                        </td>
                        <td style={{ minWidth: '190px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                            <strong>{formatGrams(item.stockGrams)}</strong>
                            {isLow && (
                              <span style={{ color: isCritical ? 'var(--color-italian-red)' : '#e67e22', fontWeight: 600, fontSize: '0.72rem' }}>
                                {isCritical ? '¡CRÍTICO!' : 'Stock Bajo'}
                              </span>
                            )}
                          </div>
                          <div className="inventory-progress-track">
                            <div
                              className="inventory-progress-fill"
                              style={{ width: `${pct}%`, background: barColor }}
                            />
                          </div>
                          <small style={{ color: 'var(--color-light-gray)', fontSize: '0.7rem' }}>
                            Mínimo alerta: {item.minStockGrams.toLocaleString('es-CL')} g
                          </small>
                        </td>
                        <td>{item.arrivalDate || '—'}</td>
                        <td>
                          <div>{item.expirationDate || '—'}</div>
                          {daysLeft !== null && (
                            <span
                              className={`status-badge ${
                                daysLeft < 0
                                  ? 'status-inactive'
                                  : daysLeft <= 7
                                  ? 'status-warning'
                                  : 'status-active'
                              }`}
                              style={{ display: 'inline-block', marginTop: '3px' }}
                            >
                              {daysLeft < 0
                                ? `Vencido hace ${Math.abs(daysLeft)}d`
                                : daysLeft === 0
                                ? 'Vence hoy'
                                : `En ${daysLeft} días`}
                            </span>
                          )}
                        </td>
                        <td>{formatCurrency(item.costPerKg)}/kg</td>
                        <td>
                          <strong style={{ color: 'var(--color-gold)' }}>{formatCurrency(totalItemCost)}</strong>
                        </td>
                        <td className="admin-actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn-toggle"
                            title="Reponer lote"
                            onClick={() => handleQuickRestock(item)}
                          >
                            + Lote
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-edit"
                            title="Editar"
                            onClick={() => handleEdit(item)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-delete"
                            title="Eliminar"
                            onClick={() => handleDelete(item)}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* SUB-TAB 2: RECETAS EN GRAMOS Y SIMULADOR DE DESCUENTO */}
      {subTab === 'simulator' && (
        <div className="admin-simulator-grid">
          <div className="admin-form-card">
            <h3>Preparar Pizza / Descontar por Receta</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-light-gray)', marginBottom: '1.25rem' }}>
              Cada pedido web aceptado descuenta automáticamente estos gramos del inventario. También puedes simular o registrar la preparación de cualquier pizza aquí mismo para ver cómo disminuye el stock en tiempo real.
            </p>

            <div className="form-group">
              <label>Selecciona la Pizza o Preparación</label>
              <select
                className="form-control-masia"
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setEditingRecipeMode(false);
                }}
              >
                {pizzasList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category === 'pizza' ? 'Pizza de la Casa' : 'Acompañamiento'})
                  </option>
                ))}
              </select>
            </div>

            {isSelectedPizza && (
              <div className="form-group">
                <label>Tamaño de la Preparación (escala los gramos automáticamente)</label>
                <div className="size-selector">
                  {[
                    { code: 'I', label: 'Individual (60%)' },
                    { code: 'M', label: 'Mediana (100%)' },
                    { code: 'F', label: 'Familiar (140%)' },
                  ].map((sz) => (
                    <button
                      key={sz.code}
                      type="button"
                      className={`size-btn ${selectedSize === sz.code ? 'active' : ''}`}
                      onClick={() => setSelectedSize(sz.code)}
                    >
                      <span className="size-btn-label">{sz.label}</span>
                      <span className="size-btn-price">
                        {formatCurrency(selectedProduct?.prices?.[sz.code] || 0)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="admin-form-grid">
              <div className="form-group">
                <label>Cantidad de pizzas a preparar</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  className="form-control-masia"
                  value={simQuantity}
                  onChange={(e) => setSimQuantity(Math.max(1, Number(e.target.value) || 1))}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '1.4rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={registerAsSale}
                    onChange={(e) => setRegisterAsSale(e.target.checked)}
                    style={{ accentColor: 'var(--color-italian-green)', width: '18px', height: '18px' }}
                  />
                  <span>Registrar también como venta del día en Dashboard</span>
                </label>
              </div>
            </div>

            {/* Resumen económico de la receta */}
            <div className="recipe-economics-box">
              <div>
                <span>Costo Insumos (1 unid.)</span>
                <strong>{formatCurrency(totalRecipeCostPerUnit)}</strong>
              </div>
              <div>
                <span>Precio Venta</span>
                <strong style={{ color: 'var(--color-italian-green)' }}>{formatCurrency(unitSalePrice)}</strong>
              </div>
              <div>
                <span>Margen Bruto</span>
                <strong style={{ color: 'var(--color-gold)' }}>
                  {formatCurrency(Math.max(0, unitSalePrice - totalRecipeCostPerUnit))}{' '}
                  ({unitSalePrice > 0 ? Math.round(((unitSalePrice - totalRecipeCostPerUnit) / unitSalePrice) * 100) : 0}%)
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary-masia"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={handleSimulatePreparation}
            >
              <FaUtensils /> Preparar {simQuantity}x {selectedProduct?.name} y Descontar Gramos
            </button>
          </div>

          {/* Ficha Técnica de Gramaje */}
          <div className="admin-form-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>Ficha Técnica de Gramaje: {selectedProduct?.name}</h3>
                <small style={{ color: 'var(--color-light-gray)' }}>
                  Gramos que se descuentan por cada preparación ({isSelectedPizza ? SIZE_LABELS[selectedSize] : 'Porción estándar'})
                </small>
              </div>
              {!editingRecipeMode ? (
                <button type="button" className="btn-outline-masia btn-sm" onClick={startEditingRecipe}>
                  <FaEdit /> Ajustar Gramos Receta
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button type="button" className="btn-primary-masia btn-sm" onClick={handleSaveCustomRecipe}>
                    Guardar Receta
                  </button>
                  <button type="button" className="btn-outline-masia btn-sm" onClick={() => setEditingRecipeMode(false)}>
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            {!editingRecipeMode ? (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ingrediente / Insumo</th>
                      <th>Gramos por 1 unid.</th>
                      <th>Total a Descontar ({simQuantity}x)</th>
                      <th>Stock Actual → Restante</th>
                      <th>Costo Insumo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecipe.map((r) => {
                      const invItem = inventory.find((i) => i.id === r.inventoryId);
                      const currentStock = invItem?.stockGrams || 0;
                      const totalToDeduct = r.grams * simQuantity;
                      const afterStock = Math.max(0, currentStock - totalToDeduct);
                      return (
                        <tr key={r.inventoryId}>
                          <td><strong>{r.name}</strong></td>
                          <td>{r.grams} g</td>
                          <td style={{ color: 'var(--color-italian-red)', fontWeight: 600 }}>
                            -{totalToDeduct} g
                          </td>
                          <td>
                            <span>{currentStock.toLocaleString('es-CL')} g</span>
                            {' → '}
                            <strong style={{ color: afterStock <= (invItem?.minStockGrams || 0) ? 'var(--color-italian-red)' : 'var(--color-italian-green)' }}>
                              {afterStock.toLocaleString('es-CL')} g
                            </strong>
                          </td>
                          <td>{formatCurrency(r.estimatedCost * simQuantity)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-light-gray)', marginBottom: '0.75rem' }}>
                  Edita los gramos base (para tamaño Mediana). El tamaño Individual calculará el 60% y el Familiar el 140% automáticamente.
                </p>
                <div className="admin-table-wrapper" style={{ marginBottom: '1rem' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Insumo</th>
                        <th>Gramos Base (Mediana)</th>
                        <th>Quitar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customRecipeDraft.map((item, idx) => (
                        <tr key={item.inventoryId}>
                          <td>{item.name}</td>
                          <td>
                            <input
                              type="number"
                              min="5"
                              step="5"
                              className="form-control-masia"
                              style={{ maxWidth: '120px', padding: '0.35rem 0.6rem' }}
                              value={item.baseGrams}
                              onChange={(e) => {
                                const val = Math.max(0, Number(e.target.value) || 0);
                                setCustomRecipeDraft((prev) =>
                                  prev.map((row, i) => (i === idx ? { ...row, baseGrams: val } : row))
                                );
                              }}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="admin-btn admin-btn-delete"
                              onClick={() =>
                                setCustomRecipeDraft((prev) => prev.filter((_, i) => i !== idx))
                              }
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '0.25rem' }}>
                      Añadir otro insumo a la receta
                    </label>
                    <select
                      className="form-control-masia"
                      value={newRecipeIngId}
                      onChange={(e) => setNewRecipeIngId(e.target.value)}
                    >
                      {inventory.map((inv) => (
                        <option key={inv.id} value={inv.id}>{inv.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ width: '130px' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '0.25rem' }}>
                      Gramos base
                    </label>
                    <input
                      type="number"
                      min="5"
                      step="5"
                      className="form-control-masia"
                      value={newRecipeGrams}
                      onChange={(e) => setNewRecipeGrams(Number(e.target.value) || 50)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-outline-masia btn-sm"
                    onClick={() => {
                      const inv = inventory.find((i) => i.id === newRecipeIngId);
                      if (!inv) return;
                      setCustomRecipeDraft((prev) => {
                        const exists = prev.find((p) => p.inventoryId === inv.id);
                        if (exists) {
                          return prev.map((p) =>
                            p.inventoryId === inv.id ? { ...p, baseGrams: Number(newRecipeGrams) } : p
                          );
                        }
                        return [...prev, { inventoryId: inv.id, name: inv.name, baseGrams: Number(newRecipeGrams) }];
                      });
                    }}
                  >
                    + Añadir ingrediente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: HISTORIAL DE MOVIMIENTOS Y DESCUENTOS */}
      {subTab === 'movements' && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Tipo</th>
                <th>Motivo / Pedido</th>
                <th>Detalle de Gramos</th>
              </tr>
            </thead>
            <tbody>
              {inventoryMovements.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-light-gray)' }}>
                    Aún no hay movimientos registrados.
                  </td>
                </tr>
              ) : (
                inventoryMovements.map((mov) => (
                  <tr key={mov.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {new Date(mov.timestamp).toLocaleString('es-CL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          mov.type === 'ingreso' ? 'status-active' : 'status-inactive'
                        }`}
                      >
                        {mov.type === 'ingreso' ? 'Ingreso Stock' : 'Descuento Receta'}
                      </span>
                    </td>
                    <td><strong>{mov.reason}</strong></td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {mov.items?.map((it, idx) => (
                          <span
                            key={idx}
                            className="movement-chip"
                            style={{
                              borderColor: mov.type === 'ingreso' ? 'var(--color-italian-green)' : 'rgba(205,33,42,0.5)',
                              color: mov.type === 'ingreso' ? 'var(--color-italian-green)' : '#ff8a8f',
                            }}
                          >
                            {it.name}: {mov.type === 'ingreso' ? '+' : '-'}{it.grams.toLocaleString('es-CL')} g
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
