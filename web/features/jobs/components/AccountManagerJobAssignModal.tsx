"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, ReactElement } from "react";
import type { ProductionUser } from "@/types/users";

interface AccountManagerJobAssignModalProps {
    open: boolean;
    jobId: number | null;
    productionUsers: ProductionUser[];
    onClose: () => void;
    onSubmit: (userId: number, notes: string, remindDays: number) => void;
}

export default function AccountManagerJobAssignModal({
    open,
    jobId,
    productionUsers,
    onClose,
    onSubmit,
}: AccountManagerJobAssignModalProps): ReactElement | null {
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [assignmentNotes, setAssignmentNotes] = useState<string>("");
    const [remindDaysBefore, setRemindDaysBefore] = useState<number>(2);

    useEffect((): void => {
        if (open) {
            setSelectedUserId(null);
            setAssignmentNotes("");
            setRemindDaysBefore(2);
        }
    }, [open]);

    if (!open) {
        return null;
    }

    const handleSubmit = (): void => {
        if (!selectedUserId) {
            return;
        }
        onSubmit(selectedUserId, assignmentNotes, remindDaysBefore);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Assign to Production Team</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                    >
                        Close
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Production Team Member
                        </label>
                        <select
                            value={selectedUserId ?? ""}
                            onChange={(event: ChangeEvent<HTMLSelectElement>): void =>
                                setSelectedUserId(Number(event.target.value))
                            }
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        >
                            <option value="">Select Production Team Member...</option>
                            {productionUsers.map((user: ProductionUser): ReactElement => (
                                <option key={user.id} value={user.id}>
                                    {user.first_name} {user.last_name} ({user.username})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assignment Notes
                        </label>
                        <textarea
                            value={assignmentNotes}
                            onChange={(event: ChangeEvent<HTMLTextAreaElement>): void =>
                                setAssignmentNotes(event.target.value)
                            }
                            rows={4}
                            placeholder="Add any instructions or notes for the production team member..."
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Send Reminder (days before deadline)
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={30}
                            value={remindDaysBefore}
                            onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                setRemindDaysBefore(Number(event.target.value))
                            }
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                    </div>
                </div>
                <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!selectedUserId}
                        className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Assign Job
                    </button>
                </div>
            </div>
        </div>
    );
}
