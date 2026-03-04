export type ProductionSettingsSection = "profile" | "notifications" | "workflow" | "security";

export interface ProductionProfileValues {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

export interface NotificationPreferences {
    notifyNewJobs: boolean;
    notifyDeadlines: boolean;
    notifyQualityControl: boolean;
    notifyDeliveries: boolean;
    notifySystem: boolean;
}

export interface WorkflowPreferences {
    defaultView: "kanban" | "list" | "calendar";
    itemsPerPage: 10 | 25 | 50 | 100;
    dateFormat: "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy-mm-dd";
    timeFormat: "12" | "24";
}

export interface ProductionSettingsPreferences {
    phone: string;
    notifications: NotificationPreferences;
    workflow: WorkflowPreferences;
}

export interface SecurityFormValues {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export const DEFAULT_PRODUCTION_PROFILE_VALUES: ProductionProfileValues = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
    notifyNewJobs: true,
    notifyDeadlines: true,
    notifyQualityControl: true,
    notifyDeliveries: true,
    notifySystem: true,
};

export const DEFAULT_WORKFLOW_PREFERENCES: WorkflowPreferences = {
    defaultView: "kanban",
    itemsPerPage: 25,
    dateFormat: "dd/mm/yyyy",
    timeFormat: "12",
};

export const DEFAULT_PRODUCTION_SETTINGS_PREFERENCES: ProductionSettingsPreferences = {
    phone: "",
    notifications: DEFAULT_NOTIFICATION_PREFERENCES,
    workflow: DEFAULT_WORKFLOW_PREFERENCES,
};

export const DEFAULT_SECURITY_FORM_VALUES: SecurityFormValues = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
};
