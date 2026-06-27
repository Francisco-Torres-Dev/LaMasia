/**
 * Versión del catálogo — incrementar para forzar recarga desde localStorage.
 */
import margaritaImage from '../assets/Pizzas/Margarita.png';
import pepperoniImage from '../assets/Pizzas/Pepperoni.png';
import napolitanaImage from '../assets/Pizzas/Napolitana.png';
import capreseImage from '../assets/Pizzas/Caprese.png';
import vegetarianaImage from '../assets/Pizzas/Vegetariana  Vegana.png';
import ilBambinoImage from '../assets/Pizzas/Il Bambino.png';
import polloBbqImage from '../assets/Pizzas/Pollo BBQ.png';
import camaronBaconImage from '../assets/Pizzas/Camarón Bacon.png';
import ibericaImage from '../assets/Pizzas/Ibérica.png';
import cuatroCarnesImage from '../assets/Pizzas/4 Carnes.png';
import hawaianaImage from '../assets/Pizzas/Hawaiana.png';
import supremaImage from '../assets/Pizzas/Suprema.png';
import chilenaImage from '../assets/Pizzas/Chilena.png';
import espanolaImage from '../assets/Pizzas/Española.png';
import especialMixImage from '../assets/Pizzas/Special Mix.png';
import mechadaImage from '../assets/Pizzas/Mechada.png';
import fullPepperoniImage from '../assets/Pizzas/Full Peperoni.png';
import cuatroQuesosImage from '../assets/Pizzas/4Quesos.png';
import laMasiaImage from '../assets/Pizzas/LaMasia.png';

import promo1Image from '../assets/Promos/Promo1.png';
import promo2Image from '../assets/Promos/Promo2.png';
import promo3Image from '../assets/Promos/Promo3.png';
import promo4Image from '../assets/Promos/Promo4.png';

import palitosAjoImage from '../assets/Acompañantes/PalitosDeAjo.png';
import alitasBbqImage from '../assets/Acompañantes/Alitasbbq.png';
import stromboliImage from '../assets/Acompañantes/Stromboli.png';
import lasanaImage from '../assets/Acompañantes/Lasaña.png';

export const CATALOG_VERSION = 3;

export const SIZE_LABELS = {
  I: 'Individual',
  M: 'Mediana',
  F: 'Familiar',
};

export const IMAGES = {
  logo: '/logo.jpg',
  hero: '/pizza-hero.jpeg',
  menu: '/pizza-menu.jpeg',
  pizza: '/pizza-menu.jpeg',
  promo: '/pizza-hero.jpeg',
  acompanamiento: '/pizza-menu.jpeg',
  bebida: '/pizza-hero.jpeg',
};

/** Alias retrocompatible */
export const PIZZA_IMAGES = {
  custom: IMAGES.pizza,
  promo: IMAGES.promo,
  drink: IMAGES.bebida,
  papitas: IMAGES.acompanamiento,
  stromboli: IMAGES.acompanamiento,
};

const img = (key = 'pizza') => IMAGES[key] || IMAGES.pizza;

const pizza = (id, name, ingredients, prices, options = {}) => ({
  id,
  name,
  category: 'pizza',
  ingredients,
  prices,
  image: options.image || img('pizza'),
  tag: options.tag || null,
  description: options.description || null,
  active: true,
});

export const initialPizzas = [
  pizza('pizza-margarita', 'Margarita', ['Salsa pomodoro', 'Mozzarella', 'Tomate cherry', 'Albahaca'], { I: 4700, M: 14000, F: 17900 }, { image: margaritaImage }),
  pizza('pizza-pepperoni', 'Pepperoni', ['Salsa pomodoro', 'Mozzarella', 'Pepperoni'], { I: 4700, M: 14000, F: 17900 }, { tag: 'mas-vendida', image: pepperoniImage }),
  pizza('pizza-napolitana', 'Napolitana', ['Salsa pomodoro', 'Mozzarella', 'Jamón pierna', 'Tomate'], { I: 4700, M: 14000, F: 17900 }, { image: napolitanaImage }),
  pizza('pizza-caprese', 'Caprese', ['Salsa pomodoro', 'Mozzarella', 'Queso de cabra', 'Tomate', 'Albahaca'], { I: 5300, M: 15900, F: 20900 }, { image: capreseImage }),
  pizza('pizza-vegetariana', 'Vegetariana / Vegana', ['Salsa pomodoro', 'Mozzarella', '4 vegetales a elección'], { I: 5600, M: 16000, F: 21500 }, { image: vegetarianaImage }),
  pizza('pizza-il-bambino', 'Il Bambino', ['Salsa pomodoro', 'Mozzarella', 'Chorizo', 'Carne', 'Choclo', 'Cebolla caramelizada'], { I: 6200, M: 18900, F: 24500 }, { tag: 'chef', image: ilBambinoImage }),
  pizza('pizza-pollo-bbq', 'Pollo BBQ', ['Salsa BBQ', 'Mozzarella', 'Pollo', 'Tocino', 'Cebolla morada'], { I: 5900, M: 17900, F: 23600 }, { image: polloBbqImage }),
  pizza('pizza-camaron-bacon', 'Camarón Bacon', ['Salsa pomodoro', 'Mozzarella', 'Camarón ecuatoriano', 'Tocino', 'Cebolla caramelizada'], { I: 6600, M: 20900, F: 25900 }, { tag: 'premium', image: camaronBaconImage }),
  pizza('pizza-iberica', 'Ibérica', ['Salsa pomodoro', 'Mozzarella', 'Jamón serrano', 'Pepperoni', 'Tomate', 'Aceitunas'], { I: 6600, M: 20900, F: 25900 }, { tag: 'premium', image: ibericaImage }),
  pizza('pizza-4-carnes', '4 Carnes', ['Salsa pomodoro', 'Mozzarella', 'Pollo', 'Pepperoni', 'Carne', 'Tocino'], { I: 7300, M: 22900, F: 28500 }, { tag: 'premium', image: cuatroCarnesImage }),
  pizza('pizza-hawaiana', 'Hawaiana', ['Salsa pomodoro', 'Mozzarella', 'Jamón', 'Piña'], { I: 4700, M: 14000, F: 17900 }, { image: hawaianaImage }),
  pizza('pizza-suprema', 'Suprema', ['Salsa pomodoro', 'Mozzarella', 'Pollo', 'Pimentón', 'Aceitunas'], { I: 5300, M: 15900, F: 20900 }, { image: supremaImage }),
  pizza('pizza-chilena', 'Chilena', ['Salsa pomodoro', 'Mozzarella', 'Carne', 'Tomate', 'Cebolla morada'], { I: 5300, M: 15900, F: 20900 }, { tag: 'mas-vendida', image: chilenaImage }),
  pizza('pizza-espanola', 'Española', ['Salsa pomodoro', 'Mozzarella', 'Choricillo', 'Aceitunas', 'Cebolla caramelizada'], { I: 5300, M: 15900, F: 20900 }, { image: espanolaImage }),
  pizza('pizza-especial-mix', 'Especial Mix', ['Salsa pomodoro', 'Mozzarella', 'Pepperoni', 'Champiñón', 'Aceitunas'], { I: 5300, M: 15900, F: 20900 }, { image: especialMixImage }),
  pizza('pizza-mechada', 'Mechada', ['Salsa pomodoro', 'Mozzarella', 'Carne mechada', 'Aceitunas', 'Cebolla caramelizada', 'Pimentón asado'], { I: 6200, M: 18900, F: 24500 }, { image: mechadaImage }),
  pizza('pizza-full-pepperoni', 'Full Pepperoni', ['Salsa pomodoro', 'Mozzarella', 'Extra pepperoni', 'Extra queso'], { I: 5300, M: 15900, F: 20900 }, { image: fullPepperoniImage }),
  pizza('pizza-4-quesos', '4 Quesos', ['Salsa pomodoro', 'Mozzarella', 'Queso de cabra', 'Queso parmesano', 'Queso azul', 'Cebolla caramelizada', 'Albahaca'], { I: 6600, M: 20900, F: 25900 }, { image: cuatroQuesosImage }),
  pizza('pizza-la-masia', 'La Masia', ['Salsa blanca', 'Mozzarella', 'Queso de cabra', 'Fondo de alcachofa', 'Tomate cherry asado', 'Aceitunas', 'Albahaca'], { I: 6600, M: 20900, F: 25900 }, { tag: 'premium', image: laMasiaImage }),
];

export const initialPromotions = [
  {
    id: 'promo-1',
    name: 'Promo 1',
    category: 'promocion',
    description: 'Pizza Familiar (3 ingredientes) + Bebida Familiar',
    includes: ['Pizza Familiar 3 ingredientes', 'Bebida Familiar'],
    price: 15400,
    image: promo1Image,
    active: true,
    tag: 'mas-vendida',
  },
  {
    id: 'promo-2',
    name: 'Promo 2',
    category: 'promocion',
    description: 'Pizza Familiar (3 ingredientes) + Palitos de ajo + Bebida Familiar',
    includes: ['Pizza Familiar 3 ingredientes', 'Palitos de ajo (6)', 'Bebida Familiar'],
    price: 17500,
    image: promo2Image,
    active: true,
    tag: null,
  },
  {
    id: 'promo-3',
    name: 'Promo 3',
    category: 'promocion',
    description: 'Pizza Familiar (3 ingredientes) + Alitas BBQ + Bebida Familiar',
    includes: ['Pizza Familiar 3 ingredientes', 'Alitas BBQ (6)', 'Bebida Familiar'],
    price: 19900,
    image: promo3Image,
    active: true,
    tag: 'chef',
  },
  {
    id: 'promo-4',
    name: 'Promo 4',
    category: 'promocion',
    description: 'Pizza Familiar (3 ingredientes) + Alitas BBQ + Palitos de ajo + Bebida Familiar',
    includes: ['Pizza Familiar 3 ingredientes', 'Alitas BBQ (6)', 'Palitos de ajo (6)', 'Bebida Familiar'],
    price: 21900,
    image: promo4Image,
    active: true,
    tag: 'premium',
  },
];

export const initialAccompaniments = [
  { id: 'palitos-ajo', name: 'Palitos de ajo (6)', category: 'acompanamiento', price: 3900, image: palitosAjoImage, active: true },
  { id: 'alitas-bbq', name: 'Alitas BBQ (6)', category: 'acompanamiento', price: 5900, image: alitasBbqImage, active: true },
  { id: 'stromboli', name: 'Stromboli (6)', category: 'acompanamiento', price: 6900, image: stromboliImage, active: true },
  { id: 'lasana', name: 'Lasaña', category: 'acompanamiento', price: 5900, image: lasanaImage, active: true },
  { id: 'ensalada-griega', name: 'Ensalada griega', category: 'acompanamiento', price: 5500, image: img('acompanamiento'), active: true },
  { id: 'ensalada-cesar', name: 'Ensalada César', category: 'acompanamiento', price: 5500, image: img('acompanamiento'), active: true },
  { id: 'calzon-napolitano', name: 'Calzón napolitano', category: 'acompanamiento', price: 2900, image: img('acompanamiento'), active: true },
];

export const initialPapas = [
  { id: 'papas-cheddar-m', name: 'Papas Cheddar Mediana', category: 'papas', price: 3200, image: img('acompanamiento'), active: true },
  { id: 'papas-cheddar-f', name: 'Papas Cheddar Familiar', category: 'papas', price: 5200, image: img('acompanamiento'), active: true },
  { id: 'papas-cheddar-tocino-m', name: 'Papas Cheddar + Tocino Mediana', category: 'papas', price: 3900, image: img('acompanamiento'), active: true, tag: 'mas-vendida' },
  { id: 'papas-cheddar-tocino-f', name: 'Papas Cheddar + Tocino Familiar', category: 'papas', price: 5900, image: img('acompanamiento'), active: true },
  { id: 'papas-supremas', name: 'Papas Supremas', category: 'papas', price: 6900, image: img('acompanamiento'), active: true },
];

export const initialSalsas = [
  { id: 'pan-pita', name: 'Pan pita', category: 'salsa', price: 500, image: img('acompanamiento'), active: true },
  { id: 'salsa-adicional', name: 'Salsa adicional', category: 'salsa', description: 'Pomodoro, Cheddar, Sour cream, Mayo cilantro, Pesto, BBQ', price: 500, image: img('acompanamiento'), active: true },
];

export const initialDrinks = [
  { id: 'jugo-natural', name: 'Jugo natural', category: 'bebida', price: 2500, image: img('bebida'), active: true },
  { id: 'bebida-lata', name: 'Bebida lata', category: 'bebida', price: 1400, image: img('bebida'), active: true },
  { id: 'bebida-familiar', name: 'Bebida familiar', category: 'bebida', price: 2600, image: img('bebida'), active: true },
  { id: 'jugo-familiar', name: 'Jugo familiar', category: 'bebida', price: 2600, image: img('bebida'), active: true },
  { id: 'te-cafe', name: 'Té o café', category: 'bebida', price: 1600, image: img('bebida'), active: true },
  { id: 'agua-mineral', name: 'Agua mineral', category: 'bebida', price: 1200, image: img('bebida'), active: true },
];

export const initialCoupons = [
  {
    id: 'coupon-bienvenida',
    code: 'MASIA10',
    type: 'percentage',
    value: 10,
    expirationDate: '2026-12-31',
    usageLimit: 100,
    currentUses: 0,
    active: true,
  },
];

export const buildPizzaConfig = {
  baseIngredients: ['Masa a la piedra o clásica napolitana', 'Salsa pomodoro', 'Mozzarella'],
  basePrices: { I: 3800, M: 6300, F: 7500 },
  ingredientTiers: {
    vegetales: {
      label: 'Vegetales',
      items: ['Champiñón', 'Tomate', 'Piña', 'Aceitunas', 'Choclo', 'Pimentón', 'Tomate cherry', 'Espárrago', 'Rúcula', 'Albahaca', 'Cebolla caramelizada', 'Cebolla morada', 'Palmito'],
      prices: { I: 900, M: 1300, F: 1700 },
    },
    estandar: {
      label: 'Estándar',
      items: ['Carne vacuno', 'Pollo', 'Jamón', 'Choricillo', 'Salame', 'Pepperoni', 'Fondo de alcachofa'],
      prices: { I: 1300, M: 1800, F: 2300 },
    },
    premium: {
      label: 'Premium',
      items: ['Jamón serrano', 'Tocino', 'Camarón ecuatoriano', 'Carne mechada'],
      prices: { I: 1800, M: 2300, F: 2900 },
    },
    queso: {
      label: 'Extra Queso',
      items: ['Mozzarella', 'Cabra', 'Azul', 'Parmesano'],
      prices: { I: 1300, M: 1800, F: 2300 },
    },
  },
};

/** Productos planos para admin (sin duplicar por tamaño) */
export const initialProducts = [
  ...initialPizzas,
  ...initialAccompaniments,
  ...initialPapas,
  ...initialSalsas,
];

export { initialPizzas as PIZZA_CATALOG };
