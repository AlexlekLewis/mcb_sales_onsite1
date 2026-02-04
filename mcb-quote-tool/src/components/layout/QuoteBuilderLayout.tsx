import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2 } from 'lucide-react';
import { ClientNavRail } from './ClientNavRail';
import { ProductTabBar, ProductTab } from './ProductTabBar';
import { QuoteSummarySheet } from '../../features/quoting/components/QuoteSummarySheet';
import { supabase } from '../../lib/supabase';

interface Client {
    id: string;
    name: string;
    initials: string;
}

interface QuoteBuilderLayoutProps {
    children: React.ReactNode;
    activeCategory: string | null;
    onCategoryChange: (category: string) => void;
}

export function QuoteBuilderLayout({ children, activeCategory, onCategoryChange }: QuoteBuilderLayoutProps) {
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [selectedClient, setSelectedClient] = useState<{ id: string; name: string } | null>(null);
    const [tabs, setTabs] = useState<ProductTab[]>([]);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

    const navigate = useNavigate();
    const { clientId } = useParams();

    // Fetch clients on mount
    useEffect(() => {
        async function fetchClients() {
            const { data, error } = await supabase
                .from('clients')
                .select('id, name')
                .order('created_at', { ascending: false })
                .limit(10);

            if (!error && data) {
                const clientsWithInitials = data.map(c => ({
                    id: c.id,
                    name: c.name,
                    initials: c.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                }));
                setClients(clientsWithInitials);

                // Set initial client from URL or first client
                if (clientId) {
                    setSelectedClientId(clientId);
                    const client = clientsWithInitials.find(c => c.id === clientId);
                    if (client) setSelectedClient({ id: client.id, name: client.name });
                } else if (clientsWithInitials.length > 0) {
                    setSelectedClientId(clientsWithInitials[0].id);
                    setSelectedClient({ id: clientsWithInitials[0].id, name: clientsWithInitials[0].name });
                }
            }
        }
        fetchClients();
    }, [clientId]);

    const handleClientSelect = (id: string) => {
        setSelectedClientId(id);
        const client = clients.find(c => c.id === id);
        if (client) {
            setSelectedClient({ id: client.id, name: client.name });
            navigate(`/quotes/builder/${id}`);
        }
    };

    const handleAddTab = (category: string) => {
        const categoryLabels: Record<string, string> = {
            'external-blinds': 'External Blinds',
            'internal-blinds': 'Internal Blinds',
            'plantation-shutters': 'Plantation Shutters',
            'security-doors': 'Security Doors'
        };

        const newTab: ProductTab = {
            id: `${category}-${Date.now()}`,
            category,
            label: categoryLabels[category] || category
        };

        setTabs([...tabs, newTab]);
        setActiveTabId(newTab.id);
        onCategoryChange(category);
    };

    const handleTabClose = (tabId: string) => {
        const newTabs = tabs.filter(t => t.id !== tabId);
        setTabs(newTabs);
        if (activeTabId === tabId) {
            setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
        }
    };

    const handleTabSelect = (tabId: string) => {
        setActiveTabId(tabId);
        const tab = tabs.find(t => t.id === tabId);
        if (tab) onCategoryChange(tab.category);
    };

    return (
        <div className="flex h-screen bg-background text-white overflow-hidden">
            {/* Slim Client Nav Rail */}
            <ClientNavRail
                clients={clients}
                selectedClientId={selectedClientId}
                onClientSelect={handleClientSelect}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header with Client Name */}
                <header className="flex items-center gap-4 px-6 py-4 bg-background border-b border-subtle">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-white">
                            {selectedClient?.name || 'Select Client'}
                        </h1>
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                            <Edit2 size={16} />
                        </button>
                    </div>
                </header>

                {/* Product Tab Bar */}
                <ProductTabBar
                    tabs={tabs}
                    activeTabId={activeTabId}
                    onTabSelect={handleTabSelect}
                    onTabClose={handleTabClose}
                    onAddTab={handleAddTab}
                />

                {/* Quote Builder Content */}
                <div className="flex-1 overflow-y-auto p-6 pb-24">
                    {activeTabId ? (
                        children
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="text-6xl mb-4">📋</div>
                            <h2 className="text-xl font-semibold text-white mb-2">Start Building Your Quote</h2>
                            <p className="text-slate-400 mb-6">Click the + button above to add a product category</p>
                        </div>
                    )}
                </div>

                {/* Quote Summary Bottom Sheet */}
                <QuoteSummarySheet
                    isExpanded={isSummaryExpanded}
                    onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)}
                    quoteItems={[]} // Will be populated with actual items
                    totalAmount={0}
                />
            </div>
        </div>
    );
}
