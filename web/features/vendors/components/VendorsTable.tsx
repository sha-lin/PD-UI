import type { ReactElement } from "react";
import { Vendor } from "@/types/vendors";

interface VendorsTableProps {
    vendors: Vendor[];
    onEdit: (vendor: Vendor) => void;
    onDelete: (vendor: Vendor) => void;
    onInvite: (vendor: Vendor) => void;
}

export default function VendorsTable({ vendors, onEdit, onDelete, onInvite }: VendorsTableProps): ReactElement {
    const formatDate = (value: string): string => {
        return new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
    };

    const createEditHandler = (vendor: Vendor): (() => void) => {
        return (): void => {
            onEdit(vendor);
        };
    };

    const createDeleteHandler = (vendor: Vendor): (() => void) => {
        return (): void => {
            onDelete(vendor);
        };
    };

    const createInviteHandler = (vendor: Vendor): (() => void) => {
        return (): void => {
            onInvite(vendor);
        };
    };

    const formatVpsValue = (value: string | number | null): string => {
        if (value === null || value === undefined) {
            return "0";
        }
        return String(value);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">VPS</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {vendors.map((vendor: Vendor): ReactElement => (
                        <tr key={vendor.id} className="border-b border-gray-100 last:border-0">
                            <td className="py-3 px-4">
                                <div className="text-sm font-semibold text-gray-900">{vendor.name}</div>
                                <div className="text-xs text-gray-500">{vendor.contact_person || "—"}</div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                <div>{vendor.email}</div>
                                <div className="text-xs text-gray-500">{vendor.phone}</div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                                    VPS {vendor.vps_score || "N/A"} ({formatVpsValue(vendor.vps_score_value)})
                                </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {vendor.rating ? `${vendor.rating} ★` : "—"}
                            </td>
                            <td className="py-3 px-4 text-sm">
                                <span
                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${vendor.active ? "bg-brand-green/10 text-brand-green" : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {vendor.active ? "Active" : "Inactive"}
                                </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">
                                {formatDate(vendor.created_at)}
                            </td>
                            <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-3">
                                    {(vendor.user === null || vendor.user_is_active === false) && (
                                        <button
                                            type="button"
                                            onClick={createInviteHandler(vendor)}
                                            className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80"
                                        >
                                            {vendor.user === null ? "Invite" : "Resend"}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={createEditHandler(vendor)}
                                        className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={createDeleteHandler(vendor)}
                                        className="text-sm font-semibold text-brand-red hover:text-brand-red/80"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
