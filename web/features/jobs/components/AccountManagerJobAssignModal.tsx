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
    isSubmitting?: boolean;
}

export default function AccountManagerJobAssignModal({
    open,
    jobId,
    productionUsers,
    onClose,
    onSubmit,
    isSubmitting = false,
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
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="text-sm text-blue-800">
                            <span className="font-medium">Email notification</span> will be sent to the assigned production team member with job details.
                        </div>
                    </div>

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
                                    {user.name}
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
                        disabled={!selectedUserId || isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                        {isSubmitting && (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {isSubmitting ? "Assigning..." : "Assign Job"}
                    </button>
                </div>
            </div>
        </div>
    );
}
