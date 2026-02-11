import { DeliveryMethod, DeliveryStatus, StagingLocation } from "@/types/deliveries";

interface DeliveriesFiltersProps {
    search: string;
    status: DeliveryStatus | "all";
    stagingLocation: StagingLocation | "all";
    handoffConfirmed: "all" | "true" | "false";
    urgentOnly: "all" | "true" | "false";
    method: DeliveryMethod | "all";
    dateFrom: string;
    dateTo: string;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: DeliveryStatus | "all") => void;
    onStagingLocationChange: (value: StagingLocation | "all") => void;
    onHandoffConfirmedChange: (value: "all" | "true" | "false") => void;
    onUrgentChange: (value: "all" | "true" | "false") => void;
    onMethodChange: (value: DeliveryMethod | "all") => void;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    onReset: () => void;
}

export default function DeliveriesFilters({
    search,
    status,
    stagingLocation,
    handoffConfirmed,
    urgentOnly,
    method,
    dateFrom,
    dateTo,
    onSearchChange,
    onStatusChange,
    onStagingLocationChange,
    onHandoffConfirmedChange,
    onUrgentChange,
    onMethodChange,
    onDateFromChange,
    onDateToChange,
    onReset,
}: DeliveriesFiltersProps) {
    const statusOptions: Array<{ label: string; value: DeliveryStatus | "all" }> = [
        { label: "All Status", value: "all" },
        { label: "Staged", value: "staged" },
        { label: "In Transit", value: "in_transit" },
        { label: "Delivered", value: "delivered" },
        { label: "Failed", value: "failed" },
    ];

    const locationOptions: Array<{ label: string; value: StagingLocation | "all" }> = [
        { label: "All Locations", value: "all" },
        { label: "Shelf A", value: "shelf-a" },
        { label: "Shelf B", value: "shelf-b" },
        { label: "Shelf C", value: "shelf-c" },
        { label: "Warehouse", value: "warehouse" },
    ];

    const methodOptions: Array<{ label: string; value: DeliveryMethod | "all" }> = [
        { label: "All Methods", value: "all" },
        { label: "Pickup", value: "pickup" },
        { label: "Delivery", value: "delivery" },
        { label: "Courier", value: "courier" },
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-6">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Search</label>
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Delivery, job, quote, or client"
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                </div>
                <div className="lg:col-span-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                    <select
                        value={status}
                        onChange={(event) => onStatusChange(event.target.value as DeliveryStatus | "all")}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="lg:col-span-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</label>
                    <select
                        value={stagingLocation}
                        onChange={(event) => onStagingLocationChange(event.target.value as StagingLocation | "all")}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                        {locationOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <details className="mt-4 rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700">
                    Advanced filters
                </summary>
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-3">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Handoff</label>
                        <select
                            value={handoffConfirmed}
                            onChange={(event) => onHandoffConfirmedChange(event.target.value as "all" | "true" | "false")}
                            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        >
                            <option value="all">All</option>
                            <option value="true">Confirmed</option>
                            <option value="false">Unconfirmed</option>
                        </select>
                    </div>
                    <div className="lg:col-span-3">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Urgent</label>
                        <select
                            value={urgentOnly}
                            onChange={(event) => onUrgentChange(event.target.value as "all" | "true" | "false")}
                            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        >
                            <option value="all">All</option>
                            <option value="true">Urgent</option>
                            <option value="false">Not urgent</option>
                        </select>
                    </div>
                    <div className="lg:col-span-3">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Method</label>
                        <select
                            value={method}
                            onChange={(event) => onMethodChange(event.target.value as DeliveryMethod | "all")}
                            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        >
                            {methodOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="lg:col-span-3">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">From</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(event) => onDateFromChange(event.target.value)}
                            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                    </div>
                    <div className="lg:col-span-3">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">To</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(event) => onDateToChange(event.target.value)}
                            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                    </div>
                </div>
            </details>
            <div className="flex justify-end mt-4">
                <button
                    type="button"
                    onClick={onReset}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                    Clear filters
                </button>
            </div>
        </div>
    );
}
