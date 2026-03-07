"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactElement } from "react";
import { type LucideIcon, X, Loader2, LogOut } from "lucide-react";
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

interface AdminSidebarProps {
    isDrawerOpen: boolean;
    onClose: () => void;
}

export default function AdminSidebar({ isDrawerOpen, onClose }: AdminSidebarProps): ReactElement {
    const pathname = usePathname();
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    const isActiveLink = (href: string): boolean =>
        pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));

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
                ${isDrawerOpen
                    ? "translate-x-0"
                    : "-translate-x-full lg:translate-x-0"
                }
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
                ))}            </nav>

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
