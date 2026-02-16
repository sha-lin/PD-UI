export type ProductStatus = "draft" | "published" | "archived";

export type ProductCustomizationLevel = "non_customizable" | "semi_customizable" | "fully_customizable";

export type ProductType = "physical" | "digital" | "service";

export type ProductVisibility = "catalog-search" | "catalog-only" | "search-only" | "hidden";

export type ProductStockStatus = "in_stock" | "low_stock" | "out_of_stock" | "made_to_order" | "discontinued";

export interface Product {
    id: number;
    name: string;
    internal_code: string;
    short_description: string;
    long_description: string;
    primary_category: string | null;
    sub_category: string | null;
    product_family: string | null;
    product_type: ProductType;
    customization_level: ProductCustomizationLevel;
    status: ProductStatus;
    is_visible: boolean;
    visibility: ProductVisibility;
    base_price: number | null;
    stock_status: ProductStockStatus;
    stock_quantity: number;
    track_inventory: boolean;
    allow_backorders: boolean;
    internal_notes: string | null;
    client_notes: string | null;
    primary_image_url: string | null;
    images: ProductImage[];
    image_count: number;
    can_be_published: boolean;
    completion_percentage: number;
    created_at: string;
    updated_at: string;
}

export interface ProductImage {
    id: number;
    image: string;
    alt_text: string;
    is_primary: boolean;
    display_order: number;
    uploaded_at: string;
}

export interface ProductsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Product[];
}

export interface ProductsQueryParams {
    page: number;
    pageSize: number;
    search: string;
    status: "all" | ProductStatus;
    customizationLevel: "all" | ProductCustomizationLevel;
    category: string;
    subCategory: string;
    visibility: "all" | ProductVisibility;
}

export interface CreateProductPayload {
    name: string;
    short_description: string;
    long_description: string;
    primary_category: string | null;
    sub_category: string | null;
    product_family: string | null;
    product_type: ProductType;
    customization_level: ProductCustomizationLevel;
    status: ProductStatus;
    is_visible: boolean;
    visibility: ProductVisibility;
    base_price: number | null;
    stock_status: ProductStockStatus;
    stock_quantity: number;
    track_inventory: boolean;
    allow_backorders: boolean;
    internal_notes: string | null;
    client_notes: string | null;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface ProductFormValues {
    name: string;
    short_description: string;
    long_description: string;
    primary_category: string;
    sub_category: string;
    product_family: string;
    product_type: ProductType;
    customization_level: ProductCustomizationLevel;
    status: ProductStatus;
    is_visible: boolean;
    visibility: ProductVisibility;
    base_price: string;
    stock_status: ProductStockStatus;
    stock_quantity: number;
    track_inventory: boolean;
    allow_backorders: boolean;
    internal_notes: string;
    client_notes: string;
}
