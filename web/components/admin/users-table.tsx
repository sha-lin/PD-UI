"use client";

import { useRef, useState } from "react";
import { MoreHorizontalIcon, PencilIcon, TrashIcon, ShieldIcon } from "lucide-react";
import type { User } from "@/types/user";

interface UsersTableProps {
    users: User[];
    onViewUser: (user: User) => void;
    onDeleteUser: (user: User) => void;
}

const avatarColors = [
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-green-100 text-green-700",
    "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700",
    "bg-teal-100 text-teal-700",
];

function getUserInitials(user: User): string {
    const firstName = user.first_name?.trim();
    const lastName = user.last_name?.trim();
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName[0].toUpperCase();
    return user.username[0].toUpperCase();
}

function getAvatarColor(userId: number): string {
    return avatarColors[userId % avatarColors.length];
}

function getFullName(user: User): string {
    return `${user.first_name} ${user.last_name}`.trim();
}

function formatJoinDate(dateString: string | undefined | null): string {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function UserRowMenu({
    onView,
    onDelete,
}: {
    onView: () => void;
    onDelete: () => void;
}) {
    const [open, setOpen] = useState<boolean>(false);
    const [menuPos, setMenuPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);

    const handleOpen = (): void => {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setMenuPos({
                top: rect.bottom + window.scrollY + 4,
                right: window.innerWidth - rect.right,
            });
        }
        setOpen((prev) => !prev);
    };

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                onClick={handleOpen}
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
                <MoreHorizontalIcon className="h-4 w-4" />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div
                        style={{ top: menuPos.top, right: menuPos.right }}
                        className="fixed z-50 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                    >
                        <button
                            type="button"
                            onClick={() => { onView(); setOpen(false); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <PencilIcon className="h-4 w-4" />
                            Edit
                        </button>
                        <div className="my-1 border-t border-gray-100" />
                        <button
                            type="button"
                            onClick={() => { onDelete(); setOpen(false); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                            <TrashIcon className="h-4 w-4" />
                            Delete
                        </button>
                    </div>
                </>
            )}
        </>
    );
}

export default function UsersTable({ users, onViewUser, onDeleteUser }: UsersTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            User
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hidden lg:table-cell">
                            Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hidden sm:table-cell">
                            Role
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hidden md:table-cell">
                            Groups
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hidden xl:table-cell">
                            Joined
                        </th>
                        <th className="w-10 px-4 py-3" />
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {users.map((user) => {
                        const fullName = getFullName(user);
                        return (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${getAvatarColor(user.id)}`}
                                        >
                                            {getUserInitials(user)}
                                        </div>
                                        <div className="min-w-0">
                                            <button
                                                type="button"
                                                onClick={() => onViewUser(user)}
                                                className="block text-sm font-medium text-gray-900 hover:text-brand-blue text-left"
                                            >
                                                {fullName || user.username}
                                            </button>
                                            <p className="text-xs text-gray-400">@{user.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 hidden lg:table-cell">
                                    <span className="text-sm text-gray-600">{user.email || "—"}</span>
                                </td>
                                <td className="px-4 py-3 hidden sm:table-cell">
                                    {user.is_superuser ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                                            <ShieldIcon className="h-3 w-3" />
                                            Superuser
                                        </span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                            User
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 hidden md:table-cell">
                                    {user.groups && user.groups.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {user.groups.slice(0, 2).map((group) => (
                                                <span
                                                    key={group.id}
                                                    className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
                                                >
                                                    {group.name}
                                                </span>
                                            ))}
                                            {user.groups.length > 2 && (
                                                <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                                                    +{user.groups.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {user.is_active ? (
                                        <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                            Inactive
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 hidden xl:table-cell">
                                    <span className="text-xs text-gray-400">{formatJoinDate(user.date_joined)}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <UserRowMenu
                                        onView={() => onViewUser(user)}
                                        onDelete={() => onDeleteUser(user)}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
