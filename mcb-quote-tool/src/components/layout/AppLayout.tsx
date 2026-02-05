import React from 'react';
import { SlimSidebar } from './SlimSidebar';
import { motion } from 'framer-motion';

interface AppLayoutProps {
    children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex h-screen bg-charcoal-gradient text-text-primary font-sans overflow-hidden">
            <SlimSidebar />

            <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden relative">
                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-20 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-[1600px] mx-auto h-full"
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
