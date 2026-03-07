"use client";

import type { ReactElement } from "react";
import AdminLayout from "@/components/admin/admin-layout";
import ProductionDeliveriesWorkspace from "@/features/production-deliveries/components/ProductionDeliveriesWorkspace";

export default function ProductionDeliveriesPage(): ReactElement {
    return (
        <AdminLayout>
            <ProductionDeliveriesWorkspace />
        </AdminLayout>
    );
}
