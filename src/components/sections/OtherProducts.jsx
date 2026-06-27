import Swal from 'sweetalert2';
import SectionTitle from '../ui/SectionTitle';
import ProductCard from '../ui/ProductCard';
import { useCart } from '../../context/CartContext';
import '../ui/components.css';

const OtherProducts = () => {
  const { products, drinks, addToCart } = useCart();

  const accompaniments = products.filter(
    (p) => ['acompanamiento', 'papas', 'salsa'].includes(p.category) && p.active
  );

  const handleAdd = (product, qty, options) => {
    if (options) {
      addToCart(product, qty, options);
    } else {
      addToCart(product);
    }
    Swal.fire({
      icon: 'success',
      title: '¡Agregado!',
      text: `${product.name} añadido al carrito`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const papas = accompaniments.filter((p) => p.category === 'papas');
  const otros = accompaniments.filter((p) => p.category !== 'papas');
  const activeDrinks = drinks.filter((d) => d.active);

  return (
    <>
      <section id="otros-productos" className="section-alt-bg">
        <div className="section-container">
          <SectionTitle subtitle="Más Delicias" title="Acompañamientos" />
          <div className="products-grid">
            {otros.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAdd}
                index={index}
                showSizes={false}
              />
            ))}
          </div>

          <SectionTitle subtitle="Crujientes" title="Papas Fritas" centered={false} />
          <div className="products-grid">
            {papas.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAdd}
                index={index}
                showSizes={false}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="bebidas">
        <div className="section-container">
          <SectionTitle subtitle="Para Acompañar" title="Bebidas" />
          <div className="drink-items drink-items-simple">
            {activeDrinks.map((drink) => (
              <div key={drink.id} className="drink-item">
                <div className="drink-item-info">
                  <div className="drink-item-name">{drink.name}</div>
                </div>
                <span className="drink-item-price">
                  ${drink.price.toLocaleString('es-CL')}
                </span>
                <button
                  type="button"
                  className="drink-add-btn"
                  onClick={() => handleAdd(drink)}
                  aria-label={`Agregar ${drink.name}`}
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default OtherProducts;
