"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    Package,
    Briefcase,
    Building2,
    Settings,
    Truck,
    BarChart3,
    Bell,
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
            { label: "Dashboard", href: "/production-team/dashboard", icon: LayoutDashboard },
        ],
    },
    {
        title: "MY WORK",
        items: [
            { label: "My Quotes", href: "/production-team/my-quotes", icon: FileText },
            { label: "My Jobs", href: "/production-team/my-jobs", icon: Briefcase },
        ],
    },
    {
        title: "PRODUCTION",
        items: [
            { label: "Product Catalog", href: "/production-team/products", icon: Package },
            { label: "Costing", href: "/production-team/processes", icon: BookOpen },
            // { label: "Quality Control", href: "/production-team/quality-control", icon: ShieldCheck },
            { label: "Vendors", href: "/production-team/vendors", icon: Building2 },
            { label: "Deliveries", href: "/production-team/deliveries", icon: Truck },
        ],
    },
    {
        title: "INSIGHTS",
        items: [
            { label: "Analytics", href: "/production-team/analytics", icon: BarChart3 },
            { label: "Notifications", href: "/production-team/notifications", icon: Bell },
            { label: "Settings", href: "/production-team/settings", icon: Settings },
        ],
    },
];

export default function ProductionSidebar() {
    const pathname = usePathname();

    const isActiveLink = (href: string): boolean =>
        pathname === href ||
        (href !== "/production-team/dashboard" && pathname.startsWith(href));

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
