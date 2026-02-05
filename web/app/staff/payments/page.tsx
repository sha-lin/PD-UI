"use client";

import AdminLayout from "@/components/admin/admin-layout";

export default function PaymentsPage() {
    return (
        <AdminLayout>
            <header className="bg-white shadow">
                <div className="px-8 py-4">
                    <h1 className="text-2xl font-bold text-brand-black">Payments</h1>
                </div>
            </header>
            <main className="p-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">Payment tracking coming soon...</p>
                </div>
            </main>
        </AdminLayout>
    );
}
