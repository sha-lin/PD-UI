import type {
    ClientOrder,
    ClientInvoice,
    InvoicesListResponse,
    OrdersListResponse,
} from "@/types/client-orders";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface OrdersQueryParams {
    page?: number;
    status?: string;
    search?: string;
}

export async function fetchClientOrders(
    params: OrdersQueryParams = {}
): Promise<OrdersListResponse> {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.status && params.status !== "all") qs.set("status", params.status);
    if (params.search?.trim()) qs.set("search", params.search.trim());

    const response = await fetch(
        `${API_BASE}/api/v1/client-orders/?${qs.toString()}`,
        { credentials: "include", cache: "no-store" }
    );
    if (!response.ok) {
        throw new Error("Failed to fetch orders");
    }
    return response.json() as Promise<OrdersListResponse>;
}

export async function fetchClientOrder(id: number): Promise<ClientOrder> {
    const response = await fetch(`${API_BASE}/api/v1/client-orders/${id}/`, {
        credentials: "include",
        cache: "no-store",
    });
    if (!response.ok) {
        throw new Error("Failed to fetch order");
    }
    return response.json() as Promise<ClientOrder>;
}

export async function fetchInvoicesForOrder(
    orderId: number
): Promise<ClientInvoice[]> {
    const response = await fetch(
        `${API_BASE}/api/v1/client-invoices/?order=${orderId}`,
        { credentials: "include", cache: "no-store" }
    );
    if (!response.ok) {
        return [];
    }
    const data = (await response.json()) as InvoicesListResponse;
    return data.results;
}

export async function submitClientOrder(id: number): Promise<ClientOrder> {
    const response = await fetch(
        `${API_BASE}/api/v1/client-orders/${id}/submit/`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        }
    );
    if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
            error?: string;
        };
        throw new Error(body.error ?? "Failed to submit order");
    }
    const data = (await response.json()) as { order: ClientOrder };
    return data.order;
}

export async function cancelClientOrder(id: number): Promise<ClientOrder> {
    const response = await fetch(
        `${API_BASE}/api/v1/client-orders/${id}/cancel/`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        }
    );
    if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
            error?: string;
        };
        throw new Error(body.error ?? "Failed to cancel order");
    }
    const data = (await response.json()) as { order: ClientOrder };
    return data.order;
}

export interface InvoicesQueryParams {
    page?: number;
    status?: string;
}

export async function fetchClientInvoices(
    params: InvoicesQueryParams = {}
): Promise<InvoicesListResponse> {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.status) qs.set("status", params.status);

    const response = await fetch(
        `${API_BASE}/api/v1/client-invoices/?${qs.toString()}`,
        { credentials: "include", cache: "no-store" }
    );
    if (!response.ok) {
        throw new Error("Failed to fetch invoices");
    }
    return response.json() as Promise<InvoicesListResponse>;
}
