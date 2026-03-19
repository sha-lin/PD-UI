"use client";

import { Suspense } from "react";
import AdminLayout from "@/components/admin/admin-layout";
import Tabs from "@/components/admin/tabs";
import UserModal from "@/components/admin/user-modal";
import AddUserModal from "@/components/admin/add-user-modal";
import GroupModal from "@/components/admin/group-modal";
import { useUsersPage } from "@/features/users/hooks/useUsersPage";
import UsersTab from "@/features/users/components/UsersTab";
import GroupsTab from "@/features/users/components/GroupsTab";
import DeleteDialog from "@/features/users/components/DeleteDialog";
import { UserPlus, Shield } from "lucide-react";

export default function UsersPage() {
    return (
        <Suspense fallback={null}>
            <UsersPageContent />
        </Suspense>
    );
}

function UsersPageContent() {
    const { activeTab, setActiveTab, filters, data, modals, handlers, calculateTotalPages } =
        useUsersPage();

    return (
        <AdminLayout>
            <header className="border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8 sm:py-6">
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                            User Management
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 hidden sm:block">
                            {activeTab === "users"
                                ? "Manage system users, search by name or email, and filter by status and role."
                                : "Manage permission groups and control user access levels."}
                        </p>
                    </div>
                    {activeTab === "users" ? (
                        <button
                            onClick={() => modals.setShowAddModal(true)}
                            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 sm:px-4 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 transition-colors"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add User</span>
                        </button>
                    ) : (
                        <button
                            onClick={handlers.openCreateGroupModal}
                            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 sm:px-4 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 transition-colors"
                        >
                            <Shield className="w-4 h-4" />
                            <span className="hidden sm:inline">Create Group</span>
                        </button>
                    )}
                </div>
                <div className="px-4 sm:px-8">
                    <Tabs
                        tabs={[
                            { id: "users", label: "Users", count: data.usersData?.count },
                            { id: "groups", label: "Groups", count: data.groups.length },
                        ]}
                        activeTab={activeTab}
                        onTabChange={(tabId) => setActiveTab(tabId as "users" | "groups")}
                    />
                </div>
            </header>

            <main className="p-4 sm:p-8 bg-gray-50">
                {activeTab === "users" ? (
                    <UsersTab
                        usersData={data.usersData}
                        isLoading={data.isLoading}
                        page={filters.page}
                        searchTerm={filters.searchTerm}
                        activeFilter={filters.activeFilter}
                        superuserFilter={filters.superuserFilter}
                        onSearchChange={handlers.handleSearchChange}
                        onActiveFilterChange={handlers.handleActiveFilterChange}
                        onSuperuserFilterChange={handlers.handleSuperuserFilterChange}
                        onNextPage={handlers.handleNextPage}
                        onPreviousPage={handlers.handlePreviousPage}
                        onViewUser={modals.setEditingUser}
                        onDeleteUser={handlers.handleDeleteUser}
                        calculateTotalPages={calculateTotalPages}
                    />
                ) : (
                    <GroupsTab
                        groups={data.groups}
                        isLoading={data.loadingGroups}
                        onEditGroup={handlers.handleEditGroup}
                        onDeleteGroup={handlers.handleDeleteGroup}
                    />
                )}

                {modals.editingUser && (
                    <UserModal
                        user={modals.editingUser}
                        isOpen={!!modals.editingUser}
                        onClose={() => modals.setEditingUser(null)}
                        onSave={handlers.handleSaveUser}
                    />
                )}

                <AddUserModal
                    isOpen={modals.showAddModal}
                    onClose={() => modals.setShowAddModal(false)}
                    onSuccess={handlers.handleAddUserSuccess}
                />

                <GroupModal
                    group={modals.editingGroup}
                    isOpen={modals.showGroupModal}
                    onClose={handlers.closeGroupModal}
                    onSave={handlers.handleSaveGroup}
                />

                {modals.deletingUser && (
                    <DeleteDialog
                        title="Delete User"
                        description={
                            <>
                                Are you sure you want to delete{" "}
                                <strong>{modals.deletingUser.username}</strong>? This action cannot
                                be undone.
                            </>
                        }
                        isPending={data.deleteUserPending}
                        confirmLabel="Delete User"
                        onConfirm={handlers.confirmDeleteUser}
                        onCancel={() => modals.setDeletingUser(null)}
                    />
                )}

                {modals.deletingGroup && (
                    <DeleteDialog
                        title="Delete Group"
                        description={
                            <>
                                Are you sure you want to delete{" "}
                                <strong>{modals.deletingGroup.name}</strong>?
                                {modals.deletingGroup.user_count &&
                                    modals.deletingGroup.user_count > 0 && (
                                        <span className="block mt-2 text-red-600">
                                            This group has {modals.deletingGroup.user_count}{" "}
                                            {modals.deletingGroup.user_count === 1
                                                ? "member"
                                                : "members"}
                                            . They will lose access granted by this group.
                                        </span>
                                    )}
                            </>
                        }
                        confirmLabel="Delete Group"
                        onConfirm={handlers.confirmDeleteGroup}
                        onCancel={() => modals.setDeletingGroup(null)}
                    />
                )}
            </main>
        </AdminLayout>
    );
}
