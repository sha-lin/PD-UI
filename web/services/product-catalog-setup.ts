import type {
    PrintCategory,
    ProductCategory,
    ProductFamily,
    ProductSubCategory,
    ProductTag,
} from "@/types/products";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchPrintCategories(): Promise<PrintCategory[]> {
    const response = await fetch(
        `${API_BASE_URL}/api/v1/print-categories/?page_size=200`,
        { credentials: "include", cache: "no-store" },
    );
    if (!response.ok) throw new Error("Failed to fetch print categories");
    const data = (await response.json()) as { results: PrintCategory[] } | PrintCategory[];
    return Array.isArray(data) ? data : data.results;
}

export async function fetchProductCategories(): Promise<ProductCategory[]> {
    const response = await fetch(
        `${API_BASE_URL}/api/v1/product-categories/?page_size=200`,
        { credentials: "include", cache: "no-store" },
    );
    if (!response.ok) throw new Error("Failed to fetch product categories");
    const data = (await response.json()) as { results: ProductCategory[] } | ProductCategory[];
    return Array.isArray(data) ? data : data.results;
}

export async function fetchProductSubCategories(
    categoryId?: number,
): Promise<ProductSubCategory[]> {
    const qs = categoryId ? `?category=${categoryId}&page_size=200` : "?page_size=200";
    const response = await fetch(
        `${API_BASE_URL}/api/v1/product-subcategories/${qs}`,
        { credentials: "include", cache: "no-store" },
    );
    if (!response.ok) throw new Error("Failed to fetch subcategories");
    const data =
        (await response.json()) as { results: ProductSubCategory[] } | ProductSubCategory[];
    return Array.isArray(data) ? data : data.results;
}

export async function fetchProductFamilies(): Promise<ProductFamily[]> {
    const response = await fetch(
        `${API_BASE_URL}/api/v1/product-families/?page_size=200`,
        { credentials: "include", cache: "no-store" },
    );
    if (!response.ok) throw new Error("Failed to fetch product families");
    const data = (await response.json()) as { results: ProductFamily[] } | ProductFamily[];
    return Array.isArray(data) ? data : data.results;
}

export async function fetchProductTags(): Promise<ProductTag[]> {
    const response = await fetch(
        `${API_BASE_URL}/api/v1/product-tags/?page_size=200`,
        { credentials: "include", cache: "no-store" },
    );
    if (!response.ok) throw new Error("Failed to fetch product tags");
    const data = (await response.json()) as { results: ProductTag[] } | ProductTag[];
    return Array.isArray(data) ? data : data.results;
}

export async function fetchSpecGroupLibraries(groupType?: string): Promise<import("@/types/products").SpecGroupLibrary[]> {
    const qs = groupType ? `?group_type=${groupType}&status=active&page_size=200` : "?status=active&page_size=200";
    const response = await fetch(
        `${API_BASE_URL}/api/v1/spec-group-library/${qs}`,
        { credentials: "include", cache: "no-store" },
    );
    if (!response.ok) throw new Error("Failed to fetch spec group libraries");
    const data = (await response.json()) as { results: import("@/types/products").SpecGroupLibrary[] } | import("@/types/products").SpecGroupLibrary[];
    return Array.isArray(data) ? data : data.results;
}
