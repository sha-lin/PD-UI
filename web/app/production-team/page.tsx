"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/admin-layout";

interface ProductionLink {
    label: string;
    description: string;
    href: string;
}

const productionLinks: ProductionLink[] = [
    {
        label: "Dashboard",
        description: "Monitor production KPIs, alerts, and activity trends.",
        href: "/production-team/dashboard",
    },
    {
        label: "Clients",
        description: "Manage client intake and handoff information.",
        href: "/staff/clients",
    },
    {
        label: "Quotes",
        description: "Prepare costing and quotations.",
        href: "/staff/production/my-quotes",
    },
    {
        label: "Product Catalog",
        description: "Maintain product offerings, pricing, and catalog visibility.",
        href: "/staff/production/products",
    },
    {
        label: "LPOs",
        description: "Track local purchase orders and update fulfillment status.",
        href: "/staff/production/lpos",
    },
    {
        label: "Jobs",
        description: "Track production execution from start to completion.",
        href: "/staff/production/my-jobs",
    },
    {
        label: "Processes",
        description: "Maintain production workflows and steps.",
        href: "/production-team/processes",
    },
    {
        label: "Delivery Handover",
        description: "Run QC checks and complete handoff to Account Management for dispatch.",
        href: "/production-team/deliveries",
    },
    {
        label: "Analytics",
        description: "Track operational metrics, quality, and team performance.",
        href: "/production-team/analytics",
    },
    {
        label: "Notifications",
        description: "Review production alerts and team notifications.",
        href: "/production-team/notifications",
    },
];

export default function ProductionTeamPage(): ReactElement {
    return (
        <AdminLayout>
            <header className="border-b border-gray-200 bg-white">
                <div className="px-8 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Production Team</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Workspace for production workflows, costing, quotations, and follow-through.
                    </p>
                </div>
            </header>

            <main className="p-8">
                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {productionLinks.map((item: ProductionLink): ReactElement => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-brand-blue"
                        >
                            <h2 className="text-lg font-semibold text-gray-900">{item.label}</h2>
                            <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                        </Link>
                    ))}
                </section>
            </main>
        </AdminLayout>
    );
}
