"use client";

import { ReactNode } from "react";
import AdminSidebar from "./admin-sidebar";

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="flex min-h-screen">
            <AdminSidebar />
            <main className="ml-64 flex-1 bg-gray-50">
                {children}
            </main>
        </div>
    );
}
