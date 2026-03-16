import type {
    PrintCategory,
    ProductCategory,
    ProductFamily,
    ProductSubCategory,
    ProductTag,
} from "@/types/products";
import { getCsrfToken } from "@/lib/api/auth";

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

// ── Product Categories ────────────────────────────────────────────────────────

export async function createProductCategory(data: { name: string; description: string }): Promise<ProductCategory> {
    const csrf = await getCsrfToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/product-categories/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create category");
    return response.json() as Promise<ProductCategory>;
}

export async function updateProductCategory(id: number, data: { name: string; description: string }): Promise<ProductCategory> {
    const csrf = await getCsrfToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/product-categories/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update category");
    return response.json() as Promise<ProductCategory>;
}

export async function deleteProductCategory(id: number): Promise<void> {
    const csrf = await getCsrfToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/product-categories/${id}/`, {
        method: "DELETE",
        headers: { "X-CSRFToken": csrf },
        credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to delete category");
}

// ── Sub-Categories ────────────────────────────────────────────────────────────

export async function createProductSubCategory(data: { name: string; description: string; category: number }): Promise<ProductSubCategory> {
    const csrf = await getCsrfToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/product-subcategories/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create sub-category");
    return response.json() as Promise<ProductSubCategory>;
}

export async function updateProductSubCategory(id: number, data: { name: string; description: string; category: number }): Promise<ProductSubCategory> {
    const csrf = await getCsrfToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/product-subcategories/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update sub-category");
    return response.json() as Promise<ProductSubCategory>;
}

export async function deleteProductSubCategory(id: number): Promise<void> {
    const csrf = await getCsrfToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/product-subcategories/${id}/`, {
        method: "DELETE",
        headers: { "X-CSRFToken": csrf },
        credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to delete sub-category");
}

// ── Product Families ──────────────────────────────────────────────────────────

export async function createProductFamily(data: { name: string; description: string }): Promise<ProductFamily> {
    const csrf = await getCsrfToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/product-families/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create product family");
    return response.json() as Promise<ProductFamily>;
}

export async function updateProductFamily(id: number, data: { name: string; description: string }): Promise<ProductFamily> {
    const csrf = await getCsrfToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/product-families/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update product family");
    return response.json() as Promise<ProductFamily>;
}

export async function deleteProductFamily(id: number): Promise<void> {
    const csrf = await getCsrfToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/product-families/${id}/`, {
        method: "DELETE",
        headers: { "X-CSRFToken": csrf },
        credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to delete product family");
}

// ── Print Categories ──────────────────────────────────────────────────────────

export async function createPrintCategory(data: { name: string; description: string }): Promise<PrintCategory> {
    const csrf = await getCsrfToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/print-categories/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create print category");
    return response.json() as Promise<PrintCategory>;
}

export async function updatePrintCategory(id: number, data: { name: string; description: string }): Promise<PrintCategory> {
    const csrf = await getCsrfToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/print-categories/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update print category");
    return response.json() as Promise<PrintCategory>;
}

export async function deletePrintCategory(id: number): Promise<void> {
    const csrf = await getCsrfToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/print-categories/${id}/`, {
        method: "DELETE",
        headers: { "X-CSRFToken": csrf },
        credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to delete print category");
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
