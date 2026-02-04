import React, { useState } from 'react';
import { QuoteBuilderLayout } from '../../components/layout/QuoteBuilderLayout';
import { QuoteBuilderForm } from './components/QuoteBuilderForm';
import { ItemChips } from './components/ItemChips';

interface QuoteItem {
    id: string;
    category: string;
    room: string;
    product: string;
    width: number;
    height: number;
    fabric?: string;
    install?: boolean;
    price: number;
}

export function QuoteBuilder() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
    const [activeItemId, setActiveItemId] = useState<string | null>(null);

    // Get items for current category
    const categoryItems = quoteItems.filter(item => item.category === activeCategory);
    const itemChips = categoryItems.map(item => ({
        id: item.id,
        label: item.room || 'Untitled',
        price: item.price
    }));

    const handleItemAdd = (itemData: any) => {
        const newItem: QuoteItem = {
            id: Date.now().toString(),
            category: activeCategory || '',
            room: itemData.room,
            product: itemData.product,
            width: itemData.width,
            height: itemData.height,
            fabric: itemData.fabric,
            install: itemData.install,
            price: 450 // TODO: Calculate actual price
        };

        setQuoteItems([...quoteItems, newItem]);
        setActiveItemId(newItem.id);
    };

    const handleAddNewItem = () => {
        // Reset form for new item
        setActiveItemId(null);
    };

    const totalAmount = quoteItems.reduce((sum, item) => sum + item.price, 0);

    return (
        <QuoteBuilderLayout
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
        >
            {activeCategory && (
                <div className="space-y-6">
                    {/* Item Chips */}
                    <ItemChips
                        items={itemChips}
                        activeItemId={activeItemId}
                        onItemSelect={setActiveItemId}
                        onAddItem={handleAddNewItem}
                    />

                    {/* Quote Builder Form */}
                    <QuoteBuilderForm
                        category={activeCategory}
                        onItemAdd={handleItemAdd}
                    />
                </div>
            )}
        </QuoteBuilderLayout>
    );
}
