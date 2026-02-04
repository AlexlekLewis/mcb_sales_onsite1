import React, { useState, useEffect } from 'react';
import { Plus, Minus, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { supabase } from '../../../lib/supabase';
import { Product, Fabric, ProductExtra } from '../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

interface QuoteBuilderFormProps {
    category: string;
    onItemAdd: (item: any) => void;
}

interface FormSection {
    id: string;
    label: string;
    isOpen: boolean;
}

export function QuoteBuilderForm({ category, onItemAdd }: QuoteBuilderFormProps) {
    // Form state
    const [roomName, setRoomName] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [width, setWidth] = useState(1200);
    const [height, setHeight] = useState(1500);
    const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);
    const [pelmetColor, setPelmetColor] = useState('');
    const [bottomRailColor, setBottomRailColor] = useState('');
    const [chainColor, setChainColor] = useState('');
    const [includeInstall, setIncludeInstall] = useState(true);
    const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
    const [notes, setNotes] = useState('');

    // Data state
    const [products, setProducts] = useState<Product[]>([]);
    const [fabrics, setFabrics] = useState<Fabric[]>([]);
    const [extras, setExtras] = useState<ProductExtra[]>([]);
    const [loading, setLoading] = useState(true);

    // Section collapse state
    const [sections, setSections] = useState<FormSection[]>([
        { id: 'product', label: 'Product Details', isOpen: true },
        { id: 'dimensions', label: 'Dimensions', isOpen: true },
        { id: 'fabric', label: 'Fabric & Finish', isOpen: true },
        { id: 'components', label: 'Component Colors', isOpen: true },
        { id: 'installation', label: 'Installation', isOpen: true },
        { id: 'extras', label: 'Extras & Add-ons', isOpen: true },
        { id: 'notes', label: 'Notes', isOpen: false },
    ]);

    // Fetch products, fabrics, extras for category
    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            // Map category ID to database category
            const categoryMap: Record<string, string> = {
                'external-blinds': 'External Blinds',
                'internal-blinds': 'Internal Blinds',
                'plantation-shutters': 'Plantation Shutters',
                'security-doors': 'Security Doors'
            };
            const dbCategory = categoryMap[category] || category;

            // Fetch products
            const { data: productsData } = await supabase
                .from('products')
                .select('*')
                .eq('category', dbCategory)
                .eq('is_active', true);

            if (productsData) setProducts(productsData);

            // Fetch fabrics
            const { data: fabricsData } = await supabase
                .from('fabrics')
                .select('*')
                .eq('product_category', dbCategory)
                .eq('is_active', true);

            if (fabricsData) setFabrics(fabricsData);

            // Fetch extras
            const { data: extrasData } = await supabase
                .from('product_extras')
                .select('*')
                .eq('product_category', dbCategory)
                .eq('is_active', true);

            if (extrasData) setExtras(extrasData);

            setLoading(false);
        }

        fetchData();
    }, [category]);

    const toggleSection = (sectionId: string) => {
        setSections(sections.map(s =>
            s.id === sectionId ? { ...s, isOpen: !s.isOpen } : s
        ));
    };

    const toggleExtra = (extraId: string) => {
        setSelectedExtras(prev =>
            prev.includes(extraId)
                ? prev.filter(id => id !== extraId)
                : [...prev, extraId]
        );
    };

    const incrementWidth = () => setWidth(w => w + 100);
    const decrementWidth = () => setWidth(w => Math.max(300, w - 100));
    const incrementHeight = () => setHeight(h => h + 100);
    const decrementHeight = () => setHeight(h => Math.max(300, h - 100));

    const renderSection = (sectionId: string, children: React.ReactNode) => {
        const section = sections.find(s => s.id === sectionId);
        if (!section) return null;

        return (
            <Card variant="glass" className={cn("overflow-hidden transition-all duration-300", section.isOpen ? "" : "hover:bg-white/10")}>
                <button
                    onClick={() => toggleSection(sectionId)}
                    className="w-full flex items-center justify-between px-4 py-3 transition-all"
                >
                    <span className="text-sm font-semibold text-brand-orange uppercase tracking-wider glow-text">
                        {section.label}
                    </span>
                    {section.isOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                </button>
                {section.isOpen && (
                    <div className="p-4 space-y-4 border-t border-white/5 bg-black/20">
                        {children}
                    </div>
                )}
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-3xl mx-auto">
            {/* Product Details */}
            {renderSection('product', (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-400 uppercase">Room Name</label>
                        <Input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="e.g. Living Room"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-400 uppercase">Product</label>
                        <select
                            value={selectedProduct?.id || ''}
                            onChange={(e) => setSelectedProduct(products.find(p => p.id === e.target.value) || null)}
                            className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-brand-orange transition-colors"
                        >
                            <option value="">Select product...</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.supplier} - {p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            ))}

            {/* Dimensions */}
            {renderSection('dimensions', (
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-400 uppercase">Width (mm)</label>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={decrementWidth}
                                className="w-12 h-12 rounded-xl bg-background border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center"
                            >
                                <Minus size={20} />
                            </button>
                            <input
                                type="number"
                                value={width}
                                onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                                className="flex-1 px-4 py-3 rounded-xl bg-background border border-white/10 text-white text-center text-xl font-bold focus:outline-none focus:border-brand-orange transition-colors"
                            />
                            <button
                                onClick={incrementWidth}
                                className="w-12 h-12 rounded-xl bg-background border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-400 uppercase">Height (mm)</label>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={decrementHeight}
                                className="w-12 h-12 rounded-xl bg-background border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center"
                            >
                                <Minus size={20} />
                            </button>
                            <input
                                type="number"
                                value={height}
                                onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                                className="flex-1 px-4 py-3 rounded-xl bg-background border border-white/10 text-white text-center text-xl font-bold focus:outline-none focus:border-brand-orange transition-colors"
                            />
                            <button
                                onClick={incrementHeight}
                                className="w-12 h-12 rounded-xl bg-background border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Fabric & Finish */}
            {renderSection('fabric', (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-400 uppercase">Fabric</label>
                        <select
                            value={selectedFabric?.id || ''}
                            onChange={(e) => setSelectedFabric(fabrics.find(f => f.id === e.target.value) || null)}
                            className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-brand-orange transition-colors"
                        >
                            <option value="">Select fabric...</option>
                            {fabrics.map(f => (
                                <option key={f.id} value={f.id}>{f.brand} - {f.name}</option>
                            ))}
                        </select>
                    </div>
                    {/* Color Swatches - simplified for now */}
                    <div className="flex gap-2 flex-wrap">
                        {['Charcoal', 'White', 'Slate Grey', 'Pearl', 'Sand', 'Midnight'].map(color => (
                            <button
                                key={color}
                                className={cn(
                                    "w-12 h-12 rounded-xl border-2 transition-all",
                                    selectedFabric?.name === color
                                        ? "border-brand-orange"
                                        : "border-white/10 hover:border-white/30"
                                )}
                                style={{ backgroundColor: color.toLowerCase() === 'charcoal' ? '#36454F' : color.toLowerCase() === 'white' ? '#f5f5f5' : color.toLowerCase() === 'slate grey' ? '#708090' : color.toLowerCase() === 'pearl' ? '#eae0c8' : color.toLowerCase() === 'sand' ? '#c2b280' : '#191970' }}
                                title={color}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {/* Component Colors */}
            {renderSection('components', (
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-400 uppercase">Pelmet Color</label>
                        <select
                            value={pelmetColor}
                            onChange={(e) => setPelmetColor(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-brand-orange transition-colors"
                        >
                            <option value="">Select...</option>
                            <option value="white">White</option>
                            <option value="black">Black</option>
                            <option value="matching">Matching Fabric</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-400 uppercase">Bottom Rail</label>
                        <select
                            value={bottomRailColor}
                            onChange={(e) => setBottomRailColor(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-brand-orange transition-colors"
                        >
                            <option value="">Select...</option>
                            <option value="white">White</option>
                            <option value="black">Black</option>
                            <option value="aluminium">Brushed Aluminium</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-400 uppercase">Chain/Cord</label>
                        <select
                            value={chainColor}
                            onChange={(e) => setChainColor(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-brand-orange transition-colors"
                        >
                            <option value="">Select...</option>
                            <option value="white">White</option>
                            <option value="grey">Grey</option>
                            <option value="stainless">Stainless Steel</option>
                        </select>
                    </div>
                </div>
            ))}

            {/* Installation */}
            {renderSection('installation', (
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white font-medium">Professional Installation</p>
                        <p className="text-sm text-slate-400">Includes fitting by certified installer</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-brand-orange font-bold">+$120</span>
                        <button
                            onClick={() => setIncludeInstall(!includeInstall)}
                            className={cn(
                                "w-14 h-8 rounded-full transition-all relative",
                                includeInstall ? "bg-brand-orange" : "bg-white/20"
                            )}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded-full bg-white absolute top-1 transition-all",
                                includeInstall ? "right-1" : "left-1"
                            )} />
                        </button>
                    </div>
                </div>
            ))}

            {/* Extras */}
            {renderSection('extras', (
                <div className="space-y-3">
                    {extras.map(extra => (
                        <label
                            key={extra.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-background border border-white/10 cursor-pointer hover:border-white/20 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={selectedExtras.includes(extra.id)}
                                    onChange={() => toggleExtra(extra.id)}
                                    className="w-5 h-5 rounded border-white/20 bg-transparent text-brand-orange focus:ring-brand-orange"
                                />
                                <span className="text-white">{extra.name}</span>
                            </div>
                            <span className="text-brand-orange font-medium">+${extra.price}</span>
                        </label>
                    ))}
                    {extras.length === 0 && (
                        <p className="text-slate-400 text-sm">No extras available for this category</p>
                    )}
                </div>
            ))}

            {/* Notes */}
            {renderSection('notes', (
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any special instructions or notes..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-orange transition-colors resize-none"
                />
            ))}

            {/* Add to Quote Button */}
            <Button
                onClick={() => {
                    // TODO: Calculate price and add item
                    onItemAdd({
                        id: Date.now().toString(),
                        room: roomName,
                        product: selectedProduct?.name,
                        width,
                        height,
                        fabric: selectedFabric?.name,
                        install: includeInstall,
                        extras: selectedExtras,
                        notes
                    });
                }}
                disabled={!roomName || !selectedProduct}
                className="w-full py-6 text-lg"
                size="lg"
            >
                Add to Quote
            </Button>
        </div>
    );
}
