import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface ProductionMember {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
}

interface SelectProductionMemberModalProps {
    quoteId: string;
    onClose: () => void;
    onConfirm: (memberId: number) => void;
}

async function fetchProductionTeam(): Promise<{ results: ProductionMember[]; count: number }> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    const response = await fetch(`${API_BASE_URL}/api/v1/users/production_team/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch production team members");
    }

    return response.json();
}

export default function SelectProductionMemberModal({
    quoteId,
    onClose,
    onConfirm,
}: SelectProductionMemberModalProps) {
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ["production-team"],
        queryFn: fetchProductionTeam,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedMemberId) {
            onConfirm(selectedMemberId);
        }
    };

    const getMemberDisplayName = (member: ProductionMember): string => {
        const fullName = `${member.first_name} ${member.last_name}`.trim();
        return fullName || member.username || member.email;
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Select Production Team Member
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            type="button"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        Assign quote {quoteId} to a production team member for costing
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-4 max-h-96 overflow-y-auto">
                        {isLoading && (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                                Failed to load production team members. Please try again.
                            </div>
                        )}

                        {data && data.results.length === 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-700">
                                No production team members available.
                            </div>
                        )}

                        {data && data.results.length > 0 && (
                            <div className="space-y-2">
                                {data.results.map((member) => (
                                    <label
                                        key={member.id}
                                        className={`flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50 transition-colors ${selectedMemberId === member.id
                                                ? "border-brand-blue bg-brand-blue/5"
                                                : "border-gray-200"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="production_member"
                                            value={member.id}
                                            checked={selectedMemberId === member.id}
                                            onChange={() => setSelectedMemberId(member.id)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {getMemberDisplayName(member)}
                                            </p>
                                            <p className="text-xs text-gray-500">{member.email}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200 p-4 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedMemberId || isLoading}
                            className="px-4 py-2 text-sm font-medium bg-brand-yellow text-brand-black hover:bg-brand-yellow/90 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Send to Production Team
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
