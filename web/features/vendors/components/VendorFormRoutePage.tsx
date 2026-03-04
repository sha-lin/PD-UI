"use client";

import { useMemo } from "react";
import type { ReactElement } from "react";
import { useParams } from "next/navigation";
import AdminLayout from "@/components/admin/admin-layout";
import VendorFormWorkspace from "@/features/vendors/components/VendorFormWorkspace";

type VendorFormRouteContext = "staff" | "production";
type VendorFormRouteMode = "create" | "edit";

interface VendorFormRoutePageProps {
    context: VendorFormRouteContext;
    mode: VendorFormRouteMode;
}

interface VendorFormRouteConfig {
    homeLabel: string;
    homeHref: string;
    listHref: string;
    createTitle: string;
    editTitle: string;
}

const VENDOR_FORM_ROUTE_CONFIG: Record<VendorFormRouteContext, VendorFormRouteConfig> = {
    staff: {
        homeLabel: "Staff Portal",
        homeHref: "/staff",
        listHref: "/staff/vendors",
        createTitle: "Create Vendor",
        editTitle: "Edit Vendor",
    },
    production: {
        homeLabel: "Production Team",
        homeHref: "/staff/production-team",
        listHref: "/staff/production-team/vendors",
        createTitle: "Create Production Vendor",
        editTitle: "Edit Production Vendor",
    },
};

export default function VendorFormRoutePage({ context, mode }: VendorFormRoutePageProps): ReactElement {
    const params = useParams();
    const config = VENDOR_FORM_ROUTE_CONFIG[context];

    const vendorIdParam =
        typeof params.vendorId === "string"
            ? params.vendorId
            : Array.isArray(params.vendorId)
                ? params.vendorId[0]
                : "";

    const vendorId = useMemo((): number => Number(vendorIdParam), [vendorIdParam]);

    return (
        <AdminLayout>
            <VendorFormWorkspace
                mode={mode}
                vendorId={mode === "edit" ? vendorId : undefined}
                homeLabel={config.homeLabel}
                homeHref={config.homeHref}
                listLabel="Vendors"
                listHref={config.listHref}
                pageLabel={mode === "create" ? "New" : "Edit"}
                title={mode === "create" ? config.createTitle : config.editTitle}
                description={
                    mode === "create"
                        ? "Add a new supplier profile and performance details"
                        : "Update vendor details, capacity, and performance scores"
                }
                submitLabel={mode === "create" ? "Create Vendor" : "Save Changes"}
                successRedirectHref={config.listHref}
                cancelRedirectHref={config.listHref}
            />
        </AdminLayout>
    );
}
