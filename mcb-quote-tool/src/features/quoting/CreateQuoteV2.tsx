import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useQuoteBuilder } from './hooks/useQuoteBuilder';
import { supabase } from '../../lib/supabase';
import { ProductConfigurator } from './components/ProductConfigurator';
import { QuoteSummaryRail } from './components/QuoteSummaryRail';

export function CreateQuoteV2() {
    const navigate = useNavigate();
    const {
        data: { products, tabs, tabProducts, relevantFabrics, relevantPriceGroups, relevantExtras }, // removed selectedProduct unused here
        quote: { customerName, setCustomerName, lineItems, overallMargin, setOverallMargin, showGst, totals, livePrice, liveWarning },
        form: {
            activeTab, setActiveTab,
            selectedProductId, setSelectedProductId,
            selectedFabricId, setSelectedFabricId,
            width, setWidth,
            drop, setDrop,
            quantity, setQuantity,
            selectedPriceGroup, setSelectedPriceGroup,
            selectedExtras, setSelectedExtras,
            fullness, setFullness
        },
        actions: { toggleExtra, addQuoteItem, removeQuoteItem, updateQuoteItem }, // removed loading unused here
        loading,
        error
    } = useQuoteBuilder();

    const [saving, setSaving] = useState(false);

    // Form Change Handler
    const handleFormChange = (field: string, value: any) => {
        switch (field) {
            case 'width': setWidth(value); break;
            case 'drop': setDrop(value); break;
            case 'quantity': setQuantity(value); break;
            case 'fullness': setFullness(value); break;
        }
    };

    const handleSave = async () => {
        if (!customerName.trim()) {
            alert('Please enter a customer name');
            return;
        }

        setSaving(true);
        const { data: quote, error: quoteError } = await supabase
            .from('quotes')
            .insert({
                customer_name: customerName || 'Unnamed Quote',
                status: 'draft',
                total_amount: totals.totalSell,
                overall_margin_percent: overallMargin,
                show_gst: showGst
            })
            .select()
            .single();

        if (quoteError || !quote) {
            console.error(quoteError);
            alert('Error creating quote');
            setSaving(false);
            return;
        }

        if (lineItems.length > 0) {
            const items = lineItems.map(item => ({
                quote_id: quote.id,
                product_id: item.product_id,
                width: item.width,
                drop: item.drop,
                quantity: item.quantity,
                calculated_price: item.calculated_price,
                location: item.location || null,
                cost_price: item.cost_price,
                item_margin_percent: item.margin_percent ?? overallMargin,
                sell_price: item.sell_price,
                notes: item.extras ? `Extras: ${item.extras.map(e => e.name).join(', ')}` : null,
                item_config: {
                    fabric_name: item.fabric_name || null,
                    price_group: item.price_group || null,
                    extras: item.extras || [],
                    notes: item.pricing_note || null,
                    fullness: item.product_name.includes('Curtains') ? item.fabric_name : undefined
                    // Note: 'fullness' logic in original was implicit. 
                    // Storing it in item_config helps reproduction.
                }
            }));

            const { error: itemsError } = await supabase.from('quote_items').insert(items);
            if (itemsError) {
                console.error(itemsError);
                alert('Quote created but failed to save items.');
            }
        }

        setSaving(false);
        navigate('/quotes');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-brand-orange" size={40} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 max-w-md text-center">
                    <h3 className="text-red-500 font-bold mb-2">Failed to Load Quote Data</h3>
                    <p className="text-gray-300 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-2rem)] overflow-hidden gap-6">
            {/* Left Panel: Configurator (60%) */}
            <div className="flex-1 flex flex-col min-w-0 bg-background-card rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#1c1c24]">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/quotes')} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-lg font-bold text-white">New Quote</h2>
                        </div>
                    </div>
                    <div className="w-64">
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Customer Name..."
                            className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-orange transition-colors"
                        />
                    </div>
                </div>

                {/* Configurator Body */}
                <ProductConfigurator
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}

                    products={tabProducts}
                    selectedProductId={selectedProductId}
                    onProductChange={(id) => {
                        setSelectedProductId(id);
                        // Explicitly clear dependent selections when product changes
                        setSelectedFabricId('');
                        setSelectedPriceGroup(null);
                        setSelectedExtras([]);
                        setWidth(''); // Optional: clear dims on product change? User preference.
                        setDrop('');
                    }}

                    fabrics={relevantFabrics}
                    selectedFabricId={selectedFabricId}
                    onFabricChange={setSelectedFabricId}

                    priceGroups={relevantPriceGroups}
                    selectedPriceGroup={selectedPriceGroup}
                    onSelectedPriceGroupChange={setSelectedPriceGroup}

                    extras={relevantExtras}
                    selectedExtras={selectedExtras}
                    onToggleExtra={toggleExtra}

                    formState={{ width, drop, quantity, fullness }}
                    onFormChange={handleFormChange}

                    onAdd={() => {
                        const res = addQuoteItem();
                        if (res?.error) alert(res.error);
                    }}
                    isValid={!!selectedProductId && (!liveWarning || livePrice > 0)}
                    livePrice={livePrice}
                    liveWarning={liveWarning}
                />
            </div>

            {/* Right Panel: Summary Rail (40%) */}
            <div className="w-[400px] xl:w-[450px] flex flex-col flex-shrink-0">
                <div className="bg-background-card rounded-2xl border border-white/5 shadow-2xl flex flex-col h-full overflow-hidden">
                    <QuoteSummaryRail
                        items={lineItems}
                        totals={totals}
                        overallMargin={overallMargin}
                        onUpdateMargin={setOverallMargin}
                        onRemoveItem={removeQuoteItem}
                        onEditItem={(item) => console.log('Edit', item)}
                    />

                    {/* Primary Save Action */}
                    <div className="p-4 border-t border-white/5 bg-[#1c1c24]">
                        <button
                            onClick={handleSave}
                            disabled={saving || lineItems.length === 0}
                            className="w-full py-4 bg-brand-orange hover:bg-brand-orange-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2 transition-all"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            Save Quote
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
