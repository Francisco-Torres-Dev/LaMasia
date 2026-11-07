import StorageService from './StorageService';
import { generateId } from '../utils/generateId';
import {
  initialInventory,
  SIZE_GRAM_MULTIPLIERS,
  INGREDIENT_TO_INVENTORY_MAP,
  ACCOMPANIMENT_RECIPES,
} from '../data/inventoryData';
import { initialProducts, initialPromotions } from '../data/catalog';

const getInitialMovements = () => {
  const now = Date.now();
  return [
    {
      id: 'mov-seed-1',
      timestamp: new Date(now - 1000 * 60 * 35).toISOString(),
      type: 'consumo',
      reason: 'Pedido #LM-8421 — 2x Pepperoni (Familiar), 1x Palitos de ajo',
      items: [
        { inventoryId: 'inv-masa', name: 'Masa Artesanal Fermentada', grams: 1004 },
        { inventoryId: 'inv-mozzarella', name: 'Queso Mozzarella', grams: 513 },
        { inventoryId: 'inv-salsa-pomodoro', name: 'Salsa Pomodoro Artesanal', grams: 224 },
        { inventoryId: 'inv-pepperoni', name: 'Pepperoni Americano', grams: 196 },
      ],
    },
    {
      id: 'mov-seed-2',
      timestamp: new Date(now - 1000 * 60 * 110).toISOString(),
      type: 'consumo',
      reason: 'Pedido #LM-8420 — 1x 4 Carnes (Familiar), 1x Camarón Bacon (Mediana)',
      items: [
        { inventoryId: 'inv-masa', name: 'Masa Artesanal Fermentada', grams: 672 },
        { inventoryId: 'inv-mozzarella', name: 'Queso Mozzarella', grams: 384 },
        { inventoryId: 'inv-carne-vacuno', name: 'Carne Molida de Vacuno', grams: 119 },
        { inventoryId: 'inv-pollo', name: 'Pollo Asado en Cubos', grams: 119 },
        { inventoryId: 'inv-tocino', name: 'Tocino Ahumado', grams: 144 },
        { inventoryId: 'inv-camaron', name: 'Camarón Ecuatoriano', grams: 90 },
      ],
    },
    {
      id: 'mov-seed-3',
      timestamp: new Date(now - 1000 * 60 * 240).toISOString(),
      type: 'ingreso',
      reason: 'Reposición de lote — Masa Artesanal Fermentada (+10.000 g)',
      items: [
        { inventoryId: 'inv-masa', name: 'Masa Artesanal Fermentada', grams: 10000 },
      ],
    },
  ];
};

export const InventoryService = {
  getInventory() {
    const stored = StorageService.get(StorageService.keys.INVENTORY, null);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      StorageService.set(StorageService.keys.INVENTORY, initialInventory);
      return initialInventory;
    }
    return stored;
  },

  saveInventory(inventory) {
    StorageService.set(StorageService.keys.INVENTORY, inventory);
    return inventory;
  },

  resetInventoryToDefaults() {
    StorageService.set(StorageService.keys.INVENTORY, initialInventory);
    return initialInventory;
  },

  getMovements() {
    const stored = StorageService.get(StorageService.keys.INVENTORY_MOVEMENTS, null);
    if (!stored || !Array.isArray(stored)) {
      const seed = getInitialMovements();
      StorageService.set(StorageService.keys.INVENTORY_MOVEMENTS, seed);
      return seed;
    }
    return stored;
  },

  saveMovements(movements) {
    StorageService.set(StorageService.keys.INVENTORY_MOVEMENTS, movements.slice(0, 100));
  },

  getCustomRecipes() {
    return StorageService.get(StorageService.keys.CUSTOM_RECIPES, {});
  },

  saveCustomRecipe(productId, baseRecipeItems) {
    const current = this.getCustomRecipes();
    const updated = { ...current, [productId]: baseRecipeItems };
    StorageService.set(StorageService.keys.CUSTOM_RECIPES, updated);
    return updated;
  },

  /**
   * Calcula los gramos por insumo para 1 unidad de un producto en un tamaño dado.
   * Si es pizza, el tamaño 'M' (Mediana) es 1.0x, 'I' (Individual) es 0.6x y 'F' (Familiar) es 1.4x.
   */
  getRecipeForProduct(productOrId, size = 'M', details = null) {
    const inventory = this.getInventory();
    const customRecipes = this.getCustomRecipes();
    const multiplier = SIZE_GRAM_MULTIPLIERS[size] || 1.0;

    let product =
      typeof productOrId === 'object' && productOrId !== null
        ? productOrId
        : [...initialProducts, ...initialPromotions].find(
            (p) => p.id === productOrId || p.name?.toLowerCase() === String(productOrId).toLowerCase()
          );

    const gramsMap = new Map();
    const addGrams = (inventoryId, grams) => {
      if (!inventoryId || grams <= 0) return;
      gramsMap.set(inventoryId, (gramsMap.get(inventoryId) || 0) + Math.round(grams));
    };

    // Caso 1: Receta personalizada guardada por el admin para este producto (en base Mediana)
    if (product?.id && customRecipes[product.id]) {
      const isPizza = product.category === 'pizza' || product.category === 'pizzas-casa';
      const factor = isPizza ? multiplier : 1.0;
      customRecipes[product.id].forEach((entry) => {
        addGrams(entry.inventoryId, entry.baseGrams * factor);
      });
    } else if (product?.id && ACCOMPANIMENT_RECIPES[product.id]) {
      // Caso 2: Acompañamiento o papas con receta explícita
      ACCOMPANIMENT_RECIPES[product.id].forEach((entry) => {
        addGrams(entry.inventoryId, entry.grams);
      });
    } else if (
      product?.category === 'promocion' ||
      String(product?.id || '').startsWith('promo-') ||
      String(product?.name || '').toLowerCase().startsWith('promo')
    ) {
      // Caso 3: Combo Promocional (siempre incluye Pizza Familiar + posibles acompañamientos)
      const famFactor = SIZE_GRAM_MULTIPLIERS.F;
      addGrams('inv-masa', 280 * famFactor);
      addGrams('inv-salsa-pomodoro', 80 * famFactor);
      addGrams('inv-mozzarella', 160 * famFactor);

      if (details) {
        Object.entries(INGREDIENT_TO_INVENTORY_MAP).forEach(([ingName, mapping]) => {
          if (details.toLowerCase().includes(ingName.toLowerCase())) {
            if (Array.isArray(mapping)) {
              mapping.forEach((m) => addGrams(m.inventoryId, m.baseGrams * famFactor));
            } else {
              addGrams(mapping.inventoryId, mapping.baseGrams * famFactor);
            }
          }
        });
      } else {
        addGrams('inv-pepperoni', 70 * famFactor);
        addGrams('inv-jamon', 75 * famFactor);
      }

      const promoName = `${product?.id || ''} ${product?.name || ''} ${product?.description || ''}`.toLowerCase();
      if (promoName.includes('promo-2') || promoName.includes('promo 2') || promoName.includes('palitos')) {
        ACCOMPANIMENT_RECIPES['palitos-ajo'].forEach((r) => addGrams(r.inventoryId, r.grams));
      }
      if (promoName.includes('promo-3') || promoName.includes('promo 3') || promoName.includes('alitas')) {
        ACCOMPANIMENT_RECIPES['alitas-bbq'].forEach((r) => addGrams(r.inventoryId, r.grams));
      }
      if (promoName.includes('promo-4') || promoName.includes('promo 4')) {
        ACCOMPANIMENT_RECIPES['palitos-ajo'].forEach((r) => addGrams(r.inventoryId, r.grams));
        ACCOMPANIMENT_RECIPES['alitas-bbq'].forEach((r) => addGrams(r.inventoryId, r.grams));
      }
    } else {
      // Caso 4: Pizza de la casa o Pizza Personalizada
      addGrams('inv-masa', 280 * multiplier);

      const ingredientsList = Array.isArray(product?.ingredients) ? product.ingredients : [];
      if (ingredientsList.length > 0) {
        ingredientsList.forEach((ingName) => {
          const trimmed = ingName.trim();
          const mapping =
            INGREDIENT_TO_INVENTORY_MAP[trimmed] ||
            Object.entries(INGREDIENT_TO_INVENTORY_MAP).find(
              ([k]) => k.toLowerCase() === trimmed.toLowerCase()
            )?.[1];

          if (mapping) {
            if (Array.isArray(mapping)) {
              mapping.forEach((m) => addGrams(m.inventoryId, m.baseGrams * multiplier));
            } else {
              addGrams(mapping.inventoryId, mapping.baseGrams * multiplier);
            }
          }
        });
      } else {
        // Pizza personalizada ("Arma tu Pizza") o sin lista explícita
        addGrams('inv-salsa-pomodoro', 80 * multiplier);
        addGrams('inv-mozzarella', 160 * multiplier);
        if (details) {
          Object.entries(INGREDIENT_TO_INVENTORY_MAP).forEach(([ingName, mapping]) => {
            if (
              ingName !== 'Mozzarella' &&
              ingName !== 'Salsa pomodoro' &&
              details.toLowerCase().includes(ingName.toLowerCase())
            ) {
              if (Array.isArray(mapping)) {
                mapping.forEach((m) => addGrams(m.inventoryId, m.baseGrams * multiplier));
              } else {
                addGrams(mapping.inventoryId, mapping.baseGrams * multiplier);
              }
            }
          });
        }
      }
    }

    return Array.from(gramsMap.entries()).map(([inventoryId, grams]) => {
      const invItem = inventory.find((i) => i.id === inventoryId);
      return {
        inventoryId,
        name: invItem?.name || inventoryId,
        grams,
        costPerKg: invItem?.costPerKg || 0,
        estimatedCost: Math.round(((invItem?.costPerKg || 0) * grams) / 1000),
      };
    });
  },

  /**
   * Descuenta del inventario los gramos correspondientes a una lista de ítems de pedido o simulación.
   */
  deductItems(itemsList, reason = 'Preparación de pedido') {
    const inventory = this.getInventory();
    const totalDeductions = new Map();

    itemsList.forEach((item) => {
      const quantity = Number(item.quantity) || 1;
      const size = item.size || 'M';
      const productObj =
        item.product ||
        initialProducts.find(
          (p) => p.id === item.productId || p.name.toLowerCase() === String(item.name || '').toLowerCase()
        ) || {
          id: item.productId || item.id,
          name: item.name,
          category: item.category || 'pizza',
          ingredients: item.ingredients,
        };

      const recipe = this.getRecipeForProduct(productObj, size, item.details);
      recipe.forEach((r) => {
        const current = totalDeductions.get(r.inventoryId) || {
          inventoryId: r.inventoryId,
          name: r.name,
          grams: 0,
        };
        current.grams += r.grams * quantity;
        totalDeductions.set(r.inventoryId, current);
      });
    });

    if (totalDeductions.size === 0) {
      return { inventory, deductions: [] };
    }

    const updatedInventory = inventory.map((inv) => {
      const deduction = totalDeductions.get(inv.id);
      if (!deduction) return inv;
      const newStock = Math.max(0, inv.stockGrams - deduction.grams);
      return {
        ...inv,
        stockGrams: newStock,
      };
    });

    this.saveInventory(updatedInventory);

    const deductionsArray = Array.from(totalDeductions.values());
    const movements = this.getMovements();
    movements.unshift({
      id: generateId(),
      timestamp: new Date().toISOString(),
      type: 'consumo',
      reason,
      items: deductionsArray,
    });
    this.saveMovements(movements);

    return {
      inventory: updatedInventory,
      deductions: deductionsArray,
    };
  },

  /**
   * Registra una entrada o reposición de stock de un insumo.
   */
  restockItem(inventoryId, addedGrams, updates = {}) {
    const inventory = this.getInventory();
    let targetName = '';
    const updatedInventory = inventory.map((inv) => {
      if (inv.id !== inventoryId) return inv;
      targetName = inv.name;
      const newStock = inv.stockGrams + Number(addedGrams);
      return {
        ...inv,
        stockGrams: newStock,
        initialStockGrams: Math.max(inv.initialStockGrams || newStock, newStock),
        arrivalDate: updates.arrivalDate || new Date().toISOString().slice(0, 10),
        expirationDate: updates.expirationDate || inv.expirationDate,
        costPerKg: updates.costPerKg ? Number(updates.costPerKg) : inv.costPerKg,
      };
    });

    this.saveInventory(updatedInventory);

    if (targetName && Number(addedGrams) > 0) {
      const movements = this.getMovements();
      movements.unshift({
        id: generateId(),
        timestamp: new Date().toISOString(),
        type: 'ingreso',
        reason: `Reposición de stock — ${targetName} (+${Number(addedGrams).toLocaleString('es-CL')} g)`,
        items: [{ inventoryId, name: targetName, grams: Number(addedGrams) }],
      });
      this.saveMovements(movements);
    }

    return updatedInventory;
  },
};

export default InventoryService;
