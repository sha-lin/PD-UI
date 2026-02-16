"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/admin-layout";
import ProductsFilters from "@/features/products/components/ProductsFilters";
import ProductsTable from "@/features/products/components/ProductsTable";
import ProductsPagination from "@/features/products/components/ProductsPagination";
import ProductsSkeleton from "@/features/products/components/ProductsSkeleton";
import ProductsEmptyState from "@/features/products/components/ProductsEmptyState";
import {
    archiveProduct,
    deleteProduct,
    fetchProducts,
    publishProduct,
} from "@/services/products";
import type {
    Product,
    ProductCustomizationLevel,
    ProductStatus,
    ProductVisibility,
    ProductsQueryParams,
    ProductsResponse,
} from "@/types/products";

export default function ProductsPage(): ReactElement {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [status, setStatus] = useState<"all" | ProductStatus>("all");
    const [customizationLevel, setCustomizationLevel] = useState<"all" | ProductCustomizationLevel>("all");
    const [category, setCategory] = useState<string>("");
    const [subCategory, setSubCategory] = useState<string>("");
    const [visibility, setVisibility] = useState<"all" | ProductVisibility>("all");
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);

    useEffect((): (() => void) => {
        const timer = setTimeout((): void => {
            setDebouncedSearch(search);
        }, 400);

        return (): void => clearTimeout(timer);
    }, [search]);

    const productQueryParams = useMemo(
        (): ProductsQueryParams => ({
            page,
            pageSize,
            search: debouncedSearch,
            status,
            customizationLevel,
            category,
            subCategory,
            visibility,
        }),
        [page, pageSize, debouncedSearch, status, customizationLevel, category, subCategory, visibility]
    );

    const { data, isLoading, error } = useQuery({
        queryKey: ["products", productQueryParams],
        queryFn: (): Promise<ProductsResponse> => fetchProducts(productQueryParams),
    });

    const publishMutation = useMutation({
        mutationFn: (productId: number): Promise<Product> => publishProduct(productId),
        onSuccess: (): void => {
            toast.success("Product published.");
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (): void => {
            toast.error("Unable to publish product.");
        },
    });

    const archiveMutation = useMutation({
        mutationFn: (productId: number): Promise<Product> => archiveProduct(productId),
        onSuccess: (): void => {
            toast.success("Product archived.");
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (): void => {
            toast.error("Unable to archive product.");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (productId: number): Promise<void> => deleteProduct(productId),
        onSuccess: (): void => {
            toast.success("Product deleted.");
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (): void => {
            toast.error("Unable to delete product.");
        },
    });

    const handleResetFilters = (): void => {
        setSearch("");
        setStatus("all");
        setCustomizationLevel("all");
        setCategory("");
        setSubCategory("");
        setVisibility("all");
        setPage(1);
    };

    const handlePageChange = (nextPage: number): void => {
        setPage(nextPage);
    };

    const handlePageSizeChange = (size: number): void => {
        setPageSize(size);
        setPage(1);
    };

    const handleEdit = (product: Product): void => {
        router.push(`/staff/products/${product.id}/edit`);
    };

    const handlePublish = (product: Product): void => {
        publishMutation.mutate(product.id);
    };

    const handleArchive = (product: Product): void => {
        archiveMutation.mutate(product.id);
    };

    const handleDelete = (product: Product): void => {
        const shouldDelete = window.confirm(`Delete ${product.name}? This cannot be undone.`);
        if (!shouldDelete) {
            return;
        }
        deleteMutation.mutate(product.id);
    };

    const products = data?.results ?? [];
    const totalCount = data?.count ?? 0;

    return (
        <AdminLayout>
            <header className="fixed top-0 z-30 w-full border-b border-gray-200 bg-white">
                <div className="px-8 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <a href="/staff" className="hover:text-brand-blue">
                            Staff Portal
                        </a>
                        <span>/</span>
                        <span className="text-gray-900">Products</span>
                    </div>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Manage product catalog, pricing, and inventory settings.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={(): void => router.push("/staff/products/new")}
                            className="inline-flex items-center justify-center rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white"
                        >
                            New Product
                        </button>
                    </div>
                </div>
            </header>
            <main className="bg-gray-50 min-h-screen pt-24">
                <div className="px-8 py-6 space-y-6">
                    {isLoading && <ProductsSkeleton />}

                    {!isLoading && (error || !data) && (
                        <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                                <div>
                                    <h3 className="font-semibold text-brand-red">Failed to load products</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Unable to fetch product data. Please try again later.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLoading && data && (
                        <>
                            <ProductsFilters
                                search={search}
                                status={status}
                                customizationLevel={customizationLevel}
                                category={category}
                                subCategory={subCategory}
                                visibility={visibility}
                                onSearchChange={(value: string): void => {
                                    setSearch(value);
                                    setPage(1);
                                }}
                                onStatusChange={(value: "all" | ProductStatus): void => {
                                    setStatus(value);
                                    setPage(1);
                                }}
                                onCustomizationChange={(value: "all" | ProductCustomizationLevel): void => {
                                    setCustomizationLevel(value);
                                    setPage(1);
                                }}
                                onCategoryChange={(value: string): void => {
                                    setCategory(value);
                                    setPage(1);
                                }}
                                onSubCategoryChange={(value: string): void => {
                                    setSubCategory(value);
                                    setPage(1);
                                }}
                                onVisibilityChange={(value: "all" | ProductVisibility): void => {
                                    setVisibility(value);
                                    setPage(1);
                                }}
                                onReset={handleResetFilters}
                            />

                            {products.length > 0 ? (
                                <>
                                    <ProductsTable
                                        products={products}
                                        onEdit={handleEdit}
                                        onPublish={handlePublish}
                                        onArchive={handleArchive}
                                        onDelete={handleDelete}
                                    />
                                    <ProductsPagination
                                        count={totalCount}
                                        page={page}
                                        pageSize={pageSize}
                                        onPageChange={handlePageChange}
                                        onPageSizeChange={handlePageSizeChange}
                                    />
                                </>
                            ) : (
                                <ProductsEmptyState
                                    title="No products found"
                                    description="Try adjusting your filters or add a new product."
                                    actionLabel="Create product"
                                    onAction={(): void => router.push("/staff/products/new")}
                                />
                            )}
                        </>
                    )}
                </div>
            </main>
        </AdminLayout>
    );
}
