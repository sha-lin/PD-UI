export type AuditLogAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "OTHER";

export interface AuditLogUser {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
}

export interface AuditLog {
    id: number;
    user: AuditLogUser | null;
    action: AuditLogAction;
    action_display: string;
    model_name: string;
    object_id: string | null;
    object_repr: string | null;
    details: string;
    ip_address: string | null;
    timestamp: string;
}

export interface AuditLogFilters {
    search?: string;
    action?: AuditLogAction | "";
    model_name?: string;
    user?: number;
    page?: number;
}

export interface AuditLogResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: AuditLog[];
}
