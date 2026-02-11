export type ProcessStatus = "draft" | "active" | "inactive";

export type ProcessCategory = "outsourced" | "in_house";

export type ProcessPricingType = "tier" | "formula";

export type ProcessVariableType = "number" | "alphanumeric";

export type ProcessVendorPriority = "preferred" | "alternative" | "backup";

export interface Process {
    id: number;
    process_id: string;
    process_name: string;
    description: string;
    category: ProcessCategory;
    standard_lead_time: number;
    pricing_type: ProcessPricingType;
    unit_of_measure: string | null;
    base_cost: string;
    approval_type: string;
    approval_margin_threshold: string;
    status: ProcessStatus;
    created_by: number | null;
    created_at: string;
    updated_at: string;
}

export interface ProcessTier {
    id: number;
    process: number;
    tier_number: number;
    quantity_from: number;
    quantity_to: number;
    price: string;
    cost: string;
    per_unit_price: string | null;
    margin_amount: string | null;
    margin_percentage: string | null;
}

export interface ProcessVariable {
    id: number;
    process: number;
    variable_name: string;
    variable_type: ProcessVariableType;
    unit: string;
    variable_value: string | null;
    price: string;
    rate: string;
    min_value: string | null;
    max_value: string | null;
    default_value: string | null;
    description: string;
    order: number;
}

export interface ProcessVendor {
    id: number;
    process: number;
    vendor_name: string;
    vendor_id: string;
    vps_score: string;
    priority: ProcessVendorPriority;
    tier_costs: Record<string, unknown> | null;
    formula_rates: Record<string, unknown> | null;
    rush_enabled: boolean;
    rush_fee_percentage: string;
    rush_threshold_days: number;
    minimum_order: string;
    standard_lead_time: number;
    rush_lead_time: number | null;
    notes: string;
}

export interface ProcessVariableRange {
    id: number;
    variable: number;
    min_value: string;
    max_value: string;
    price: string;
    rate: string;
    order: number;
}

export interface ProcessesResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Process[];
}

export interface ProcessesQueryParams {
    page: number;
    pageSize: number;
    search: string;
    status: ProcessStatus | "all";
    pricingType: ProcessPricingType | "all";
    category: ProcessCategory | "all";
    ordering: string;
}

export interface ProcessDetailBundle {
    process: Process;
    tiers: ProcessTier[];
    variables: ProcessVariable[];
    vendors: ProcessVendor[];
}

export interface CreateProcessPayload {
    process_id: string;
    process_name: string;
    description: string;
    category: ProcessCategory;
    standard_lead_time: number;
    pricing_type: ProcessPricingType;
    unit_of_measure: string | null;
    base_cost: string;
    approval_type: string;
    approval_margin_threshold: string;
    status: ProcessStatus;
}

export type UpdateProcessPayload = Partial<CreateProcessPayload>;

export interface CreateProcessTierPayload {
    process: number;
    tier_number: number;
    quantity_from: number;
    quantity_to: number;
    price: string;
    cost: string;
}

export type UpdateProcessTierPayload = Partial<CreateProcessTierPayload>;

export interface CreateProcessVariablePayload {
    process: number;
    variable_name: string;
    variable_type: ProcessVariableType;
    unit: string;
    variable_value: string | null;
    price: string;
    rate: string;
    min_value: string | null;
    max_value: string | null;
    default_value: string | null;
    description: string;
    order: number;
}

export type UpdateProcessVariablePayload = Partial<CreateProcessVariablePayload>;

export interface CreateProcessVendorPayload {
    process: number;
    vendor_name: string;
    vendor_id: string;
    vps_score: string;
    priority: ProcessVendorPriority;
    tier_costs: Record<string, unknown> | null;
    formula_rates: Record<string, unknown> | null;
    rush_enabled: boolean;
    rush_fee_percentage: string;
    rush_threshold_days: number;
    minimum_order: string;
    standard_lead_time: number;
    rush_lead_time: number | null;
    notes: string;
}

export type UpdateProcessVendorPayload = Partial<CreateProcessVendorPayload>;

export interface CreateProcessVariableRangePayload {
    variable: number;
    min_value: string;
    max_value: string;
    price: string;
    rate: string;
    order: number;
}

export type UpdateProcessVariableRangePayload = Partial<CreateProcessVariableRangePayload>;

export interface ProcessTierFormValues {
    id: number | null;
    tier_number: number;
    quantity_from: number;
    quantity_to: number;
    price: string;
    cost: string;
}

export interface ProcessVariableFormValues {
    id: number | null;
    variable_name: string;
    variable_type: ProcessVariableType;
    unit: string;
    variable_value: string | null;
    price: string;
    rate: string;
    min_value: string | null;
    max_value: string | null;
    default_value: string | null;
    description: string;
    order: number;
}

export interface ProcessVendorFormValues {
    id: number | null;
    vendor_name: string;
    vendor_id: string;
    vps_score: string;
    priority: ProcessVendorPriority;
    rush_enabled: boolean;
    rush_fee_percentage: string;
    rush_threshold_days: number;
    minimum_order: string;
    standard_lead_time: number;
    rush_lead_time: number | null;
    notes: string;
}

export interface ProcessFormValues {
    process_id: string;
    process_name: string;
    description: string;
    category: ProcessCategory;
    standard_lead_time: number;
    pricing_type: ProcessPricingType;
    unit_of_measure: string;
    base_cost: string;
    approval_type: string;
    approval_margin_threshold: string;
    status: ProcessStatus;
    tiers: ProcessTierFormValues[];
    variables: ProcessVariableFormValues[];
    vendors: ProcessVendorFormValues[];
}
