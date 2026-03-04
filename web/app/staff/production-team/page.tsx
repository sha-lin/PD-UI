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
        label: "Clients",
        description: "Manage client intake and handoff information.",
        href: "/staff/clients",
    },
    {
        label: "Quotes",
        description: "Prepare costing and quotations.",
        href: "/staff/quotes",
    },
    {
        label: "Jobs",
        description: "Track production execution from start to completion.",
        href: "/staff/jobs",
    },
    {
        label: "Processes",
        description: "Maintain production workflows and steps.",
        href: "/staff/processes",
    },
    {
        label: "Quality Control",
        description: "Review checks and production quality status.",
        href: "/staff/quality-control",
    },
    {
        label: "Deliveries",
        description: "Monitor dispatch and delivery progress.",
        href: "/staff/production-team/deliveries",
    },
    {
        label: "Analytics",
        description: "Track operational metrics, quality, and team performance.",
        href: "/staff/production-team/analytics",
    },
    {
        label: "Notifications",
        description: "Review production alerts and team notifications.",
        href: "/staff/production-team/notifications",
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
