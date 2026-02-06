import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    ArrowLeft,
    FileText,
    Send,
    Check,
    X,
    Trash2,
    Download,
    Loader2,
    Clock,
    CheckCircle,
    XCircle,
    Edit3,
    Eye
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Quote, QuoteItemFull } from './types';
import { QuoteEditor } from './QuoteEditor';
import { formatCurrency } from './margin-utils';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { QuotePDFDocument } from './components/pdf/QuotePDFDocument';
import { EmailQuoteModal } from './components/EmailQuoteModal';

interface QuoteItemLegacy {
    id: string;
    product_id: string;
    width: number;
    drop: number;
    quantity: number;
    calculated_price: number;
    location?: string;
    cost_price?: number;
    item_margin_percent?: number;
    sell_price?: number;
    discount_percent?: number;
    products?: {
        name: string;
        supplier: string;
        quote_config?: any;
        category?: string;
    };
    item_config?: {
        fabric_name?: string;
        price_group?: string;
        notes?: string;
        [key: string]: any;
    };
    pricing_note?: string; // Legacy field
    notes?: string;
}

const statusFlow = ['draft', 'sent', 'approved', 'rejected'];

const statusConfig: Record<string, { color: string; bgColor: string; icon: any; label: string }> = {
    draft: { color: 'text-slate-300', bgColor: 'bg-gray-500/10', icon: Clock, label: 'Draft' },
    sent: { color: 'text-blue-400', bgColor: 'bg-blue-500/10', icon: FileText, label: 'Sent' },
    approved: { color: 'text-green-400', bgColor: 'bg-green-500/10', icon: CheckCircle, label: 'Approved' },
    rejected: { color: 'text-red-400', bgColor: 'bg-red-500/10', icon: XCircle, label: 'Rejected' },
};

export function QuoteDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [quote, setQuote] = useState<Quote | null>(null);
    const [items, setItems] = useState<QuoteItemLegacy[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [emailModalOpen, setEmailModalOpen] = useState(false);

    const fetchQuote = async () => {
        if (!id) return;

        console.log('Fetching quote...', id);
        const { data: quoteData, error: quoteError } = await supabase
            .from('quotes')
            .select('*')
            .eq('id', id)
            .single();

        if (quoteError) console.error('Error fetching quote:', quoteError);
        console.log('Quote Data:', quoteData);

        if (quoteData) {
            setQuote({
                ...quoteData,
                overall_margin_percent: quoteData.overall_margin_percent ?? 0,
                show_gst: quoteData.show_gst ?? true
            });

            const { data: itemsData, error: itemsError } = await supabase
                .from('quote_items')
                .select('*, products(name, supplier, quote_config)')
                .eq('quote_id', id);

            if (itemsError) console.error('Error fetching items:', itemsError);
            console.log('Items Data:', itemsData);

            if (itemsData) setItems(itemsData);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchQuote();
    }, [id]);

    const updateStatus = async (newStatus: string) => {
        if (!quote) return;
        setUpdating(true);

        await supabase
            .from('quotes')
            .update({ status: newStatus })
            .eq('id', quote.id);

        setQuote({ ...quote, status: newStatus as Quote['status'] });
        setUpdating(false);
    };

    const deleteQuote = async () => {
        if (!quote || !confirm('Are you sure you want to delete this quote?')) return;

        await supabase.from('quotes').delete().eq('id', quote.id);
        navigate('/quotes');
    };

    const updateItemMargin = async (itemId: string, newMargin: number) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        // Optimistic update
        const updatedItems = items.map(i =>
            i.id === itemId ? { ...i, item_margin_percent: newMargin } : i
        );
        setItems(updatedItems);

        try {
            // Recalculate price logic would ideally happen here or on server
            // For now just saving the margin
            const { error } = await supabase
                .from('quote_items')
                .update({ item_margin_percent: newMargin })
                .eq('id', itemId);

            if (error) throw error;

            // Optionally refetch to get server-calculated prices if using triggers/functions
            fetchQuote();
        } catch (error) {
            console.error('Error updating margin:', error);
            // Revert on error
            fetchQuote();
        }
    };

    const sendEmail = async (email: string, message: string) => {
        if (!quote) return;

        try {
            // 1. Generate PDF Blob
            const blob = await pdf(<QuotePDFDocument quote={quote} items={items} />).toBlob();

            // 2. Convert to Base64 (simplest for Edge Function transport)
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64data = reader.result?.toString().split(',')[1];

                // 3. Call Edge Function
                const { data, error } = await supabase.functions.invoke('send-quote', {
                    body: {
                        quoteId: quote.id,
                        email,
                        message,
                        pdfBase64: base64data,
                        customerName: quote.customer_name
                    }
                });

                if (error) throw error;

                alert('Email sent successfully!');
                updateStatus('sent');
            };
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email. Check console for details.');
            throw error;
        }
    };

    const formatSize = (item: QuoteItemLegacy) => {
        const config = item.products?.quote_config;
        const showWidth = config?.show_width ?? true;
        const showDrop = config?.show_drop ?? true;
        const labelWidth = config?.label_width ? config.label_width.replace(' (mm)', '') : 'W';
        const labelDrop = config?.label_drop ? config.label_drop.replace(' (mm)', '') : 'D';

        if (showWidth && showDrop) return `${item.width}${labelWidth} x ${item.drop}${labelDrop}`;
        if (showWidth) return `${item.width}mm ${labelWidth}`;
        if (showDrop) return `${item.drop}mm ${labelDrop}`;
        return '-';
    };



    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-brand-orange" size={32} />
            </div>
        );
    }

    if (!quote) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-300">Quote not found</p>
                <Link to="/quotes" className="text-brand-orange hover:text-brand-orange-light mt-4 inline-block">Back to Quotes</Link>
            </div>
        );
    }

    const status = statusConfig[quote.status] || statusConfig.draft;
    const StatusIcon = status.icon;

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/quotes')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <ArrowLeft size={20} className="text-slate-300" />
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">{quote.customer_name || 'Unnamed Quote'}</h2>
                    <p className="text-slate-300">Created {new Date(quote.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium", status.bgColor, status.color)}>
                    <StatusIcon size={14} />
                    {status.label}
                </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
                {/* Edit/View Toggle */}
                <button
                    onClick={() => setEditMode(!editMode)}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-2 border",
                        editMode
                            ? "bg-brand-orange text-white border-brand-orange"
                            : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                    )}
                >
                    {editMode ? <Eye size={16} /> : <Edit3 size={16} />}
                    {editMode ? 'View Mode' : 'Edit Quote'}
                </button>

                {quote.status === 'draft' && (
                    <button
                        onClick={() => updateStatus('sent')}
                        disabled={updating}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2"
                    >
                        <Send size={16} />
                        Mark as Sent
                    </button>
                )}
                {quote.status === 'sent' && (
                    <>
                        <button
                            onClick={() => updateStatus('approved')}
                            disabled={updating}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2"
                        >
                            <Check size={16} />
                            Approve
                        </button>
                        <button
                            onClick={() => updateStatus('rejected')}
                            disabled={updating}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2"
                        >
                            <X size={16} />
                            Reject
                        </button>
                    </>
                )}
                {/* Only render PDF Link when fully loaded to avoid render loops/crashes */}
                {!loading && quote && items.length > 0 && (
                    <PDFDownloadLink
                        document={<QuotePDFDocument quote={quote} items={items} />}
                        fileName={`Quote - ${quote.customer_name}.pdf`}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2 border border-white/10"
                    >
                        {({ loading: pdfLoading }) => (
                            <>
                                {pdfLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                {pdfLoading ? 'Generating...' : 'Download PDF'}
                            </>
                        )}
                    </PDFDownloadLink>
                )}
                <button
                    onClick={() => setEmailModalOpen(true)}
                    className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-brand-orange/20"
                >
                    <Send size={16} />
                    Email Quote
                </button>
                <button
                    onClick={deleteQuote}
                    className="px-4 py-2 bg-white/5 hover:bg-red-600/20 text-red-400 text-sm font-medium rounded-xl transition-all flex items-center gap-2 border border-white/10 ml-auto"
                >
                    <Trash2 size={16} />
                    Delete
                </button>
            </div>

            {/* Quote Content - Edit Mode or View Mode */}
            {
                editMode ? (
                    <QuoteEditor
                        quoteId={id!}
                        onSave={() => {
                            fetchQuote();
                            setEditMode(false);
                        }}
                    />
                ) : (
                    /* View Mode - Simple Table */
                    <div className="bg-background-card rounded-2xl border border-white/5 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1000px] md:min-w-0">
                                <thead>
                                    <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-wider">
                                        <th className="p-4 font-medium">Window</th>
                                        <th className="p-4 font-medium">Width</th>
                                        <th className="p-4 font-medium">Drop</th>
                                        <th className="p-4 font-medium">Price Group</th>
                                        <th className="p-4 font-medium">Gross Margin</th>
                                        <th className="p-4 font-medium">Discount %</th>
                                        <th className="p-4 font-medium">Discount $</th>
                                        <th className="p-4 font-medium">Fabric</th>
                                        <th className="p-4 font-medium">Install Item(s)</th>
                                        <th className="p-4 font-medium">Control Side</th>
                                        <th className="p-4 font-medium">Bottom Rail Type</th>
                                        <th className="p-4 font-medium">Fitting</th>
                                        <th className="p-4 font-medium">Notes</th>
                                        <th className="p-4 font-medium text-right">Final Price (Incl. GST)</th>
                                        <th className="p-4 font-medium text-center">More</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan={15} className="px-6 py-8 text-center text-slate-400">No items in this quote</td>
                                        </tr>
                                    ) : (
                                        items.map((item, index) => {
                                            const config = item.products?.quote_config;
                                            // Helper to safely access nested properties that might not exist on Legacy type but exist in DB
                                            const itemAny = item as any;
                                            const notes = itemAny.notes || itemAny.pricing_note || '';
                                            const margin = itemAny.item_margin_percent ?? quote?.overall_margin_percent ?? 0;
                                            const discountPercent = itemAny.discount_percent || 0;
                                            const discountAmount = item.calculated_price * (discountPercent / 100);

                                            // Parse potential JSON in notes or other fields if stored that way, 
                                            // but for now we'll assume direct access or placeholders

                                            return (
                                                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="p-4 text-white font-medium">
                                                        <div>{item.location || `Room ${index + 1}`}</div>
                                                        <div className="text-slate-500 text-xs">Window 1</div>
                                                    </td>
                                                    <td className="p-4 text-slate-300">{item.width}</td>
                                                    <td className="p-4 text-slate-300">{item.drop}</td>
                                                    <td className="p-4 text-slate-300">
                                                        {itemAny.item_config?.price_group || 'Group 1'}
                                                    </td>
                                                    <td className="p-4 text-slate-300">
                                                        {margin}%
                                                    </td>
                                                    <td className="p-4 text-slate-300">{discountPercent.toFixed(2)}%</td>
                                                    <td className="p-4 text-slate-300">${discountAmount.toFixed(2)}</td>
                                                    <td className="p-4 text-slate-300 max-w-[250px] truncate" title={itemAny.item_config?.fabric_name}>
                                                        {itemAny.item_config?.fabric_name || 'Standard'}
                                                    </td>
                                                    <td className="p-4 text-slate-300 text-xs max-w-[200px]">
                                                        {/* Placeholder for install items logic */}
                                                        <div>Inside Mount</div>
                                                        <div>Standard Timber</div>
                                                    </td>
                                                    <td className="p-4 text-slate-300">Left</td>
                                                    <td className="p-4 text-slate-300">Oval</td>
                                                    <td className="p-4 text-slate-300">Inside Mount</td>
                                                    <td className="p-4 text-slate-300 max-w-[200px] truncate" title={notes}>
                                                        {notes || '-'}
                                                    </td>
                                                    <td className="p-4 text-green-400 font-bold text-right">
                                                        ${(item.calculated_price * 1.1).toFixed(2)}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                                            <div className="flex flex-col gap-0.5 items-center">
                                                                <span className="w-1 h-1 bg-current rounded-full"></span>
                                                                <span className="w-1 h-1 bg-current rounded-full"></span>
                                                                <span className="w-1 h-1 bg-current rounded-full"></span>
                                                            </div>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }
            {/* Email Modal */}
            <EmailQuoteModal
                isOpen={emailModalOpen}
                onClose={() => setEmailModalOpen(false)}
                onSend={sendEmail}
                customerName={quote.customer_name}
            />
        </div >
    );
}
