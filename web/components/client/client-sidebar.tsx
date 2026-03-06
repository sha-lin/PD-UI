"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { LayoutDashboard, Package, Settings, LogOut } from "lucide-react";

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
        title: "MAIN",
        items: [
            { label: "Dashboard", href: "/portal", icon: LayoutDashboard },
            { label: "Orders", href: "/portal/orders", icon: Package },
            { label: "Settings", href: "/portal/settings", icon: Settings },
        ],
    },
];

export default function ClientSidebar() {
    const pathname = usePathname();

    const isActiveLink = (href: string): boolean => {
        return pathname === href;
    };

    const handleLogout = () => {
        // Handle logout logic
        window.location.href = "/login";
    };

    return (
        <aside className="w-64 bg-brand-blue text-white h-screen fixed left-0 top-0 overflow-y-auto flex flex-col">
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

            {/* Logout Button */}
            <div className="px-4 py-4 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white hover:bg-white/10 rounded transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
