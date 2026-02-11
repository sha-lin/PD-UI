import {
    CreateProcessPayload,
    CreateProcessTierPayload,
    CreateProcessVariablePayload,
    CreateProcessVariableRangePayload,
    CreateProcessVendorPayload,
    Process,
    ProcessDetailBundle,
    ProcessTier,
    ProcessVariable,
    ProcessVariableRange,
    ProcessVendor,
    ProcessesQueryParams,
    ProcessesResponse,
    UpdateProcessPayload,
    UpdateProcessTierPayload,
    UpdateProcessVariablePayload,
    UpdateProcessVariableRangePayload,
    UpdateProcessVendorPayload,
} from "@/types/processes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const buildQueryString = (params: ProcessesQueryParams): string => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", params.page.toString());
    searchParams.set("page_size", params.pageSize.toString());

    if (params.search.trim()) {
        searchParams.set("search", params.search.trim());
    }

    if (params.status !== "all") {
        searchParams.set("status", params.status);
    }

    if (params.pricingType !== "all") {
        searchParams.set("pricing_type", params.pricingType);
    }

    if (params.category !== "all") {
        searchParams.set("category", params.category);
    }

    if (params.ordering) {
        searchParams.set("ordering", params.ordering);
    }

    return searchParams.toString();
};

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
    const data = await response.json();
    return data as T;
};

const parseErrorText = async (response: Response): Promise<string> => {
    const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
    return errorText;
};

export async function fetchProcesses(params: ProcessesQueryParams): Promise<ProcessesResponse> {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/api/v1/processes/?${queryString}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await parseErrorText(response);
        throw new Error(`Failed to fetch processes: ${response.status} ${errorText}`);
    }

    return parseJsonResponse<ProcessesResponse>(response);
}

export async function fetchProcess(processId: number): Promise<Process> {
    const response = await fetch(`${API_BASE_URL}/api/v1/processes/${processId}/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await parseErrorText(response);
        throw new Error(`Failed to fetch process: ${response.status} ${errorText}`);
    }

    return parseJsonResponse<Process>(response);
}

export async function fetchProcessTiers(processId: number): Promise<ProcessTier[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/process-tiers/?process=${processId}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await parseErrorText(response);
        throw new Error(`Failed to fetch process tiers: ${response.status} ${errorText}`);
    }

    return parseJsonResponse<ProcessTier[]>(response);
}

export async function fetchProcessVariables(processId: number): Promise<ProcessVariable[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/process-variables/?process=${processId}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await parseErrorText(response);
        throw new Error(`Failed to fetch process variables: ${response.status} ${errorText}`);
    }

    return parseJsonResponse<ProcessVariable[]>(response);
}

export async function fetchProcessVendors(processId: number): Promise<ProcessVendor[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/process-vendors/?process=${processId}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await parseErrorText(response);
        throw new Error(`Failed to fetch process vendors: ${response.status} ${errorText}`);
    }

    return parseJsonResponse<ProcessVendor[]>(response);
}

export async function fetchProcessDetailBundle(processId: number): Promise<ProcessDetailBundle> {
    const [process, tiers, variables, vendors] = await Promise.all([
        fetchProcess(processId),
        fetchProcessTiers(processId),
        fetchProcessVariables(processId),
        fetchProcessVendors(processId),
    ]);

    return {
        process,
        tiers,
        variables,
        vendors,
    };
}

export async function createProcess(payload: CreateProcessPayload): Promise<Process> {
    const response = await fetch(`${API_BASE_URL}/api/v1/processes/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await parseErrorText(response);
        throw new Error(`Failed to create process: ${response.status} ${errorText}`);
    }

    return parseJsonResponse<Process>(response);
}

export async function updateProcess(processId: number, payload: UpdateProcessPayload): Promise<Process> {
    const response = await fetch(`${API_BASE_URL}/api/v1/processes/${processId}/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await parseErrorText(response);
        throw new Error(`Failed to update process: ${response.status} ${errorText}`);
    }

    return parseJsonResponse<Process>(response);
}

export async function deleteProcess(processId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/processes/${processId}/`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await parseErrorText(response);
        throw new Error(`Failed to delete process: ${response.status} ${errorText}`);
    }
}

export async function createProcessTier(payload: CreateProcessTierPayload): Promise<ProcessTier> {
    const response = await fetch(`${API_BASE_URL}/api/v1/process-tiers/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await parseErrorText(response);
        throw new Error(`Failed to create process tier: ${response.status} ${errorText}`);
    }

    return parseJsonResponse<ProcessTier>(response);
}

export async function updateProcessTier(tierId: number, payload: UpdateProcessTierPayload): Promise<ProcessTier> {
    const response = await fetch(`${API_BASE_URL}/api/v1/process-tiers/${tierId}/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await parseErrorText(response);
        throw new Error(`Failed to update process tier: ${response.status} ${errorText}`);
    }

    return parseJsonResponse<ProcessTier>(response);
}

export async function deleteProcessTier(tierId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/process-tiers/${tierId}/`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await parseErrorText(response);
        throw new Error(`Failed to delete process tier: ${response.status} ${errorText}`);
    }
}

export async function createProcessVariable(payload: CreateProcessVariablePayload): Promise<ProcessVariable> {
    const response = await fetch(`${API_BASE_URL}/api/v1/process-variables/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await parseErrorText(response);
        throw new Error(`Failed to create process variable: ${response.status} ${errorText}`);
    }

    return parseJsonResponse<ProcessVariable>(response);
}

export async function updateProcessVariable(
    variableId: number,
    payload: UpdateProcessVariablePayload
): Promise<ProcessVariable> {
    const response = await fetch(`${API_BASE_URL}/api/v1/process-variables/${variableId}/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await parseErrorText(response);
        throw new Error(`Failed to update process variable: ${response.status} ${errorText}`);
    }

    return parseJsonResponse<ProcessVariable>(response);
}

export async function deleteProcessVariable(variableId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/process-variables/${variableId}/`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await parseErrorText(response);
        throw new Error(`Failed to delete process variable: ${response.status} ${errorText}`);
    }
}

export async function createProcessVendor(payload: CreateProcessVendorPayload): Promise<ProcessVendor> {
    const response = await fetch(`${API_BASE_URL}/api/v1/process-vendors/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await parseErrorText(response);
        throw new Error(`Failed to create process vendor: ${response.status} ${errorText}`);
    }

    return parseJsonResponse<ProcessVendor>(response);
}

export async function updateProcessVendor(
    vendorId: number,
    payload: UpdateProcessVendorPayload
): Promise<ProcessVendor> {
    const response = await fetch(`${API_BASE_URL}/api/v1/process-vendors/${vendorId}/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await parseErrorText(response);
        throw new Error(`Failed to update process vendor: ${response.status} ${errorText}`);
    }

    return parseJsonResponse<ProcessVendor>(response);
}

export async function deleteProcessVendor(vendorId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/process-vendors/${vendorId}/`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await parseErrorText(response);
        throw new Error(`Failed to delete process vendor: ${response.status} ${errorText}`);
    }
}

export async function fetchProcessVariableRanges(variableId: number): Promise<ProcessVariableRange[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/process-variable-ranges/?variable=${variableId}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await parseErrorText(response);
        throw new Error(`Failed to fetch variable ranges: ${response.status} ${errorText}`);
    }

    return parseJsonResponse<ProcessVariableRange[]>(response);
}

export async function createProcessVariableRange(
    payload: CreateProcessVariableRangePayload
): Promise<ProcessVariableRange> {
    const response = await fetch(`${API_BASE_URL}/api/v1/process-variable-ranges/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await parseErrorText(response);
        throw new Error(`Failed to create variable range: ${response.status} ${errorText}`);
    }

    return parseJsonResponse<ProcessVariableRange>(response);
}

export async function updateProcessVariableRange(
    rangeId: number,
    payload: UpdateProcessVariableRangePayload
): Promise<ProcessVariableRange> {
    const response = await fetch(`${API_BASE_URL}/api/v1/process-variable-ranges/${rangeId}/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await parseErrorText(response);
        throw new Error(`Failed to update variable range: ${response.status} ${errorText}`);
    }

    return parseJsonResponse<ProcessVariableRange>(response);
}

export async function deleteProcessVariableRange(rangeId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/process-variable-ranges/${rangeId}/`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await parseErrorText(response);
        throw new Error(`Failed to delete variable range: ${response.status} ${errorText}`);
    }
}
