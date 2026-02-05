"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchGroups } from "@/lib/api/users";
import { X, AlertCircle, UserPlus } from "lucide-react";

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface InviteUserFormData {
    first_name: string;
    last_name: string;
    email: string;
    group_ids: number[];
    send_invite: boolean;
}

function getCsrfToken(): string | null {
    const name = "csrftoken";
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        const trimmed = cookie.trim();
        if (trimmed.startsWith(name + "=")) {
            return decodeURIComponent(trimmed.substring(name.length + 1));
        }
    }
    return null;
}

export default function AddUserModal({ isOpen, onClose, onSuccess }: AddUserModalProps) {
    const [formData, setFormData] = useState<InviteUserFormData>({
        first_name: "",
        last_name: "",
        email: "",
        group_ids: [],
        send_invite: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: groups = [], isLoading: loadingGroups } = useQuery({
        queryKey: ["groups"],
        queryFn: fetchGroups,
        enabled: isOpen,
    });

    if (!isOpen) return null;

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                group_ids: [],
                send_invite: true,
            });
            setError(null);
            onClose();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.first_name || !formData.last_name) {
            setError("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const csrfToken = getCsrfToken();
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${API_BASE_URL}/api/v1/users/invite/`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...(csrfToken && { "X-CSRFToken": csrfToken }),
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to invite user");
            }

            onSuccess();
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to invite user");
            setIsSubmitting(false);
        }
    };

    const toggleGroup = (groupId: number) => {
        setFormData(prev => ({
            ...prev,
            group_ids: prev.group_ids.includes(groupId)
                ? prev.group_ids.filter(id => id !== groupId)
                : [...prev.group_ids, groupId]
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-shrink-0 border-b border-gray-200">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center">
                                <UserPlus className="w-5 h-5 text-brand-blue" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Invite New User</h2>
                                <p className="text-sm text-gray-600">Send an invitation to join the staff portal</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    {error && (
                        <div className="mx-6 mt-5 mb-0 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <div className="px-6 py-5 space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">User Information</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-0.5">
                                            First Name <span className="text-red-500">*</span>
                                        </label>
                                        <p className="text-xs text-gray-500 mb-1.5">User's given name</p>
                                        <input
                                            type="text"
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            required
                                            className="w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-0.5">
                                            Last Name <span className="text-red-500">*</span>
                                        </label>
                                        <p className="text-xs text-gray-500 mb-1.5">User's family name</p>
                                        <input
                                            type="text"
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            required
                                            className="w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-0.5">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <p className="text-xs text-gray-500 mb-1.5">Invitation will be sent to this address</p>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                        placeholder="john.doe@printduka.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">Assign Groups</h3>
                            <p className="text-xs text-gray-600 mb-4">
                                Groups control user permissions and access levels
                            </p>
                            {loadingGroups ? (
                                <div className="text-sm text-gray-500">Loading groups...</div>
                            ) : groups.length === 0 ? (
                                <div className="text-sm text-gray-500">No groups available</div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {groups.map((group) => (
                                        <div
                                            key={group.id}
                                            className="flex items-center cursor-pointer"
                                            onClick={() => toggleGroup(group.id)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.group_ids.includes(group.id)}
                                                onChange={() => toggleGroup(group.id)}
                                                className="w-4 h-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                                            />
                                            <label className="ml-2 text-sm text-gray-700 cursor-pointer">
                                                {group.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-start">
                                <input
                                    type="checkbox"
                                    id="send_invite"
                                    checked={formData.send_invite}
                                    onChange={(e) => setFormData({ ...formData, send_invite: e.target.checked })}
                                    className="w-4 h-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue mt-0.5"
                                />
                                <div className="ml-2">
                                    <label htmlFor="send_invite" className="text-sm font-medium text-gray-900 cursor-pointer">
                                        Send invitation email
                                    </label>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        User will receive an email with an activation link to set their password
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Sending Invite..." : "Send Invitation"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
