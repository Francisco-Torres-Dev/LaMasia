import { motion } from 'framer-motion';
import { FaFire, FaCalendarAlt, FaShoppingCart, FaStar, FaLock, FaBan } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useCart } from '../../context/CartContext';
import { formatCurrency as formatPrice } from '../../utils/formatCurrency';
import '../ui/components.css';

const DAILY_PIZZAS = [
  {
    dayIndex: 2,
    dayLabel: 'MARTES',
    dayName: 'Martes',
    pizzaId: 'pizza-especial-mix',
    name: 'Especial Mix',
    ingredients: 'Salsa pomodoro, Mozzarella, Pepperoni, Champiñón y Aceitunas',
    normalPrice: 20900,
    promoPrice: 8900,
    image: '/pizzas/Fotos%20reales/especial%20mix.jpg',
    accent: 'red',
  },
  {
    dayIndex: 3,
    dayLabel: 'MIÉRCOLES',
    dayName: 'Miércoles',
    pizzaId: 'pizza-suprema',
    name: 'Suprema',
    ingredients: 'Salsa pomodoro, Mozzarella, Pollo, Pimentón y Aceitunas',
    normalPrice: 20900,
    promoPrice: 8900,
    image: '/pizzas/Fotos%20reales/suprema.jpg',
    accent: 'green',
  },
  {
    dayIndex: 4,
    dayLabel: 'JUEVES',
    dayName: 'Jueves',
    pizzaId: 'pizza-espanola',
    name: 'Española',
    ingredients: 'Salsa pomodoro, Mozzarella, Choricillo, Aceitunas y Cebolla caramelizada',
    normalPrice: 20900,
    promoPrice: 8900,
    image: '/pizzas/Fotos%20reales/espa%C3%B1ola.jpg',
    accent: 'gold',
  },
];

const DAY_NAMES_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/**
 * Banner destacado debajo del Hero: Promoción Pizza del Día (Martes, Miércoles y Jueves) Familiar a $8.900.
 * El botón de pedir se habilita únicamente en el día que corresponde a cada pizza y NO aplica 2x1.
 */
const DailyPromoBanner = () => {
  const { products, addToCart } = useCart();
  const todayIndex = new Date().getDay(); // 2 = Martes, 3 = Miércoles, 4 = Jueves
  const todayName = DAY_NAMES_ES[todayIndex];

  const handleOrderDailyPromo = (dailyItem) => {
    if (todayIndex !== dailyItem.dayIndex) {
      Swal.fire({
        icon: 'info',
        title: `Disponible solo los ${dailyItem.dayName}`,
        text: `Hoy es ${todayName}. La promoción de Pizza ${dailyItem.name} Familiar a ${formatPrice(dailyItem.promoPrice)} solo se puede pedir los días ${dailyItem.dayName}.`,
        confirmButtonText: 'Entendido',
      });
      return;
    }

    const catalogPizza = products.find((p) => p.id === dailyItem.pizzaId);
    const productToAdd = catalogPizza || {
      id: dailyItem.pizzaId,
      name: dailyItem.name,
      category: 'pizza',
      image: dailyItem.image,
    };

    addToCart(productToAdd, 1, {
      size: 'F',
      price: dailyItem.promoPrice,
      eligible2x1: false,
      isDailyPromo: true,
      details: `Promo Pizza del Día (${dailyItem.dayName}) · Sin 2x1`,
    });

    Swal.fire({
      icon: 'success',
      title: `¡Promo ${dailyItem.dayName} agregada!`,
      text: `Pizza ${dailyItem.name} Familiar por ${formatPrice(dailyItem.promoPrice)} añadida al carrito (no acumulable con 2x1).`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  return (
    <section className="daily-promo-section" aria-label="Promoción Pizza del Día">
      <div className="section-container">
        <motion.div
          className="daily-promo-banner"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <div className="daily-promo-glow daily-promo-glow-left" />
          <div className="daily-promo-glow daily-promo-glow-right" />

          <div className="daily-promo-header">
            <div className="daily-promo-badge-wrap">
              <span className="daily-promo-badge">
                <FaFire /> PROMOCIÓN PIZZA DEL DÍA
              </span>
              <span className="daily-promo-days-pill">
                <FaCalendarAlt /> MARTES · MIÉRCOLES · JUEVES
              </span>
              <span className="daily-promo-no2x1-pill">
                <FaBan /> NO APLICA 2x1
              </span>
            </div>

            <div className="daily-promo-title-row">
              <div>
                <h2 className="daily-promo-title">
                  ¡Tu Pizza <span className="text-accent-red">Familiar</span> del Día a Precio Único!
                </h2>
                <p className="daily-promo-subtitle">
                  Disfruta nuestras clásicas de la casa recién horneadas en tamaño{' '}
                  <strong>Familiar</strong> todos los martes, miércoles y jueves.{' '}
                  <span className="daily-promo-rule-inline">
                    *Se habilita exclusivamente el día correspondiente y no es acumulable con promoción 2x1.
                  </span>
                </p>
              </div>

              <div className="daily-promo-price-spotlight">
                <span className="daily-promo-price-label">PIZZA FAMILIAR</span>
                <span className="daily-promo-price-old">Normal {formatPrice(20900)}</span>
                <span className="daily-promo-price-main">{formatPrice(8900)}</span>
                <span className="daily-promo-price-save">¡Ahorras {formatPrice(12000)}!</span>
              </div>
            </div>
          </div>

          <div className="daily-promo-cards-grid">
            {DAILY_PIZZAS.map((item, idx) => {
              const isToday = todayIndex === item.dayIndex;
              return (
                <motion.div
                  key={item.dayLabel}
                  className={`daily-pizza-card accent-${item.accent} ${isToday ? 'is-today' : 'is-locked'}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.12 }}
                >
                  <div className="daily-pizza-img-wrap">
                    <img src={item.image} alt={`Pizza ${item.name}`} loading="lazy" />
                    <div className="daily-pizza-img-overlay" />
                    <span className="daily-pizza-day-tag">{item.dayLabel}</span>
                    {isToday ? (
                      <span className="daily-pizza-today-badge">
                        <FaStar /> HOY ACTIVA
                      </span>
                    ) : (
                      <span className="daily-pizza-locked-badge">
                        <FaLock /> Solo {item.dayName}
                      </span>
                    )}
                    <div className="daily-pizza-floating-price">{formatPrice(item.promoPrice)}</div>
                  </div>

                  <div className="daily-pizza-body">
                    <div className="daily-pizza-heading">
                      <h3>Pizza {item.name}</h3>
                      <span className="daily-pizza-size-chip">Familiar · Sin 2x1</span>
                    </div>
                    <p className="daily-pizza-ingredients">{item.ingredients}</p>

                    <div className="daily-pizza-footer">
                      <div className="daily-pizza-price-compare">
                        <span className="old-price">{formatPrice(item.normalPrice)}</span>
                        <strong className="promo-price">{formatPrice(item.promoPrice)}</strong>
                      </div>
                      <button
                        type="button"
                        className={`btn-daily-promo ${!isToday ? 'disabled' : ''}`}
                        disabled={!isToday}
                        onClick={() => handleOrderDailyPromo(item)}
                        title={
                          isToday
                            ? `Agregar Pizza ${item.name} Familiar por ${formatPrice(item.promoPrice)}`
                            : `Esta promoción solo está habilitada los días ${item.dayName}`
                        }
                      >
                        {isToday ? (
                          <>
                            <FaShoppingCart /> Pedir Promo {item.dayName}
                          </>
                        ) : (
                          <>
                            <FaLock /> Solo los {item.dayName}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DailyPromoBanner;
