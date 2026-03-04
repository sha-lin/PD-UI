import { redirect } from "next/navigation";

export default function ProductionDashboardAliasPage(): never {
    redirect("/staff/production-team/dashboard");
}
