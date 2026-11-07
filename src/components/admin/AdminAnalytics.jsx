import { useState, useMemo } from 'react';
import {
  FaChartBar,
  FaPizzaSlice,
  FaDollarSign,
  FaTrophy,
  FaCalendarAlt,
  FaClock,
  FaMotorcycle,
  FaPercentage,
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import InventoryService from '../../services/InventoryService';
import { formatCurrency } from '../../utils/formatCurrency';

const isPizzaItem = (item) => {
  const cat = String(item.category || '').toLowerCase();
  const name = String(item.name || '').toLowerCase();
  const pid = String(item.productId || '').toLowerCase();
  if (cat === 'pizza' || cat === 'pizzas-casa') return true;
  if (pid.startsWith('pizza-')) return true;
  if (
    cat === 'bebida' ||
    cat === 'acompanamiento' ||
    cat === 'papas' ||
    cat === 'salsa' ||
    name.includes('bebida') ||
    name.includes('jugo') ||
    name.includes('agua') ||
    name.includes('palitos') ||
    name.includes('stromboli') ||
    name.includes('alitas') ||
    name.includes('papas') ||
    name.includes('ensalada') ||
    name.includes('lasaña')
  ) {
    return false;
  }
  return true;
};

const normalizeSizeLabel = (size) => {
  if (!size) return 'Familiar';
  const s = String(size).toLowerCase();
  if (s === 'i' || s.includes('indiv')) return 'Individual';
  if (s === 'm' || s.includes('med')) return 'Mediana';
  return 'Familiar';
};

const formatShortDate = (dateStr) => {
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
};

const formatFullDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const AdminAnalytics = () => {
  const { orders, products } = useCart();
  const [periodDays, setPeriodDays] = useState(14); // 7 | 14 | 30 | 0 (todo)
  const [dailyMetric, setDailyMetric] = useState('pizzas'); // 'pizzas' | 'revenue'
  const [selectedDay, setSelectedDay] = useState(() => new Date().toISOString().slice(0, 10));

  // Filtrar pedidos válidos (no cancelados) dentro del período
  const validOrders = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    return orders.filter((o) => {
      if (o.status === 'cancelado') return false;
      if (!periodDays || periodDays <= 0) return true;
      const orderDate = new Date(o.createdAt);
      const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
      return diffDays <= periodDays;
    });
  }, [orders, periodDays]);

  // Construcción de serie diaria para los últimos N días
  const dailySeries = useMemo(() => {
    const daysCount = periodDays > 0 ? Math.min(periodDays, 14) : 14;
    const mapByDate = new Map();
    const today = new Date();

    for (let i = daysCount - 1; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      mapByDate.set(key, {
        date: key,
        label: formatShortDate(key),
        pizzas: 0,
        accompaniments: 0,
        ordersCount: 0,
        revenue: 0,
        itemsBreakdown: [],
      });
    }

    orders
      .filter((o) => o.status !== 'cancelado')
      .forEach((order) => {
        const dateKey = order.createdAt.slice(0, 10);
        if (!mapByDate.has(dateKey)) {
          mapByDate.set(dateKey, {
            date: dateKey,
            label: formatShortDate(dateKey),
            pizzas: 0,
            accompaniments: 0,
            ordersCount: 0,
            revenue: 0,
            itemsBreakdown: [],
          });
        }
        const entry = mapByDate.get(dateKey);
        entry.ordersCount += 1;
        entry.revenue += Number(order.total) || 0;

        order.items?.forEach((item) => {
          const qty = Number(item.quantity) || 1;
          if (isPizzaItem(item)) {
            entry.pizzas += qty;
          } else {
            entry.accompaniments += qty;
          }
          entry.itemsBreakdown.push({
            name: item.name,
            size: item.size || null,
            quantity: qty,
            price: item.price || 0,
            isPizza: isPizzaItem(item),
          });
        });
      });

    const allDays = Array.from(mapByDate.values()).sort((a, b) => a.date.localeCompare(b.date));
    return periodDays > 0 ? allDays.slice(-daysCount) : allDays.slice(-14);
  }, [orders, periodDays]);

  // Datos detallados para "Tal Día" (selectedDay)
  const selectedDayStats = useMemo(() => {
    const dayOrders = orders.filter(
      (o) => o.status !== 'cancelado' && o.createdAt.slice(0, 10) === selectedDay
    );
    let totalPizzas = 0;
    let totalRevenue = 0;
    const pizzaCountMap = new Map();

    dayOrders.forEach((order) => {
      totalRevenue += Number(order.total) || 0;
      order.items?.forEach((item) => {
        const qty = Number(item.quantity) || 1;
        if (isPizzaItem(item)) {
          totalPizzas += qty;
          const key = `${item.name}${item.size ? ` (${item.size})` : ''}`;
          pizzaCountMap.set(key, (pizzaCountMap.get(key) || 0) + qty);
        }
      });
    });

    const pizzasBreakdown = Array.from(pizzaCountMap.entries())
      .map(([label, qty]) => ({ label, qty }))
      .sort((a, b) => b.qty - a.qty);

    return {
      date: selectedDay,
      ordersCount: dayOrders.length,
      totalPizzas,
      totalRevenue,
      pizzasBreakdown,
    };
  }, [orders, selectedDay]);

  // Estadísticas globales del período: Ranking de Pizzas, Tamaños, Horarios, Modalidad e Insumos
  const analytics = useMemo(() => {
    let totalRevenue = 0;
    let totalPizzas = 0;
    let totalOrders = validOrders.length;
    let deliveryCount = 0;
    let pickupCount = 0;
    let ordersWith2x1 = 0;
    let totalFoodCost = 0;

    const byPizzaMap = new Map();
    const bySizeMap = { Familiar: 0, Mediana: 0, Individual: 0 };
    const byHourMap = new Map();
    const ingredientConsumptionMap = new Map();

    for (let h = 12; h <= 23; h += 1) {
      byHourMap.set(h, 0);
    }

    validOrders.forEach((order) => {
      totalRevenue += Number(order.total) || 0;
      if (order.delivery?.type === 'delivery') deliveryCount += 1;
      else pickupCount += 1;
      if ((order.promo2x1Discount || 0) > 0) ordersWith2x1 += 1;

      const orderHour = new Date(order.createdAt).getHours();
      const clampedHour = Math.min(23, Math.max(12, orderHour));

      order.items?.forEach((item) => {
        const qty = Number(item.quantity) || 1;
        const itemRevenue = (Number(item.price) || 0) * qty;

        // Calcular consumo de insumos y food cost estimado
        const catalogProduct = products.find(
          (p) => p.id === item.productId || p.name.toLowerCase() === String(item.name || '').toLowerCase()
        );
        const recipe = InventoryService.getRecipeForProduct(
          catalogProduct || item,
          item.size || 'M',
          item.details
        );
        recipe.forEach((r) => {
          totalFoodCost += r.estimatedCost * qty;
          const prev = ingredientConsumptionMap.get(r.inventoryId) || {
            name: r.name,
            grams: 0,
            cost: 0,
          };
          prev.grams += r.grams * qty;
          prev.cost += r.estimatedCost * qty;
          ingredientConsumptionMap.set(r.inventoryId, prev);
        });

        if (isPizzaItem(item)) {
          totalPizzas += qty;
          byHourMap.set(clampedHour, (byHourMap.get(clampedHour) || 0) + qty);

          const sizeLabel = normalizeSizeLabel(item.size);
          bySizeMap[sizeLabel] = (bySizeMap[sizeLabel] || 0) + qty;

          const curr = byPizzaMap.get(item.name) || {
            name: item.name,
            quantity: 0,
            revenue: 0,
            image: catalogProduct?.image || null,
          };
          curr.quantity += qty;
          curr.revenue += itemRevenue;
          byPizzaMap.set(item.name, curr);
        }
      });
    });

    const topPizzas = Array.from(byPizzaMap.values()).sort((a, b) => b.quantity - a.quantity);
    const bestSeller = topPizzas[0] || { name: 'Sin datos', quantity: 0 };
    const avgTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const grossMarginPct =
      totalRevenue > 0
        ? Math.max(0, Math.round(((totalRevenue - totalFoodCost) / totalRevenue) * 100))
        : 0;

    const hourlySeries = Array.from(byHourMap.entries()).map(([hour, count]) => ({
      hour: `${String(hour).padStart(2, '0')}:00`,
      count,
    }));

    const topIngredients = Array.from(ingredientConsumptionMap.values())
      .sort((a, b) => b.grams - a.grams)
      .slice(0, 7);

    return {
      totalRevenue,
      totalPizzas,
      totalOrders,
      avgTicket,
      bestSeller,
      topPizzas,
      bySizeMap,
      deliveryCount,
      pickupCount,
      ordersWith2x1,
      hourlySeries,
      topIngredients,
      totalFoodCost,
      grossMarginPct,
    };
  }, [validOrders, products]);

  const maxDailyVal = useMemo(() => {
    const vals = dailySeries.map((d) => (dailyMetric === 'pizzas' ? d.pizzas : d.revenue));
    return Math.max(...vals, 1);
  }, [dailySeries, dailyMetric]);

  const maxPizzaUnits = useMemo(
    () => Math.max(...analytics.topPizzas.map((p) => p.quantity), 1),
    [analytics.topPizzas]
  );

  const maxHourVal = useMemo(
    () => Math.max(...analytics.hourlySeries.map((h) => h.count), 1),
    [analytics.hourlySeries]
  );

  // Cálculo del gráfico Donut SVG para tamaños de pizza
  const sizeSegments = useMemo(() => {
    const total = Math.max(1, analytics.totalPizzas);
    const entries = [
      { label: 'Familiar', count: analytics.bySizeMap.Familiar || 0, color: '#CD212A' },
      { label: 'Mediana', count: analytics.bySizeMap.Mediana || 0, color: '#008C45' },
      { label: 'Individual', count: analytics.bySizeMap.Individual || 0, color: '#c9a962' },
    ];
    let accPct = 0;
    return entries.map((e) => {
      const pct = Math.round((e.count / total) * 100);
      const dashArray = `${(e.count / total) * 100} ${100 - (e.count / total) * 100}`;
      const dashOffset = 25 - accPct;
      accPct += (e.count / total) * 100;
      return { ...e, pct, dashArray, dashOffset };
    });
  }, [analytics]);

  return (
    <div>
      {/* Barra Superior de Filtros de Período */}
      <div className="admin-analytics-header">
        <div>
          <h3 style={{ margin: 0, fontSize: '1.35rem' }}>
            Dashboard de Ventas y Rendimiento del Negocio
          </h3>
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--color-light-gray)' }}>
            Estadísticas en tiempo real de pizzas más vendidas, ventas por día, horarios punta y consumo de insumos.
          </p>
        </div>

        <div className="admin-period-pills">
          {[
            { days: 7, label: 'Últimos 7 días' },
            { days: 14, label: 'Últimos 14 días' },
            { days: 30, label: 'Últimos 30 días' },
            { days: 0, label: 'Histórico Total' },
          ].map((opt) => (
            <button
              key={opt.days}
              type="button"
              className={`admin-period-pill ${periodDays === opt.days ? 'active' : ''}`}
              onClick={() => setPeriodDays(opt.days)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'rgba(0, 140, 69, 0.15)', color: 'var(--color-italian-green)' }}>
            <FaDollarSign />
          </div>
          <div>
            <span className="admin-kpi-label">Ingresos del Período</span>
            <h3 className="admin-kpi-value">{formatCurrency(analytics.totalRevenue)}</h3>
            <small className="admin-kpi-sub">
              Ticket promedio: {formatCurrency(analytics.avgTicket)} ({analytics.totalOrders} pedidos)
            </small>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'rgba(205, 33, 42, 0.15)', color: 'var(--color-italian-red)' }}>
            <FaPizzaSlice />
          </div>
          <div>
            <span className="admin-kpi-label">Pizzas Vendidas</span>
            <h3 className="admin-kpi-value">{analytics.totalPizzas} pizzas</h3>
            <small className="admin-kpi-sub">
              Promedio {(analytics.totalPizzas / Math.max(1, analytics.totalOrders)).toFixed(1)} pizzas por pedido
            </small>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'rgba(201, 169, 98, 0.15)', color: 'var(--color-gold)' }}>
            <FaTrophy />
          </div>
          <div>
            <span className="admin-kpi-label">Pizza #1 Más Vendida</span>
            <h3 className="admin-kpi-value">{analytics.bestSeller.name}</h3>
            <small className="admin-kpi-sub">
              {analytics.bestSeller.quantity} unidades ({analytics.totalPizzas > 0 ? Math.round((analytics.bestSeller.quantity / analytics.totalPizzas) * 100) : 0}% del total)
            </small>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71' }}>
            <FaPercentage />
          </div>
          <div>
            <span className="admin-kpi-label">Margen Bruto Estimado</span>
            <h3 className="admin-kpi-value">{analytics.grossMarginPct}%</h3>
            <small className="admin-kpi-sub">
              Costo insumos: {formatCurrency(analytics.totalFoodCost)}
            </small>
          </div>
        </div>
      </div>

      {/* CONSULTA DE DÍA ESPECÍFICO ("¿Cuántas pizzas se vendieron tal día?") + GRÁFICO DIARIO */}
      <div className="admin-analytics-grid-2">
        {/* Gráfico de Barras Diario */}
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <div>
              <h4>Ventas por Día (Haz clic en una barra para ver el detalle del día)</h4>
              <small style={{ color: 'var(--color-light-gray)' }}>
                Evolución diaria de pizzas preparadas e ingresos
              </small>
            </div>
            <div className="admin-metric-switch">
              <button
                type="button"
                className={dailyMetric === 'pizzas' ? 'active' : ''}
                onClick={() => setDailyMetric('pizzas')}
              >
                Pizzas (Unid.)
              </button>
              <button
                type="button"
                className={dailyMetric === 'revenue' ? 'active' : ''}
                onClick={() => setDailyMetric('revenue')}
              >
                Ingresos ($)
              </button>
            </div>
          </div>

          <div className="daily-bars-chart">
            {dailySeries.map((day) => {
              const val = dailyMetric === 'pizzas' ? day.pizzas : day.revenue;
              const heightPct = Math.max(8, Math.round((val / maxDailyVal) * 100));
              const isSelected = day.date === selectedDay;

              return (
                <div
                  key={day.date}
                  className={`daily-bar-col ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedDay(day.date)}
                  title={`${day.date}: ${day.pizzas} pizzas — ${formatCurrency(day.revenue)}`}
                >
                  <span className="daily-bar-value">
                    {dailyMetric === 'pizzas'
                      ? `${day.pizzas}`
                      : `$${Math.round(day.revenue / 1000)}k`}
                  </span>
                  <div className="daily-bar-track">
                    <div
                      className="daily-bar-fill"
                      style={{
                        height: `${heightPct}%`,
                        background: isSelected
                          ? 'linear-gradient(180deg, var(--color-gold), #9c7a32)'
                          : dailyMetric === 'pizzas'
                          ? 'linear-gradient(180deg, var(--color-italian-red), #8a151b)'
                          : 'linear-gradient(180deg, var(--color-italian-green), #00592b)',
                      }}
                    />
                  </div>
                  <span className="daily-bar-label">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inspector de Día Específico ("¿Cuántas pizzas se vendieron tal día?") */}
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <div>
              <h4>
                <FaCalendarAlt style={{ color: 'var(--color-gold)', marginRight: '0.4rem' }} />
                Detalle de Ventas por Día
              </h4>
              <small style={{ color: 'var(--color-light-gray)' }}>
                Consulta cuántas pizzas se vendieron en una fecha específica
              </small>
            </div>
            <input
              type="date"
              className="form-control-masia"
              style={{ maxWidth: '165px', padding: '0.4rem 0.65rem', fontSize: '0.82rem' }}
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            />
          </div>

          <div className="day-inspector-banner">
            <div style={{ textTransform: 'capitalize', fontSize: '0.85rem', color: 'var(--color-gold)', marginBottom: '0.5rem' }}>
              {formatFullDate(selectedDayStats.date)}
            </div>
            <div className="day-inspector-metrics">
              <div>
                <span>Pizzas Vendidas</span>
                <strong>{selectedDayStats.totalPizzas} pizzas</strong>
              </div>
              <div>
                <span>Pedidos del Día</span>
                <strong>{selectedDayStats.ordersCount} pedidos</strong>
              </div>
              <div>
                <span>Total Vendido</span>
                <strong style={{ color: 'var(--color-italian-green)' }}>
                  {formatCurrency(selectedDayStats.totalRevenue)}
                </strong>
              </div>
            </div>
          </div>

          <h5 style={{ fontSize: '0.85rem', color: 'var(--color-light-gray)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Pizzas preparadas este día:
          </h5>
          {selectedDayStats.pizzasBreakdown.length === 0 ? (
            <p style={{ color: 'var(--color-light-gray)', fontSize: '0.85rem', padding: '1rem 0' }}>
              No se registran pizzas vendidas en esta fecha. Selecciona otra barra del gráfico o fecha del calendario.
            </p>
          ) : (
            <div className="day-pizzas-list">
              {selectedDayStats.pizzasBreakdown.map((item, idx) => (
                <div key={idx} className="day-pizza-row">
                  <span>{item.label}</span>
                  <span className="day-pizza-qty">{item.qty} unid.</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RANKING DE PIZZAS MÁS VENDIDAS + DISTRIBUCIÓN POR TAMAÑO Y CANAL */}
      <div className="admin-analytics-grid-2">
        {/* Ranking de Pizzas Más Vendidas */}
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <div>
              <h4>
                <FaChartBar style={{ color: 'var(--color-italian-red)', marginRight: '0.4rem' }} />
                Ranking de Pizzas Más Vendidas
              </h4>
              <small style={{ color: 'var(--color-light-gray)' }}>
                Unidades vendidas, participación e ingresos por variedad
              </small>
            </div>
          </div>

          <div className="top-pizzas-ranking">
            {analytics.topPizzas.slice(0, 10).map((pizza, idx) => {
              const widthPct = Math.max(6, Math.round((pizza.quantity / maxPizzaUnits) * 100));
              const sharePct =
                analytics.totalPizzas > 0
                  ? Math.round((pizza.quantity / analytics.totalPizzas) * 100)
                  : 0;

              return (
                <div key={pizza.name} className="ranking-row">
                  <div className="ranking-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span className={`ranking-pos ${idx < 3 ? `pos-${idx + 1}` : ''}`}>
                        #{idx + 1}
                      </span>
                      {pizza.image && (
                        <img
                          src={pizza.image}
                          alt={pizza.name}
                          className="ranking-thumb"
                        />
                      )}
                      <strong>{pizza.name}</strong>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-light-gray)' }}>
                      <strong style={{ color: 'var(--color-white)' }}>{pizza.quantity} pizzas</strong>{' '}
                      ({sharePct}%) ·{' '}
                      <span style={{ color: 'var(--color-italian-green)' }}>
                        {formatCurrency(pizza.revenue)}
                      </span>
                    </div>
                  </div>
                  <div className="ranking-bar-track">
                    <div
                      className="ranking-bar-fill"
                      style={{
                        width: `${widthPct}%`,
                        background:
                          idx === 0
                            ? 'linear-gradient(90deg, var(--color-italian-red), #ff525b)'
                            : idx === 1
                            ? 'linear-gradient(90deg, var(--color-italian-green), #00b85c)'
                            : idx === 2
                            ? 'linear-gradient(90deg, var(--color-gold), #e5c678)'
                            : 'linear-gradient(90deg, #4b5563, #9ca3af)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna derecha: Tamaños + Canal + Consumo Insumos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Donut Chart de Tamaños + Modalidad de Entrega */}
          <div className="admin-chart-card">
            <h4>Preferencia por Tamaño y Modalidad de Entrega</h4>
            <div className="donut-and-channel-grid">
              {/* Donut SVG */}
              <div className="donut-container">
                <svg viewBox="0 0 42 42" className="donut-svg">
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#222" strokeWidth="5" />
                  {sizeSegments.map((seg) => (
                    <circle
                      key={seg.label}
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="5"
                      strokeDasharray={seg.dashArray}
                      strokeDashoffset={seg.dashOffset}
                    />
                  ))}
                  <text x="21" y="20" textAnchor="middle" fill="#fff" fontSize="5.5" fontWeight="700">
                    {analytics.totalPizzas}
                  </text>
                  <text x="21" y="25" textAnchor="middle" fill="#999" fontSize="2.8">
                    PIZZAS
                  </text>
                </svg>

                <div className="donut-legend">
                  {sizeSegments.map((seg) => (
                    <div key={seg.label} className="donut-legend-item">
                      <span className="donut-dot" style={{ background: seg.color }} />
                      <span>{seg.label}:</span>
                      <strong>{seg.count} ({seg.pct}%)</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Canal Delivery vs Retiro y Uso de 2x1 */}
              <div className="channel-stats-box">
                <div className="channel-stat-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.3rem' }}>
                    <span><FaMotorcycle /> Delivery a Domicilio</span>
                    <strong>
                      {analytics.deliveryCount} pedidos (
                      {analytics.totalOrders > 0
                        ? Math.round((analytics.deliveryCount / analytics.totalOrders) * 100)
                        : 0}
                      %)
                    </strong>
                  </div>
                  <div className="inventory-progress-track">
                    <div
                      className="inventory-progress-fill"
                      style={{
                        width: `${
                          analytics.totalOrders > 0
                            ? Math.round((analytics.deliveryCount / analytics.totalOrders) * 100)
                            : 0
                        }%`,
                        background: 'var(--color-italian-green)',
                      }}
                    />
                  </div>
                </div>

                <div className="channel-stat-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.3rem' }}>
                    <span>Retiro en Local</span>
                    <strong>
                      {analytics.pickupCount} pedidos (
                      {analytics.totalOrders > 0
                        ? Math.round((analytics.pickupCount / analytics.totalOrders) * 100)
                        : 0}
                      %)
                    </strong>
                  </div>
                  <div className="inventory-progress-track">
                    <div
                      className="inventory-progress-fill"
                      style={{
                        width: `${
                          analytics.totalOrders > 0
                            ? Math.round((analytics.pickupCount / analytics.totalOrders) * 100)
                            : 0
                        }%`,
                        background: 'var(--color-gold)',
                      }}
                    />
                  </div>
                </div>

                <div className="channel-stat-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.3rem' }}>
                    <span>Pedidos con Promo 2x1</span>
                    <strong>
                      {analytics.ordersWith2x1} de {analytics.totalOrders} pedidos
                    </strong>
                  </div>
                  <div className="inventory-progress-track">
                    <div
                      className="inventory-progress-fill"
                      style={{
                        width: `${
                          analytics.totalOrders > 0
                            ? Math.round((analytics.ordersWith2x1 / analytics.totalOrders) * 100)
                            : 0
                        }%`,
                        background: 'var(--color-italian-red)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Consumo Estimado de Insumos Clave en el Período */}
          <div className="admin-chart-card">
            <h4>Insumos Más Consumidos en el Período (según Recetas)</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-light-gray)', marginBottom: '0.85rem' }}>
              Gramos y kilos utilizados por las pizzas preparadas en el período seleccionado
            </p>
            <div className="top-ingredients-list">
              {analytics.topIngredients.map((ing) => (
                <div key={ing.name} className="top-ingredient-row">
                  <span>{ing.name}</span>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                    <strong>{(ing.grams / 1000).toFixed(2)} kg ({ing.grams.toLocaleString('es-CL')} g)</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-gold)', minWidth: '75px', textAlign: 'right' }}>
                      {formatCurrency(ing.cost)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICO DE HORARIOS PUNTA (Demanda por Hora del Día) */}
      <div className="admin-chart-card" style={{ marginTop: '1.5rem' }}>
        <div className="admin-chart-header">
          <div>
            <h4>
              <FaClock style={{ color: 'var(--color-italian-green)', marginRight: '0.4rem' }} />
              Horarios Punta de Pedidos (Pizzas Vendidas por Hora: 12:00 a 23:00 hrs)
            </h4>
            <small style={{ color: 'var(--color-light-gray)' }}>
              Identifica las horas de mayor movimiento en cocina para planificar preparación de masa y turnos
            </small>
          </div>
        </div>

        <div className="hourly-bars-chart">
          {analytics.hourlySeries.map((slot) => {
            const pct = Math.max(6, Math.round((slot.count / maxHourVal) * 100));
            const isPeak = slot.count > 0 && slot.count >= maxHourVal * 0.75;
            return (
              <div key={slot.hour} className="hourly-bar-col">
                <span className="daily-bar-value">{slot.count}</span>
                <div className="daily-bar-track" style={{ height: '120px' }}>
                  <div
                    className="daily-bar-fill"
                    style={{
                      height: `${pct}%`,
                      background: isPeak
                        ? 'linear-gradient(180deg, var(--color-italian-red), #8a151b)'
                        : 'linear-gradient(180deg, var(--color-italian-green), #00592b)',
                    }}
                  />
                </div>
                <span className="daily-bar-label">{slot.hour}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
