import Swal from 'sweetalert2';
import SectionTitle from '../ui/SectionTitle';
import PromoCard from '../ui/PromoCard';
import { useCart } from '../../context/CartContext';
import '../ui/components.css';

/**
 * Promoción 2x1 automática + combos con precio fijo.
 */
const Promotions = () => {
  const { promotions, addToCart } = useCart();
  const activePromos = promotions.filter((p) => p.active);

  const handleAdd = (product) => {
    addToCart(product);
    Swal.fire({
      icon: 'success',
      title: '¡Promoción agregada!',
      text: `${product.name} añadida al carrito`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  return (
    <section id="promociones" className="section-alt-bg">
      <div className="section-container">
        <SectionTitle subtitle="Ofertas Especiales" title="Promociones" />

        <div className="promo-2x1-banner">
          <h3>Promoción Permanente 2x1</h3>
          <p>
            Al agregar <strong>2 pizzas Medianas</strong> o <strong>2 pizzas Familiares</strong>{' '}
            (iguales o distintas), el carrito aplica automáticamente el 2x1: pagas solo la más cara.
          </p>
          <p className="promo-2x1-note">No aplica a Individual ni a combos promocionales.</p>
        </div>

        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>Combos Promocionales</h3>
        <div className="promo-grid">
          {activePromos.map((promo, index) => (
            <PromoCard key={promo.id} promo={promo} onAddToCart={handleAdd} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Promotions;
