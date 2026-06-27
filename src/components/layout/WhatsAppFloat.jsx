import { FaWhatsapp } from 'react-icons/fa';
import { BUSINESS_INFO } from '../../data/constants';
import '../ui/components.css';

/**
 * Botón flotante de WhatsApp.
 */
const WhatsAppFloat = () => {
  const handleClick = () => {
    const phone = BUSINESS_INFO.whatsapp.replace('+', '');
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  return (
    <button type="button" className="whatsapp-float" onClick={handleClick} aria-label="Contactar por WhatsApp">
      <FaWhatsapp />
    </button>
  );
};

export default WhatsAppFloat;
