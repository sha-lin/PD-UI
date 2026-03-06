"use client";

import { ReactNode } from "react";
import ClientSidebar from "./client-sidebar";

interface ClientLayoutProps {
    children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    return (
        <div className="flex min-h-screen">
            <ClientSidebar />
            <main className="ml-64 flex-1 bg-gray-50">
                {children}
            </main>
        </div>
    );
}

