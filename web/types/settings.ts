export interface SystemSettings {
    site_title?: string;
    support_email?: string;
    currency?: string;
    timezone?: string;
    maintenance_mode?: boolean;
    email_on_order?: boolean;
    email_on_quote?: boolean;
    daily_digest?: boolean;
    allow_registration?: boolean;
    session_timeout?: number;
}

export interface SettingItem {
    key: string;
    value: string;
    description?: string;
    is_public: boolean;
}

export interface UpdateSettingsPayload {
    [key: string]: string | boolean | number;
}
