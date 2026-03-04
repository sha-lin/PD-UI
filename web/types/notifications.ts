export interface UserNotification {
    id: number;
    recipient: number;
    notification_type: string;
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
    related_lead: number | null;
    related_quote_id: string | null;
    related_job: number | null;
    action_url: string | null;
    action_label: string | null;
}

export interface NotificationsQuery {
    search?: string;
    notificationType?: string;
    unreadOnly?: boolean;
}

export interface NotificationsResponse {
    results: UserNotification[];
    count: number;
}
