"use client";

import type { ReactElement } from "react";
import AdminLayout from "@/components/admin/admin-layout";
import ProductionAnalyticsWorkspace from "@/features/production-analytics/components/ProductionAnalyticsWorkspace";

export default function ProductionAnalyticsPage(): ReactElement {
    return (
        <AdminLayout>
            <ProductionAnalyticsWorkspace />
        </AdminLayout>
    );
}