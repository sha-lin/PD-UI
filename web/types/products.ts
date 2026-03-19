export type ProductStatus = "draft" | "published" | "archived";
export type ProductType = "physical" | "digital" | "service";
export type ProductPricingMode = "auto_calculate" | "quote_only";
export type ProductVisibility = "catalog-search" | "catalog-only" | "search-only" | "hidden";
export type ProductStockStatus = "in_stock" | "low_stock" | "out_of_stock" | "made_to_order" | "discontinued";
export type ProductUnitOfMeasure = "pieces" | "packs" | "sets" | "sqm" | "cm";
export type ProductWeightUnit = "gsm" | "kg" | "g";
export type ProductDimensionUnit = "cm" | "mm" | "in";
export type ProductWarranty = "satisfaction-guarantee" | "no-warranty" | "30-days" | "90-days";
export type ProductCountryOfOrigin = "kenya" | "china" | "india" | "uae";
export type SpecGroupType =
    | "quantity_tier"
    | "single_select_modifier"
    | "multi_select_modifier"
    | "numeric_input"
    | "dimension_input"
    | "multiplier"
    | "display_only";

export interface PrintCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
}

export interface ProductCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
}

export interface ProductSubCategory {
    id: number;
    category: number;
    category_name: string;
    name: string;
    slug: string;
    description: string;
}

export interface ProductFamily {
    id: number;
    name: string;
    slug: string;
    description: string;
}

export interface ProductTag {
    id: number;
    name: string;
    slug: string;
}

export interface SpecGroupLibrary {
    id: number;
    name: string;
    group_type: SpecGroupType;
    display_label: string;
    help_text: string;
    is_required: boolean;
    status: "active" | "draft" | "archived";
    library_options: SpecGroupLibraryOption[];
}

export interface SpecGroupLibraryOption {
    id: number;
    library_group: number;
    name: string;
    display_order: number;
    is_default: boolean;
    is_active: boolean;
    quantity_value: number | null;
    selling_price: string | null;
    vendor_cost: string | null;
    selling_price_modifier: string | null;
    vendor_cost_modifier: string | null;
    multiplier_value: string | null;
    preview_image: string | null;
}

export interface SpecOption {
    id: number;
    spec_group: number;
    library_option: number | null;
    name: string;
    display_order: number;
    is_default: boolean;
    is_active: boolean;
    quantity_value: number | null;
    selling_price: string | null;
    vendor_cost: string | null;
    selling_price_modifier: string | null;
    vendor_cost_modifier: string | null;
    multiplier_value: string | null;
    preview_image: string | null;
}

export interface SpecOptionRange {
    id: number;
    spec_group: number;
    range_from: string;
    range_to: string | null;
    unit_label: string;
    selling_price_base: string;
    selling_rate_per_unit: string;
    vendor_cost_base: string;
    vendor_rate_per_unit: string;
    display_order: number;
}

export interface ProductSpecGroup {
    id: number;
    product: number;
    library_group: number | null;
    uses_library_options: boolean;
    name: string;
    display_label: string;
    help_text: string;
    group_type: SpecGroupType;
    is_required: boolean;
    display_order: number;
    is_active: boolean;
    parent_option: number | null;
    dim_unit: "mm" | "cm" | "in";
    dim_width_min: string | null;
    dim_width_max: string | null;
    dim_height_min: string | null;
    dim_height_max: string | null;
    selling_rate_per_sqm: string | null;
    vendor_rate_per_sqm: string | null;
    min_selling_price: string | null;
    min_vendor_cost: string | null;
    header_image: string | null;
    options: SpecOption[];
    ranges: SpecOptionRange[];
}

export interface Product {
    id: number;
    name: string;
    internal_code: string;
    short_description: string;
    long_description: string;
    maintenance: string;
    technical_specs: string;
    print_category: number | null;
    print_category_name: string | null;
    primary_category: number | null;
    primary_category_name: string | null;
    sub_category: number | null;
    sub_category_name: string | null;
    product_family: number | null;
    product_family_name: string | null;
    product_type: ProductType;
    tags: ProductTag[];
    pricing_mode: ProductPricingMode;
    status: ProductStatus;
    is_visible: boolean;
    visibility: ProductVisibility;
    feature_product: boolean;
    bestseller_badge: boolean;
    new_arrival: boolean;
    new_arrival_expires: string | null;
    on_sale_badge: boolean;
    unit_of_measure: ProductUnitOfMeasure;
    unit_of_measure_custom: string;
    weight: string | null;
    weight_unit: ProductWeightUnit;
    length: string | null;
    width: string | null;
    height: string | null;
    dimension_unit: ProductDimensionUnit;
    warranty: ProductWarranty;
    country_of_origin: ProductCountryOfOrigin;
    stock_status: ProductStockStatus;
    stock_quantity: number;
    low_stock_threshold: number;
    track_inventory: boolean;
    allow_backorders: boolean;
    internal_notes: string;
    client_notes: string;
    primary_image_url: string | null;
    spec_groups: ProductSpecGroup[];
    created_by: number | null;
    created_by_name: string | null;
    updated_by: number | null;
    updated_by_name: string | null;
    created_at: string;
    updated_at: string;
}

export interface ProductsQueryParams {
    search: string;
    status: ProductStatus | "all";
    pricingMode: ProductPricingMode | "all";
    printCategory: string;
    category: string;
    page: number;
    pageSize: number;
}

export interface ProductsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Product[];
}

export interface ProductFormValues {
    name: string;
    short_description: string;
    long_description: string;
    maintenance: string;
    technical_specs: string;
    print_category: string;
    primary_category: string;
    sub_category: string;
    product_family: string;
    tag_ids: number[];
    product_type: ProductType;
    pricing_mode: ProductPricingMode;
    status: ProductStatus;
    is_visible: boolean;
    visibility: ProductVisibility;
    feature_product: boolean;
    bestseller_badge: boolean;
    new_arrival: boolean;
    new_arrival_expires: string;
    on_sale_badge: boolean;
    unit_of_measure: ProductUnitOfMeasure;
    unit_of_measure_custom: string;
    weight: string;
    weight_unit: ProductWeightUnit;
    length: string;
    width: string;
    height: string;
    dimension_unit: ProductDimensionUnit;
    warranty: ProductWarranty;
    country_of_origin: ProductCountryOfOrigin;
    stock_status: ProductStockStatus;
    stock_quantity: number;
    low_stock_threshold: number;
    track_inventory: boolean;
    allow_backorders: boolean;
    internal_notes: string;
    client_notes: string;
}

export interface CreateProductPayload {
    name: string;
    short_description: string;
    long_description: string;
    maintenance: string;
    technical_specs: string;
    print_category: number | null;
    primary_category: number | null;
    sub_category: number | null;
    product_family: number | null;
    tag_ids: number[];
    product_type: ProductType;
    pricing_mode: ProductPricingMode;
    status: ProductStatus;
    is_visible: boolean;
    visibility: ProductVisibility;
    feature_product: boolean;
    bestseller_badge: boolean;
    new_arrival: boolean;
    new_arrival_expires: string | null;
    on_sale_badge: boolean;
    unit_of_measure: ProductUnitOfMeasure;
    unit_of_measure_custom: string;
    weight: string | null;
    weight_unit: ProductWeightUnit;
    length: string | null;
    width: string | null;
    height: string | null;
    dimension_unit: ProductDimensionUnit;
    warranty: ProductWarranty;
    country_of_origin: ProductCountryOfOrigin;
    stock_status: ProductStockStatus;
    stock_quantity: number;
    low_stock_threshold: number;
    track_inventory: boolean;
    allow_backorders: boolean;
    internal_notes: string;
    client_notes: string;
}

export interface CreateSpecGroupPayload {
    product: number;
    library_group: number | null;
    uses_library_options: boolean;
    name: string;
    display_label: string;
    help_text: string;
    group_type: SpecGroupType;
    is_required: boolean;
    display_order: number;
    is_active: boolean;
    parent_option: number | null;
    dim_unit: "mm" | "cm" | "in";
    dim_width_min: string | null;
    dim_width_max: string | null;
    dim_height_min: string | null;
    dim_height_max: string | null;
    selling_rate_per_sqm: string | null;
    vendor_rate_per_sqm: string | null;
    min_selling_price: string | null;
    min_vendor_cost: string | null;
}

export interface CreateSpecOptionPayload {
    spec_group: number;
    name: string;
    display_order: number;
    is_default: boolean;
    is_active: boolean;
    quantity_value: number | null;
    selling_price: string | null;
    vendor_cost: string | null;
    selling_price_modifier: string | null;
    vendor_cost_modifier: string | null;
    multiplier_value: string | null;
}

export interface CreateSpecOptionRangePayload {
    spec_group: number;
    range_from: string;
    range_to: string | null;
    unit_label: string;
    selling_price_base: string;
    selling_rate_per_unit: string;
    vendor_cost_base: string;
    vendor_rate_per_unit: string;
    display_order: number;
}
