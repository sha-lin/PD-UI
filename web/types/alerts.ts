export type AlertType =
    | "low_stock"
    | "urgent_order"
    | "payment_due"
    | "system_error"
    | "new_lead"
    | "quote_expired"
    | "info";

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export interface SystemAlert {
    id: number;
    alert_type: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    link: string;
    visible_to_admins: boolean;
    visible_to_production: boolean;
    is_active: boolean;
    is_dismissed: boolean;
    dismissed_by: number | null;
    dismissed_at: string | null;
    related_client: number | null;
    related_quote: number | null;
    related_lpo: number | null;
    created_at: string;
    created_by: number | null;
}

export interface AlertFilters {
    search?: string;
    alert_type?: AlertType | "";
    severity?: AlertSeverity | "";
    is_active?: boolean;
    is_dismissed?: boolean;
    page?: number;
}

export interface AlertsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: SystemAlert[];
}
