import { FaInstagram, FaWhatsapp, FaMapMarkerAlt } from 'react-icons/fa';
import { IMAGES } from '../../data/catalog';
import { BUSINESS_INFO, NAV_LINKS } from '../../data/constants';
import { scrollToSection } from '../../hooks/useScrollTo';
import '../ui/components.css';

/**
 * Footer premium con información del negocio.
 */
const Footer = () => (
  <footer className="footer-masia">
    <div className="section-container">
      <div className="footer-grid">
        <div className="footer-brand">
          <img src={IMAGES.logo} alt={BUSINESS_INFO.name} />
          <p>&ldquo;Hecha con amor, servida con pasión.&rdquo;</p>
        </div>

        <div className="footer-links">
          <h4>Navegación</h4>
          <ul>
            {NAV_LINKS.slice(0, 5).map((link) => (
              <li key={link.id}>
                <button type="button" onClick={() => scrollToSection(link.href)}>
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-social">
          <h4>Síguenos</h4>
          <div className="social-links">
            <a href={BUSINESS_INFO.instagramUrl} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href={`https://wa.me/${BUSINESS_INFO.whatsapp.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="WhatsApp">
              <FaWhatsapp />
            </a>
            <a href={BUSINESS_INFO.mapsLink} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Ubicación">
              <FaMapMarkerAlt />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        {BUSINESS_INFO.name} © {BUSINESS_INFO.foundedYear}
        <span className="footer-flags">
          <span className="footer-flag footer-flag-green" />
          <span className="footer-flag footer-flag-white" />
          <span className="footer-flag footer-flag-red" />
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
