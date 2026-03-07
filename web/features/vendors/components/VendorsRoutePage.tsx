"use client";

import type { ReactElement } from "react";
import AdminLayout from "@/components/admin/admin-layout";
import VendorsWorkspace from "@/features/vendors/components/VendorsWorkspace";

type VendorsRouteContext = "staff" | "production";

interface VendorsRoutePageProps {
    context: VendorsRouteContext;
}

interface VendorsRouteConfig {
    breadcrumbHref: string;
    breadcrumbLabel: string;
    title: string;
    description: string;
    addVendorHref: string;
    editVendorBaseHref: string;
}

const VENDORS_ROUTE_CONFIG: Record<VendorsRouteContext, VendorsRouteConfig> = {
    staff: {
        breadcrumbHref: "/staff",
        breadcrumbLabel: "Staff Portal",
        title: "Vendors",
        description: "Manage suppliers, pricing capacity, and performance",
        addVendorHref: "/staff/vendors/new",
        editVendorBaseHref: "/staff/vendors",
    },
    production: {
        breadcrumbHref: "/production-team",
        breadcrumbLabel: "Production Team",
        title: "Production Vendors",
        description: "Manage production vendors, capacity, and performance.",
        addVendorHref: "/production-team/vendors/new",
        editVendorBaseHref: "/production-team/vendors",
    },
};

export default function VendorsRoutePage({ context }: VendorsRoutePageProps): ReactElement {
    const config = VENDORS_ROUTE_CONFIG[context];

    return (
        <AdminLayout>
            <VendorsWorkspace
                breadcrumbHref={config.breadcrumbHref}
                breadcrumbLabel={config.breadcrumbLabel}
                sectionLabel="Vendors"
                title={config.title}
                description={config.description}
                addVendorHref={config.addVendorHref}
                editVendorBaseHref={config.editVendorBaseHref}
            />
        </AdminLayout>
    );
}
