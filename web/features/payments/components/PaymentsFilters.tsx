import { PaymentMethod, PaymentStatus } from "@/types/payments";

interface PaymentsFiltersProps {
    search: string;
    status: PaymentStatus | "all";
    method: PaymentMethod | "all";
    dateFrom: string;
    dateTo: string;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: PaymentStatus | "all") => void;
    onMethodChange: (value: PaymentMethod | "all") => void;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    onReset: () => void;
}

export default function PaymentsFilters({
    search,
    status,
    method,
    dateFrom,
    dateTo,
    onSearchChange,
    onStatusChange,
    onMethodChange,
    onDateFromChange,
    onDateToChange,
    onReset,
}: PaymentsFiltersProps) {
    const statusOptions: Array<{ label: string; value: PaymentStatus | "all" }> = [
        { label: "All Status", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "Completed", value: "completed" },
        { label: "Failed", value: "failed" },
        { label: "Refunded", value: "refunded" },
    ];

    const methodOptions: Array<{ label: string; value: PaymentMethod | "all" }> = [
        { label: "All Methods", value: "all" },
        { label: "Cash", value: "cash" },
        { label: "M-Pesa", value: "mpesa" },
        { label: "Bank Transfer", value: "bank_transfer" },
        { label: "Cheque", value: "cheque" },
        { label: "Credit Card", value: "credit_card" },
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-4">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Search</label>
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Reference, client, or LPO"
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                </div>
                <div className="lg:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                    <select
                        value={status}
                        onChange={(event) => onStatusChange(event.target.value as PaymentStatus | "all")}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="lg:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Method</label>
                    <select
                        value={method}
                        onChange={(event) => onMethodChange(event.target.value as PaymentMethod | "all")}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                        {methodOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="lg:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">From</label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(event) => onDateFromChange(event.target.value)}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                </div>
                <div className="lg:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">To</label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(event) => onDateToChange(event.target.value)}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                </div>
            </div>
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
