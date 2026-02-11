import { Delivery, DeliveryMethod, StagingLocation } from "@/types/deliveries";
import DeliveryStatusBadge from "./DeliveryStatusBadge";

interface DeliveryDetailsPanelProps {
    delivery: Delivery | null;
    onClose: () => void;
}

export default function DeliveryDetailsPanel({ delivery, onClose }: DeliveryDetailsPanelProps) {
    if (!delivery) {
        return null;
    }

    const methodLabels: Record<DeliveryMethod, string> = {
        pickup: "Pickup",
        delivery: "Delivery",
        courier: "Courier",
    };

    const locationLabels: Record<StagingLocation, string> = {
        "shelf-a": "Shelf A",
        "shelf-b": "Shelf B",
        "shelf-c": "Shelf C",
        warehouse: "Warehouse",
    };

    const formatDate = (value: string | null): string => {
        if (!value) return "—";
        return new Date(value).toLocaleDateString("en-US", {
            month: "long",
            day: "2-digit",
            year: "numeric",
        });
    };

    const packagingEntries = delivery.packaging_verified
        ? Object.entries(delivery.packaging_verified)
        : [];

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                onClick={onClose}
                className="absolute inset-0 bg-black/30"
                aria-label="Close delivery details"
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Delivery Details</p>
                        <h3 className="text-lg font-semibold text-gray-900 mt-1">
                            {delivery.delivery_number}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                    >
                        Close
                    </button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Job</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                            {delivery.job_number || "—"}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Client</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                            {delivery.client_name || "—"}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quote</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                            {delivery.quote_id || "—"}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</div>
                        <div className="mt-2">
                            <DeliveryStatusBadge status={delivery.status} />
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Method</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                            {delivery.delivery_method ? methodLabels[delivery.delivery_method] : "—"}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Staging Location</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                            {locationLabels[delivery.staging_location]}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Scheduled Delivery</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                            {formatDate(delivery.scheduled_delivery_date)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Handoff</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                            {delivery.handoff_confirmed ? "Confirmed" : "Pending"}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Handoff Time</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                            {formatDate(delivery.handoff_confirmed_at)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Urgent</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                            {delivery.mark_urgent ? "Urgent" : "Normal"}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Packaging Checks</div>
                        <div className="text-sm text-gray-700 mt-1">
                            {packagingEntries.length > 0
                                ? packagingEntries
                                    .filter((entry) => Boolean(entry[1]))
                                    .map((entry) => entry[0].replace(/_/g, " "))
                                    .join(", ")
                                : "—"}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Package Photos</div>
                        <div className="text-sm text-gray-700 mt-1">
                            {delivery.package_photos.length > 0
                                ? `${delivery.package_photos.length} photo(s)`
                                : "—"}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes to AM</div>
                        <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                            {delivery.notes_to_am || "No notes recorded."}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
