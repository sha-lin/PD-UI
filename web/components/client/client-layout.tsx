"use client";

import { useState, type ReactNode } from "react";
import ClientSidebar from "./client-sidebar";
import { Menu } from "lucide-react";

interface ClientLayoutProps {
    children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <div className="flex min-h-screen">
            {/* Desktop sidebar */}
            <ClientSidebar onClose={() => setDrawerOpen(false)} isDrawerOpen={drawerOpen} />

            {/* Mobile backdrop */}
            {drawerOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/40 lg:hidden"
                    onClick={() => setDrawerOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
                {/* Mobile top bar */}
                <header className="lg:hidden sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-brand-blue text-white">
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="p-1.5 rounded hover:bg-white/10 transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-semibold">Print Duka Portal</span>
                </header>

                <main className="flex-1 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}

