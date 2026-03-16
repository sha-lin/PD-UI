import type { Product, ProductPricingMode, ProductSpecGroup } from "@/types/products";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface CatalogProduct {
    id: number;
    name: string;
    internal_code: string;
    short_description: string;
    long_description: string;
    print_category: number | null;
    print_category_name: string | null;
    primary_category: number | null;
    primary_category_name: string | null;
    sub_category: number | null;
    sub_category_name: string | null;
    product_type: string;
    tags: Array<{ id: number; name: string; slug: string }>;
    pricing_mode: ProductPricingMode;
    is_visible: boolean;
    visibility: string;
    feature_product: boolean;
    bestseller_badge: boolean;
    new_arrival: boolean;
    new_arrival_expires: string | null;
    on_sale_badge: boolean;
    unit_of_measure: string;
    stock_status: string;
    spec_groups: ProductSpecGroup[];
}

export interface PriceCalculationResult {
    valid: boolean;
    final_selling_price: string;
    final_vendor_cost: string;
    margin_percent: string;
    line_items: Array<{
        spec_group_id: number;
        spec_group_name: string;
        description: string;
        selling_price: string;
        vendor_cost: string;
    }>;
    errors?: string[];
}

export type SelectionValue = number | number[] | number | { width: number; height: number };

export async function fetchCatalogProducts(params?: {
    category?: string;
    print_category?: string;
    pricing_mode?: string;
    search?: string;
    page_size?: number;
}): Promise<{ count: number; results: CatalogProduct[] }> {
    const qs = new URLSearchParams();
    if (params?.category) qs.set("category", params.category);
    if (params?.print_category) qs.set("print_category", params.print_category);
    if (params?.pricing_mode) qs.set("pricing_mode", params.pricing_mode);
    if (params?.search) qs.set("search", params.search);
    qs.set("page_size", String(params?.page_size ?? 48));

    const url = `${API_BASE_URL}/api/v1/product-catalog/?${qs.toString()}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Failed to fetch catalog: ${response.status}`);
    return response.json() as Promise<{ count: number; results: CatalogProduct[] }>;
}

export async function fetchCatalogProduct(productId: number): Promise<CatalogProduct> {
    const response = await fetch(`${API_BASE_URL}/api/v1/product-catalog/${productId}/`, {
        cache: "no-store",
    });
    if (!response.ok) throw new Error(`Product not found: ${response.status}`);
    return response.json() as Promise<CatalogProduct>;
}

export async function calculatePrice(
    productId: number,
    selections: Record<number, SelectionValue>,
): Promise<PriceCalculationResult> {
    const stringKeyedSelections: Record<string, SelectionValue> = {};
    for (const [key, value] of Object.entries(selections)) {
        stringKeyedSelections[key] = value;
    }
    const response = await fetch(
        `${API_BASE_URL}/api/v1/product-catalog/${productId}/calculate-price/`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ selections: stringKeyedSelections }),
        },
    );
    if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { detail?: string };
        throw new Error(data.detail ?? `Calculation failed: ${response.status}`);
    }
    return response.json() as Promise<PriceCalculationResult>;
}
