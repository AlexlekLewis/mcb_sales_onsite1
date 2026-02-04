export const PRODUCT_CATEGORIES = {
    INTERNAL_BLINDS: 'Internal Blinds',
    CURTAINS: 'Curtains',
    PLANTATION_SHUTTERS: 'Plantation Shutters',
    EXTERNAL_BLINDS: 'External Blinds',
    SECURITY_DOORS: 'Security Doors',
    HONEYCOMB: 'Honeycomb',
    VENETIANS: 'Venetians',
    EXTRAS_ONLY: 'Extras Only', // Usage? Seen in some contexts perhaps, safe to add if needed, but sticking to knowns first.
    // Actually, stick to what I saw in DB.

} as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[keyof typeof PRODUCT_CATEGORIES];

export const PRICING_TYPES = {
    GRID: 'grid',
    SQM: 'sqm',
    UNIT: 'unit',
} as const;

export type PricingType = typeof PRICING_TYPES[keyof typeof PRICING_TYPES];
