import { User, UsersListResponse, UsersQueryParams, UpdateUserPayload, Group, Permission } from "@/types/user";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class UsersApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number
    ) {
        super(message);
        this.name = "UsersApiError";
    }
}

function getCsrfToken(): string | null {
    const name = "csrftoken";
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        const trimmed = cookie.trim();
        if (trimmed.startsWith(name + "=")) {
            return decodeURIComponent(trimmed.substring(name.length + 1));
        }
    }
    return null;
}

export async function fetchUsers(
    params: UsersQueryParams = {}
): Promise<UsersListResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) {
        searchParams.append("page", params.page.toString());
    }
    if (params.search) {
        searchParams.append("search", params.search);
    }
    if (params.is_active !== undefined) {
        searchParams.append("is_active", params.is_active.toString());
    }
    if (params.is_superuser !== undefined) {
        searchParams.append("is_superuser", params.is_superuser.toString());
    }

    const url = `${API_BASE_URL}/api/v1/users/?${searchParams.toString()}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new UsersApiError("Authentication required", 401);
            }
            if (response.status === 403) {
                throw new UsersApiError("Access denied", 403);
            }
            throw new UsersApiError("Failed to fetch users");
        }

        const data: UsersListResponse = await response.json();
        return data;
    } catch (error) {
        if (error instanceof UsersApiError) {
            throw error;
        }
        throw new UsersApiError("Unable to load users. Please try again.");
    }
}

export async function fetchUserById(userId: number): Promise<User> {
    const url = `${API_BASE_URL}/api/v1/users/${userId}/`;

    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new UsersApiError("Authentication required", 401);
            }
            if (response.status === 403) {
                throw new UsersApiError("Access denied", 403);
            }
            if (response.status === 404) {
                throw new UsersApiError("User not found", 404);
            }
            throw new UsersApiError("Failed to fetch user");
        }

        const data: User = await response.json();
        return data;
    } catch (error) {
        if (error instanceof UsersApiError) {
            throw error;
        }
        throw new UsersApiError("Unable to load user. Please try again.");
    }
}

export async function updateUser(userId: number, updates: UpdateUserPayload): Promise<User> {
    const url = `${API_BASE_URL}/api/v1/users/${userId}/`;
    const csrfToken = getCsrfToken();

    try {
        const response = await fetch(url, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new UsersApiError("Authentication required", 401);
            }
            if (response.status === 403) {
                throw new UsersApiError("Access denied", 403);
            }
            if (response.status === 404) {
                throw new UsersApiError("User not found", 404);
            }
            throw new UsersApiError("Failed to update user");
        }

        const data: User = await response.json();
        return data;
    } catch (error) {
        if (error instanceof UsersApiError) {
            throw error;
        }
        throw new UsersApiError("Unable to update user. Please try again.");
    }
}

export async function fetchGroups(): Promise<Group[]> {
    const url = `${API_BASE_URL}/api/v1/groups/`;

    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new UsersApiError("Failed to fetch groups");
        }

        const data: Group[] = await response.json();
        return data;
    } catch (error) {
        if (error instanceof UsersApiError) {
            throw error;
        }
        throw new UsersApiError("Unable to load groups. Please try again.");
    }
}

export async function createGroup(name: string): Promise<Group> {
    const url = `${API_BASE_URL}/api/v1/groups/`;
    const csrfToken = getCsrfToken();

    try {
        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(csrfToken && { "X-CSRFToken": csrfToken }),
            },
            body: JSON.stringify({ name }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new UsersApiError(data.detail || "Failed to create group");
        }

        const data: Group = await response.json();
        return data;
    } catch (error) {
        if (error instanceof UsersApiError) {
            throw error;
        }
        throw new UsersApiError("Unable to create group. Please try again.");
    }
}

export async function updateGroup(groupId: number, name: string): Promise<Group> {
    const url = `${API_BASE_URL}/api/v1/groups/${groupId}/`;
    const csrfToken = getCsrfToken();

    try {
        const response = await fetch(url, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(csrfToken && { "X-CSRFToken": csrfToken }),
            },
            body: JSON.stringify({ name }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new UsersApiError(data.detail || "Failed to update group");
        }

        const data: Group = await response.json();
        return data;
    } catch (error) {
        if (error instanceof UsersApiError) {
            throw error;
        }
        throw new UsersApiError("Unable to update group. Please try again.");
    }
}

export async function deleteGroup(groupId: number): Promise<void> {
    const url = `${API_BASE_URL}/api/v1/groups/${groupId}/`;
    const csrfToken = getCsrfToken();

    try {
        const response = await fetch(url, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(csrfToken && { "X-CSRFToken": csrfToken }),
            },
        });

        if (!response.ok) {
            const data = await response.json();
            throw new UsersApiError(data.detail || "Failed to delete group");
        }
    } catch (error) {
        if (error instanceof UsersApiError) {
            throw error;
        }
        throw new UsersApiError("Unable to delete group. Please try again.");
    }
}

export async function fetchGroupById(groupId: number): Promise<Group> {
    const url = `${API_BASE_URL}/api/v1/groups/${groupId}/`;

    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new UsersApiError("Group not found", 404);
            }
            throw new UsersApiError("Failed to fetch group");
        }

        const data: Group = await response.json();
        return data;
    } catch (error) {
        if (error instanceof UsersApiError) {
            throw error;
        }
        throw new UsersApiError("Unable to load group. Please try again.");
    }
}

export async function fetchPermissions(): Promise<Permission[]> {
    const url = `${API_BASE_URL}/api/v1/permissions/`;

    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new UsersApiError("Failed to fetch permissions");
        }

        const data: Permission[] = await response.json();
        return data;
    } catch (error) {
        if (error instanceof UsersApiError) {
            throw error;
        }
        throw new UsersApiError("Unable to load permissions. Please try again.");
    }
}

export async function updateGroupPermissions(groupId: number, permissionIds: number[]): Promise<Group> {
    const url = `${API_BASE_URL}/api/v1/groups/${groupId}/`;
    const csrfToken = getCsrfToken();

    try {
        const response = await fetch(url, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(csrfToken && { "X-CSRFToken": csrfToken }),
            },
            body: JSON.stringify({ permission_ids: permissionIds }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new UsersApiError(data.detail || "Failed to update group permissions");
        }

        const data: Group = await response.json();
        return data;
    } catch (error) {
        if (error instanceof UsersApiError) {
            throw error;
        }
        throw new UsersApiError("Unable to update group permissions. Please try again.");
    }
}
