import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Products from '../components/sections/Products';
import Promotions from '../components/sections/Promotions';
import HousePizzas from '../components/sections/HousePizzas';
import BuildYourPizza from '../components/sections/BuildYourPizza';
import OtherProducts from '../components/sections/OtherProducts';
import Location from '../components/sections/Location';
import Contact from '../components/sections/Contact';

/**
 * Página principal — Landing Page de La Masia Pizzería.
 */
const HomePage = () => (
  <>
    <Hero />
    <About />
    <Products />
    <Promotions />
    <HousePizzas />
    <BuildYourPizza />
    <OtherProducts />
    <Location />
    <Contact />
  </>
);

export default HomePage;
