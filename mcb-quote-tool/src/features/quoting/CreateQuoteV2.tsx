import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useQuoteBuilder } from './hooks/useQuoteBuilder';
import { supabase } from '../../lib/supabase';
import { ProductConfigurator } from './components/ProductConfigurator';
import { QuoteSummaryRail } from './components/QuoteSummaryRail';
import { QuoteToolsPanel } from './components/QuoteToolsPanel';
import { StartQuoteModal } from './components/StartQuoteModal';

export function CreateQuoteV2() {
    const navigate = useNavigate();
    const {
        data: { products, tabs, tabProducts, relevantFabrics, relevantPriceGroups, relevantExtras },
        quote: { customerName, setCustomerName, lineItems, overallMargin, setOverallMargin, showGst, totals, livePrice, liveWarning, liveNote },
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
        actions: { toggleExtra, addQuoteItem, removeQuoteItem, updateQuoteItem },
        loading,
        error
    } = useQuoteBuilder();

    const [saving, setSaving] = useState(false);

    // Draft-first flow: quote is created upfront via the modal
    const [draftQuoteId, setDraftQuoteId] = useState<string | null>(null);

    // Product range filtering
    const [selectedRanges, setSelectedRanges] = useState<string[]>([]);
    const [showAddRange, setShowAddRange] = useState(false);
    const addRangeRef = useRef<HTMLDivElement>(null);

    // Close add-range dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (addRangeRef.current && !addRangeRef.current.contains(e.target as Node)) {
                setShowAddRange(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Compute visible tabs based on selected ranges
    const visibleTabs = useMemo(() => {
        if (selectedRanges.length === 0) return tabs;
        return tabs.filter(t => selectedRanges.includes(t.id));
    }, [tabs, selectedRanges]);

    // Ranges not yet added (for the "+" dropdown)
    const remainingRanges = useMemo(() => {
        return tabs.filter(t => !selectedRanges.includes(t.id));
    }, [tabs, selectedRanges]);

    const addRange = (rangeId: string) => {
        setSelectedRanges(prev => [...prev, rangeId]);
        setActiveTab(rangeId);
        setShowAddRange(false);
        // Reset product selection when switching ranges
        setSelectedProductId('');
        setSelectedFabricId('');
        setSelectedPriceGroup(null);
        setSelectedExtras([]);
    };

    // Form Change Handler
    const handleFormChange = (field: string, value: any) => {
        switch (field) {
            case 'width': setWidth(value); break;
            case 'drop': setDrop(value); break;
            case 'quantity': setQuantity(value); break;
            case 'fullness': setFullness(value); break;
        }
    };

    // Called when the StartQuoteModal creates a draft
    const handleDraftCreated = (quoteId: string, name: string, ranges: string[]) => {
        setDraftQuoteId(quoteId);
        setCustomerName(name);
        setSelectedRanges(ranges);
        // Set active tab to the first selected range
        if (ranges.length > 0) {
            setActiveTab(ranges[0]);
        }
    };

    // Save = update the existing draft with line items
    const handleSave = async () => {
        if (!draftQuoteId) return;

        setSaving(true);
        try {
            // Update the draft quote with final totals
            const { error: updateError } = await supabase
                .from('quotes')
                .update({
                    customer_name: customerName || 'Unnamed Quote',
                    total_amount: totals.totalSell,
                    overall_margin_percent: overallMargin,
                    show_gst: showGst,
                })
                .eq('id', draftQuoteId);

            if (updateError) {
                throw new Error(updateError.message);
            }

            // Insert line items
            if (lineItems.length > 0) {
                const items = lineItems.map(item => ({
                    quote_id: draftQuoteId,
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
                    }
                }));

                const { error: itemsError } = await supabase.from('quote_items').insert(items);
                if (itemsError) {
                    console.error("Item insertion failed:", itemsError);
                    alert(`Quote saved but failed to save items: ${itemsError.message}`);
                }
            }

            // Success — navigate to the saved quote
            navigate(`/quotes/${draftQuoteId}`);
        } catch (err: any) {
            console.error("Error saving quote:", err);
            alert(`An error occurred: ${err.message || 'Unknown error'}`);
        } finally {
            setSaving(false);
        }
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
        <>
            {/* Start Quote Modal — shown until draft is created */}
            {!draftQuoteId && (
                <StartQuoteModal
                    onStart={handleDraftCreated}
                    onCancel={() => navigate('/quotes')}
                />
            )}

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
                                <h2 className="text-lg font-bold text-white">
                                    {customerName ? `Quote — ${customerName}` : 'New Quote'}
                                </h2>
                                {draftQuoteId && (
                                    <p className="text-xs text-slate-500">Draft auto-saved</p>
                                )}
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
                        tabs={visibleTabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}

                        /* "+" tab for adding ranges */
                        addRangeButton={
                            remainingRanges.length > 0 ? (
                                <div ref={addRangeRef} className="relative">
                                    <button
                                        onClick={() => setShowAddRange(!showAddRange)}
                                        className={cn(
                                            "px-3 py-3 rounded-t-xl text-sm font-medium transition-all border-t border-x border-b-0 relative top-[1px]",
                                            "bg-transparent border-transparent text-slate-500 hover:text-brand-orange hover:bg-white/5"
                                        )}
                                        title="Add product range"
                                    >
                                        <Plus size={16} />
                                    </button>
                                    {showAddRange && (
                                        <div className="absolute top-full left-0 mt-1 z-20 bg-[#1c1c24] border border-white/10 rounded-xl shadow-2xl min-w-[200px] py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                                            <p className="px-3 py-1.5 text-[10px] text-slate-500 uppercase tracking-wider">Add Range</p>
                                            {remainingRanges.map(range => (
                                                <button
                                                    key={range.id}
                                                    onClick={() => addRange(range.id)}
                                                    className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                                >
                                                    {range.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : undefined
                        }

                        products={tabProducts}
                        selectedProductId={selectedProductId}
                        onProductChange={(id) => {
                            setSelectedProductId(id);
                            setSelectedFabricId('');
                            setSelectedPriceGroup(null);
                            setSelectedExtras([]);
                            setWidth('');
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
                        }}
                        isValid={(() => {
                            const w = parseInt(width);
                            const d = parseInt(drop);
                            const config = products.find(p => p.id === selectedProductId)?.quote_config || {};
                            const showW = config.show_width ?? true;
                            const showD = config.show_drop ?? true;

                            const hasValidDims = (!showW || w > 0) && (!showD || d > 0);
                            const hasFabric = relevantFabrics.length === 0 || !!selectedFabricId;

                            return !!selectedProductId && !liveWarning && hasValidDims && hasFabric;
                        })()}
                        livePrice={livePrice}
                        liveWarning={liveWarning}
                        liveNote={liveNote}
                    />
                </div>

                {/* Right Panel: Summary Rail + Tools (40%) */}
                <div className="w-[400px] xl:w-[450px] flex flex-col flex-shrink-0 gap-4">
                    <div className="bg-background-card rounded-2xl border border-white/5 shadow-2xl flex flex-col flex-1 overflow-hidden">
                        <QuoteSummaryRail
                            items={lineItems}
                            totals={totals}
                            overallMargin={overallMargin}
                            onUpdateMargin={setOverallMargin}
                            onRemoveItem={removeQuoteItem}
                            onEditItem={(item) => { /* TODO: Implement Edit Item */ }}
                        />

                        {/* Primary Save Action */}
                        <div className="p-4 border-t border-white/5 bg-[#1c1c24]">
                            <button
                                onClick={handleSave}
                                disabled={saving || lineItems.length === 0 || !draftQuoteId}
                                className="w-full py-4 bg-brand-orange hover:bg-brand-orange-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2 transition-all"
                            >
                                {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                Save Quote
                            </button>
                        </div>
                    </div>

                    {/* Tools Panel — always active once draft exists */}
                    {draftQuoteId && (
                        <QuoteToolsPanel quoteId={draftQuoteId} />
                    )}
                </div>
            </div>
        </>
    );
}
