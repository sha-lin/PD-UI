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

export interface PurchaseOrderBasic {
    id: number;
    po_number: string;
    product_type: string;
}

export type IssueStatus = "open" | "in_progress" | "resolved" | "closed";
export type IssueType = "quality" | "delivery" | "technical" | "material" | "other";

export interface VendorIssue {
    id: number;
    purchase_order: PurchaseOrderBasic;
    issue_type: string;
    description: string;
    status: IssueStatus;
    created_at: string;
}

export interface CreateIssuePayload {
    purchase_order_id: number;
    issue_type: IssueType;
    description: string;
}

export type ApprovalStatus = "pending" | "approved" | "rejected" | "customer_notified";

export interface MaterialSubstitution {
    id: number;
    purchase_order: PurchaseOrderBasic;
    original_material: string;
    substitute_material: string;
    reason: string;
    original_cost: number;
    substitute_cost: number;
    cost_difference: number;
    cost_impact_percentage: number;
    approval_status: ApprovalStatus;
    approval_notes: string;
    created_at: string;
    updated_at: string;
}

export interface CreateSubstitutionPayload {
    purchase_order_id: number;
    original_material: string;
    substitute_material: string;
    reason: string;
    original_cost: number;
    substitute_cost: number;
}

export interface InvoiceLineItem {
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
}

export type InvoiceStatus = "draft" | "submitted" | "approved" | "paid" | "rejected";

export interface VendorInvoice {
    id: number;
    invoice_number: string;
    vendor_invoice_ref: string;
    purchase_order: PurchaseOrderBasic;
    job_number: string;
    invoice_date: string;
    due_date: string;
    line_items: InvoiceLineItem[];
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total_amount: number;
    status: InvoiceStatus;
    invoice_file?: string;
    rejection_reason?: string;
    submitted_at?: string;
    approved_at?: string;
    paid_at?: string;
    created_at: string;
    updated_at: string;
    vendor_name: string;
    po_number: string;
}

export interface CreateInvoicePayload {
    purchase_order_id: number;
    vendor_invoice_ref?: string;
    invoice_date: string;
    due_date: string;
    line_items: InvoiceLineItem[];
    subtotal: number;
    tax_rate: number;
}

export interface UpdateInvoicePayload {
    vendor_invoice_ref?: string;
    invoice_date?: string;
    due_date?: string;
    line_items?: InvoiceLineItem[];
    subtotal?: number;
    tax_rate?: number;
}

export interface InvoiceStats {
    draft_count: number;
    submitted_count: number;
    approved_count: number;
    paid_count: number;
    rejected_count: number;
    total_pending_amount: number;
    total_paid_amount: number;
    current_month_amount: number;
}

export type ProofStatus = "pending" | "approved" | "rejected";

export interface VendorProof {
    id: number;
    purchase_order: PurchaseOrderBasic;
    proof_image: string;
    description: string;
    submitted_at: string;
    status: ProofStatus;
    status_display: string;
    reviewed_by?: number;
    reviewed_at?: string;
    rejection_reason?: string;
}

export interface CreateProofPayload {
    purchase_order_id: number;
    proof_image: File;
    description?: string;
}

export interface ProofStats {
    total_submitted: number;
    pending_review: number;
    approved: number;
    rejected: number;
}

export type POStatus =
    | "NEW"
    | "ACCEPTED"
    | "IN_PRODUCTION"
    | "AWAITING_APPROVAL"
    | "BLOCKED"
    | "AT_RISK"
    | "COMPLETED"
    | "CANCELLED";

export type POMilestone =
    | "awaiting_acceptance"
    | "in_production"
    | "quality_check"
    | "completed";

export interface PurchaseOrder {
    id: number;
    po_number: string;
    job: number;
    job_number: string;
    vendor: number;
    vendor_name: string;
    product_type: string;
    product_description: string;
    quantity: number;
    unit_cost: number;
    total_cost: number;
    status: POStatus;
    status_display: string;
    milestone: POMilestone;
    milestone_display: string;
    created_at: string;
    updated_at: string;
    required_by: string;
    due_date: string;
    vendor_accepted: boolean;
    vendor_accepted_at?: string;
    vendor_notes: string;
    last_activity_at: string;
    completed_at?: string;
    completed_on_time: boolean;
    has_issues: boolean;
    is_blocked: boolean;
    blocked_reason: string;
    blocked_at?: string;
    assets_acknowledged: boolean;
    assets_acknowledged_at?: string;
    shipping_method: string;
    tracking_number: string;
    ready_for_pickup: boolean;
    invoice_sent: boolean;
    invoice_paid: boolean;
    days_until_due: number;
}

export interface UpdateMilestonePayload {
    milestone: POMilestone;
    notes?: string;
}

export interface POStats {
    total_pos: number;
    active_pos: number;
    completed_pos: number;
    at_risk_pos: number;
    total_value: number;
}
