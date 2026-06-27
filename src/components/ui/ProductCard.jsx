import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa';
import BadgeTag from './BadgeTag';
import { formatCurrency } from '../../utils/formatCurrency';
import { SIZE_LABELS } from '../../data/catalog';
import './components.css';

/**
 * Tarjeta de producto con selector de tamaño para pizzas.
 */
const ProductCard = ({ product, onAddToCart, index = 0, showSizes = true }) => {
  const hasSizes = product.prices && showSizes;
  const [selectedSize, setSelectedSize] = useState(hasSizes ? 'M' : null);

  const displayPrice = hasSizes
    ? product.prices[selectedSize]
    : product.price;

  const handleAdd = () => {
    if (hasSizes) {
      onAddToCart(product, 1, { size: selectedSize, price: product.prices[selectedSize] });
    } else {
      onAddToCart(product);
    }
  };

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -8 }}
    >
      <div className="product-card-image">
        <img src={product.image} alt={product.name} loading="lazy" />
        <BadgeTag tag={product.tag} />
        <div className="product-card-overlay">
          <button type="button" className="btn-primary-masia btn-sm" onClick={handleAdd}>
            <FaShoppingCart /> Agregar
          </button>
        </div>
      </div>
      <div className="product-card-body">
        <h3 className="product-card-title">{product.name}</h3>
        {product.description && (
          <p className="product-card-description">{product.description}</p>
        )}
        {product.ingredients && (
          <ul className="product-card-ingredients">
            {product.ingredients.map((ing) => (
              <li key={ing}>{ing}</li>
            ))}
          </ul>
        )}

        {hasSizes && (
          <div className="size-selector">
            {Object.entries(product.prices).map(([size, price]) => (
              <button
                key={size}
                type="button"
                className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                <span className="size-btn-label">{SIZE_LABELS[size]}</span>
                <span className="size-btn-price">{formatCurrency(price)}</span>
              </button>
            ))}
          </div>
        )}

        <div className="product-card-footer">
          <span className="product-card-price">{formatCurrency(displayPrice)}</span>
          <button type="button" className="btn-add-cart" onClick={handleAdd} aria-label={`Agregar ${product.name}`}>
            <FaShoppingCart />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
