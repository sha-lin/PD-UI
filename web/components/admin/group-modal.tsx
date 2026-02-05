"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle, Users, Shield } from "lucide-react";
import { GroupWithCount } from "./groups-table";

interface GroupModalProps {
    group: GroupWithCount | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (groupId: number | null, name: string) => Promise<void>;
}

export default function GroupModal({ group, isOpen, onClose, onSave }: GroupModalProps) {
    const [name, setName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setName(group?.name || "");
            setError(null);
        }
    }, [isOpen, group]);

    if (!isOpen) return null;

    const isEditing = !!group;

    const handleClose = () => {
        if (!isSaving) {
            setName("");
            setError(null);
            onClose();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Group name is required");
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            await onSave(group?.id || null, name.trim());
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save group");
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-shrink-0 border-b border-gray-200">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-brand-blue" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {isEditing ? "Edit Group" : "Create Group"}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {isEditing ? "Modify group details" : "Add a new permission group"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isSaving}
                            className="text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="mx-6 mt-5 mb-0 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <div className="px-6 py-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-0.5">
                                Group Name <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-500 mb-2">
                                A descriptive name for this permission group
                            </p>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoFocus
                                className="w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                placeholder="e.g., Production Team, Sales Team"
                            />
                        </div>

                        {isEditing && group?.user_count !== undefined && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 text-sm text-blue-800">
                                    <Users className="w-4 h-4" />
                                    <span>
                                        This group currently has <strong>{group.user_count}</strong> {group.user_count === 1 ? 'member' : 'members'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSaving}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Create Group"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
