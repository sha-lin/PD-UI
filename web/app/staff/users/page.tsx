"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import AdminLayout from "@/components/admin/admin-layout";
import Tabs from "@/components/admin/tabs";
import UsersTable from "@/components/admin/users-table";
import UsersTableFilters from "@/components/admin/users-table-filters";
import GroupsTable, { GroupWithCount } from "@/components/admin/groups-table";
import Pagination from "@/components/admin/pagination";
import TableSkeleton from "@/components/admin/table-skeleton";
import EmptyState from "@/components/admin/empty-state";
import UserModal from "@/components/admin/user-modal";
import AddUserModal from "@/components/admin/add-user-modal";
import GroupModal from "@/components/admin/group-modal";
import { fetchUsers, updateUser, fetchGroups, createGroup, updateGroup, deleteGroup } from "@/lib/api/users";
import { UserPlus, Shield, AlertTriangle } from "lucide-react";
import { User, UpdateUserPayload } from "@/types/user";

export default function UsersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<"users" | "groups">("users");
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
    const [superuserFilter, setSuperuserFilter] = useState<boolean | undefined>(undefined);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState<GroupWithCount | null>(null);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [deletingGroup, setDeletingGroup] = useState<GroupWithCount | null>(null);

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab === "groups") {
            setActiveTab("groups");
        }
    }, [searchParams]);

    const {
        data: usersData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["users", page, searchTerm, activeFilter, superuserFilter],
        queryFn: () =>
            fetchUsers({
                page,
                search: searchTerm || undefined,
                is_active: activeFilter,
                is_superuser: superuserFilter,
            }),
        retry: 1,
        enabled: activeTab === "users",
    });

    const {
        data: groups = [],
        isLoading: loadingGroups,
        error: groupsError,
    } = useQuery({
        queryKey: ["groups"],
        queryFn: fetchGroups,
        enabled: activeTab === "groups",
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ userId, updates }: { userId: number; updates: UpdateUserPayload }) =>
            updateUser(userId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });

    const createGroupMutation = useMutation({
        mutationFn: (name: string) => createGroup(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groups"] });
        },
    });

    const updateGroupMutation = useMutation({
        mutationFn: ({ groupId, name }: { groupId: number; name: string }) =>
            updateGroup(groupId, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groups"] });
        },
    });

    const deleteGroupMutation = useMutation({
        mutationFn: (groupId: number) => deleteGroup(groupId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groups"] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });

    const handleSaveUser = async (userId: number, updates: UpdateUserPayload) => {
        await updateUserMutation.mutateAsync({ userId, updates });
    };

    const handleSaveGroup = async (groupId: number | null, name: string) => {
        if (groupId) {
            await updateGroupMutation.mutateAsync({ groupId, name });
        } else {
            await createGroupMutation.mutateAsync(name);
        }
    };

    const handleEditGroup = (group: GroupWithCount) => {
        setEditingGroup(group);
        setShowGroupModal(true);
    };

    const handleDeleteGroup = (group: GroupWithCount) => {
        setDeletingGroup(group);
    };

    const confirmDeleteGroup = async () => {
        if (deletingGroup) {
            await deleteGroupMutation.mutateAsync(deletingGroup.id);
            setDeletingGroup(null);
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPage(1);
    };

    const handleActiveFilterChange = (value: boolean | undefined) => {
        setActiveFilter(value);
        setPage(1);
    };

    const handleSuperuserFilterChange = (value: boolean | undefined) => {
        setSuperuserFilter(value);
        setPage(1);
    };

    const handleNextPage = () => {
        if (usersData?.next) {
            setPage((prev) => prev + 1);
        }
    };

    const handlePreviousPage = () => {
        if (usersData?.previous && page > 1) {
            setPage((prev) => prev - 1);
        }
    };

    const calculateTotalPages = (totalCount: number, pageSize: number = 25): number => {
        return Math.ceil(totalCount / pageSize);
    };

    return (
        <AdminLayout>
            <header className="border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between px-8 py-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            {activeTab === "users"
                                ? "Manage system users, search by name or email, and filter by status and role."
                                : "Manage permission groups and control user access levels."
                            }
                        </p>
                    </div>
                    {activeTab === "users" ? (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 transition-colors"
                        >
                            <UserPlus className="w-4 h-4" />
                            Add User
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                setEditingGroup(null);
                                setShowGroupModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 transition-colors"
                        >
                            <Shield className="w-4 h-4" />
                            Create Group
                        </button>
                    )}
                </div>
                <div className="px-8">
                    <Tabs
                        tabs={[
                            { id: "users", label: "Users", count: usersData?.count },
                            { id: "groups", label: "Groups", count: groups.length },
                        ]}
                        activeTab={activeTab}
                        onTabChange={(tabId) => setActiveTab(tabId as "users" | "groups")}
                    />
                </div>
            </header>

            <main className="p-8 bg-white">
                {activeTab === "users" ? (
                    <>
                        <UsersTableFilters
                            searchTerm={searchTerm}
                            activeFilter={activeFilter}
                            superuserFilter={superuserFilter}
                            onSearchChange={handleSearchChange}
                            onActiveFilterChange={handleActiveFilterChange}
                            onSuperuserFilterChange={handleSuperuserFilterChange}
                        />

                        <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden mt-6">
                            {isLoading ? (
                                <TableSkeleton rows={10} columns={7} />
                            ) : usersData && usersData.results.length > 0 ? (
                                <>
                                    <UsersTable users={usersData.results} onViewUser={setEditingUser} />
                                    <Pagination
                                        currentPage={page}
                                        totalPages={calculateTotalPages(usersData.count)}
                                        hasNext={!!usersData.next}
                                        hasPrevious={!!usersData.previous}
                                        onNext={handleNextPage}
                                        onPrevious={handlePreviousPage}
                                    />
                                </>
                            ) : (
                                <div className="px-8">
                                    <EmptyState message="Try adjusting your search or filter criteria" />
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                        {loadingGroups ? (
                            <TableSkeleton rows={5} columns={3} />
                        ) : groups.length > 0 ? (
                            <GroupsTable
                                groups={groups as GroupWithCount[]}
                                onEditGroup={handleEditGroup}
                                onDeleteGroup={handleDeleteGroup}
                            />
                        ) : (
                            <div className="px-8">
                                <EmptyState message="No groups created yet. Click 'Create Group' to add one." />
                            </div>
                        )}
                    </div>
                )}

                {editingUser && (
                    <UserModal
                        user={editingUser}
                        isOpen={!!editingUser}
                        onClose={() => setEditingUser(null)}
                        onSave={handleSaveUser}
                    />
                )}

                <AddUserModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
                />

                <GroupModal
                    group={editingGroup}
                    isOpen={showGroupModal}
                    onClose={() => {
                        setShowGroupModal(false);
                        setEditingGroup(null);
                    }}
                    onSave={handleSaveGroup}
                />

                {deletingGroup && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Delete Group</h2>
                            </div>
                            <p className="text-sm text-gray-600 mb-6">
                                Are you sure you want to delete <strong>{deletingGroup.name}</strong>?
                                {deletingGroup.user_count && deletingGroup.user_count > 0 && (
                                    <span className="block mt-2 text-red-600">
                                        This group has {deletingGroup.user_count} {deletingGroup.user_count === 1 ? 'member' : 'members'}. They will lose access granted by this group.
                                    </span>
                                )}
                            </p>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setDeletingGroup(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteGroup}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                                >
                                    Delete Group
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </AdminLayout>
    );

}
