"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, type ReactElement } from "react";
import {
    type LucideIcon,
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
    LogOut,
    Loader2,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { logoutUserSession } from "@/lib/api/auth";

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

interface ProductionSidebarProps {
    isDrawerOpen: boolean;
    onClose: () => void;
}

export default function ProductionSidebar({ isDrawerOpen, onClose }: ProductionSidebarProps): ReactElement {
    const pathname = usePathname();
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    const isActiveLink = (href: string): boolean =>
        pathname === href ||
        (href !== "/production-team/dashboard" && pathname.startsWith(href));

    async function handleLogout(): Promise<void> {
        setLoggingOut(true);
        try {
            await logoutUserSession();
        } finally {
            router.push("/login");
        }
    }

    return (
        <aside
            className={`
                fixed left-0 top-0 z-30 h-screen w-64 bg-brand-blue text-white
                flex flex-col overflow-y-auto
                transition-transform duration-200 ease-in-out
                ${isDrawerOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
        >
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <Image
                    src="/logo/pd.png"
                    alt="PrintDuka"
                    width={50}
                    height={16}
                    className="w-20 h-auto"
                    priority
                />
                <button
                    onClick={onClose}
                    className="lg:hidden p-1.5 rounded hover:bg-white/10 transition-colors"
                    aria-label="Close menu"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <nav className="py-4 flex-1">
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
                                            onClick={onClose}
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

            <div className="px-4 py-4 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white hover:bg-white/10 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loggingOut ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <LogOut className="w-5 h-5" />
                    )}
                    <span>{loggingOut ? "Logging out…" : "Logout"}</span>
                </button>
            </div>
        </aside>
    );
}
