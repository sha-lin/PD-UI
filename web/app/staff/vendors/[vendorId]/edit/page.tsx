"use client";

import type { ReactElement } from "react";
import VendorFormRoutePage from "@/features/vendors/components/VendorFormRoutePage";

export default function EditVendorPage(): ReactElement {
    return <VendorFormRoutePage context="staff" mode="edit" />;
}
