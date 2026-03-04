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
    ClipboardList,
    BarChart3,
    Bell
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
            { label: "Dashboard", href: "/staff/production-team/dashboard", icon: LayoutDashboard },
        ],
    },
    {
        title: "PRODUCTION TEAM",
        items: [
            { label: "Product Catalog", href: "/staff/production/products", icon: Package },
            { label: "LPOs", href: "/staff/production/lpos", icon: ClipboardList },
            { label: "My Quotes", href: "/staff/production/my-quotes", icon: FileText },
            { label: "My Jobs", href: "/staff/production/my-jobs", icon: Briefcase },
            { label: "Costing", href: "/staff/production-team/processes", icon: BookOpen },
            { label: "Vendors", href: "/staff/production-team/vendors", icon: Building2 },
            { label: "Delivery", href: "/staff/production-team/deliveries", icon: Truck },
            { label: "Analytics", href: "/staff/production-team/analytics", icon: BarChart3 },
            { label: "Settings", href: "/staff/production-team/settings", icon: Settings },
            { label: "Notifications", href: "/staff/production-team/notifications", icon: Bell },
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
