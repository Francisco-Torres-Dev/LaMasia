import { motion } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa';
import BadgeTag from './BadgeTag';
import { formatCurrency } from '../../utils/formatCurrency';
import './components.css';

/**
 * Tarjeta para promociones con precio fijo (no participan del 2x1).
 */
const PromoCard = ({ promo, onAddToCart, index = 0 }) => {
  const handleAdd = () => {
    onAddToCart(promo);
  };

  return (
    <motion.div
      className="promo-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
    >
      <div className="promo-card-header">
        <BadgeTag tag={promo.tag} />
        <span className="promo-type-badge">Combo</span>
      </div>
      <div className="promo-card-image">
        <img src={promo.image} alt={promo.name} loading="lazy" />
      </div>
      <div className="promo-card-body">
        <h3>{promo.name}</h3>
        <p className="promo-description">{promo.description}</p>
        {promo.includes && (
          <div className="promo-options">
            <span className="promo-options-label">Incluye:</span>
            <div className="promo-options-list">
              {promo.includes.map((item) => (
                <span key={item} className="promo-option-chip">{item}</span>
              ))}
            </div>
          </div>
        )}
        <div className="promo-card-footer">
          <span className="promo-price">{formatCurrency(promo.price)}</span>
          <button type="button" className="btn-primary-masia btn-sm" onClick={handleAdd}>
            <FaShoppingCart /> {promo.category === 'promocion' ? 'Elegir ingredientes' : 'Agregar'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PromoCard;
