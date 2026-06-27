import Swal from 'sweetalert2';
import SectionTitle from '../ui/SectionTitle';
import ProductCard from '../ui/ProductCard';
import { useCart } from '../../context/CartContext';
import '../ui/components.css';

const Products = () => {
  const { products, addToCart } = useCart();
  const featured = products.filter((p) => p.category === 'pizza' && p.active).slice(0, 6);

  const handleAdd = (product, qty, options) => {
    addToCart(product, qty, options);
    Swal.fire({
      icon: 'success',
      title: '¡Agregado!',
      text: `${product.name} añadida al carrito`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  return (
    <section id="productos">
      <div className="section-container">
        <SectionTitle subtitle="Nuestra Carta" title="Productos Destacados" />
        <div className="products-grid">
          {featured.map((product, index) => (
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

export default Products;
