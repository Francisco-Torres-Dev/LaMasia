import { motion } from 'framer-motion';
import { FaExternalLinkAlt } from 'react-icons/fa';
import SectionTitle from '../ui/SectionTitle';
import { BUSINESS_INFO } from '../../data/constants';
import '../ui/components.css';

/**
 * Sección de ubicación con Google Maps embebido.
 */
const Location = () => (
  <section id="ubicacion">
    <div className="section-container">
      <SectionTitle subtitle="Encuéntranos" title="Ubicación" />

      <motion.div
        className="location-map"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <iframe
          title="Ubicación La Masia Pizzería"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.847!2d-70.5756!3d-33.6103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662b8b8b8b8b8b9%3A0x0!2sTocornal%201741%2C%20Puente%20Alto!5e0!3m2!1ses!2scl!4v1700000000000!5m2!1ses!2scl"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </motion.div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <p style={{ color: 'var(--color-light-gray)', marginBottom: '1rem' }}>
          {BUSINESS_INFO.address}
        </p>
        <a
          href={BUSINESS_INFO.mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline-masia"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <FaExternalLinkAlt /> Abrir en Google Maps
        </a>
      </div>
    </div>
  </section>
);

export default Location;
