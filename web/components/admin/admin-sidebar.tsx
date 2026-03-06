"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import {
    LayoutDashboard,
    Users,
    FileText,
    Package,
    Briefcase,
    Building2,
    Settings,
    Truck,
    ClipboardList,
    BarChart3,
    CreditCard,
    UserCircle,
    ShieldCheck,
    AlertTriangle,
} from "lucide-react";

interface MenuItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

interface MenuSection {
    title?: string;
    items: MenuItem[];
}

const menuSections: MenuSection[] = [
    {
        items: [
            { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        ],
    },
    {
        title: "CLIENTS & SALES",
        items: [
            { label: "Clients", href: "/admin/clients", icon: UserCircle },
            { label: "Leads", href: "/admin/leads", icon: Users },
            { label: "Quotes", href: "/admin/quotes", icon: FileText },
            { label: "Jobs", href: "/admin/jobs", icon: Briefcase },
            { label: "Payments", href: "/admin/payments", icon: CreditCard },
        ],
    },
    {
        title: "OPERATIONS",
        items: [
            { label: "Products", href: "/admin/products", icon: Package },
            { label: "LPOs", href: "/admin/lpos", icon: ClipboardList },
            { label: "Vendors", href: "/admin/vendors", icon: Building2 },
            { label: "Deliveries", href: "/admin/deliveries", icon: Truck },
            { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        ],
    },
    {
        title: "ADMINISTRATION",
        items: [
            { label: "Users", href: "/admin/users", icon: Users },
            { label: "Audit Logs", href: "/admin/audit-logs", icon: ShieldCheck },
            { label: "Alerts", href: "/admin/alerts", icon: AlertTriangle },
            { label: "Settings", href: "/admin/settings", icon: Settings },
        ],
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    const isActiveLink = (href: string): boolean =>
        pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));

    return (
        <aside className="w-64 bg-brand-blue text-white h-screen fixed left-0 top-0 overflow-y-auto">
            <div className="px-4 py-3 border-b border-white/10">
                <Image
                    src="/logo/pd.png"
                    alt="PrintDuka"
                    width={50}
                    height={16}
                    className="w-20 h-auto"
                    priority
                />
            </div>

            <nav className="py-4">
                {menuSections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="mb-6">
                        {section.title && (
                            <h2 className="px-4 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                                {section.title}
                            </h2>
                        )}
                        <ul>
                            {section.items.map((item) => {
                                const isActive = isActiveLink(item.href);
                                const Icon = item.icon;
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isActive
                                                ? "bg-brand-yellow text-brand-blue font-semibold"
                                                : "text-white hover:bg-white/10"
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    );
}
