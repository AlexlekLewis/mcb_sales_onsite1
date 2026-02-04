/**
 * Price Calculation Utilities
 * Handles grid-based pricing with "next highest" lookup logic
 */

interface PricingData {
    width_steps: number[];
    drop_steps: number[];
    grid: number[][];
    notes?: string;
}

interface SqmPricingData {
    price_per_sqm: number;
    min_charge?: number;
}

interface UnitPricingData {
    sizes: Record<string, number>;
}

/**
 * Find the index of the next highest step in an array.
 * If the exact value exists, return that index.
 * If the value is between steps, return the index of the higher step.
 * If the value is above all steps, return -1 (out of range).
 * If the value is below the first step, return 0 (minimum size).
 */
export function findNextHighestIndex(steps: number[], value: number): number {
    // If value is below minimum, use minimum
    if (value <= steps[0]) {
        return 0;
    }

    // Find the first step that is >= value
    for (let i = 0; i < steps.length; i++) {
        if (steps[i] >= value) {
            return i;
        }
    }

    // Value is above max - return -1 to indicate out of range
    return -1;
}

/**
 * Calculate price from a grid-based pricing structure.
 * Uses "next highest" logic for both width and drop.
 */
export function calculateGridPrice(
    pricingData: PricingData,
    width: number,
    drop: number,
    priceGroupMultiplier: number = 1.0
): { price: number; status: 'ok' | 'out_of_range' | 'error'; message?: string } {
    const { width_steps, drop_steps, grid } = pricingData;

    if (!width_steps || !drop_steps || !grid) {
        return { price: 0, status: 'error', message: 'Invalid pricing data' };
    }

    const widthIndex = findNextHighestIndex(width_steps, width);
    const dropIndex = findNextHighestIndex(drop_steps, drop);

    // Check if dimensions are out of range
    if (widthIndex === -1) {
        const maxWidth = width_steps[width_steps.length - 1];
        return {
            price: 0,
            status: 'out_of_range',
            message: `Width ${width}mm exceeds max ${maxWidth}mm`
        };
    }

    if (dropIndex === -1) {
        const maxDrop = drop_steps[drop_steps.length - 1];
        return {
            price: 0,
            status: 'out_of_range',
            message: `Drop ${drop}mm exceeds max ${maxDrop}mm`
        };
    }

    // Get price from grid
    const basePrice = grid[widthIndex]?.[dropIndex];

    if (basePrice === undefined || basePrice === null) {
        return { price: 0, status: 'error', message: 'Price not found in grid' };
    }

    // Apply price group multiplier
    const finalPrice = basePrice * priceGroupMultiplier;

    return { price: finalPrice, status: 'ok' };
}

/**
 * Calculate price per square metre with minimum charge.
 */
export function calculateSqmPrice(
    pricingData: SqmPricingData,
    width: number,
    drop: number
): { price: number; status: 'ok' | 'error' } {
    const sqm = (width / 1000) * (drop / 1000);
    const calculatedPrice = sqm * pricingData.price_per_sqm;
    const minCharge = pricingData.min_charge || 0;

    return {
        price: Math.max(calculatedPrice, minCharge),
        status: 'ok'
    };
}

/**
 * Calculate unit-based price (e.g., doors with fixed sizes).
 */
export function calculateUnitPrice(
    pricingData: UnitPricingData,
    sizeKey: string
): { price: number; status: 'ok' | 'error'; message?: string } {
    const price = pricingData.sizes?.[sizeKey];

    if (price === undefined) {
        return { price: 0, status: 'error', message: `Size ${sizeKey} not available` };
    }

    return { price, status: 'ok' };
}

/**
 * Get the grid step values that would be used for a given dimension.
 * Useful for displaying what size the price is based on.
 */
export function getActualGridSize(
    pricingData: PricingData,
    width: number,
    drop: number
): { actualWidth: number | null; actualDrop: number | null } {
    const widthIndex = findNextHighestIndex(pricingData.width_steps, width);
    const dropIndex = findNextHighestIndex(pricingData.drop_steps, drop);

    return {
        actualWidth: widthIndex >= 0 ? pricingData.width_steps[widthIndex] : null,
        actualDrop: dropIndex >= 0 ? pricingData.drop_steps[dropIndex] : null
    };
}

/**
 * Get min/max dimensions from pricing data.
 */
export function getPricingLimits(pricingData: PricingData): {
    minWidth: number;
    maxWidth: number;
    minDrop: number;
    maxDrop: number;
} {
    return {
        minWidth: pricingData.width_steps[0],
        maxWidth: pricingData.width_steps[pricingData.width_steps.length - 1],
        minDrop: pricingData.drop_steps[0],
        maxDrop: pricingData.drop_steps[pricingData.drop_steps.length - 1]
    };
}
