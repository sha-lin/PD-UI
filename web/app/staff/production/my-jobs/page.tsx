"use client";

import type { ReactElement } from "react";
import AdminLayout from "@/components/admin/admin-layout";
import ProductionMyJobsWorkspace from "@/features/production-my-jobs/components/ProductionMyJobsWorkspace";

export default function ProductionMyJobsPage(): ReactElement {
    return (
        <AdminLayout>
            <ProductionMyJobsWorkspace />
        </AdminLayout>
    );
}
