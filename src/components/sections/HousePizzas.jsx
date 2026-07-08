import Swal from 'sweetalert2';
import SectionTitle from '../ui/SectionTitle';
import ProductCard from '../ui/ProductCard';
import { useCart } from '../../context/CartContext';
import '../ui/components.css';

const HousePizzas = () => {
  const { products, addToCart } = useCart();
  const housePizzas = products.filter((p) => p.category === 'pizza' && p.active);

  const handleAdd = (product, qty, options) => {
    addToCart(product, qty, options);
    Swal.fire({
      icon: 'success',
      title: '¡Agregado!',
      text: `${product.name} (${options?.size ? '' : ''}) añadida al carrito`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  return (
    <section id="pizzas-casa">
      <div className="section-container">
        <SectionTitle subtitle="Recetas Exclusivas" title="Pizzas de la Casa" />
        <p style={{ marginBottom: '1rem', color: 'var(--color-light-gray)' }}>
          Promo 2x1 se aplica automáticamente a pizzas Medianas y Familiares de la casa. No aplica a pizzas individuales, combos promocionales ni pizzas personalizadas.
        </p>
        <div className="products-grid">
          {housePizzas.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAdd}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HousePizzas;
