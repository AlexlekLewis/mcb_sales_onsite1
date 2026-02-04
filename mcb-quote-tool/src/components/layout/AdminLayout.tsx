import React, { ReactNode } from 'react';
import { AdminSidebar } from '../../features/admin/components/AdminSidebar';

interface AdminLayoutProps {
    children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="flex h-screen bg-background text-white overflow-hidden font-sans">
            <AdminSidebar />
            <main className="flex-1 overflow-auto bg-background">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
