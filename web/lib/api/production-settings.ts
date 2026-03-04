import { getCsrfToken } from "@/lib/api/auth";
import type { User } from "@/types/auth";
import {
    DEFAULT_PRODUCTION_SETTINGS_PREFERENCES,
    type ProductionSettingsPreferences,
} from "@/types/production-settings";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PRODUCTION_SETTINGS_STORAGE_KEY = "pd-production-settings-v1";

interface ApiError {
    error?: string;
    detail?: string;
    message?: string;
}

class ProductionSettingsApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
    ) {
        super(message);
        this.name = "ProductionSettingsApiError";
    }
}

const parsePreferences = (rawValue: string): ProductionSettingsPreferences => {
    const parsedValue = JSON.parse(rawValue) as Partial<ProductionSettingsPreferences>;

    return {
        phone: typeof parsedValue.phone === "string" ? parsedValue.phone : "",
        notifications: {
            ...DEFAULT_PRODUCTION_SETTINGS_PREFERENCES.notifications,
            ...(parsedValue.notifications ?? {}),
        },
        workflow: {
            ...DEFAULT_PRODUCTION_SETTINGS_PREFERENCES.workflow,
            ...(parsedValue.workflow ?? {}),
        },
    };
};

export const loadProductionSettingsPreferences = (): ProductionSettingsPreferences => {
    if (typeof window === "undefined") {
        return DEFAULT_PRODUCTION_SETTINGS_PREFERENCES;
    }

    const storedValue = window.localStorage.getItem(PRODUCTION_SETTINGS_STORAGE_KEY);

    if (!storedValue) {
        return DEFAULT_PRODUCTION_SETTINGS_PREFERENCES;
    }

    try {
        return parsePreferences(storedValue);
    } catch (_error: unknown) {
        return DEFAULT_PRODUCTION_SETTINGS_PREFERENCES;
    }
};

export const saveProductionSettingsPreferences = (preferences: ProductionSettingsPreferences): void => {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(PRODUCTION_SETTINGS_STORAGE_KEY, JSON.stringify(preferences));
};

export const updateStaffProfile = async (
    payload: { first_name: string; last_name: string },
): Promise<User> => {
    const csrfToken = await getCsrfToken();

    const response = await fetch(`${API_BASE_URL}/api/v1/users/me/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = (await response.json().catch((): ApiError => ({}))) as ApiError;
        const message =
            errorData.error ||
            errorData.detail ||
            errorData.message ||
            "Unable to process request. Please try again.";

        throw new ProductionSettingsApiError(message, response.status);
    }

    return response.json() as Promise<User>;
};
