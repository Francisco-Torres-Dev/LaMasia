/**
 * Etiqueta visual para productos y promociones.
 */
const TAG_CONFIG = {
  'mas-vendida': { label: 'Más Vendida', className: 'tag-bestseller' },
  chef: { label: 'Recomendación del Chef', className: 'tag-chef' },
  premium: { label: 'Premium', className: 'tag-premium' },
};

const BadgeTag = ({ tag }) => {
  if (!tag || !TAG_CONFIG[tag]) return null;
  const config = TAG_CONFIG[tag];
  return <span className={`product-tag ${config.className}`}>{config.label}</span>;
};

export default BadgeTag;
