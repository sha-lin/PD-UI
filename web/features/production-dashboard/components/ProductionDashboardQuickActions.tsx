import type { ReactElement } from "react";
import {
    BriefcaseBusinessIcon,
    Building2Icon,
    FileTextIcon,
    PackageIcon,
    SettingsIcon,
} from "lucide-react";

interface ProductionQuickAction {
    label: string;
    href: string;
    Icon: typeof PackageIcon;
}

const productionQuickActions: ProductionQuickAction[] = [
    { label: "My Quotes", href: "/staff/production/my-quotes", Icon: FileTextIcon },
    { label: "My Jobs", href: "/staff/production/my-jobs", Icon: BriefcaseBusinessIcon },
    { label: "Product Catalog", href: "/staff/production/products", Icon: PackageIcon },
    { label: "Processes", href: "/production-team/processes", Icon: SettingsIcon },
    { label: "Vendors", href: "/production-team/vendors", Icon: Building2Icon },
];

export default function ProductionDashboardQuickActions(): ReactElement {
    return (
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {productionQuickActions.map((action: ProductionQuickAction): ReactElement => (
                    <a
                        key={action.href}
                        href={action.href}
                        className="rounded-md border border-gray-200 bg-gray-50 px-3 py-4 text-center hover:border-brand-blue hover:bg-white transition-colors"
                    >
                        <action.Icon className="mx-auto h-5 w-5 text-brand-blue" />
                        <p className="mt-2 text-sm font-medium text-gray-700">{action.label}</p>
                    </a>
                ))}
            </div>
        </section>
    );
}
