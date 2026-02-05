"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import {
    LayoutDashboard,
    Users,
    Target,
    FileText,
    Package,
    Briefcase,
    Building2,
    Settings,
    CheckCircle,
    Truck,
    ClipboardList,
    CreditCard,
    BarChart3,
    User,
    Bell,
    ScrollText,
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
            { label: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
        ],
    },
    {
        title: "BUSINESS",
        items: [
            { label: "Clients", href: "/staff/clients", icon: Users },
            { label: "Leads", href: "/staff/leads", icon: Target },
            { label: "Quotes", href: "/staff/quotes", icon: FileText },
            { label: "Products", href: "/staff/products", icon: Package },
        ],
    },
    {
        title: "OPERATIONS",
        items: [
            { label: "Jobs", href: "/staff/jobs", icon: Briefcase },
            { label: "Vendors", href: "/staff/vendors", icon: Building2 },
            { label: "Processes", href: "/staff/processes", icon: Settings },
            { label: "Quality Control", href: "/staff/quality-control", icon: CheckCircle },
            { label: "Deliveries", href: "/staff/deliveries", icon: Truck },
        ],
    },
    {
        title: "FINANCIAL",
        items: [
            { label: "LPOs", href: "/staff/lpos", icon: ClipboardList },
            { label: "Payments", href: "/staff/payments", icon: CreditCard },
            { label: "Analytics", href: "/staff/analytics", icon: BarChart3 },
        ],
    },
    {
        title: "SYSTEM",
        items: [
            { label: "Users", href: "/staff/users", icon: User },
            { label: "System Alerts", href: "/staff/alerts", icon: Bell },
            { label: "Audit Logs", href: "/staff/audit-logs", icon: ScrollText },
            { label: "Settings", href: "/staff/settings", icon: Settings },
        ],
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    const isActiveLink = (href: string): boolean => {
        return pathname === href;
    };

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
