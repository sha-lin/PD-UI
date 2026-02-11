import { LucideIcon } from "lucide-react";

interface Tab {
    id: string;
    label: string;
    description?: string;
    icon?: LucideIcon;
    count?: number;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export default function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
    const hasDescriptions = tabs.some(tab => tab.description);

    return (
        <div className="border-b border-gray-200 bg-gray-50/50">
            <nav className="flex px-6">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                                relative px-6 py-4 text-left transition-all border-b-2
                                ${isActive
                                    ? "text-brand-blue border-brand-blue bg-white"
                                    : "text-gray-600 hover:text-gray-900 border-transparent hover:bg-white/50"
                                }
                                ${hasDescriptions ? 'py-5' : 'py-4'}
                            `}
                        >
                            <div className="flex items-start gap-3">
                                {Icon && (
                                    <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isActive ? "text-brand-blue" : "text-gray-400"
                                        }`} />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">
                                            {tab.label}
                                        </span>
                                        {tab.count !== undefined && (
                                            <span
                                                className={`
                                                    px-2 py-0.5 text-xs font-medium rounded-full
                                                    ${isActive
                                                        ? "bg-brand-blue/10 text-brand-blue"
                                                        : "bg-gray-100 text-gray-600"
                                                    }
                                                `}
                                            >
                                                {tab.count}
                                            </span>
                                        )}
                                    </div>
                                    {tab.description && (
                                        <p className={`text-xs mt-1 ${isActive ? "text-brand-blue/70" : "text-gray-500"
                                            }`}>
                                            {tab.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
