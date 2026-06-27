import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa';
import Swal from 'sweetalert2';
import SectionTitle from '../ui/SectionTitle';
import { buildPizzaConfig, IMAGES, SIZE_LABELS } from '../../data/catalog';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import '../ui/components.css';

const BuildYourPizza = () => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedExtras, setSelectedExtras] = useState([]);

  const toggleExtra = (extra) => {
    setSelectedExtras((prev) =>
      prev.some((e) => e.key === extra.key)
        ? prev.filter((e) => e.key !== extra.key)
        : [...prev, extra]
    );
  };

  const allExtras = useMemo(() => {
    const list = [];
    Object.entries(buildPizzaConfig.ingredientTiers).forEach(([tierId, tier]) => {
      tier.items.forEach((name) => {
        list.push({
          key: `${tierId}-${name}`,
          name,
          tier: tier.label,
          price: tier.prices[selectedSize],
        });
      });
    });
    return list;
  }, [selectedSize]);

  const totalPrice = useMemo(() => {
    const base = buildPizzaConfig.basePrices[selectedSize];
    const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
    return base + extrasTotal;
  }, [selectedSize, selectedExtras]);

  const handleAddToCart = () => {
    const extrasNames = selectedExtras.map((e) => e.name).join(', ');
    const sizeLabel = SIZE_LABELS[selectedSize];
    const details = extrasNames
      ? `${sizeLabel} · Extras: ${extrasNames}`
      : sizeLabel;

    addToCart(
      {
        id: `custom-pizza-${Date.now()}`,
        name: 'Pizza Personalizada',
        category: 'pizza',
        image: IMAGES.pizza,
      },
      1,
      {
        size: selectedSize,
        price: totalPrice,
        details,
      }
    );

    Swal.fire({
      icon: 'success',
      title: '¡Pizza agregada!',
      text: 'Tu pizza personalizada está en el carrito',
      timer: 1500,
      showConfirmButton: false,
    });

    setSelectedExtras([]);
  };

  return (
    <section id="arma-pizza" className="build-pizza-section">
      <div className="section-container">
        <SectionTitle subtitle="Crea tu Obra Maestra" title="Arma tu Pizza" />

        <div className="build-pizza-container">
          <div>
            <div className="size-selector build-size-selector" style={{ marginBottom: '1.5rem' }}>
              {Object.entries(buildPizzaConfig.basePrices).map(([size, price]) => (
                <button
                  key={size}
                  type="button"
                  className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => { setSelectedSize(size); setSelectedExtras([]); }}
                >
                  <span className="size-btn-label">{SIZE_LABELS[size]}</span>
                  <span className="size-btn-price">Base {formatCurrency(price)}</span>
                </button>
              ))}
            </div>

            <p style={{ marginBottom: '1rem', color: 'var(--color-light-gray)', fontSize: '0.9rem' }}>
              Base incluye: {buildPizzaConfig.baseIngredients.join(', ')}
            </p>

            {Object.entries(buildPizzaConfig.ingredientTiers).map(([tierId, tier]) => (
              <div key={tierId} style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>
                  {tier.label} — {formatCurrency(tier.prices[selectedSize])} c/u
                </h4>
                <div className="build-pizza-extras">
                  {tier.items.map((name) => {
                    const extra = { key: `${tierId}-${name}`, name, tier: tier.label, price: tier.prices[selectedSize] };
                    const isSelected = selectedExtras.some((e) => e.key === extra.key);
                    return (
                      <label key={extra.key} className={`extra-item ${isSelected ? 'selected' : ''}`}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleExtra(extra)} />
                        <div className="extra-item-info">
                          <span className="extra-item-name">{name}</span>
                          <span className="extra-item-price">+{formatCurrency(extra.price)}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <motion.div
            className="build-pizza-summary"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3>Tu Pizza</h3>
            <div className="build-base-info">
              <p><strong>Tamaño:</strong> {SIZE_LABELS[selectedSize]}</p>
              <p><strong>Base:</strong> {buildPizzaConfig.baseIngredients.join(', ')}</p>
              <p><strong>Precio base:</strong> {formatCurrency(buildPizzaConfig.basePrices[selectedSize])}</p>
            </div>

            {selectedExtras.length > 0 && (
              <div className="build-selected-extras">
                <h4>Ingredientes seleccionados</h4>
                <ul>
                  {selectedExtras.map((extra) => (
                    <li key={extra.key}>
                      <span>{extra.name}</span>
                      <span>{formatCurrency(extra.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="build-total">
              <span>Total</span>
              <span className="build-total-price">{formatCurrency(totalPrice)}</span>
            </div>

            <button type="button" className="btn-primary-masia" style={{ width: '100%' }} onClick={handleAddToCart}>
              <FaShoppingCart /> Agregar al Carrito
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BuildYourPizza;
