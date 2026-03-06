export interface Vendor {
    id: number;
    user: number | null;
    user_is_active: boolean | null;
    name: string;
    contact_person: string | null;
    email: string;
    phone: string;
    business_address: string | null;
    tax_pin: string | null;
    payment_terms: string | null;
    payment_method: string | null;
    services: string | null;
    specialization: string | null;
    minimum_order: string;
    lead_time: string | null;
    rush_capable: boolean;
    rating: string | null;
    quality_rating: string | null;
    reliability_rating: string | null;
    vps_score: string | null;
    vps_score_value: string | number;
    performance_score: string | number | null;
    recommended: boolean;
    active: boolean;
    is_available: boolean;
    max_concurrent_jobs: number;
    internal_notes: string | null;
    created_at: string;
    updated_at: string;
}

export type VendorListItem = Vendor;

export interface VendorsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Vendor[];
}

export interface VendorsQueryParams {
    page: number;
    pageSize: number;
    search: string;
    active: "all" | "true" | "false";
}

export interface CreateVendorPayload {
    name: string;
    contact_person: string | null;
    email: string;
    phone: string;
    business_address: string | null;
    tax_pin: string | null;
    payment_terms: string | null;
    payment_method: string | null;
    services: string | null;
    specialization: string | null;
    minimum_order: string;
    lead_time: string | null;
    rush_capable: boolean;
    rating: string | null;
    quality_rating: string | null;
    reliability_rating: string | null;
    vps_score: string | null;
    vps_score_value: string;
    performance_score: string | number | null;
    recommended: boolean;
    active: boolean;
    is_available: boolean;
    max_concurrent_jobs: number;
    internal_notes: string | null;
}

export type UpdateVendorPayload = Partial<CreateVendorPayload>;

export interface VendorFormValues {
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    business_address: string;
    tax_pin: string;
    payment_terms: string;
    payment_method: string;
    services: string;
    specialization: string;
    minimum_order: string;
    lead_time: string;
    rush_capable: boolean;
    rating: string;
    quality_rating: string;
    reliability_rating: string;
    vps_score: string;
    vps_score_value: string;
    performance_score: string;
    recommended: boolean;
    active: boolean;
    is_available: boolean;
    max_concurrent_jobs: number;
    internal_notes: string;
}

export interface VendorPerformanceInsight {
    type: "positive" | "warning" | "negative";
    icon: string;
    title: string;
    description: string;
}

export interface VendorPerformanceScorecard {
    overall_score: number;
    vps_grade: string;
    tax_status: string;
    certifications: string[];
    on_time_rate: number;
    quality_score: number;
    avg_turnaround: number;
    defect_rate: number;
    cost_per_job: number;
    acceptance_rate: number;
    response_time: number;
    ghosting_incidents: number;
    decline_rate: number;
    insights: VendorPerformanceInsight[];
}
