import {
    CreateProductPayload,
    Product,
    ProductsQueryParams,
    ProductsResponse,
    UpdateProductPayload,
} from "@/types/products";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const buildQueryString = (params: ProductsQueryParams): string => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", params.page.toString());
    searchParams.set("page_size", params.pageSize.toString());

    if (params.search.trim()) {
        searchParams.set("search", params.search.trim());
    }

    if (params.status !== "all") {
        searchParams.set("status", params.status);
    }

    if (params.customizationLevel !== "all") {
        searchParams.set("customization_level", params.customizationLevel);
    }

    if (params.category.trim()) {
        searchParams.set("primary_category", params.category.trim());
    }

    if (params.subCategory.trim()) {
        searchParams.set("sub_category", params.subCategory.trim());
    }

    if (params.visibility !== "all") {
        searchParams.set("visibility", params.visibility);
    }

    return searchParams.toString();
};

const getCsrfToken = (): string | null => {
    const name = "csrftoken";
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
        const trimmed = cookie.trim();
        if (trimmed.startsWith(`${name}=`)) {
            return decodeURIComponent(trimmed.substring(name.length + 1));
        }
    }
    return null;
};

const buildWriteHeaders = (): HeadersInit => {
    const csrfToken = getCsrfToken();
    return {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
    };
};

const buildMultipartHeaders = (): HeadersInit => {
    const csrfToken = getCsrfToken();
    return {
        ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
    };
};

type ApiProduct = Omit<Product, "base_price"> & {
    base_price: number | string | null;
};

interface ApiProductsResponse extends Omit<ProductsResponse, "results"> {
    results: ApiProduct[];
}

const parseBasePrice = (value: number | string | null): number | null => {
    if (value === null) {
        return null;
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const normalizeProduct = (product: ApiProduct): Product => {
    return {
        ...product,
        base_price: parseBasePrice(product.base_price),
    };
};

export async function fetchProducts(params: ProductsQueryParams): Promise<ProductsResponse> {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/api/v1/products/?${queryString}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to fetch products: ${response.status} ${errorText}`);
    }

    const payload = (await response.json()) as ApiProductsResponse;
    return {
        ...payload,
        results: payload.results.map(normalizeProduct),
    };
}

export async function fetchProduct(productId: number): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to fetch product: ${response.status} ${errorText}`);
    }

    const payload = (await response.json()) as ApiProduct;
    return normalizeProduct(payload);
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to create product: ${response.status} ${errorText}`);
    }

    const created = (await response.json()) as ApiProduct;
    return normalizeProduct(created);
}

export async function updateProduct(productId: number, payload: UpdateProductPayload): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}/`, {
        method: "PATCH",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to update product: ${response.status} ${errorText}`);
    }

    const updated = (await response.json()) as ApiProduct;
    return normalizeProduct(updated);
}

export async function deleteProduct(productId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}/`, {
        method: "DELETE",
        headers: buildWriteHeaders(),
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to delete product: ${response.status} ${errorText}`);
    }
}

export async function publishProduct(productId: number): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}/publish/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to publish product: ${response.status} ${errorText}`);
    }

    const published = (await response.json()) as ApiProduct;
    return normalizeProduct(published);
}

export async function archiveProduct(productId: number): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}/archive/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to archive product: ${response.status} ${errorText}`);
    }

    const archived = (await response.json()) as ApiProduct;
    return normalizeProduct(archived);
}

export async function saveDraft(productId: number): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}/save-draft/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to save draft: ${response.status} ${errorText}`);
    }

    const draft = (await response.json()) as ApiProduct;
    return normalizeProduct(draft);
}

export async function uploadProductPrimaryImage(productId: number, image: File, altText: string): Promise<void> {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("alt_text", altText);

    const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}/upload-primary-image/`, {
        method: "POST",
        headers: buildMultipartHeaders(),
        credentials: "include",
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to upload primary image: ${response.status} ${errorText}`);
    }
}

export async function uploadProductGalleryImages(productId: number, images: File[], altText: string): Promise<void> {
    const formData = new FormData();
    for (const image of images) {
        formData.append("images", image);
    }
    formData.append("alt_text", altText);

    const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}/upload-gallery-images/`, {
        method: "POST",
        headers: buildMultipartHeaders(),
        credentials: "include",
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to upload gallery images: ${response.status} ${errorText}`);
    }
}
