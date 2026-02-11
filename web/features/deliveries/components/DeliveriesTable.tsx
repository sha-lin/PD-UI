import { Delivery, DeliveryMethod } from "@/types/deliveries";
import DeliveryStatusBadge from "./DeliveryStatusBadge";

interface DeliveriesTableProps {
    deliveries: Delivery[];
    onView: (delivery: Delivery) => void;
}

export default function DeliveriesTable({ deliveries, onView }: DeliveriesTableProps) {
    const methodLabels: Record<DeliveryMethod, string> = {
        pickup: "Pickup",
        delivery: "Delivery",
        courier: "Courier",
    };

    const locationLabels: Record<string, string> = {
        "shelf-a": "Shelf A",
        "shelf-b": "Shelf B",
        "shelf-c": "Shelf C",
        warehouse: "Warehouse",
    };

    const formatDate = (value: string | null): string => {
        if (!value) return "—";
        return new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Delivery</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Job</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Method</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Staging</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Scheduled</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Handoff</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {deliveries.map((delivery) => (
                        <tr key={delivery.id} className="border-b border-gray-100 last:border-0">
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                {delivery.delivery_number}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {delivery.job_number || "—"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {delivery.client_name || "—"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {delivery.delivery_method ? methodLabels[delivery.delivery_method] : "—"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                <DeliveryStatusBadge status={delivery.status} />
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {locationLabels[delivery.staging_location] || "—"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {formatDate(delivery.scheduled_delivery_date)}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {delivery.handoff_confirmed ? "Confirmed" : "Pending"}
                            </td>
                            <td className="py-3 px-4 text-right">
                                <button
                                    type="button"
                                    onClick={() => onView(delivery)}
                                    className="text-brand-blue text-sm font-semibold hover:text-brand-blue/80"
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
