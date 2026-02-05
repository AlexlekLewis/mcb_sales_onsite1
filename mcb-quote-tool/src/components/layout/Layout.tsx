import React, { useState } from 'react';
import {
    BarChart3,
    Users,
    FileText,
    Settings,
    Plus,
    Search,
    LayoutDashboard,
    Menu,
    X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import logo from '../../assets/Logo_Sq.png';

const SidebarItem = ({ icon: Icon, label, path, badge, onClick }: { icon: any, label: string, path: string, badge?: number, onClick?: () => void }) => {
    const location = useLocation();
    const isActive = location.pathname === path;

    return (
        <Link to={path} className="block mb-2" onClick={onClick}>
            <div className={cn(
                "relative flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group cursor-pointer overflow-hidden",
                isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-white"
            )}>
                {/* Active Background Glow */}
                {isActive && (
                    <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 bg-brand-orange/10 border border-brand-orange/20 rounded-xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}

                {/* Left Active Indicator */}
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[linear-gradient(135deg,#D97706,#F59E0B)] rounded-r-full shadow-orange-glow" />
                )}

                <div className="relative z-10 flex items-center gap-3 ml-2">
                    <Icon size={20} className={cn("transition-colors duration-300",
                        isActive
                            ? "text-brand-orange drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]"
                            : "text-slate-500 group-hover:text-white"
                    )} />
                    <span className={cn("font-medium text-sm transition-colors duration-300", isActive ? "text-white" : "")}>{label}</span>
                </div>
                {badge && (
                    <span className="relative z-10 bg-gradient-to-r from-brand-orange to-brand-orange-light shadow-orange-glow text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>
                )}
            </div>
        </Link>
    );
};

const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
        {/* Logo Area */}
        <div className="flex flex-col items-center justify-center py-6 mb-4">
            <div className="w-32 h-32 relative mb-2">
                <img
                    src={logo}
                    alt="MCB Logo"
                    className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(217,119,6,0.3)]"
                />
            </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto space-y-8 no-scrollbar">
            <div>
                <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</div>
                <SidebarItem icon={BarChart3} label="Dashboards" path="/" onClick={onItemClick} />
                <SidebarItem icon={Users} label="Clients" path="/clients" onClick={onItemClick} />
                <SidebarItem icon={FileText} label="Quotes" path="/quotes" onClick={onItemClick} />
            </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
            <Link to="/quotes/new" className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all" onClick={onItemClick}>
                <Plus size={20} />
                <span className="font-medium text-sm">Add new quote</span>
            </Link>
            <Link to="/admin" className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all" onClick={onItemClick}>
                <Settings size={20} />
                <span className="font-medium text-sm">Settings (Admin)</span>
            </Link>
        </div>

        {/* User Profile */}
        <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-brand-orange/20 flex items-center justify-center">
                <span className="text-xs font-bold text-brand-orange">AL</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Alex Lewis</p>
                <p className="text-xs text-slate-400 truncate">alex@mcb.com.au</p>
            </div>
        </div>
    </>
);

export function Layout({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-background text-white font-sans overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-shrink-0 flex-col border-r border-subtle bg-background-card p-4">
                <SidebarContent />
            </aside>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-40 md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        {/* Sidebar Drawer */}
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-72 bg-background-card p-4 z-50 flex flex-col md:hidden"
                        >
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                            <SidebarContent onItemClick={() => setIsMobileMenuOpen(false)} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
                {/* Top Header */}
                <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-background">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden p-2 text-slate-400 hover:text-white"
                    >
                        <Menu size={24} />
                    </button>

                    <h2 className="text-xl font-bold text-white hidden md:block">Dashboard</h2>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden sm:block">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-background-card border border-muted rounded-xl pl-10 pr-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-brand-orange/50 w-64 transition-all"
                            />
                        </div>
                        {/* Header Actions Removed to prevent duplication */}
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
