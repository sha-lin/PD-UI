"use client";

import type { ReactElement } from "react";
import AccountManagerLayout from "@/components/account-manager/account-manager-layout";

export default function LeadIntakePage(): ReactElement {
    return (
        <AccountManagerLayout>
            <header className="bg-white shadow">
                <div className="px-8 py-4">
                    <h1 className="text-2xl font-bold text-brand-black">Lead Intake</h1>
                </div>
            </header>

            <main className="p-8 space-y-5">
                <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
                    <p className="text-gray-700">Lead Intake - Coming Soon</p>
                </div>
            </main>
        </AccountManagerLayout>
    );
}
