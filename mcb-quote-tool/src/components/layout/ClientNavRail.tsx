import React from 'react';
import { Plus, Check, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';

interface Client {
    id: string;
    name: string;
    initials: string;
}

interface ClientNavRailProps {
    clients: Client[];
    selectedClientId: string | null;
    onClientSelect: (clientId: string) => void;
}

export function ClientNavRail({ clients, selectedClientId, onClientSelect }: ClientNavRailProps) {
    return (
        <div className="w-16 flex-shrink-0 bg-background-card border-r border-subtle flex flex-col items-center py-4">
            {/* Client Avatars */}
            <div className="flex-1 flex flex-col items-center gap-3 overflow-y-auto no-scrollbar">
                {clients.map((client) => {
                    const isActive = selectedClientId === client.id;
                    return (
                        <button
                            key={client.id}
                            onClick={() => onClientSelect(client.id)}
                            className={cn(
                                "relative w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                                isActive
                                    ? "bg-[linear-gradient(135deg,#D97706,#F59E0B)] text-white shadow-orange-glow scale-110"
                                    : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                            )}
                            title={client.name}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-client-ring"
                                    className="absolute inset-0 rounded-full border-2 border-white/20"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{client.initials}</span>
                        </button>
                    );
                })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-subtle mt-4">
                <Link
                    to="/admin"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    title="Admin Settings"
                >
                    <Settings size={20} />
                </Link>
            </div>
        </div>
    );
}
