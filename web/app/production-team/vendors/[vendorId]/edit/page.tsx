"use client";

import type { ReactElement } from "react";
import VendorFormRoutePage from "@/features/vendors/components/VendorFormRoutePage";

export default function EditProductionVendorPage(): ReactElement {
    return <VendorFormRoutePage context="production" mode="edit" />;
}
