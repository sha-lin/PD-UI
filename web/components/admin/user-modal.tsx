"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, UpdateUserPayload } from "@/types/user";
import { fetchGroups } from "@/lib/api/users";
import { X, AlertCircle, Edit2 } from "lucide-react";

interface UserModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onSave: (userId: number, updates: UpdateUserPayload) => Promise<void>;
}

export default function UserModal({ user, isOpen, onClose, onSave }: UserModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UpdateUserPayload>({});
    const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: groups = [], isLoading: loadingGroups } = useQuery({
        queryKey: ["groups"],
        queryFn: fetchGroups,
        enabled: isOpen,
    });

    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                is_active: user.is_active,
                is_superuser: user.is_superuser,
            });
            setSelectedGroupIds(user.groups?.map(g => g.id) || []);
            setIsEditing(false);
            setError(null);
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setFormData({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            is_active: user.is_active,
            is_superuser: user.is_superuser,
        });
        setSelectedGroupIds(user.groups?.map(g => g.id) || []);
        setIsEditing(false);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        try {
            await onSave(user.id, {
                ...formData,
                group_ids: selectedGroupIds,
            });
            setIsEditing(false);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update user");
            setIsSaving(false);
        }
    };

    const toggleGroup = (groupId: number) => {
        if (!isEditing) return;
        setSelectedGroupIds(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isEditing) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
                        <p className="text-sm text-gray-600 mt-0.5">{user.username}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isEditing && (
                            <button
                                onClick={handleEdit}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 transition-colors"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
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
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={user.username}
                                        disabled
                                        className="w-full h-10 px-3 text-sm bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Username cannot be changed</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-0.5">
                                            First Name
                                        </label>
                                        <p className="text-xs text-gray-500 mb-1.5">User's given name</p>
                                        <input
                                            type="text"
                                            value={isEditing ? (formData.first_name || "") : user.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            disabled={!isEditing}
                                            className="w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-0.5">
                                            Last Name
                                        </label>
                                        <p className="text-xs text-gray-500 mb-1.5">User's family name</p>
                                        <input
                                            type="text"
                                            value={isEditing ? (formData.last_name || "") : user.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            disabled={!isEditing}
                                            className="w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-0.5">
                                        Email
                                    </label>
                                    <p className="text-xs text-gray-500 mb-1.5">Primary email address for notifications</p>
                                    <input
                                        type="email"
                                        value={isEditing ? (formData.email || "") : user.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="is_active"
                                                checked={isEditing ? (formData.is_active ?? user.is_active) : user.is_active}
                                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                disabled={!isEditing}
                                                className="w-4 h-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue disabled:cursor-not-allowed"
                                            />
                                            <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-900">
                                                Active user
                                            </label>
                                        </div>
                                        <p className="ml-6 text-xs text-gray-500">User can access the system and perform actions</p>
                                    </div>

                                    <div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="is_superuser"
                                                checked={isEditing ? (formData.is_superuser ?? user.is_superuser) : user.is_superuser}
                                                onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
                                                disabled={!isEditing}
                                                className="w-4 h-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue disabled:cursor-not-allowed"
                                            />
                                            <label htmlFor="is_superuser" className="ml-2 text-sm font-medium text-gray-900">
                                                Superuser privileges
                                            </label>
                                        </div>
                                        <p className="ml-6 text-xs text-gray-500">Full system access including admin panel</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">Assigned Groups</h3>
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
                                            className={`flex items-center ${isEditing ? "cursor-pointer" : ""}`}
                                            onClick={() => isEditing && toggleGroup(group.id)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedGroupIds.includes(group.id)}
                                                onChange={() => toggleGroup(group.id)}
                                                disabled={!isEditing}
                                                className="w-4 h-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue disabled:cursor-not-allowed"
                                            />
                                            <label className="ml-2 text-sm text-gray-700 cursor-pointer">
                                                {group.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
