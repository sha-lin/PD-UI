"use client";

import type { ReactElement } from "react";
import VendorFormRoutePage from "@/features/vendors/components/VendorFormRoutePage";

export default function NewProductionVendorPage(): ReactElement {
    return <VendorFormRoutePage context="production" mode="create" />;
}
