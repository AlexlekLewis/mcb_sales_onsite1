import { z } from 'zod';
import { PRICING_TYPES } from './constants';

export const GridPricingDataSchema = z.object({
    width_steps: z.array(z.number()).min(1, { message: 'At least one width step is required' }),
    drop_steps: z.array(z.number()).min(1, { message: 'At least one drop step is required' }),
    grid: z.array(z.array(z.number())).optional(),
    grids: z.record(z.array(z.array(z.number()))).optional(),
    notes: z.string().optional(),
}).refine(data => data.grid || data.grids, {
    message: "Either 'grid' or 'grids' must be provided",
});

export const SqmPricingDataSchema = z.object({
    price_per_sqm: z.number().min(0, { message: 'Price per sqm must be non-negative' }),
    min_charge: z.number().optional(),
});

export const UnitPricingDataSchema = z.object({
    sizes: z.record(z.number()),
});

export const getPricingDataSchema = (type: string) => {
    switch (type) {
        case PRICING_TYPES.GRID:
            return GridPricingDataSchema;
        case PRICING_TYPES.SQM:
            return SqmPricingDataSchema;
        case PRICING_TYPES.UNIT:
            return UnitPricingDataSchema;
        default:
            return z.unknown();
    }
};
