import type { ReactElement } from "react";
import {
    BriefcaseBusinessIcon,
    ClipboardCheckIcon,
    FileTextIcon,
    HandCoinsIcon,
    PackageIcon,
    TrendingUpIcon,
    UsersIcon,
    UserRoundCheckIcon,
} from "lucide-react";
import type { DashboardAnalytics, DashboardOverview } from "@/types/dashboard";

interface DashboardKpiGridProps {
    overview: DashboardOverview;
    analytics: DashboardAnalytics;
}

export default function DashboardKpiGrid({ overview, analytics }: DashboardKpiGridProps): ReactElement {
    const totalRevenue = Number(analytics.dashboard_stats.total_revenue || 0);

    const cards = [
        {
            label: "Total Clients",
            value: overview.clients.total.toLocaleString("en-US"),
            trend: `+${analytics.dashboard_stats.new_clients_trend} last 30d`,
            icon: UsersIcon,
            accent: "text-brand-blue",
        },
        {
            label: "Active Leads",
            value: overview.leads.total.toLocaleString("en-US"),
            trend: `${overview.leads.new} new`,
            icon: UserRoundCheckIcon,
            accent: "text-brand-yellow",
        },
        {
            label: "Quotes",
            value: overview.quotes.total.toLocaleString("en-US"),
            trend: `${overview.quotes.approved} approved`,
            icon: FileTextIcon,
            accent: "text-brand-purple",
        },
        {
            label: "Jobs In Progress",
            value: overview.jobs.in_progress.toLocaleString("en-US"),
            trend: `${overview.jobs.pending} pending`,
            icon: BriefcaseBusinessIcon,
            accent: "text-brand-orange",
        },
        {
            label: "Pending Orders",
            value: overview.lpos.pending.toLocaleString("en-US"),
            trend: `${overview.lpos.approved} approved`,
            icon: ClipboardCheckIcon,
            accent: "text-brand-red",
        },
        {
            label: "Published Products",
            value: analytics.dashboard_stats.total_products.toLocaleString("en-US"),
            trend: "Catalog items",
            icon: PackageIcon,
            accent: "text-brand-green",
        },
        {
            label: "Total Revenue",
            value: `KES ${totalRevenue.toLocaleString("en-US", {
                maximumFractionDigits: 0,
            })}`,
            trend: `KES ${Number(analytics.dashboard_stats.revenue_trend || 0).toLocaleString("en-US", {
                maximumFractionDigits: 0,
            })} last 30d`,
            icon: HandCoinsIcon,
            accent: "text-brand-black",
        },
        {
            label: "Quote Approval Rate",
            value:
                overview.quotes.total > 0
                    ? `${Math.round((overview.quotes.approved / overview.quotes.total) * 100)}%`
                    : "0%",
            trend: `${overview.quotes.lost} lost`,
            icon: TrendingUpIcon,
            accent: "text-brand-blue",
        },
    ] as const;

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {cards.map((card): ReactElement => {
                const Icon = card.icon;
                return (
                    <article key={card.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{card.label}</p>
                                <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
                                <p className="mt-1 text-xs text-gray-600">{card.trend}</p>
                            </div>
                            <div className="rounded-md bg-gray-100 p-2">
                                <Icon className={`h-5 w-5 ${card.accent}`} />
                            </div>
                        </div>
                    </article>
                );
            })}
        </section>
    );
}
