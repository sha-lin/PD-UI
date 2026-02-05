interface Tab {
    id: string;
    label: string;
    count?: number;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export default function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
    return (
        <div className="border-b border-gray-200">
            <nav className="flex gap-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`
                            relative px-1 py-4 text-sm font-medium transition-colors
                            ${activeTab === tab.id
                                ? "text-brand-blue"
                                : "text-gray-600 hover:text-gray-900"
                            }
                        `}
                    >
                        <span className="flex items-center gap-2">
                            {tab.label}
                            {tab.count !== undefined && (
                                <span
                                    className={`
                                        px-2 py-0.5 text-xs font-medium rounded-full
                                        ${activeTab === tab.id
                                            ? "bg-brand-blue/10 text-brand-blue"
                                            : "bg-gray-100 text-gray-600"
                                        }
                                    `}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </span>
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue" />
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
}
