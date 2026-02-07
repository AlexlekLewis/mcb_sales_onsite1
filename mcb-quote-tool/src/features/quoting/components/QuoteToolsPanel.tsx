import React, { useState, useEffect } from 'react';
import { Camera, Mic, ChevronDown, ChevronUp, Image as ImageIcon, FileText } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { supabase } from '../../../lib/supabase';
import { CameraCapture } from '../../tools/CameraCapture';
import { VoiceRecorder } from '../../tools/VoiceRecorder';

interface QuoteToolsPanelProps {
    quoteId: string;
}

type ActiveTab = 'photos' | 'voice' | null;

export function QuoteToolsPanel({ quoteId }: QuoteToolsPanelProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>(null);
    const [photosCount, setPhotosCount] = useState(0);
    const [notesCount, setNotesCount] = useState(0);

    // Fetch counts for badge display
    useEffect(() => {
        const fetchCounts = async () => {
            const [photosRes, notesRes] = await Promise.all([
                supabase
                    .from('notes')
                    .select('id', { count: 'exact', head: true })
                    .eq('type', 'photo')
                    .eq('quote_id', quoteId),
                supabase
                    .from('notes')
                    .select('id', { count: 'exact', head: true })
                    .eq('type', 'voice')
                    .eq('quote_id', quoteId),
            ]);

            setPhotosCount(photosRes.count ?? 0);
            setNotesCount(notesRes.count ?? 0);
        };

        fetchCounts();
    }, [quoteId]);

    const isExpanded = activeTab !== null;

    const toggleTab = (tab: ActiveTab) => {
        setActiveTab(prev => (prev === tab ? null : tab));
    };

    return (
        <div className={cn(
            "bg-background-card rounded-2xl border overflow-hidden transition-all",
            isExpanded ? "border-brand-orange/20" : "border-white/5"
        )}>
            {/* Toolbar — always visible */}
            <div className={cn("flex items-center", isExpanded ? "border-b border-white/5" : "")}>
                <button
                    onClick={() => toggleTab('photos')}
                    className={cn(
                        'flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 text-sm font-medium transition-all',
                        activeTab === 'photos'
                            ? 'text-brand-orange bg-brand-orange/5 border-b-2 border-brand-orange'
                            : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                    )}
                >
                    <Camera size={18} />
                    <span>Photos</span>
                    {photosCount > 0 && (
                        <span className={cn(
                            'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                            activeTab === 'photos'
                                ? 'bg-brand-orange/20 text-brand-orange'
                                : 'bg-white/10 text-slate-400'
                        )}>
                            {photosCount}
                        </span>
                    )}
                    {activeTab === 'photos' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                <div className="w-px h-8 bg-white/5" />

                <button
                    onClick={() => toggleTab('voice')}
                    className={cn(
                        'flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 text-sm font-medium transition-all',
                        activeTab === 'voice'
                            ? 'text-brand-orange bg-brand-orange/5 border-b-2 border-brand-orange'
                            : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                    )}
                >
                    <Mic size={18} />
                    <span>Voice Notes</span>
                    {notesCount > 0 && (
                        <span className={cn(
                            'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                            activeTab === 'voice'
                                ? 'bg-brand-orange/20 text-brand-orange'
                                : 'bg-white/10 text-slate-400'
                        )}>
                            {notesCount}
                        </span>
                    )}
                    {activeTab === 'voice' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="p-4">
                    {activeTab === 'photos' && (
                        <CameraCapture quoteId={quoteId} compact />
                    )}
                    {activeTab === 'voice' && (
                        <VoiceRecorder quoteId={quoteId} compact />
                    )}

                    {/* Collapse bar */}
                    <button
                        onClick={() => setActiveTab(null)}
                        className="w-full mt-3 py-2 text-xs text-slate-500 hover:text-white flex items-center justify-center gap-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <ChevronUp size={14} />
                        Collapse
                    </button>
                </div>
            )}
        </div>
    );
}
