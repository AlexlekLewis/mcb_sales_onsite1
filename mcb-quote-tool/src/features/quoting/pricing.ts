import { PRODUCT_CATEGORIES, PRICING_TYPES } from '../../lib/constants';
import { Product, PriceGroup, GridPricingData, SqmPricingData, UnitPricingData } from './types';

interface PricingOptions {
    priceGroup: PriceGroup | null;
    fullness?: '100' | '160';
}

interface PricingResult {
    price: number;
    warning?: string;
}

export const calculatePrice = (product: Product, w: number, d: number, options: PricingOptions): PricingResult => {
    // 1. SQM Logic
    if (product.pricing_type === PRICING_TYPES.SQM) {
        return calculateSqmPrice(product.pricing_data as SqmPricingData, w, d, options);
    }

    // 2. Unit Logic
    if (product.pricing_type === PRICING_TYPES.UNIT) {
        // Placeholder for unit logic if needed, currently not fully implemented in original file
        return { price: 0 };
    }

    // 3. Grid Logic (Curtains, External, Standard)
    if (product.pricing_type === PRICING_TYPES.GRID) {
        // Dispatch based on Category for specific Grid nuances
        // Note: We use already narrowed product.pricing_data here
        if (product.category === PRODUCT_CATEGORIES.CURTAINS) {
            return calculateCurtainPrice(product.pricing_data as GridPricingData, w, d, options);
        }

        if (product.category === PRODUCT_CATEGORIES.EXTERNAL_BLINDS) {
            return calculateExternalBlindPrice(product.pricing_data as GridPricingData, w, d, options);
        }

        // Default / Standard Grid
        return calculateStandardGridPrice(product.pricing_data as GridPricingData, w, d, options);
    }

    return { price: 0 };
};

// --- Isolated Strategies (Now accepting Data directly to ensure type safety) ---

const calculateCurtainPrice = (data: GridPricingData, w: number, d: number, { priceGroup, fullness }: PricingOptions): PricingResult => {
    const { grids, width_steps, drop_steps } = data;
    if (!grids || !width_steps || !drop_steps) return { price: 0, warning: 'Invalid pricing data' };

    // Key Construction: Group + Fullness
    const groupCode = priceGroup?.group_code || '1';
    const key = `${groupCode}_${fullness || '100'}`;
    const activeGrid = grids[key];

    if (!activeGrid) {
        return { price: 0, warning: `Price grid not found for key: ${key}` };
    }

    // Indexing: Curtains are DROP Major [DropIndex][WidthIndex] (Fixed Rule)
    const widthIndex = width_steps.findIndex((step: number) => w <= step);
    const dropIndex = drop_steps.findIndex((step: number) => d <= step);

    if (widthIndex === -1) return { price: 0, warning: `Width ${w}mm exceeds max ${width_steps[width_steps.length - 1]}mm` };
    if (dropIndex === -1) return { price: 0, warning: `Drop ${d}mm exceeds max ${drop_steps[drop_steps.length - 1]}mm` };

    const price = activeGrid[dropIndex]?.[widthIndex] || 0;

    return {
        price,
        warning: `Priced @ ${width_steps[widthIndex]}W x ${drop_steps[dropIndex]}D`
    };
};

const calculateExternalBlindPrice = (data: GridPricingData, w: number, d: number, { priceGroup }: PricingOptions): PricingResult => {
    // Dedicated Logic for External Blinds
    const { grids, width_steps, drop_steps } = data;
    if (!grids || !width_steps || !drop_steps) return { price: 0, warning: 'Invalid pricing data' };

    // Key Determination (Default to '1' if no group)
    const key = priceGroup?.group_code || '1';

    const activeGrid = grids[key];
    if (!activeGrid) return { price: 0, warning: `Price grid not found for Group ${key}` };

    const widthIndex = width_steps.findIndex((step: number) => w <= step);
    const dropIndex = drop_steps.findIndex((step: number) => d <= step);

    if (widthIndex === -1) return { price: 0, warning: `Width ${w}mm exceeds max ${width_steps[width_steps.length - 1]}mm` };
    if (dropIndex === -1) return { price: 0, warning: `Drop ${d}mm exceeds max ${drop_steps[drop_steps.length - 1]}mm` };

    // Indexing: External Blinds (Data is Drop rows x Width cols, i.e., Drop Major)
    const basePrice = activeGrid[dropIndex]?.[widthIndex] || 0;

    // Apply Multiplier
    const finalPrice = basePrice * (priceGroup?.multiplier || 1.0);

    return {
        price: finalPrice,
        warning: `Priced @ ${width_steps[widthIndex]}W x ${drop_steps[dropIndex]}D`
    };
};

const calculateStandardGridPrice = (data: GridPricingData, w: number, d: number, { priceGroup }: PricingOptions): PricingResult => {
    const { grids, grid, width_steps, drop_steps } = data;
    if ((!grids && !grid) || !width_steps || !drop_steps) return { price: 0, warning: 'Invalid pricing data' };

    // Key Determination
    // Use priceGroup.group_code directly.
    let key = priceGroup?.group_code || '1';
    let activeGrid: number[][] | undefined;

    if (grids) {
        activeGrid = grids[key];
        // Case-insensitive fallback
        if (!activeGrid) {
            const matchingKey = Object.keys(grids).find(k => k.toLowerCase() === key.toLowerCase());
            if (matchingKey) activeGrid = grids[matchingKey];
        }
    } else if (grid) {
        // Fallback for single-grid products (e.g. existing Honeycomb data)
        activeGrid = grid;
    }

    if (!activeGrid) return { price: 0, warning: `Price grid not found for Group ${key}` };

    // Indexing: Roller Blinds are WIDTH Major [WidthIndex][DropIndex] (Fixed Rule)
    const widthIndex = width_steps.findIndex((step: number) => w <= step);
    const dropIndex = drop_steps.findIndex((step: number) => d <= step);

    if (widthIndex === -1) return { price: 0, warning: `Width ${w}mm exceeds max ${width_steps[width_steps.length - 1]}mm` };
    if (dropIndex === -1) return { price: 0, warning: `Drop ${d}mm exceeds max ${drop_steps[drop_steps.length - 1]}mm` };

    const price = activeGrid[widthIndex]?.[dropIndex] || 0;

    // Apply Multiplier (e.g. for Retail Markup if configured in PriceGroup)
    const finalPrice = price * (priceGroup?.multiplier || 1.0);

    return {
        price: finalPrice,
        warning: `Priced @ ${width_steps[widthIndex]}W x ${drop_steps[dropIndex]}D`
    };
};

const calculateSqmPrice = (data: SqmPricingData, w: number, d: number, { priceGroup }: PricingOptions): PricingResult => {
    const sqm = (w / 1000) * (d / 1000);
    const basePrice = data.price_per_sqm || 0;
    const multiplier = priceGroup?.multiplier || 1.0;
    const price = sqm * basePrice * multiplier;

    return { price, warning: `Area: ${sqm.toFixed(2)} sqm` };
};

export const calculateExtraPrice = (extra: { price_type?: string; price: number }, basePrice: number, w: number, d: number): number => {
    switch (extra.price_type) {
        case 'fixed':
            return extra.price;
        case 'per_metre_width':
            return extra.price * (w / 1000);
        case 'per_sqm':
            return extra.price * (w / 1000) * (d / 1000);
        case 'percentage':
            return basePrice * (extra.price / 100);
        default:
            return extra.price;
    }
};
