export type OrderStatus =
    | "draft"
    | "submitted"
    | "acknowledged"
    | "in_production"
    | "ready"
    | "shipped"
    | "delivered"
    | "cancelled";

export type InvoiceStatus = "draft" | "issued" | "overdue" | "paid" | "cancelled";

export interface ClientOrderItem {
    id: number;
    product: number;
    product_name: string;
    product_sku: string;
    quantity: number;
    unit_price: string;
    line_total: string;
    specifications: Record<string, string>;
    created_at: string;
}

export interface ClientOrder {
    id: number;
    order_number: string;
    client: number;
    client_name: string;
    quote: number | null;
    quote_number: string | null;
    job: number | null;
    status: OrderStatus;
    subtotal: string;
    tax_amount: string;
    shipping_cost: string;
    total_amount: string;
    shipping_address: string;
    delivery_date: string | null;
    special_instructions: string;
    items: ClientOrderItem[];
    created_by: number | null;
    created_at: string;
    updated_at: string;
    submitted_at: string | null;
}

export interface ClientInvoice {
    id: number;
    invoice_number: string;
    client: number;
    client_name: string;
    order: number | null;
    order_number: string | null;
    subtotal: string;
    tax_amount: string;
    total_amount: string;
    amount_paid: string;
    balance_due: string;
    status: InvoiceStatus;
    invoice_date: string | null;
    due_date: string | null;
    issued_at: string | null;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface OrdersListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ClientOrder[];
}

export interface InvoicesListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ClientInvoice[];
}

export type NotificationType =
    | "order_confirmed"
    | "order_status_update"
    | "invoice_issued"
    | "payment_received"
    | "delivery_scheduled"
    | "ticket_reply"
    | "announcement"
    | "reminder";

export interface ClientPortalNotification {
    id: number;
    portal_user: number;
    notification_type: NotificationType;
    title: string;
    message: string;
    order: number | null;
    invoice: number | null;
    ticket: number | null;
    is_read: boolean;
    created_at: string;
    read_at: string | null;
}

export interface NotificationsListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ClientPortalNotification[];
}
