import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import {
    LayoutDashboard,
    Settings,
    Blinds,
    FoldVertical,
    Sun,
    Table,
    Shield,
    Hammer,
    Percent,
    PanelTop
} from 'lucide-react';

const AdminNavItem = ({ to, icon: Icon, label, end = false, className }: { to: string, icon: any, label: string, end?: boolean, className?: string }) => (
    <NavLink to={to} end={end} className={cn("block mb-2", className)}>
        {({ isActive }) => (
            <div className={cn(
                "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden cursor-pointer",
                isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
            )}>
                {isActive && (
                    <motion.div
                        layoutId="admin-sidebar-active"
                        className="absolute inset-0 bg-brand-orange/10 border border-brand-orange/20 rounded-xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[linear-gradient(135deg,#D97706,#F59E0B)] rounded-r-full shadow-orange-glow" />
                )}
                <div className="relative z-10 flex items-center gap-3">
                    <Icon size={20} className={cn("transition-colors duration-300",
                        isActive
                            ? "text-brand-orange drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]"
                            : "text-slate-500 group-hover:text-white"
                    )} />
                    <span className="font-medium text-sm">{label}</span>
                </div>
            </div>
        )}
    </NavLink>
);

export function AdminSidebar() {
    return (
        <div className="w-64 bg-background-card border-r border-white/5 flex flex-col h-full overflow-y-auto no-scrollbar">
            <div className="p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[linear-gradient(135deg,#D97706,#F59E0B)] flex items-center justify-center shadow-orange-glow border border-white/10">
                        <Settings size={18} className="text-white" />
                    </div>
                    Admin Portal
                </h2>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                <AdminNavItem to="/admin" icon={LayoutDashboard} label="Dashboard" end />

                <div className="pt-4 pb-2">
                    <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Products</p>
                </div>

                <AdminNavItem to="/admin/products?category=Internal%20Blinds" icon={Blinds} label="Internal Blinds" />
                <AdminNavItem to="/admin/products?category=Curtains" icon={FoldVertical} label="Curtains" />
                <AdminNavItem to="/admin/products?category=Plantation%20Shutters" icon={Table} label="Plantation Shutters" />
                <AdminNavItem to="/admin/products?category=Roller%20Shutters" icon={PanelTop} label="Roller Shutters" />
                <AdminNavItem to="/admin/products?category=External%20Blinds" icon={Sun} label="External Blinds" />
                <AdminNavItem to="/admin/products?category=Security%20Doors" icon={Shield} label="Security Doors" />

                <div className="pt-4 pb-2">
                    <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Configuration</p>
                </div>

                <AdminNavItem to="/admin/installation" icon={Hammer} label="Installation" />
                <AdminNavItem to="/admin/discounts" icon={Percent} label="Discounts" />
            </nav>

            <div className="p-4 border-t border-white/5">
                <NavLink
                    to="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-colors border border-transparent hover:border-white/5"
                >
                    <span>Back to App</span>
                </NavLink>
            </div>
        </div>
    );
}
