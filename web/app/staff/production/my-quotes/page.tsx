"use client";

import type { ReactElement } from "react";
import AdminLayout from "@/components/admin/admin-layout";
import ProductionMyQuotesWorkspace from "@/features/production-my-quotes/components/ProductionMyQuotesWorkspace";

export default function ProductionMyQuotesPage(): ReactElement {
    return (
        <AdminLayout>
            <ProductionMyQuotesWorkspace />
        </AdminLayout>
    );
}
