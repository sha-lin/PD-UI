"use client";

import type { ReactElement } from "react";
import VendorsRoutePage from "@/features/vendors/components/VendorsRoutePage";

export default function ProductionTeamVendorsPage(): ReactElement {
    return <VendorsRoutePage context="production" />;
}
