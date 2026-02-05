"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { fetchGroupById, fetchPermissions, updateGroupPermissions } from "@/lib/api/users";
import { Permission } from "@/types/user";
import { LoaderOne } from "@/components/ui/loader";
import { ArrowLeft, Save, Search, ChevronDown, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";

interface PermissionsByModule {
    [key: string]: Permission[];
}

export default function GroupDetailPage() {
    const router = useRouter();
    const params = useParams();
    const queryClient = useQueryClient();
    const groupId = parseInt(params.id as string);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const { data: group, isLoading: loadingGroup } = useQuery({
        queryKey: ["group", groupId],
        queryFn: () => fetchGroupById(groupId),
        retry: 1,
    });

    const { data: allPermissions = [], isLoading: loadingPermissions } = useQuery({
        queryKey: ["permissions"],
        queryFn: fetchPermissions,
    });

    useEffect(() => {
        if (group?.permissions) {
            const permissionIds = new Set(group.permissions.map(p => p.id));
            setSelectedPermissions(permissionIds);
        }
    }, [group]);

    const permissionsByModule = useMemo<PermissionsByModule>(() => {
        const grouped: PermissionsByModule = {};

        allPermissions.forEach(permission => {
            const moduleKey = `${permission.content_type.app_label}.${permission.content_type.model}`;
            if (!grouped[moduleKey]) {
                grouped[moduleKey] = [];
            }
            grouped[moduleKey].push(permission);
        });

        return grouped;
    }, [allPermissions]);

    const filteredModules = useMemo(() => {
        if (!searchTerm) return permissionsByModule;

        const filtered: PermissionsByModule = {};
        Object.entries(permissionsByModule).forEach(([moduleKey, permissions]) => {
            const matchingPerms = permissions.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.codename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                moduleKey.toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (matchingPerms.length > 0) {
                filtered[moduleKey] = matchingPerms;
            }
        });
        return filtered;
    }, [permissionsByModule, searchTerm]);

    const sortedModuleKeys = useMemo(() => {
        return Object.keys(filteredModules).sort((a, b) => a.localeCompare(b));
    }, [filteredModules]);

    useEffect(() => {
        if (searchTerm && sortedModuleKeys.length > 0) {
            setExpandedModules(new Set(sortedModuleKeys));
        }
    }, [searchTerm, sortedModuleKeys]);

    const updatePermissionsMutation = useMutation({
        mutationFn: (permissionIds: number[]) => updateGroupPermissions(groupId, permissionIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["group", groupId] });
            queryClient.invalidateQueries({ queryKey: ["groups"] });
            setHasChanges(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        },
    });

    const toggleModule = (moduleKey: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleKey)) {
            newExpanded.delete(moduleKey);
        } else {
            newExpanded.add(moduleKey);
        }
        setExpandedModules(newExpanded);
    };

    const togglePermission = (permissionId: number) => {
        const newSelected = new Set(selectedPermissions);
        if (newSelected.has(permissionId)) {
            newSelected.delete(permissionId);
        } else {
            newSelected.add(permissionId);
        }
        setSelectedPermissions(newSelected);
        setHasChanges(true);
    };

    const toggleAllInModule = (moduleKey: string) => {
        const modulePermissions = permissionsByModule[moduleKey];
        const allSelected = modulePermissions.every(p => selectedPermissions.has(p.id));

        const newSelected = new Set(selectedPermissions);
        modulePermissions.forEach(p => {
            if (allSelected) {
                newSelected.delete(p.id);
            } else {
                newSelected.add(p.id);
            }
        });

        setSelectedPermissions(newSelected);
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updatePermissionsMutation.mutateAsync(Array.from(selectedPermissions));
        } finally {
            setIsSaving(false);
        }
    };

    const formatModuleName = (moduleKey: string) => {
        const [appLabel, model] = moduleKey.split(".");
        return `${appLabel} › ${model.split("_").map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(" ")}`;
    };

    const getModulePermissionCount = (moduleKey: string) => {
        const modulePermissions = permissionsByModule[moduleKey];
        const selectedCount = modulePermissions.filter(p => selectedPermissions.has(p.id)).length;
        return { selected: selectedCount, total: modulePermissions.length };
    };

    if (loadingGroup || loadingPermissions) {
        return (
            <AdminLayout>
                <header className="border-b border-gray-200 bg-white">
                    <div className="px-8 py-4">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                                <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg">
                        <div className="p-6 border-b border-gray-200">
                            <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="p-6">
                                    <div className="h-6 w-64 bg-gray-200 rounded animate-pulse mb-4"></div>
                                    <div className="space-y-2 pl-8">
                                        <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                                        <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse"></div>
                                        <div className="h-4 w-4/6 bg-gray-100 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!group) {
        return (
            <AdminLayout>
                <div className="p-8">
                    <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Group not found</h3>
                        <p className="text-sm text-gray-500 mb-6">The group you are looking for does not exist.</p>
                        <button
                            onClick={() => router.push("/staff/users")}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Users
                        </button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const totalSelected = selectedPermissions.size;
    const totalPermissions = allPermissions.length;

    return (
        <AdminLayout>
            <header className="border-b border-gray-200 bg-white">
                <div className="px-8 py-4">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                {group.user_count} {group.user_count === 1 ? "member" : "members"} · {totalSelected} of {totalPermissions} permissions selected
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {saveSuccess && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span className="text-sm font-medium">Saved</span>
                                </div>
                            )}
                            {hasChanges && (
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                >
                                    {isSaving ? (
                                        <>
                                            <LoaderOne variant="light" />
                                            <span className="ml-2">Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/staff/users?tab=groups")}
                            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-blue transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back
                        </button>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <button
                                onClick={() => router.push("/staff/users")}
                                className="hover:text-brand-blue transition-colors"
                            >
                                User Management
                            </button>
                            <span>›</span>
                            <button
                                onClick={() => router.push("/staff/users?tab=groups")}
                                className="hover:text-brand-blue transition-colors"
                            >
                                Groups
                            </button>
                            <span>›</span>
                            <span className="text-gray-700">{group.name}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-8 space-y-6">

                <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search permissions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {sortedModuleKeys.length === 0 ? (
                            <div className="p-12 text-center">
                                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No permissions found</h3>
                                <p className="text-sm text-gray-500">Try adjusting your search</p>
                            </div>
                        ) : (
                            sortedModuleKeys.map((moduleKey) => {
                                const isExpanded = expandedModules.has(moduleKey);
                                const modulePermissions = filteredModules[moduleKey];
                                const { selected, total } = getModulePermissionCount(moduleKey);
                                const allSelected = selected === total && total > 0;
                                const someSelected = selected > 0 && selected < total;

                                return (
                                    <div key={moduleKey} className="bg-white">
                                        <div className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 cursor-pointer">
                                            <button
                                                onClick={() => toggleModule(moduleKey)}
                                                className="flex-1 flex items-center gap-3 text-left"
                                            >
                                                {isExpanded ? (
                                                    <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                )}
                                                <span className="text-sm font-medium text-gray-900">
                                                    {formatModuleName(moduleKey)}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    ({selected}/{total})
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => toggleAllInModule(moduleKey)}
                                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                            >
                                                {allSelected ? "Deselect All" : "Select All"}
                                            </button>
                                        </div>

                                        {isExpanded && (
                                            <div className="px-6 pb-4 space-y-2">
                                                {modulePermissions.map((permission) => (
                                                    <label
                                                        key={permission.id}
                                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPermissions.has(permission.id)}
                                                            onChange={() => togglePermission(permission.id)}
                                                            className="mt-0.5 h-4 w-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue focus:ring-offset-0"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {permission.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 font-mono">
                                                                {permission.codename}
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
