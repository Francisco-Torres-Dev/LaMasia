import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaClock, FaHeart } from 'react-icons/fa';
import SectionTitle from '../ui/SectionTitle';
import { BUSINESS_INFO } from '../../data/constants';
import '../ui/components.css';

/**
 * Sección Sobre Nosotros con historia del negocio.
 */
const About = () => (
  <section id="sobre-nosotros" className="about-section">
    <div className="section-container">
      <SectionTitle subtitle="Nuestra Historia" title="Sobre Nosotros" />

      <div className="about-grid">
        <motion.div
          className="about-text"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p>
            <strong className="text-accent-red">{BUSINESS_INFO.name}</strong> nació en Puente Alto
            durante el año {BUSINESS_INFO.foundedYear}. Fue creada por expertos en pizzas artesanales
            y masas tradicionales.
          </p>
          <p>
            Su objetivo es entregar pizzas de calidad superior utilizando ingredientes frescos
            y preparación artesanal, manteniendo viva la tradición italiana con un toque moderno.
          </p>
          <p>
            Cada pizza que sale de nuestro horno lleva consigo la pasión y dedicación de un equipo
            comprometido con la excelencia gastronómica.
          </p>
        </motion.div>

        <motion.div
          className="about-info-card"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="about-info-item">
            <FaMapMarkerAlt className="about-info-icon" />
            <div>
              <h4>Dirección</h4>
              <p>{BUSINESS_INFO.address}</p>
            </div>
          </div>
          <div className="about-info-item">
            <FaClock className="about-info-icon" />
            <div>
              <h4>Horario</h4>
              <p>{BUSINESS_INFO.schedule}</p>
            </div>
          </div>
          <div className="about-info-item">
            <FaHeart className="about-info-icon" />
            <div>
              <h4>Nuestra Promesa</h4>
              <p>Ingredientes frescos, masa artesanal y pasión en cada preparación.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default About;
