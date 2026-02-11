import { LPO, LPOStatus } from "@/types/lpos";
import LpoStatusBadge from "./LpoStatusBadge";

interface LpoDetailsPanelProps {
    lpo: LPO | null;
    onClose: () => void;
}

export default function LpoDetailsPanel({ lpo, onClose }: LpoDetailsPanelProps) {
    if (!lpo) {
        return null;
    }

    const formatAmount = (value: number): string => `KES ${value.toLocaleString()}`;

    const formatDate = (value: string | null): string => {
        if (!value) return "—";
        return new Date(value).toLocaleDateString("en-US", {
            month: "long",
            day: "2-digit",
            year: "numeric",
        });
    };

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                onClick={onClose}
                className="absolute inset-0 bg-black/30"
                aria-label="Close LPO details"
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">LPO Details</p>
                        <h3 className="text-lg font-semibold text-gray-900 mt-1">
                            {lpo.lpo_number}
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
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Client</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                            {lpo.client_name || "—"}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quote</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                            {lpo.quote_id || "—"}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</div>
                        <div className="mt-2">
                            <LpoStatusBadge status={lpo.status as LPOStatus} />
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Amount</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                            {formatAmount(lpo.total_amount)}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subtotal</div>
                            <div className="text-sm font-semibold text-gray-900 mt-1">
                                {formatAmount(lpo.subtotal)}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">VAT</div>
                            <div className="text-sm font-semibold text-gray-900 mt-1">
                                {formatAmount(lpo.vat_amount)}
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Terms</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                            {lpo.payment_terms || "—"}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Delivery Date</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                            {formatDate(lpo.delivery_date)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created At</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                            {formatDate(lpo.created_at)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</div>
                        <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                            {lpo.notes || "No notes recorded."}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
