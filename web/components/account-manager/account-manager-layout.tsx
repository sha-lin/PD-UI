"use client";

import { ReactNode } from "react";
import AccountManagerSidebar from "./account-manager-sidebar";

interface AccountManagerLayoutProps {
    children: ReactNode;
}

export default function AccountManagerLayout({ children }: AccountManagerLayoutProps) {
    return (
        <div className="flex min-h-screen">
            <AccountManagerSidebar />
            <main className="ml-64 flex-1 bg-gray-50">
                {children}
            </main>
        </div>
    );
}
