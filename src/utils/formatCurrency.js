/**
 * Formatea un número como moneda chilena (CLP).
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Formatea un número sin símbolo de moneda.
 * @param {number} amount
 * @returns {string}
 */
export const formatNumber = (amount) => {
  return new Intl.NumberFormat('es-CL').format(amount);
};
