import { PricingType } from '../../lib/constants';

export interface GridPricingData {
    width_steps: number[];
    drop_steps: number[];
    grid?: number[][];
    grids?: Record<string, number[][]>; // For products with multiple grids (e.g. by price group)
    notes?: string;
}

export interface SqmPricingData {
    price_per_sqm: number;
    min_charge?: number;
}

export interface UnitPricingData {
    sizes: Record<string, number>;
}

// Discriminator is pricing_type
export type Product =
    | {
        id: string;
        supplier: string;
        category: string;
        name: string;
        pricing_type: 'grid';
        pricing_data: GridPricingData;
        quote_config?: QuoteConfig;
        is_active?: boolean;
    }
    | {
        id: string;
        supplier: string;
        category: string;
        name: string;
        pricing_type: 'sqm';
        pricing_data: SqmPricingData;
        quote_config?: QuoteConfig;
        is_active?: boolean;
    }
    | {
        id: string;
        supplier: string;
        category: string;
        name: string;
        pricing_type: 'unit';
        pricing_data: UnitPricingData;
        quote_config?: QuoteConfig;
        is_active?: boolean;
    }
    // Fallback for legacy or unknown types during migration, strictly typed as unknown regarding data
    | {
        id: string;
        supplier: string;
        category: string;
        name: string;
        pricing_type: string;
        pricing_data: unknown;
        quote_config?: QuoteConfig;
        is_active?: boolean;
    };


export interface QuoteConfig {
    show_width?: boolean;
    show_drop?: boolean;
    show_quantity?: boolean;
    show_fabric?: boolean;
    show_extras?: boolean;
    show_fullness?: boolean;
    label_width?: string;
    label_drop?: string;
}

export interface Fabric {
    id: string;
    supplier: string;
    brand: string;
    name: string;
    price_group: string;
    category: string | null;
    product_category: string | null;
    is_active?: boolean;
}

export interface SelectedExtra {
    id: string;
    name: string;
    price: number;
    calculated_price: number;
    price_type?: string;
}

export interface PriceGroup {
    id: string;
    category: string;
    name: string;
    price: number;
    supplier: string;
    group_code: string;
    group_name: string;
    multiplier: number;
    price_type?: string;
    notes: string | null;
    is_active?: boolean;
}

export interface ProductExtra {
    id: string;
    product_category: string;
    extra_category?: string; // e.g. 'Motorisation', 'General'
    name: string;
    price: number;
    supplier: string;
    price_type?: string;
    notes: string | null;
    is_active?: boolean;
    product_ids?: string[]; // Optional: if set, only applies to these products. If null/empty, applies to all in category.
}

export interface QuoteItem {
    product_id: string;
    product_name: string;
    width: number;
    drop: number;
    quantity: number;
    calculated_price: number;
    pricing_note?: string;
    price_group?: string;
    extras?: SelectedExtra[];
}

// Enhanced Quote interface with margin support
export interface Quote {
    id: string;
    customer_name: string;
    customer_id?: string;
    status: 'draft' | 'sent' | 'approved' | 'rejected';
    total_amount: number;
    overall_margin_percent: number;
    show_gst: boolean;
    notes?: string;
    created_at: string;
    updated_at?: string;
}

// Enhanced QuoteItem with full margin tracking
export interface QuoteItemFull {
    id: string;
    quote_id: string;
    product_id: string;
    location?: string; // Room name e.g., "Master Bedroom"
    width: number;
    drop: number;
    quantity: number;
    cost_price: number; // Base cost from supplier
    item_margin_percent: number; // Per-item margin override
    sell_price: number; // Price after margin (per unit)
    calculated_price: number; // Total for this line (sell_price * quantity)
    notes?: string;
    item_config?: {
        fabric_id?: string;
        fabric_name?: string;
        price_group?: string;
        extras?: SelectedExtra[];
        fullness?: string;
        notes?: string;
    };
    products?: {
        name: string;
        supplier: string;
        category: string;
        quote_config?: QuoteConfig;
    };
}

export interface EnhancedQuoteItem extends QuoteItem {
    id: string;          // Unique UI ID
    location: string;
    cost_price: number;      // Per-unit cost (wholesale)
    margin_percent: number | null;  // Item-specific margin (null = use overall)
    sell_price: number;      // Per-unit sell = cost × (1 + margin%)
    discount_percent: number; // Trade/volume discount
    fabric_name: string;     // Selected fabric display name
    notes: string;           // Item notes
}
