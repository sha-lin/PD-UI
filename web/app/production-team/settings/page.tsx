"use client";

import type { ReactElement } from "react";
import AdminLayout from "@/components/admin/admin-layout";
import ProductionSettingsWorkspace from "@/features/production-settings/components/ProductionSettingsWorkspace";

export default function ProductionSettingsPage(): ReactElement {
    return (
        <AdminLayout>
            <ProductionSettingsWorkspace />
        </AdminLayout>
    );
}
