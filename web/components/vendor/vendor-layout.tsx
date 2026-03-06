"use client";

import { ReactNode } from "react";
import VendorSidebar from "./vendor-sidebar";

interface VendorLayoutProps {
    children: ReactNode;
}

export default function VendorLayout({ children }: VendorLayoutProps) {
    return (
        <div className="flex min-h-screen">
            <VendorSidebar />
            <main className="ml-64 flex-1 bg-gray-50">
                {children}
            </main>
        </div>
    );
}
