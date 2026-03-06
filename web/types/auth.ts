export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthTokens {
    access: string;
    refresh: string;
}

export type StaffGroup = "Admin" | "Account Manager" | "Production Team";

export type UserGroup = StaffGroup;

export type PortalRole =
    | "admin"
    | "account_manager"
    | "production_team"
    | "client"
    | "vendor";

export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
    is_superuser: boolean;
    is_active: boolean;
    groups: StaffGroup[];
    portal_role: PortalRole | null;
}

export interface UserProfile {
    user: User;
    role: "admin" | "account_manager" | "production_team" | "client" | "vendor";
    permissions: string[];
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
}

export interface ChangePasswordData {
    old_password: string;
    new_password: string;
}
