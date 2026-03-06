"use client";

import type { ReactElement } from "react";
import VendorLayout from "@/components/vendor/vendor-layout";

export default function VendorDashboardPage(): ReactElement {
    return (
        <VendorLayout>
            <header className="bg-white shadow">
                <div className="px-8 py-4">
                    <h1 className="text-2xl font-bold text-brand-black">Vendor Dashboard</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage your vendor operations and track performance
                    </p>
                </div>
            </header>

            <main className="p-8 space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Vendor Portal</h2>
                        <p className="text-gray-600">Dashboard features coming soon</p>
                    </div>
                </div>
            </main>
        </VendorLayout>
    );
}
