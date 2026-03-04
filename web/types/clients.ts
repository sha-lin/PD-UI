export type ClientType = "B2B" | "B2C";

export type ClientStatus = "Active" | "Dormant" | "Inactive";

export type ClientPaymentTerms = "Prepaid" | "Net 7" | "Net 15" | "Net 30" | "Net 60";

export type ClientRiskRating = "Low" | "Medium" | "High";

export type ClientPreferredChannel = "Email" | "Phone" | "WhatsApp" | "In-Person";

export interface Client {
    id: number;
    client_id: string;
    client_type: ClientType;
    company: string;
    name: string;
    email: string;
    phone: string;
    vat_tax_id: string;
    kra_pin: string;
    address: string;
    industry: string;
    payment_terms: ClientPaymentTerms;
    credit_limit: number | string;
    default_markup: number | string;
    risk_rating: ClientRiskRating;
    is_reseller: boolean;
    delivery_address: string | null;
    delivery_instructions: string;
    preferred_channel: ClientPreferredChannel;
    lead_source: string;
    status: ClientStatus | string;
    account_manager: number | null;
    converted_from_lead: number | null;
    created_at: string;
    updated_at: string;
    last_activity: string;
    onboarded_by: number | null;
}

export interface ClientContact {
    id: number;
    client: number;
    full_name: string;
    email: string;
    phone: string;
    role: string;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
}

export interface BrandAsset {
    id: number;
    client: number;
    asset_type: string;
    description: string;
    uploaded_by: number | null;
    created_at: string;
    updated_at: string;
}

export interface ComplianceDocument {
    id: number;
    client: number;
    document_type: string;
    notes: string;
    uploaded_by: number | null;
    created_at: string;
    updated_at: string;
}

export interface ClientsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Client[];
}

export interface ClientsQueryParams {
    page: number;
    pageSize: number;
    search: string;
    status: "all" | ClientStatus;
    clientType: "all" | ClientType;
}

export interface ClientFormPayload {
    client_type: ClientType;
    name: string;
    company?: string;
    email?: string;
    phone: string;
    vat_tax_id?: string;
    kra_pin?: string;
    address?: string;
    industry?: string;
    payment_terms?: ClientPaymentTerms;
    credit_limit?: number;
    default_markup?: number;
    risk_rating?: ClientRiskRating;
    is_reseller?: boolean;
    delivery_address?: string;
    delivery_instructions?: string;
    preferred_channel?: ClientPreferredChannel;
    lead_source?: string;
    status?: ClientStatus;
}
