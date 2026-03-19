"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
    fetchUsers,
    updateUser,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    deleteUser,
} from "@/lib/api/users";
import type { User, UpdateUserPayload, UsersListResponse } from "@/types/user";
import type { GroupWithCount } from "@/components/admin/groups-table";

export interface UsersPageHandlers {
    handleSaveUser: (userId: number, updates: UpdateUserPayload) => Promise<void>;
    handleDeleteUser: (user: User) => void;
    confirmDeleteUser: () => Promise<void>;
    handleAddUserSuccess: () => void;
    handleSaveGroup: (groupId: number | null, name: string) => Promise<void>;
    handleEditGroup: (group: GroupWithCount) => void;
    handleDeleteGroup: (group: GroupWithCount) => void;
    confirmDeleteGroup: () => Promise<void>;
    handleSearchChange: (value: string) => void;
    handleActiveFilterChange: (value: boolean | undefined) => void;
    handleSuperuserFilterChange: (value: boolean | undefined) => void;
    handleNextPage: () => void;
    handlePreviousPage: () => void;
    openCreateGroupModal: () => void;
    closeGroupModal: () => void;
}

export interface UsersPageData {
    usersData: UsersListResponse | undefined;
    isLoading: boolean;
    groups: GroupWithCount[];
    loadingGroups: boolean;
    deleteUserPending: boolean;
}

export interface UsersPageModalState {
    editingUser: User | null;
    setEditingUser: (user: User | null) => void;
    showAddModal: boolean;
    setShowAddModal: (show: boolean) => void;
    editingGroup: GroupWithCount | null;
    showGroupModal: boolean;
    deletingUser: User | null;
    setDeletingUser: (user: User | null) => void;
    deletingGroup: GroupWithCount | null;
    setDeletingGroup: (group: GroupWithCount | null) => void;
}

export interface UsersPageFilters {
    page: number;
    searchTerm: string;
    activeFilter: boolean | undefined;
    superuserFilter: boolean | undefined;
}

export interface UseUsersPageReturn {
    activeTab: "users" | "groups";
    setActiveTab: (tab: "users" | "groups") => void;
    filters: UsersPageFilters;
    data: UsersPageData;
    modals: UsersPageModalState;
    handlers: UsersPageHandlers;
    calculateTotalPages: (totalCount: number) => number;
}

export function useUsersPage(): UseUsersPageReturn {
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
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab === "groups") setActiveTab("groups");
    }, [searchParams]);

    const { data: usersData, isLoading } = useQuery({
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

    const { data: groups = [], isLoading: loadingGroups } = useQuery<GroupWithCount[]>({
        queryKey: ["groups"],
        queryFn: fetchGroups,
        enabled: activeTab === "groups",
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ userId, updates }: { userId: number; updates: UpdateUserPayload }) =>
            updateUser(userId, updates),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    });

    const createGroupMutation = useMutation({
        mutationFn: (name: string) => createGroup(name),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
    });

    const updateGroupMutation = useMutation({
        mutationFn: ({ groupId, name }: { groupId: number; name: string }) =>
            updateGroup(groupId, name),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
    });

    const deleteUserMutation = useMutation({
        mutationFn: (userId: number) => deleteUser(userId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
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

    const handleDeleteUser = (user: User) => setDeletingUser(user);

    const handleAddUserSuccess = () => {
        setShowAddModal(false);
        queryClient.invalidateQueries({ queryKey: ["users"] });
    };

    const confirmDeleteUser = async () => {
        if (!deletingUser) return;
        await deleteUserMutation.mutateAsync(deletingUser.id);
        setDeletingUser(null);
        setEditingUser(null);
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

    const openCreateGroupModal = () => {
        setEditingGroup(null);
        setShowGroupModal(true);
    };

    const closeGroupModal = () => {
        setShowGroupModal(false);
        setEditingGroup(null);
    };

    const handleDeleteGroup = (group: GroupWithCount) => setDeletingGroup(group);

    const confirmDeleteGroup = async () => {
        if (!deletingGroup) return;
        await deleteGroupMutation.mutateAsync(deletingGroup.id);
        setDeletingGroup(null);
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
        if (usersData?.next) setPage((prev) => prev + 1);
    };

    const handlePreviousPage = () => {
        if (usersData?.previous && page > 1) setPage((prev) => prev - 1);
    };

    const calculateTotalPages = (totalCount: number): number => Math.ceil(totalCount / 25);

    return {
        activeTab,
        setActiveTab,
        filters: { page, searchTerm, activeFilter, superuserFilter },
        data: {
            usersData,
            isLoading,
            groups,
            loadingGroups,
            deleteUserPending: deleteUserMutation.isPending,
        },
        modals: {
            editingUser,
            setEditingUser,
            showAddModal,
            setShowAddModal,
            editingGroup,
            showGroupModal,
            deletingUser,
            setDeletingUser,
            deletingGroup,
            setDeletingGroup,
        },
        handlers: {
            handleSaveUser,
            handleDeleteUser,
            confirmDeleteUser,
            handleAddUserSuccess,
            handleSaveGroup,
            handleEditGroup,
            handleDeleteGroup,
            confirmDeleteGroup,
            handleSearchChange,
            handleActiveFilterChange,
            handleSuperuserFilterChange,
            handleNextPage,
            handlePreviousPage,
            openCreateGroupModal,
            closeGroupModal,
        },
        calculateTotalPages,
    };
}
