import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    Plus,
    LogOut,
    Menu,
    ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import logo from '../../assets/Logo_iso.png';
import { supabase } from '../../lib/supabase';

interface SidebarItemProps {
    icon: any;
    label: string;
    path: string;
    active?: boolean;
}

const SidebarItem = ({ icon: Icon, label, path }: SidebarItemProps) => {
    return (
        <NavLink
            to={path}
            className={({ isActive }) => cn(
                "relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 group",
                isActive
                    ? "text-white bg-brand shadow-copper-glow"
                    : "text-text-muted hover:text-white hover:bg-white/5"
            )}
            title={label}
        >
            <Icon size={20} className="relative z-10" />

            {/* Tooltip on hover (simple absolute positioning) */}
            <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-white/10">
                {label}
            </div>
        </NavLink>
    );
};

export function SlimSidebar() {

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            window.location.href = '/login';
        }
    };

    return (
        <aside className="w-[80px] flex flex-col items-center py-6 bg-[#2C2C2C] border-r border-white/5 h-screen z-20 backdrop-blur-md">
            {/* Logo */}
            {/* Logo */}
            <div className="mb-8 p-0">
                <div className="w-12 h-12 flex items-center justify-center">
                    <img src={logo} alt="MCB" className="w-full h-full object-contain drop-shadow-copper-glow" />
                </div>
            </div>

            {/* Main Nav */}
            <nav className="flex-1 w-full px-4 flex flex-col items-center gap-3">
                <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/" />
                <SidebarItem icon={Users} label="Clients" path="/clients" />
                <SidebarItem icon={FileText} label="Quotes" path="/quotes" />

                <div className="my-2 w-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <SidebarItem icon={Plus} label="New Quote" path="/quotes/new" />
            </nav>

            {/* Bottom Actions */}
            <div className="w-full px-4 flex flex-col items-center gap-3 mb-6">
                <SidebarItem icon={Settings} label="Admin Settings" path="/admin" />
                <button
                    onClick={handleLogout}
                    className="w-12 h-12 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>

            {/* Profile Avatar */}
            <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/40 flex items-center justify-center text-xs font-bold text-brand shadow-[0_0_10px_rgba(193,121,55,0.2)] cursor-pointer hover:ring-2 ring-brand/50 transition-all">
                AL
            </div>
        </aside>
    );
}
