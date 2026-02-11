"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/admin-layout";
import { fetchUserById, updateUser } from "@/lib/api/users";
import { fetchAuditLogs } from "@/lib/api/audit-logs";
import { UpdateUserPayload } from "@/types/user";
import {
    ArrowLeft,
    Mail,
    Calendar,
    Shield,
    Users,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Edit,
    Save,
    X
} from "lucide-react";
import Link from "next/link";

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const userId = parseInt(params.id as string);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UpdateUserPayload>({});

    const { data: user, isLoading, error } = useQuery({
        queryKey: ["user", userId],
        queryFn: () => fetchUserById(userId),
        retry: 1,
    });

    const { data: activityData } = useQuery({
        queryKey: ["user-activity", userId],
        queryFn: () => fetchAuditLogs({ user: userId, page: 1 }),
        enabled: !!user,
    });

    const updateMutation = useMutation({
        mutationFn: (updates: UpdateUserPayload) => updateUser(userId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user", userId] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setIsEditing(false);
        },
    });

    const handleEdit = () => {
        if (user) {
            setFormData({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                is_active: user.is_active,
                is_superuser: user.is_superuser,
            });
            setIsEditing(true);
        }
    };

    const handleSave = () => {
        updateMutation.mutate(formData);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({});
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="p-8">
                    <div className="space-y-4">
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (error || !user) {
        return (
            <AdminLayout>
                <div className="p-8">
                    <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            The user you're looking for doesn't exist or you don't have permission to view it.
                        </p>
                        <Link
                            href="/staff/users"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Users
                        </Link>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <header className="border-b border-gray-200 bg-white">
                <div className="px-8 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <Link href="/staff" className="hover:text-brand-blue">Staff Portal</Link>
                        <span>/</span>
                        <Link href="/staff/users" className="hover:text-brand-blue">Users</Link>
                        <span>/</span>
                        <span className="text-gray-900">{user.username}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                {user.first_name || user.last_name
                                    ? `${user.first_name} ${user.last_name}`.trim()
                                    : "No name provided"}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {!isEditing ? (
                                <button
                                    onClick={handleEdit}
                                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit User
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <X className="h-4 w-4" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={updateMutation.isPending}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 disabled:opacity-50 text-sm font-medium"
                                    >
                                        <Save className="h-4 w-4" />
                                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.first_name || ""}
                                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-900">{user.first_name || "-"}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Name
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.last_name || ""}
                                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-900">{user.last_name || "-"}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Mail className="h-4 w-4 inline mr-1" />
                                        Email
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={formData.email || ""}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-900">{user.email}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={isEditing ? formData.is_active : user.is_active}
                                                onChange={(e) => isEditing && setFormData({ ...formData, is_active: e.target.checked })}
                                                disabled={!isEditing}
                                                className="h-4 w-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Active</span>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={isEditing ? formData.is_superuser : user.is_superuser}
                                                onChange={(e) => isEditing && setFormData({ ...formData, is_superuser: e.target.checked })}
                                                disabled={!isEditing}
                                                className="h-4 w-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Superuser</span>
                                        </label>
                                    </div>
                                </div>

                                {user.date_joined && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Calendar className="h-4 w-4 inline mr-1" />
                                            Date Joined
                                        </label>
                                        <p className="text-sm text-gray-900">
                                            {new Date(user.date_joined).toLocaleDateString("en-US", {
                                                month: "long",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                )}

                                {user.last_login && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Login
                                        </label>
                                        <p className="text-sm text-gray-900">
                                            {new Date(user.last_login).toLocaleDateString("en-US", {
                                                month: "long",
                                                day: "numeric",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                            {activityData && activityData.results.length > 0 ? (
                                <div className="space-y-3">
                                    {activityData.results.slice(0, 10).map((log) => (
                                        <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-shrink-0">
                                                {log.action === "CREATE" && <CheckCircle2 className="h-5 w-5 text-brand-green" />}
                                                {log.action === "UPDATE" && <Edit className="h-5 w-5 text-brand-yellow" />}
                                                {log.action === "DELETE" && <XCircle className="h-5 w-5 text-brand-red" />}
                                                {!["CREATE", "UPDATE", "DELETE"].includes(log.action) && (
                                                    <Shield className="h-5 w-5 text-brand-blue" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {log.action} {log.model_name}
                                                </p>
                                                {log.object_repr && (
                                                    <p className="text-sm text-gray-600">{log.object_repr}</p>
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(log.timestamp).toLocaleString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    <Link
                                        href={`/staff/audit-logs?user=${userId}`}
                                        className="block text-center text-sm text-brand-blue hover:underline mt-4"
                                    >
                                        View all activity
                                    </Link>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-8">No activity recorded</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Status
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Account Status</span>
                                    {user.is_active ? (
                                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                                            Inactive
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Superuser</span>
                                    {user.is_superuser ? (
                                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                                            Yes
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                                            No
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Groups
                            </h2>
                            {user.groups && user.groups.length > 0 ? (
                                <div className="space-y-2">
                                    {user.groups.map((group) => (
                                        <Link
                                            key={group.id}
                                            href={`/staff/users/groups/${group.id}`}
                                            className="block px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-900 transition-colors"
                                        >
                                            {group.name}
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No groups assigned</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
