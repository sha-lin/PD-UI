import { Search, ChevronDown } from "lucide-react";

interface UsersTableFiltersProps {
    searchTerm: string;
    activeFilter: boolean | undefined;
    superuserFilter: boolean | undefined;
    onSearchChange: (value: string) => void;
    onActiveFilterChange: (value: boolean | undefined) => void;
    onSuperuserFilterChange: (value: boolean | undefined) => void;
}

export default function UsersTableFilters({
    searchTerm,
    activeFilter,
    superuserFilter,
    onSearchChange,
    onActiveFilterChange,
    onSuperuserFilterChange,
}: UsersTableFiltersProps) {
    const handleActiveFilterChange = (value: string) => {
        if (value === "all") {
            onActiveFilterChange(undefined);
        } else if (value === "true") {
            onActiveFilterChange(true);
        } else {
            onActiveFilterChange(false);
        }
    };

    const handleSuperuserFilterChange = (value: string) => {
        if (value === "all") {
            onSuperuserFilterChange(undefined);
        } else if (value === "true") {
            onSuperuserFilterChange(true);
        } else {
            onSuperuserFilterChange(false);
        }
    };

    const getActiveFilterValue = () => {
        if (activeFilter === undefined) return "all";
        return activeFilter ? "true" : "false";
    };

    const getSuperuserFilterValue = () => {
        if (superuserFilter === undefined) return "all";
        return superuserFilter ? "true" : "false";
    };

    return (
        <div className="bg-white">
            <div className="flex items-center justify-between gap-8">
                <div className="flex-1 max-w-3xl">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-shadow"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Status:</span>
                        <div className="relative">
                            <select
                                value={getActiveFilterValue()}
                                onChange={(e) => handleActiveFilterChange(e.target.value)}
                                className="h-10 pl-3 pr-9 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent appearance-none cursor-pointer"
                            >
                                <option value="all">All</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Role:</span>
                        <div className="relative">
                            <select
                                value={getSuperuserFilterValue()}
                                onChange={(e) => handleSuperuserFilterChange(e.target.value)}
                                className="h-10 pl-3 pr-9 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent appearance-none cursor-pointer"
                            >
                                <option value="all">All</option>
                                <option value="true">Superuser</option>
                                <option value="false">Regular</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
