import { motion } from 'framer-motion';
import { FaChevronDown, FaWhatsapp } from 'react-icons/fa';
import { IMAGES } from '../../data/catalog';
import { BUSINESS_INFO } from '../../data/constants';
import { scrollToSection } from '../../hooks/useScrollTo';
import '../ui/components.css';

/**
 * Hero section con imagen de fondo premium y animaciones.
 */
const Hero = () => {
  const handleWhatsApp = () => {
    const phone = BUSINESS_INFO.whatsapp.replace('+', '');
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  return (
    <section id="inicio" className="hero-section">
      <div className="hero-bg" />
      <div className="hero-overlay" />

      <div className="hero-content">
        <motion.img
          src={IMAGES.logo}
          alt={BUSINESS_INFO.name}
          className="hero-logo"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        />

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          LA MASIA PIZZERÍA
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          &ldquo;{BUSINESS_INFO.heroSubtitle}&rdquo;
        </motion.p>

        <motion.p
          className="hero-tagline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {BUSINESS_INFO.slogan}
        </motion.p>

        <motion.div
          className="hero-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <button type="button" className="btn-primary-masia" onClick={() => scrollToSection('#productos')}>
            Ver Carta
          </button>
          <button type="button" className="btn-green-masia" onClick={handleWhatsApp}>
            <FaWhatsapp /> Pedir por WhatsApp
          </button>
        </motion.div>
      </div>

      <motion.div
        className="hero-scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={() => scrollToSection('#sobre-nosotros')}
        style={{ cursor: 'pointer' }}
      >
        <FaChevronDown />
      </motion.div>
    </section>
  );
};

export default Hero;
