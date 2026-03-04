"use client";

import type { ReactElement } from "react";
import AdminLayout from "@/components/admin/admin-layout";
import ProductionDashboardWorkspace from "@/features/production-dashboard/components/ProductionDashboardWorkspace";

export default function ProductionDashboardPage(): ReactElement {
    return (
        <AdminLayout>
            <ProductionDashboardWorkspace />
        </AdminLayout>
    );
}
