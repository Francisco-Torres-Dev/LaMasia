import './components.css';

/**
 * Título de sección reutilizable con animación.
 */
const SectionTitle = ({ subtitle, title, centered = true, light = false }) => (
  <div className={`section-title ${centered ? 'text-center' : ''}`}>
    {subtitle && (
      <span className={`section-subtitle ${light ? 'text-light' : ''}`}>{subtitle}</span>
    )}
    <h2 className={`section-heading ${light ? 'text-white' : ''}`}>{title}</h2>
    <div className={`italian-divider ${centered ? '' : 'italian-divider-left'}`} />
  </div>
);

export default SectionTitle;
