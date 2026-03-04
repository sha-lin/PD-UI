import type {
    CompleteProductionHandoffPayload,
    CompleteProductionHandoffResponse,
    ProductionHandoffQueueResponse,
} from "@/types/production-deliveries";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const getCsrfToken = (): string | null => {
    const name = "csrftoken";
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
        const trimmed = cookie.trim();
        if (trimmed.startsWith(`${name}=`)) {
            return decodeURIComponent(trimmed.substring(name.length + 1));
        }
    }

    return null;
};

const buildWriteHeaders = (): HeadersInit => {
    const csrfToken = getCsrfToken();
    return {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
    };
};

const readErrorText = async (response: Response): Promise<string> => {
    try {
        const payload = (await response.json()) as { detail?: string; error?: string; message?: string };
        if (payload.detail) {
            return payload.detail;
        }
        if (payload.error) {
            return payload.error;
        }
        if (payload.message) {
            return payload.message;
        }
    } catch (_error: unknown) {
    }

    return response.text().catch((_error: unknown): string => "Unknown error");
};

export async function fetchProductionHandoffQueue(search: string): Promise<ProductionHandoffQueueResponse> {
    const params = new URLSearchParams();
    if (search.trim()) {
        params.set("search", search.trim());
    }

    const queryString = params.toString();
    const response = await fetch(
        `${API_BASE_URL}/api/v1/deliveries/handoff-queue/${queryString ? `?${queryString}` : ""}`,
        {
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            cache: "no-store",
        }
    );

    if (!response.ok) {
        const errorText = await readErrorText(response);
        throw new Error(`Failed to fetch handoff queue: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function completeProductionHandoff(
    payload: CompleteProductionHandoffPayload
): Promise<CompleteProductionHandoffResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/deliveries/complete-handoff/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await readErrorText(response);
        throw new Error(`Failed to complete handoff: ${response.status} ${errorText}`);
    }

    return response.json();
}
