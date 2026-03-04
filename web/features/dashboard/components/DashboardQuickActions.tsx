import type { ReactElement } from "react";
import {
    BriefcaseBusinessIcon,
    Building2Icon,
    FileTextIcon,
    PackageIcon,
    TargetIcon,
    UsersIcon,
} from "lucide-react";

interface QuickAction {
    label: string;
    href: string;
    Icon: typeof UsersIcon;
}

const quickActions: QuickAction[] = [
    { label: "Clients", href: "/staff/clients", Icon: UsersIcon },
    { label: "Leads", href: "/staff/leads", Icon: TargetIcon },
    { label: "Quotes", href: "/staff/quotes", Icon: FileTextIcon },
    { label: "Products", href: "/staff/products", Icon: PackageIcon },
    { label: "Jobs", href: "/staff/jobs", Icon: BriefcaseBusinessIcon },
    { label: "Vendors", href: "/staff/vendors", Icon: Building2Icon },
];

export default function DashboardQuickActions(): ReactElement {
    return (
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {quickActions.map((action: QuickAction): ReactElement => (
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
