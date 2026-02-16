export type LeadStatus = "New" | "Contacted" | "Qualified" | "Converted" | "Lost";

export type LeadSource = "Website" | "Referral" | "Cold Call" | "Social Media" | "Event" | "Other";

export interface Lead {
    id: number;
    lead_id: string;
    name: string;
    email: string;
    phone: string;
    source: LeadSource | "";
    product_interest: string;
    preferred_contact: "Email" | "Phone" | "WhatsApp";
    preferred_client_type: "B2B" | "B2C";
    follow_up_date: string | null;
    status: LeadStatus | string;
    notes: string;
    created_by: number | null;
    created_at: string;
    updated_at: string;
    converted_to_client: boolean;
    converted_at: string | null;
}

export interface LeadsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Lead[];
}

export interface LeadsQueryParams {
    page: number;
    pageSize: number;
    search: string;
    status: "all" | LeadStatus;
    source: "all" | LeadSource;
}

export interface LeadQualifyResponse {
    detail: string;
    lead: Lead;
}

export interface LeadConvertPayload {
    client_type: "B2B" | "B2C";
    company?: string;
    vat_tax_id?: string;
    kra_pin?: string;
    industry?: string;
    contacts?: Array<{
        full_name: string;
        email: string;
        phone: string;
        role: string;
        is_primary: boolean;
    }>;
}

export interface LeadConvertResponse {
    detail: string;
    client?: {
        id: number;
        client_id: string;
        name: string;
    };
    client_id?: number;
}
