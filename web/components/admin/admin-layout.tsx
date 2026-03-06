"use client";

import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminSidebar from "./admin-sidebar";
import ProductionSidebar from "@/components/production/production-sidebar";
import { checkSession } from "@/lib/api/auth";

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { data: session } = useQuery({
        queryKey: ["staff-session"],
        queryFn: checkSession,
        staleTime: 300_000,
        retry: false,
    });

    const Sidebar =
        session?.user?.portal_role === "production_team"
            ? ProductionSidebar
            : AdminSidebar;

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="ml-64 flex-1 bg-gray-50">
                {children}
            </main>
        </div>
    );
}
