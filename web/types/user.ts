export interface ContentType {
    app_label: string;
    model: string;
}

export interface Permission {
    id: number;
    name: string;
    codename: string;
    content_type: ContentType;
}

export interface Group {
    id: number;
    name: string;
    user_count?: number;
    permissions?: Permission[];
}

export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    is_superuser: boolean;
    groups?: Group[];
    date_joined?: string;
    last_login?: string | null;
}

export interface UsersListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: User[];
}

export interface UsersQueryParams {
    page?: number;
    search?: string;
    is_active?: boolean;
    is_superuser?: boolean;
}

export interface UpdateUserPayload {
    first_name?: string;
    last_name?: string;
    email?: string;
    is_active?: boolean;
    is_superuser?: boolean;
    group_ids?: number[];
}
