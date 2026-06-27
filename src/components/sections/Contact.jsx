import { useForm } from 'react-hook-form';
import { FaMapMarkerAlt, FaWhatsapp, FaInstagram, FaClock } from 'react-icons/fa';
import Swal from 'sweetalert2';
import SectionTitle from '../ui/SectionTitle';
import { BUSINESS_INFO } from '../../data/constants';
import EmailService from '../../services/EmailService';
import '../ui/components.css';

/**
 * Sección de contacto con formulario.
 */
const Contact = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const payload = EmailService.buildOrderPayload({
      items: [],
      subtotal: 0,
      discount: 0,
      total: 0,
      customer: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        message: data.message,
      },
    });

    payload.type = 'contact';
    payload.message = data.message;

    await EmailService.sendOrderEmail(payload);

    Swal.fire({
      icon: 'success',
      title: '¡Mensaje enviado!',
      text: 'Nos pondremos en contacto contigo pronto.',
      timer: 2500,
      showConfirmButton: false,
    });

    reset();
  };

  return (
    <section id="contacto" className="section-alt-bg">
      <div className="section-container">
        <SectionTitle subtitle="Escríbenos" title="Contacto" />

        <div className="contact-grid">
          <div className="contact-info-card">
            <div className="contact-info-item">
              <div className="contact-info-icon"><FaMapMarkerAlt /></div>
              <div>
                <strong>Dirección</strong>
                <p>{BUSINESS_INFO.shortAddress}</p>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-info-icon"><FaWhatsapp /></div>
              <div>
                <strong>WhatsApp</strong>
                <p>
                  <a href={`https://wa.me/${BUSINESS_INFO.whatsapp.replace('+', '')}`} target="_blank" rel="noopener noreferrer">
                    {BUSINESS_INFO.whatsappDisplay}
                  </a>
                </p>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-info-icon"><FaInstagram /></div>
              <div>
                <strong>Instagram</strong>
                <p>
                  <a href={BUSINESS_INFO.instagramUrl} target="_blank" rel="noopener noreferrer">
                    {BUSINESS_INFO.instagram}
                  </a>
                </p>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-info-icon"><FaClock /></div>
              <div>
                <strong>Horario</strong>
                <p>{BUSINESS_INFO.schedule}</p>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input
                id="name"
                className="form-control-masia"
                placeholder="Tu nombre"
                {...register('name', { required: 'El nombre es requerido' })}
              />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="phone">Teléfono</label>
              <input
                id="phone"
                className="form-control-masia"
                placeholder="+56 9 XXXX XXXX"
                {...register('phone', { required: 'El teléfono es requerido' })}
              />
              {errors.phone && <span className="form-error">{errors.phone.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo</label>
              <input
                id="email"
                type="email"
                className="form-control-masia"
                placeholder="tu@email.com"
                {...register('email', {
                  required: 'El correo es requerido',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
                })}
              />
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="message">Mensaje</label>
              <textarea
                id="message"
                className="form-control-masia"
                rows={4}
                placeholder="¿En qué podemos ayudarte?"
                {...register('message', { required: 'El mensaje es requerido' })}
              />
              {errors.message && <span className="form-error">{errors.message.message}</span>}
            </div>
            <button type="submit" className="btn-primary-masia" style={{ width: '100%' }}>
              Enviar Mensaje
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
