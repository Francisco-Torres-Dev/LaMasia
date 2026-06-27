/**
 * Scroll suave hacia un elemento por ID o selector.
 * @param {string} targetId
 * @param {number} offset
 */
export const scrollToSection = (targetId, offset = 80) => {
  const element = document.getElementById(targetId.replace('#', ''));
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
};

export default scrollToSection;
