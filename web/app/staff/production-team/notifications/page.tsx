"use client";

import type { ChangeEvent, ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    AlertCircleIcon,
    BellIcon,
    CheckCircle2Icon,
    SearchIcon,
} from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/admin-layout";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/api/notifications";
import type { NotificationsQuery, UserNotification } from "@/types/notifications";

function getTypeBadgeClass(notificationType: string): string {
    if (notificationType.includes("approved") || notificationType.includes("completed")) {
        return "bg-brand-green/10 text-brand-green border-brand-green/20";
    }

    if (notificationType.includes("reminder") || notificationType.includes("request")) {
        return "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20";
    }

    if (notificationType.includes("adjustment") || notificationType.includes("discount")) {
        return "bg-brand-orange/10 text-brand-orange border-brand-orange/20";
    }

    return "bg-brand-blue/10 text-brand-blue border-brand-blue/20";
}

function formatDate(value: string): string {
    return new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ProductionNotificationsPage(): ReactElement {
    const queryClient = useQueryClient();
    const [searchInput, setSearchInput] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [notificationType, setNotificationType] = useState<string>("");
    const [unreadOnly, setUnreadOnly] = useState<boolean>(true);

    useEffect((): (() => void) => {
        const timer = setTimeout((): void => {
            setDebouncedSearch(searchInput.trim());
        }, 350);

        return (): void => clearTimeout(timer);
    }, [searchInput]);

    const query: NotificationsQuery = useMemo(
        (): NotificationsQuery => ({
            search: debouncedSearch,
            notificationType,
            unreadOnly,
        }),
        [debouncedSearch, notificationType, unreadOnly]
    );

    const notificationsQuery = useQuery({
        queryKey: ["production-notifications", query],
        queryFn: () => fetchNotifications(query),
    });

    const markReadMutation = useMutation({
        mutationFn: (notificationId: number) => markNotificationRead(notificationId),
        onSuccess: () => {
            toast.success("Notification marked as read.");
            queryClient.invalidateQueries({ queryKey: ["production-notifications"] });
        },
        onError: () => {
            toast.error("Unable to update notification.");
        },
    });

    const markAllReadMutation = useMutation({
        mutationFn: (notificationIds: number[]) => markAllNotificationsRead(notificationIds),
        onSuccess: () => {
            toast.success("All notifications marked as read.");
            queryClient.invalidateQueries({ queryKey: ["production-notifications"] });
        },
        onError: () => {
            toast.error("Unable to mark all notifications as read.");
        },
    });

    const notifications = useMemo(
        (): UserNotification[] => notificationsQuery.data?.results ?? [],
        [notificationsQuery.data?.results]
    );

    const unreadNotifications = useMemo(
        (): UserNotification[] => notifications.filter((notification: UserNotification): boolean => !notification.is_read),
        [notifications]
    );

    const handleMarkRead = (notificationId: number): void => {
        markReadMutation.mutate(notificationId);
    };

    const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        setNotificationType(event.target.value);
    };

    const handleMarkAllRead = (): void => {
        const unreadIds = unreadNotifications.map((notification: UserNotification): number => notification.id);
        if (unreadIds.length === 0) {
            return;
        }

        markAllReadMutation.mutate(unreadIds);
    };

    return (
        <AdminLayout>
            <header className="border-b border-gray-200 bg-white">
                <div className="px-8 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Production Team Notifications</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Notifications from the existing production notification stream.
                    </p>
                </div>
            </header>

            <main className="p-8">
                <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row">
                            <div className="relative flex-1">
                                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(event: ChangeEvent<HTMLInputElement>): void => setSearchInput(event.target.value)}
                                    placeholder="Search notifications..."
                                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                />
                            </div>

                            <select
                                value={notificationType}
                                onChange={handleTypeChange}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-blue"
                            >
                                <option value="">All Types</option>
                                <option value="lead_created">Lead Created</option>
                                <option value="quote_reminder">Quote Reminder</option>
                                <option value="quote_approved">Quote Approved</option>
                                <option value="quote_sent_pt">Sent to Production Team</option>
                                <option value="quote_pt_approved">Costed by Production Team</option>
                                <option value="job_completed">Job Completed</option>
                                <option value="general">General</option>
                            </select>

                            <label className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={unreadOnly}
                                    onChange={(event: ChangeEvent<HTMLInputElement>): void => setUnreadOnly(event.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                                />
                                Unread only
                            </label>

                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                disabled={markAllReadMutation.isPending || unreadNotifications.length === 0}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-blue hover:text-brand-blue disabled:opacity-50"
                            >
                                Mark all as read
                            </button>
                        </div>
                    </div>

                    {notificationsQuery.isLoading ? (
                        <div className="divide-y divide-gray-100 p-4">
                            {Array.from({ length: 5 }).map((_, index: number): ReactElement => (
                                <article key={`skeleton-${index}`} className="py-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200" />
                                                <div className="h-4 w-56 animate-pulse rounded bg-gray-200" />
                                                <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200" />
                                            </div>
                                            <div className="mt-3 h-4 w-full animate-pulse rounded bg-gray-200" />
                                            <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-gray-200" />
                                            <div className="mt-3 h-3 w-32 animate-pulse rounded bg-gray-200" />
                                        </div>
                                        <div className="h-8 w-24 animate-pulse rounded-md bg-gray-200" />
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : null}

                    {notificationsQuery.isError ? (
                        <div className="p-6">
                            <div className="rounded-lg border border-brand-red/20 bg-brand-red/5 p-4">
                                <p className="text-sm font-medium text-brand-red">Unable to load notifications.</p>
                            </div>
                        </div>
                    ) : null}

                    {!notificationsQuery.isLoading && !notificationsQuery.isError ? (
                        <div className="divide-y divide-gray-100">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <BellIcon className="mx-auto h-10 w-10 text-gray-300" />
                                    <p className="mt-3 text-sm text-gray-500">No production notifications available.</p>
                                </div>
                            ) : (
                                notifications.map((notification: UserNotification): ReactElement => (
                                    <article key={notification.id} className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <AlertCircleIcon className="h-4 w-4 text-brand-blue" />
                                                    <h2 className="truncate text-sm font-semibold text-gray-900">{notification.title}</h2>
                                                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getTypeBadgeClass(notification.notification_type)}`}>
                                                        {notification.notification_type}
                                                    </span>
                                                    {!notification.is_read ? <span className="text-xs font-medium text-brand-red">New</span> : null}
                                                </div>
                                                <p className="mt-2 text-sm text-gray-700">{notification.message}</p>
                                                <p className="mt-2 text-xs text-gray-500">{formatDate(notification.created_at)}</p>
                                            </div>

                                            {!notification.is_read ? (
                                                <button
                                                    type="button"
                                                    onClick={(): void => handleMarkRead(notification.id)}
                                                    disabled={markReadMutation.isPending}
                                                    className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-brand-blue hover:text-brand-blue disabled:opacity-50"
                                                >
                                                    <CheckCircle2Icon className="h-3.5 w-3.5" />
                                                    Mark read
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400">Read</span>
                                            )}
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    ) : null}
                </section>
            </main>
        </AdminLayout>
    );
}
