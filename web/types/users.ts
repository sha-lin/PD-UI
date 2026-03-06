export interface ProductionUser {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
}

export interface ProductionUsersResponse {
    results: ProductionUser[];
    count: number;
}
