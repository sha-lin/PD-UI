"use client";

import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    CheckCircle2,
    LoaderCircle,
    Save,
} from "lucide-react";
import { toast } from "sonner";
import { changePassword, getCurrentUser } from "@/lib/api/auth";
import {
    loadProductionSettingsPreferences,
    saveProductionSettingsPreferences,
    updateStaffProfile,
} from "@/lib/api/production-settings";
import type { ChangePasswordData } from "@/types/auth";
import {
    DEFAULT_PRODUCTION_PROFILE_VALUES,
    DEFAULT_SECURITY_FORM_VALUES,
    type NotificationPreferences,
    type ProductionProfileValues,
    type ProductionSettingsPreferences,
    type SecurityFormValues,
    type WorkflowPreferences,
} from "@/types/production-settings";

const buildChangePasswordPayload = (values: SecurityFormValues): ChangePasswordData => {
    return {
        old_password: values.currentPassword,
        new_password: values.newPassword,
    };
};

const buildPreferencesPayload = (
    phone: string,
    notifications: NotificationPreferences,
    workflow: WorkflowPreferences,
): ProductionSettingsPreferences => {
    return {
        phone,
        notifications,
        workflow,
    };
};

export default function ProductionSettingsWorkspace(): ReactElement {
    const [profileValues, setProfileValues] = useState<ProductionProfileValues>(DEFAULT_PRODUCTION_PROFILE_VALUES);
    const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => {
        return loadProductionSettingsPreferences().notifications;
    });
    const [workflowPreferences, setWorkflowPreferences] = useState<WorkflowPreferences>(() => {
        return loadProductionSettingsPreferences().workflow;
    });
    const [securityValues, setSecurityValues] = useState<SecurityFormValues>(DEFAULT_SECURITY_FORM_VALUES);

    const currentUserQuery = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        retry: false,
    });

    useEffect((): void => {
        const storedPreferences = loadProductionSettingsPreferences();

        setProfileValues((previousValues: ProductionProfileValues): ProductionProfileValues => {
            return {
                ...previousValues,
                phone: storedPreferences.phone,
            };
        });
    }, []);

    useEffect((): void => {
        if (!currentUserQuery.data) {
            return;
        }

        setProfileValues((previousValues: ProductionProfileValues): ProductionProfileValues => {
            return {
                ...previousValues,
                firstName: currentUserQuery.data.first_name,
                lastName: currentUserQuery.data.last_name,
                email: currentUserQuery.data.email,
            };
        });
    }, [currentUserQuery.data]);

    const savePreferencesMutation = useMutation({
        mutationFn: async (): Promise<void> => {
            saveProductionSettingsPreferences(
                buildPreferencesPayload(profileValues.phone, notificationPreferences, workflowPreferences),
            );
        },
        onSuccess: (): void => {
            toast.success("Preferences saved successfully.");
        },
        onError: (): void => {
            toast.error("Unable to save preferences. Please try again.");
        },
    });

    const saveProfileMutation = useMutation({
        mutationFn: async (): Promise<void> => {
            if (!currentUserQuery.data) {
                throw new Error("Unable to load user profile");
            }

            await updateStaffProfile({
                first_name: profileValues.firstName.trim(),
                last_name: profileValues.lastName.trim(),
            });

            saveProductionSettingsPreferences(
                buildPreferencesPayload(profileValues.phone, notificationPreferences, workflowPreferences),
            );
        },
        onSuccess: (): void => {
            toast.success("Profile updated successfully.");
            void currentUserQuery.refetch();
        },
        onError: (error: unknown): void => {
            const message = error instanceof Error
                ? error.message
                : "Unable to update profile. Please try again.";
            toast.error(message);
        },
    });

    const changePasswordMutation = useMutation({
        mutationFn: async (): Promise<void> => {
            await changePassword(buildChangePasswordPayload(securityValues));
        },
        onSuccess: (): void => {
            setSecurityValues(DEFAULT_SECURITY_FORM_VALUES);
            toast.success("Password updated successfully.");
        },
        onError: (error: unknown): void => {
            const message = error instanceof Error
                ? error.message
                : "Unable to update password. Please try again.";
            toast.error(message);
        },
    });

    const handleSaveNotificationPreferences = (): void => {
        void savePreferencesMutation.mutateAsync();
    };

    const handleSaveWorkflowPreferences = (): void => {
        void savePreferencesMutation.mutateAsync();
    };

    const handleSaveProfile = (): void => {
        if (!profileValues.firstName.trim() || !profileValues.lastName.trim()) {
            toast.error("First name and last name are required.");
            return;
        }

        void saveProfileMutation.mutateAsync();
    };

    const handleChangePassword = (): void => {
        if (!securityValues.currentPassword || !securityValues.newPassword || !securityValues.confirmPassword) {
            toast.error("All password fields are required.");
            return;
        }

        if (securityValues.newPassword !== securityValues.confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        void changePasswordMutation.mutateAsync();
    };

    if (currentUserQuery.isLoading) {
        return (
            <main className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-6xl animate-pulse space-y-6">
                    <div className="h-10 w-64 rounded bg-gray-200"></div>
                    <div className="h-[640px] rounded-xl bg-white"></div>
                </div>
            </main>
        );
    }

    if (currentUserQuery.isError || !currentUserQuery.data) {
        return (
            <main className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-3xl rounded-xl border border-brand-red/20 bg-white p-8 text-center">
                    <h2 className="text-lg font-semibold text-gray-900">Unable to load profile settings</h2>
                    <p className="mt-2 text-sm text-gray-600">Refresh the page and try again.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-6xl">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage your production team preferences and configurations.
                    </p>
                </header>

                <div className="space-y-6">
                    <section id="profile-section" className="rounded-xl border border-gray-200 bg-white p-6">
                        <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>

                        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={profileValues.firstName}
                                    onChange={(event): void => {
                                        setProfileValues((previousValues: ProductionProfileValues): ProductionProfileValues => {
                                            return { ...previousValues, firstName: event.target.value };
                                        });
                                    }}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={profileValues.lastName}
                                    onChange={(event): void => {
                                        setProfileValues((previousValues: ProductionProfileValues): ProductionProfileValues => {
                                            return { ...previousValues, lastName: event.target.value };
                                        });
                                    }}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={profileValues.email}
                                    readOnly
                                    className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={profileValues.phone}
                                    onChange={(event): void => {
                                        setProfileValues((previousValues: ProductionProfileValues): ProductionProfileValues => {
                                            return { ...previousValues, phone: event.target.value };
                                        });
                                    }}
                                    placeholder="+254 XXX XXX XXX"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">Your Role</p>
                            <p className="mt-2 text-sm text-gray-600">You are currently assigned to the Production Team.</p>
                            <span className="mt-3 inline-flex rounded-md bg-brand-blue px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                                Production Team
                            </span>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={handleSaveProfile}
                                disabled={saveProfileMutation.isPending}
                                className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-60"
                            >
                                {saveProfileMutation.isPending ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                Save Profile
                            </button>
                        </div>
                    </section>

                    <section id="notifications-section" className="rounded-xl border border-gray-200 bg-white p-6">
                        <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>

                        <div className="mt-6 space-y-4">
                            <label className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">New Job Assignments</p>
                                    <p className="text-sm text-gray-600">
                                        Receive notifications when new jobs are assigned to you.
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={notificationPreferences.notifyNewJobs}
                                    onChange={(event): void => {
                                        setNotificationPreferences((previousValues: NotificationPreferences): NotificationPreferences => {
                                            return { ...previousValues, notifyNewJobs: event.target.checked };
                                        });
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                                />
                            </label>

                            <label className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Deadline Reminders</p>
                                    <p className="text-sm text-gray-600">
                                        Get reminders 24 hours before job deadlines.
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={notificationPreferences.notifyDeadlines}
                                    onChange={(event): void => {
                                        setNotificationPreferences((previousValues: NotificationPreferences): NotificationPreferences => {
                                            return { ...previousValues, notifyDeadlines: event.target.checked };
                                        });
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                                />
                            </label>

                            <label className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Quality Control Updates</p>
                                    <p className="text-sm text-gray-600">
                                        Be notified when QC inspections are completed or require action.
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={notificationPreferences.notifyQualityControl}
                                    onChange={(event): void => {
                                        setNotificationPreferences((previousValues: NotificationPreferences): NotificationPreferences => {
                                            return { ...previousValues, notifyQualityControl: event.target.checked };
                                        });
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                                />
                            </label>

                            <label className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Vendor Deliveries</p>
                                    <p className="text-sm text-gray-600">
                                        Alert when vendors deliver items to the warehouse.
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={notificationPreferences.notifyDeliveries}
                                    onChange={(event): void => {
                                        setNotificationPreferences((previousValues: NotificationPreferences): NotificationPreferences => {
                                            return { ...previousValues, notifyDeliveries: event.target.checked };
                                        });
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                                />
                            </label>

                            <label className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">System Updates</p>
                                    <p className="text-sm text-gray-600">
                                        Receive important system announcements.
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={notificationPreferences.notifySystem}
                                    onChange={(event): void => {
                                        setNotificationPreferences((previousValues: NotificationPreferences): NotificationPreferences => {
                                            return { ...previousValues, notifySystem: event.target.checked };
                                        });
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                                />
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={handleSaveNotificationPreferences}
                                disabled={savePreferencesMutation.isPending}
                                className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-60"
                            >
                                {savePreferencesMutation.isPending ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                Save Notifications
                            </button>
                        </div>
                    </section>

                    <section id="workflow-section" className="rounded-xl border border-gray-200 bg-white p-6">
                        <h2 className="text-lg font-semibold text-gray-900">Workflow Configuration</h2>

                        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    Default Dashboard View
                                </label>
                                <select
                                    value={workflowPreferences.defaultView}
                                    onChange={(event): void => {
                                        setWorkflowPreferences((previousValues: WorkflowPreferences): WorkflowPreferences => {
                                            return {
                                                ...previousValues,
                                                defaultView: event.target.value as WorkflowPreferences["defaultView"],
                                            };
                                        });
                                    }}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                                >
                                    <option value="kanban">Kanban Board</option>
                                    <option value="list">List View</option>
                                    <option value="calendar">Calendar View</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    Items Per Page
                                </label>
                                <select
                                    value={workflowPreferences.itemsPerPage}
                                    onChange={(event): void => {
                                        setWorkflowPreferences((previousValues: WorkflowPreferences): WorkflowPreferences => {
                                            return {
                                                ...previousValues,
                                                itemsPerPage: Number(event.target.value) as WorkflowPreferences["itemsPerPage"],
                                            };
                                        });
                                    }}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    Date Format
                                </label>
                                <select
                                    value={workflowPreferences.dateFormat}
                                    onChange={(event): void => {
                                        setWorkflowPreferences((previousValues: WorkflowPreferences): WorkflowPreferences => {
                                            return {
                                                ...previousValues,
                                                dateFormat: event.target.value as WorkflowPreferences["dateFormat"],
                                            };
                                        });
                                    }}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                                >
                                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    Time Format
                                </label>
                                <select
                                    value={workflowPreferences.timeFormat}
                                    onChange={(event): void => {
                                        setWorkflowPreferences((previousValues: WorkflowPreferences): WorkflowPreferences => {
                                            return {
                                                ...previousValues,
                                                timeFormat: event.target.value as WorkflowPreferences["timeFormat"],
                                            };
                                        });
                                    }}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                                >
                                    <option value="12">12-hour (AM/PM)</option>
                                    <option value="24">24-hour</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">Auto Refresh</p>
                            <p className="mt-2 text-sm text-gray-600">
                                Dashboard auto-refreshes every 5 minutes to show the latest job updates.
                            </p>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={handleSaveWorkflowPreferences}
                                disabled={savePreferencesMutation.isPending}
                                className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-60"
                            >
                                {savePreferencesMutation.isPending ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                Save Workflow
                            </button>
                        </div>
                    </section>

                    <section id="security-section" className="rounded-xl border border-gray-200 bg-white p-6">
                        <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>

                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={securityValues.currentPassword}
                                    onChange={(event): void => {
                                        setSecurityValues((previousValues: SecurityFormValues): SecurityFormValues => {
                                            return { ...previousValues, currentPassword: event.target.value };
                                        });
                                    }}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={securityValues.newPassword}
                                    onChange={(event): void => {
                                        setSecurityValues((previousValues: SecurityFormValues): SecurityFormValues => {
                                            return { ...previousValues, newPassword: event.target.value };
                                        });
                                    }}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={securityValues.confirmPassword}
                                    onChange={(event): void => {
                                        setSecurityValues((previousValues: SecurityFormValues): SecurityFormValues => {
                                            return { ...previousValues, confirmPassword: event.target.value };
                                        });
                                    }}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">Password Requirements</p>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
                                <li>Minimum 8 characters</li>
                                <li>At least one uppercase letter</li>
                                <li>At least one number</li>
                                <li>At least one special character</li>
                            </ul>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={handleChangePassword}
                                disabled={changePasswordMutation.isPending}
                                className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-60"
                            >
                                {changePasswordMutation.isPending ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                )}
                                Update Password
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
