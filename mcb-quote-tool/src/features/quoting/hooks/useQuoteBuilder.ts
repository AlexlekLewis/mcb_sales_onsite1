import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Product, ProductExtra, Quote, QuoteItem, Fabric, PriceGroup, SelectedExtra, EnhancedQuoteItem } from '../types';
import { calculatePrice, calculateExtraPrice } from '../pricing';
import { applySingleMargin } from '../margin-utils';

export function useQuoteBuilder() {
    // --- Data State ---
    const [products, setProducts] = useState<Product[]>([]);
    const [extras, setExtras] = useState<ProductExtra[]>([]);
    const [priceGroups, setPriceGroups] = useState<PriceGroup[]>([]);
    const [fabrics, setFabrics] = useState<Fabric[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Quote State ---
    const [customerName, setCustomerName] = useState('');
    const [lineItems, setQuoteItems] = useState<EnhancedQuoteItem[]>([]);
    const [overallMargin, setOverallMargin] = useState(45);
    const [showGst, setShowGst] = useState(true);

    // --- Form Configuration State ---
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedFabricId, setSelectedFabricId] = useState('');
    const [width, setWidth] = useState('');
    const [drop, setDrop] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [selectedPriceGroup, setSelectedPriceGroup] = useState<PriceGroup | null>(null);
    const [selectedExtras, setSelectedExtras] = useState<SelectedExtra[]>([]);
    const [fullness, setFullness] = useState<'100' | '160'>('100');

    // UI State
    const [activeTab, setActiveTab] = useState<string>('');

    // --- Data Fetching ---
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const [productsRes, extrasRes, groupsRes, fabricsRes] = await Promise.all([
                    supabase.from('products').select('*').order('supplier'),
                    supabase.from('product_extras').select('*').order('product_category, name'),
                    supabase.from('price_groups').select('*').order('supplier, group_code'),
                    supabase.from('fabrics').select('*').order('brand, name')
                ]);

                if (productsRes.error) throw new Error(`Products: ${productsRes.error.message}`);
                if (extrasRes.error) throw new Error(`Extras: ${extrasRes.error.message}`);
                if (groupsRes.error) throw new Error(`Price Groups: ${groupsRes.error.message}`);
                if (fabricsRes.error) throw new Error(`Fabrics: ${fabricsRes.error.message}`);

                if (productsRes.data) setProducts(productsRes.data.filter(p => p.is_active !== false));
                // Ensure price is treated as number
                if (extrasRes.data) setExtras(extrasRes.data.filter(e => e.is_active !== false).map(e => ({ ...e, price: typeof e.price === 'string' ? parseFloat(e.price) : e.price })));
                if (groupsRes.data) setPriceGroups(groupsRes.data.filter(g => g.is_active !== false));
                if (fabricsRes.data) setFabrics(fabricsRes.data.filter(f => f.is_active !== false));
            } catch (err: any) {
                console.error("Error loading quote data:", err);
                setError(err.message || 'Failed to load quote data');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // --- Computed Data ---

    // Tabs
    const tabs = useMemo(() => {
        const groups = new Set(products.map(p => `${p.supplier}|${p.category}`));
        return Array.from(groups).map(g => {
            const [supplier, category] = g.split('|');
            return { id: g, label: `${supplier} ${category}`, supplier, category };
        }).sort((a, b) => a.label.localeCompare(b.label));
    }, [products]);

    // Set Default Tab
    useEffect(() => {
        if (tabs.length > 0 && !activeTab) {
            const defaultTab = tabs.find(t => t.id === 'Creative|Internal Blinds') || tabs[0];
            setActiveTab(defaultTab.id);
        }
    }, [tabs, activeTab]);

    // Filter Products
    const tabProducts = useMemo(() => {
        if (!activeTab) return [];
        const filtered = products.filter(p => `${p.supplier}|${p.category}` === activeTab);

        if (activeTab === 'Creative|External Blinds') {
            const order = [
                'Creative Recloth',
                'Creative Auto Awning',
                'Creative Straight Drop (Crank/Strap)',
                'Creative Fixed Guide (Spring)',
                'Creative Wire Guide (Crank)',
                'Creative Veue Zipscreen',
                'Creative Veue Straight Drop',
                'Creative Veue Extreme Zip Screen (No Headbox)',
                'Creative Veue Extreme Zip Screen (190 Headbox)'
            ];
            return filtered.sort((a, b) => {
                const indexA = order.indexOf(a.name);
                const indexB = order.indexOf(b.name);
                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                return a.name.localeCompare(b.name);
            });
        }
        return filtered;
    }, [activeTab, products]);

    // Auto-select single product OR clear if invalid for current tab
    useEffect(() => {
        // If the currently selected product is NOT in the new tab's product list, clear it.
        const isValidForTab = tabProducts.some(p => p.id === selectedProductId);

        if (!isValidForTab) {
            if (tabProducts.length === 1) {
                setSelectedProductId(tabProducts[0].id);
            } else {
                setSelectedProductId('');
            }
        }
    }, [tabProducts, selectedProductId]);

    // Selected Product Helpers
    const selectedProduct = useMemo(() => products.find(p => p.id === selectedProductId), [products, selectedProductId]);

    const relevantPriceGroups = useMemo(() => selectedProduct
        ? priceGroups.filter(g =>
            g.supplier === selectedProduct.supplier &&
            g.category === selectedProduct.category
        )
        : [], [selectedProduct, priceGroups]);

    const relevantFabrics = useMemo(() => selectedProduct
        ? fabrics.filter(f =>
            f.supplier === selectedProduct.supplier &&
            f.product_category === selectedProduct.category
        )
        : [], [selectedProduct, fabrics]);

    const relevantExtras = useMemo(() => selectedProduct
        ? extras.filter(e => {
            // 1. Supplier Match (Start by entering supplier scope)
            if (e.supplier !== selectedProduct.supplier) return false;

            // 2. Category Match
            const categoryMatch = e.product_category === selectedProduct.category;
            if (!categoryMatch) {
                // 3. Product ID specific whitelist (Only check if category missed)
                if (e.product_ids && e.product_ids.length > 0) {
                    return e.product_ids.includes(selectedProduct.id);
                }
                return false;
            }

            // 4. All in matched category
            return true;
        })
        : [], [selectedProduct, extras]);


    // --- Live Pricing Calculation ---
    // This ensures we always have a current price for the UI and validation
    const { livePrice, liveWarning, liveNote } = useMemo(() => {
        if (!selectedProduct) return { livePrice: 0, liveWarning: undefined, liveNote: undefined };

        // Parse Dimensions
        const w = parseInt(width) || 0;
        const d = parseInt(drop) || 0;
        const qty = parseInt(quantity) || 1;

        // 0. check config
        const config = selectedProduct.quote_config || {};
        const showW = config.show_width ?? true;
        const showD = config.show_drop ?? true;

        // If dimensions are visible but 0/empty, return 0 price (don't show default min bracket)
        if ((showW && w === 0) || (showD && d === 0)) {
            return { livePrice: 0, liveWarning: undefined, liveNote: 'Enter dimensions' };
        }

        // Base Price
        const { price, warning, note } = calculatePrice(selectedProduct, w, d, { priceGroup: selectedPriceGroup, fullness });

        // Extras
        const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.calculated_price, 0);

        // Final Unit Price (Cost)
        const unitPrice = price + extrasTotal;

        // Total Line Item Price
        const calculated_price = unitPrice * qty;

        return {
            livePrice: calculated_price,
            liveWarning: warning,  // Actual errors (blocks adding to quote)
            liveNote: note         // Informational (pricing tier used)
        };
    }, [selectedProduct, width, drop, quantity, selectedPriceGroup, fullness, selectedExtras]);



    const toggleExtra = (extra: ProductExtra) => {
        const w = parseInt(width) || 0;
        const d = parseInt(drop) || 0;

        const { price: basePrice } = selectedProduct ? calculatePrice(selectedProduct, w, d, { priceGroup: selectedPriceGroup, fullness }) : { price: 0 };

        const exists = selectedExtras.find(e => e.id === extra.id);
        if (exists) {
            setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id));
        } else {
            const calcPrice = calculateExtraPrice(extra, basePrice, w, d);
            setSelectedExtras([...selectedExtras, {
                id: extra.id,
                name: extra.name,
                price: extra.price,
                calculated_price: calcPrice,
                price_type: extra.price_type
            }]);
        }
    };

    const addQuoteItem = () => {
        if (!selectedProduct) return;

        const config = selectedProduct.quote_config || {};
        const showW = config.show_width ?? true;
        const showD = config.show_drop ?? true;

        if ((showW && !width) || (showD && !drop)) return;

        const fabric = fabrics.find(f => f.id === selectedFabricId);

        const w = showW ? parseInt(width) : 0;
        const d = showD ? parseInt(drop) : 0;
        const qty = parseInt(quantity) || 1;
        // Use the live values for consistency/correctness
        // Rerun calculation to ensure safety inside the function scope if needed, 
        // but for now we trust the inputs provided they match.
        // Re-calculating avoids stale closure issues if not using the memo result directly.
        const { price, warning } = calculatePrice(selectedProduct, w, d, { priceGroup: selectedPriceGroup, fullness });

        // STRICT VALIDATION: Block $0 prices if there is a warning or if regular pricing failed
        // A warning usually means "out of grid", but we should also check explicit invalid dims
        if (w <= 0 && showW) {
            toast.error('Width must be greater than 0');
            return { error: 'Invalid width' };
        }
        if (d <= 0 && showD) {
            toast.error('Drop must be greater than 0');
            return { error: 'Invalid drop' };
        }
        if (warning) {
            toast.error(warning);
            return { error: warning };
        }

        // Final price check
        const unitPrice = price + selectedExtras.reduce((s, e) => s + e.calculated_price, 0);
        if (unitPrice <= 0) {
            toast.error('Price cannot be zero. Check dimensions.');
            return { error: 'Price is zero' };
        }

        const calculated_price = unitPrice * qty;

        const newItem: QuoteItem = {
            id: crypto.randomUUID(),
            product_id: selectedProductId,
            product_name: selectedProduct.supplier === selectedProduct.name || selectedProduct.name.startsWith(selectedProduct.supplier)
                ? selectedProduct.name
                : `${selectedProduct.supplier} - ${selectedProduct.name}`,
            product_category: selectedProduct.category,
            width: w,
            drop: d,
            quantity: qty,
            price_group: selectedPriceGroup?.name, // Store name for display
            fabric_name: fabric?.name,
            fabric_price_group: fabric?.price_group,
            notes: '',
            calculated_price: calculated_price,
            cost_price: calculated_price, // Assuming cost = sell for now if no markup logic yet
            sell_price: calculated_price,
            extras: selectedExtras.map(e => ({
                id: e.id,
                name: e.name,
                price: e.calculated_price
            })),
            pricing_note: `Priced @ ${w}W x ${d}D Bracket`,
        };

        setLineItems(prev => [...prev, newItem]);
        toast.success(`Added ${newItem.product_name} to quote`);

        // Reset ONLY dimensions/qty/extras for rapid entry of similar items
        // Keep Product/Fabric selections
        setWidth('');
        setDrop('');
        setQuantity('1'); // Reset to 1
        // setSelectedPriceGroup(null); // Keep price group if manual override? No, usually auto.
        setSelectedExtras([]);
        // setFullness('100'); // Keep fullness context?

        return { success: true };
    };        // Note: Some extras might add cost, but base product price shouldn't be zero unless allowed.
    // Assuming most products must have a base price.
    if (price === 0 && warning) {
        console.warn("Blocked invalid price:", warning);
        return { error: warning };
    }
    if (price === 0 && selectedProduct.pricing_type !== 'Unit') { // Allow Unit items if they naturally can be 0? Maybe not.
        // Double check standard grid logic
    }

    const productPrice = price * qty;

    const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.calculated_price, 0);
    const costPerUnit = price + extrasTotal;
    const totalPrice = costPerUnit * qty;

    const newItem: EnhancedQuoteItem = {
        id: crypto.randomUUID(),
        product_id: selectedProduct.id,
        product_name: selectedProduct.supplier === selectedProduct.name || selectedProduct.name.startsWith(selectedProduct.supplier)
            ? selectedProduct.name
            : `${selectedProduct.supplier} - ${selectedProduct.name}`,
        width: w,
        drop: d,
        quantity: qty,
        calculated_price: totalPrice,
        pricing_note: warning,
        price_group: selectedPriceGroup?.group_name,
        extras: selectedExtras.length > 0 ? [...selectedExtras] : undefined,
        location: '',
        cost_price: costPerUnit,
        margin_percent: null,
        sell_price: applySingleMargin(costPerUnit, overallMargin),
        discount_percent: 0,
        fabric_name: fabric ? `${fabric.brand} ${fabric.name}` : '',
        notes: '',
    };

    setQuoteItems([...lineItems, newItem]);

    // Reset Form - Keep Product/Fabric selections for rapid entry
    // setSelectedProductId('');
    // setSelectedFabricId('');
    setWidth('');
    setDrop('');
    setQuantity('1');
    // setSelectedPriceGroup(null);
    setSelectedExtras([]);
    // setShowExtras(false); // UI state, handle in component
    setFullness('100');

    return { success: true };
};

const removeQuoteItem = (id: string) => {
    setQuoteItems(lineItems.filter(item => item.id !== id));
};

const updateQuoteItem = (id: string, updates: Partial<EnhancedQuoteItem>) => {
    setQuoteItems(items => items.map(item => {
        if (item.id !== id) return item;

        const updatedItem = { ...item, ...updates };

        // Recalculate prices if relevant fields change
        if ('margin_percent' in updates || 'quantity' in updates) {
            const effectiveMargin = updatedItem.margin_percent !== null ? updatedItem.margin_percent : overallMargin;
            updatedItem.sell_price = applySingleMargin(updatedItem.cost_price, effectiveMargin);
            updatedItem.calculated_price = updatedItem.sell_price * updatedItem.quantity;
        }
        return updatedItem;
    }));
};

// Apply Margin Logic
useEffect(() => {
    if (lineItems.length > 0) {
        setQuoteItems(items => items.map(item => {
            if (item.margin_percent === null) {
                const sell_price = applySingleMargin(item.cost_price, overallMargin);
                return {
                    ...item,
                    sell_price,
                    calculated_price: sell_price * item.quantity
                };
            }
            return item;
        }));
    }
}, [overallMargin]); // Warning: This might trigger purely on lineItems change loops if strict dependency used improperly, but lineItems is not in dependency array which is correct for this effect (responds to overallMargin change)

// --- Totals ---
const totals = useMemo(() => {
    const totalCost = lineItems.reduce((sum, item) => sum + (item.cost_price * item.quantity), 0);
    const totalSell = lineItems.reduce((sum, item) => {
        const effectiveMargin = item.margin_percent !== null ? item.margin_percent : overallMargin;
        const sell = applySingleMargin(item.cost_price, effectiveMargin);
        return sum + (sell * item.quantity);
    }, 0);
    const totalMargin = totalSell - totalCost;
    const avgMarginPercent = totalCost > 0 ? (totalMargin / totalCost) * 100 : 0;
    const gst = totalSell * 0.1;
    const totalIncGst = totalSell + gst;

    return { totalCost, totalSell, totalMargin, avgMarginPercent, gst, totalIncGst };
}, [lineItems, overallMargin]);

return {
    // Data
    data: {
        products,
        extras,
        priceGroups,
        fabrics,
        tabs,
        tabProducts,
        relevantFabrics,
        relevantPriceGroups,
        relevantExtras,
        selectedProduct,
    },
    loading,
    error,

    // Quote
    quote: {
        customerName,
        setCustomerName,
        lineItems,
        overallMargin,
        setOverallMargin,
        showGst,
        setShowGst,
        totals,
        livePrice,
        liveWarning,
        liveNote
    },

    // Input Form
    form: {
        activeTab, setActiveTab,
        selectedProductId, setSelectedProductId,
        selectedFabricId, setSelectedFabricId,
        width, setWidth,
        drop, setDrop,
        quantity, setQuantity,
        selectedPriceGroup, setSelectedPriceGroup,
        selectedExtras, setSelectedExtras,
        fullness, setFullness,
    },

    // Actions
    actions: {
        toggleExtra,
        addQuoteItem,
        removeQuoteItem,
        updateQuoteItem,
    }
};
}
