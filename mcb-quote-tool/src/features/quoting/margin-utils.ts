/**
 * Margin Calculation Utilities
 * 
 * Uses Markup on Cost method:
 * Sell = Cost × (1 + Margin%)
 * e.g., 30% markup on $100 cost = $130 sell
 */

export interface MarginCalculation {
    cost: number;
    marginPercent: number;
    marginAmount: number;
    subtotal: number;
    gst: number;
    total: number;
}

const GST_RATE = 0.1; // 10% Australian GST

/**
 * Calculate pricing with margin applied
 */
export function calculateMargin(
    cost: number,
    marginPercent: number
): MarginCalculation {
    const marginAmount = cost * (marginPercent / 100);
    const subtotal = cost + marginAmount;
    const gst = subtotal * GST_RATE;
    const total = subtotal + gst;

    return {
        cost,
        marginPercent,
        marginAmount,
        subtotal,
        gst,
        total
    };
}

/**
 * Calculate sell price from cost and margin
 */
export function applySingleMargin(cost: number, marginPercent: number): number {
    return cost * (1 + marginPercent / 100);
}

/**
 * Reverse calculate: get margin % from cost and sell
 */
export function getMarginPercent(cost: number, sell: number): number {
    if (cost === 0) return 0;
    return ((sell - cost) / cost) * 100;
}

/**
 * Calculate totals for a quote
 */
export function calculateQuoteTotals(
    items: Array<{ quantity: number; cost_price: number; item_margin_percent: number }>,
    overallMargin: number = 0,
    categoryMargins: Record<string, number> = {}
): {
    totalCost: number;
    totalMargin: number;
    subtotalExGst: number;
    gst: number;
    totalIncGst: number;
    averageMarginPercent: number;
} {
    let totalCost = 0;
    let totalSell = 0;

    items.forEach(item => {
        const quantity = item.quantity || 1;
        const cost = (item.cost_price || 0) * quantity;

        // Use item margin if set, otherwise use overall margin
        const effectiveMargin = item.item_margin_percent > 0
            ? item.item_margin_percent
            : overallMargin;

        const sell = applySingleMargin(cost, effectiveMargin);

        totalCost += cost;
        totalSell += sell;
    });

    const totalMargin = totalSell - totalCost;
    const gst = totalSell * GST_RATE;
    const averageMarginPercent = totalCost > 0 ? (totalMargin / totalCost) * 100 : 0;

    return {
        totalCost,
        totalMargin,
        subtotalExGst: totalSell,
        gst,
        totalIncGst: totalSell + gst,
        averageMarginPercent
    };
}

/**
 * Format currency for display (AUD)
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
}
