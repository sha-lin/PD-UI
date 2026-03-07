"use client";

import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminSidebar from "./admin-sidebar";
import ProductionLayout from "@/components/production/production-layout";
import { checkSession } from "@/lib/api/auth";
import { Menu } from "lucide-react";

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { data: session } = useQuery({
        queryKey: ["staff-session"],
        queryFn: checkSession,
        staleTime: 300_000,
        retry: false,
    });

    if (session?.user?.portal_role === "production_team") {
        return <ProductionLayout>{children}</ProductionLayout>;
    }

    return (
        <div className="flex min-h-screen">
            <AdminSidebar onClose={() => setDrawerOpen(false)} isDrawerOpen={drawerOpen} />

            {drawerOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/40 lg:hidden"
                    onClick={() => setDrawerOpen(false)}
                />
            )}

            <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
                <header className="lg:hidden sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-brand-blue text-white">
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="p-1.5 rounded hover:bg-white/10 transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-semibold">Print Duka - Admin</span>
                </header>

                <main className="flex-1 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}
