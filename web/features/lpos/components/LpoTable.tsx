import { LPO } from "@/types/lpos";
import LpoStatusBadge from "./LpoStatusBadge";

interface LpoTableProps {
    lpos: LPO[];
    onView: (lpo: LPO) => void;
}

export default function LpoTable({ lpos, onView }: LpoTableProps) {
    const formatAmount = (value: number): string => `KES ${value.toLocaleString()}`;

    const formatDate = (value: string): string => {
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
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">LPO Number</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Quote</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {lpos.map((lpo) => (
                        <tr key={lpo.id} className="border-b border-gray-100 last:border-0">
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                {lpo.lpo_number}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {lpo.client_name || "—"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {lpo.quote_id || "—"}
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                                {formatAmount(lpo.total_amount)}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                <LpoStatusBadge status={lpo.status} />
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {formatDate(lpo.created_at)}
                            </td>
                            <td className="py-3 px-4 text-right">
                                <button
                                    type="button"
                                    onClick={() => onView(lpo)}
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
