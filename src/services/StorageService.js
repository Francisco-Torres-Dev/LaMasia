import { CATALOG_VERSION } from '../data/catalog';

const STORAGE_KEYS = {
  CART: 'lamasia_cart',
  COUPON: 'lamasia_coupon',
  PRODUCTS: 'lamasia_products',
  DRINKS: 'lamasia_drinks',
  PROMOTIONS: 'lamasia_promotions',
  COUPONS: 'lamasia_coupons',
  ADMIN_SESSION: 'lamasia_admin_session',
  ORDERS: 'lamasia_orders',
  COMANDAS: 'lamasia_comandas',
  DELIVERY_SETTINGS: 'lamasia_delivery_settings',
  CATALOG_VERSION: 'lamasia_catalog_version',
};

/**
 * Servicio genérico de persistencia en LocalStorage.
 */
export const StorageService = {
  get(key, fallback = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  /** Resetea catálogo si cambió la versión (evita errores por datos antiguos). */
  ensureCatalogVersion() {
    const stored = localStorage.getItem(STORAGE_KEYS.CATALOG_VERSION);
    if (stored !== String(CATALOG_VERSION)) {
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.DRINKS);
      localStorage.removeItem(STORAGE_KEYS.PROMOTIONS);
      localStorage.removeItem(STORAGE_KEYS.COUPONS);
      localStorage.removeItem(STORAGE_KEYS.CART);
      localStorage.removeItem(STORAGE_KEYS.COUPON);
      localStorage.setItem(STORAGE_KEYS.CATALOG_VERSION, String(CATALOG_VERSION));
    }
  },

  keys: STORAGE_KEYS,
};

StorageService.ensureCatalogVersion();

export default StorageService;
