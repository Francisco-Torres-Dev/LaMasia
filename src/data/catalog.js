/**
 * Versión del catálogo — incrementar para forzar recarga desde localStorage.
 */
import promo1Image from '../assets/Promos/Promo1.png';
import promo2Image from '../assets/Promos/Promo2.png';
import promo3Image from '../assets/Promos/Promo3.png';
import promo4Image from '../assets/Promos/Promo4.png';

/**
 * Helper para apuntar a las fotos reales ubicadas en /public/pizzas/Fotos reales/
 */
const realPhoto = (fileName) => `/pizzas/Fotos%20reales/${encodeURIComponent(fileName)}`;

const margaritaImage = realPhoto('margarita.jpg');
const pepperoniImage = realPhoto('peperonni.jpg');
const napolitanaImage = realPhoto('napolitana.jpg');
const capreseImage = realPhoto('caprese.jpg');
const vegetarianaImage = realPhoto('vegetariana.jpg');
const ilBambinoImage = realPhoto('il bambino.jpg');
const polloBbqImage = realPhoto('pollo bbq.jpg');
const camaronBaconImage = realPhoto('camaron.jpg');
const ibericaImage = realPhoto('iberica.jpg');
const cuatroCarnesImage = realPhoto('cuatro carnes.jpg');
const hawaianaImage = realPhoto('hawuallana.jpg');
const supremaImage = realPhoto('suprema.jpg');
const chilenaImage = realPhoto('chilena.jpg');
const espanolaImage = realPhoto('española.jpg');
const especialMixImage = realPhoto('especial mix.jpg');
const mechadaImage = realPhoto('mechada.jpg');
const fullPepperoniImage = realPhoto('peperonni full.jpg');
const cuatroQuesosImage = realPhoto('cuatro quesos.jpg');
const laMasiaImage = realPhoto('la masia.jpg');

const palitosAjoImage = realPhoto('palos de ajo.jpg');
const alitasBbqImage = realPhoto('alitas bbq.jpg');
const stromboliImage = realPhoto('stronboli.jpg');
const lasanaImage = realPhoto('lasana.jpg');
const ensaladaGriegaImage = realPhoto('ensalada griega.jpg');
const ensaladaCesarImage = realPhoto('ensalada cesar.jpg');
const calzonNapolitanoImage = realPhoto('calzon napolitano.jpg');
const papasCheddarImage = realPhoto('papas cheddar.jpg');
const papasCheddarTocinoImage = realPhoto('papas cheddar tocino.jpg');
const papasSupremasImage = realPhoto('papas supremas.jpg');
const panPitaImage = realPhoto('pan pita.jpg');
const salsasImage = realPhoto('salsas.jpg');
const portadaRealImage = realPhoto('portada dos.jpg');

export const CATALOG_VERSION = 6;

export const SIZE_LABELS = {
  I: 'Individual',
  M: 'Mediana',
  F: 'Familiar',
};

export const IMAGES = {
  logo: '/logo.jpg',
  hero: portadaRealImage,
  menu: portadaRealImage,
  pizza: laMasiaImage,
  promo: portadaRealImage,
  acompanamiento: palitosAjoImage,
  bebida: '/pizza-hero.jpeg',
};

/** Alias retrocompatible */
export const PIZZA_IMAGES = {
  custom: IMAGES.pizza,
  promo: IMAGES.promo,
  drink: IMAGES.bebida,
  papitas: IMAGES.acompanamiento,
  stromboli: stromboliImage,
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
  { id: 'palitos-ajo', name: 'Palitos de ajo (6)', category: 'acompanamiento', description: 'Masa napolitana con mantequilla al ajo, parmesano y orégano + salsa a elección', price: 3900, image: palitosAjoImage, active: true },
  { id: 'alitas-bbq', name: 'Alitas BBQ (6)', category: 'acompanamiento', description: '6 alitas de pollo horneadas bañadas en salsa BBQ artesanal', price: 5900, image: alitasBbqImage, active: true },
  { id: 'stromboli', name: 'Stromboli (6)', category: 'acompanamiento', description: 'Rollitos rellenos de mozzarella, jamón o pepperoni + salsa a elección', price: 6900, image: stromboliImage, active: true },
  { id: 'lasana', name: 'Lasaña', category: 'acompanamiento', description: 'Lasaña artesanal horneada con salsa boloñesa, bechamel y queso gratinado', price: 5900, image: lasanaImage, active: true },
  { id: 'ensalada-griega', name: 'Ensalada griega', category: 'acompanamiento', description: 'Mix de hojas verdes, tomate cherry, aceitunas, pepino, cebolla morada y queso cabra', price: 5500, image: ensaladaGriegaImage, active: true },
  { id: 'ensalada-cesar', name: 'Ensalada César', category: 'acompanamiento', description: 'Lechuga fresca, pollo grillado, crutones caseros, parmesano y aderezo César', price: 5500, image: ensaladaCesarImage, active: true },
  { id: 'calzon-napolitano', name: 'Calzón napolitano', category: 'acompanamiento', description: 'Masa tradicional doblada rellena de salsa pomodoro, mozzarella, jamón y tomate', price: 2900, image: calzonNapolitanoImage, active: true },
];

export const initialPapas = [
  { id: 'papas-cheddar-m', name: 'Papas Cheddar Mediana', category: 'papas', description: 'Papas fritas crujientes bañadas en abundante salsa de queso cheddar', price: 3200, image: papasCheddarImage, active: true },
  { id: 'papas-cheddar-f', name: 'Papas Cheddar Familiar', category: 'papas', description: 'Porción familiar de papas fritas con abundante salsa de queso cheddar', price: 5200, image: papasCheddarImage, active: true },
  { id: 'papas-cheddar-tocino-m', name: 'Papas Cheddar + Tocino Mediana', category: 'papas', description: 'Papas fritas con salsa de queso cheddar fundido y trozos de tocino crocante', price: 3900, image: papasCheddarTocinoImage, active: true, tag: 'mas-vendida' },
  { id: 'papas-cheddar-tocino-f', name: 'Papas Cheddar + Tocino Familiar', category: 'papas', description: 'Porción familiar de papas fritas con salsa cheddar y tocino crocante', price: 5900, image: papasCheddarTocinoImage, active: true },
  { id: 'papas-supremas', name: 'Papas Supremas', category: 'papas', description: 'Papas fritas cargadas con queso cheddar, carne/chili, tocino y salsas de la casa', price: 6900, image: papasSupremasImage, active: true },
];

export const initialSalsas = [
  { id: 'pan-pita', name: 'Pan pita', category: 'salsa', description: 'Pan pita artesanal recién horneado a la piedra', price: 500, image: panPitaImage, active: true },
  { id: 'salsa-adicional', name: 'Salsa adicional', category: 'salsa', description: 'Pomodoro, Cheddar, Sour cream, Mayo cilantro, Pesto, BBQ', price: 500, image: salsasImage, active: true },
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
      items: ['Champiñón', 'Tomate', 'Piña', 'Aceitunas', 'Choclo', 'Pimentón', 'Tomate cherry', 'Espárrago', 'Albahaca', 'Cebolla caramelizada', 'Cebolla morada', 'Palmito'],
      prices: { I: 900, M: 1300, F: 1700 },
    },
    estandar: {
      label: 'Estándar',
      items: ['Carne vacuno', 'Pollo', 'Jamón', 'Choricillo', 'Chorizo', 'Salame', 'Pepperoni', 'Fondo de alcachofa'],
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
