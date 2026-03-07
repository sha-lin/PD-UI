export interface ProductionUser {
    id: number;
    name: string;
    email: string;
}

export interface ProductionUsersResponse {
    success: boolean;
    users: ProductionUser[];
}
