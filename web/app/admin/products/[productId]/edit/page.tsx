"use client";

import { useCallback, useState } from "react";
import type { ReactElement } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/admin-layout";
import { resolveProductsBasePath } from "@/lib/product-routes";
import ProductForm from "@/features/products/components/ProductForm";
import { fetchProduct, updateProduct, uploadProductImage } from "@/services/products";
import SpecGroupsBuilder from "@/features/products/components/SpecGroupsBuilder";
import type { CreateProductPayload, Product, ProductFormValues } from "@/types/products";

const buildFormValues = (product: Product): ProductFormValues => ({
    name: product.name,
    short_description: product.short_description,
    long_description: product.long_description,
    maintenance: product.maintenance,
    technical_specs: product.technical_specs,
    print_category: product.print_category !== null ? String(product.print_category) : "",
    primary_category: product.primary_category !== null ? String(product.primary_category) : "",
    sub_category: product.sub_category !== null ? String(product.sub_category) : "",
    product_family: product.product_family !== null ? String(product.product_family) : "",
    tag_ids: product.tags.map((t) => t.id),
    product_type: product.product_type,
    pricing_mode: product.pricing_mode,
    status: product.status,
    is_visible: product.is_visible,
    visibility: product.visibility,
    feature_product: product.feature_product,
    bestseller_badge: product.bestseller_badge,
    new_arrival: product.new_arrival,
    new_arrival_expires: product.new_arrival_expires ?? "",
    on_sale_badge: product.on_sale_badge,
    unit_of_measure: product.unit_of_measure,
    unit_of_measure_custom: product.unit_of_measure_custom,
    weight: product.weight ?? "",
    weight_unit: product.weight_unit,
    length: product.length ?? "",
    width: product.width ?? "",
    height: product.height ?? "",
    dimension_unit: product.dimension_unit,
    warranty: product.warranty,
    country_of_origin: product.country_of_origin,
    stock_status: product.stock_status,
    stock_quantity: product.stock_quantity,
    low_stock_threshold: product.low_stock_threshold,
    track_inventory: product.track_inventory,
    allow_backorders: product.allow_backorders,
    internal_notes: product.internal_notes,
    client_notes: product.client_notes,
});

const buildPayload = (values: ProductFormValues): CreateProductPayload => ({
    name: values.name.trim(),
    short_description: values.short_description.trim(),
    long_description: values.long_description.trim(),
    maintenance: values.maintenance.trim(),
    technical_specs: values.technical_specs.trim(),
    print_category: values.print_category ? Number(values.print_category) : null,
    primary_category: values.primary_category ? Number(values.primary_category) : null,
    sub_category: values.sub_category ? Number(values.sub_category) : null,
    product_family: values.product_family ? Number(values.product_family) : null,
    tag_ids: values.tag_ids,
    product_type: values.product_type,
    pricing_mode: values.pricing_mode,
    status: values.status,
    is_visible: values.is_visible,
    visibility: values.visibility,
    feature_product: values.feature_product,
    bestseller_badge: values.bestseller_badge,
    new_arrival: values.new_arrival,
    new_arrival_expires: values.new_arrival_expires.trim() || null,
    on_sale_badge: values.on_sale_badge,
    unit_of_measure: values.unit_of_measure,
    unit_of_measure_custom: values.unit_of_measure_custom.trim(),
    weight: values.weight.trim() || null,
    weight_unit: values.weight_unit,
    length: values.length.trim() || null,
    width: values.width.trim() || null,
    height: values.height.trim() || null,
    dimension_unit: values.dimension_unit,
    warranty: values.warranty,
    country_of_origin: values.country_of_origin,
    stock_status: values.stock_status,
    stock_quantity: values.stock_quantity,
    low_stock_threshold: values.low_stock_threshold,
    track_inventory: values.track_inventory,
    allow_backorders: values.allow_backorders,
    internal_notes: values.internal_notes.trim(),
    client_notes: values.client_notes.trim(),
});

export default function EditProductPage(): ReactElement {
    const params = useParams<{ productId: string }>();
    const router = useRouter();
    const pathname = usePathname();
    const basePath = resolveProductsBasePath(pathname);

    const [localValues, setLocalValues] = useState<ProductFormValues | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const { data: product, isLoading, isError } = useQuery<Product>({
        queryKey: ["product", params.productId],
        queryFn: () => fetchProduct(Number(params.productId)),
        enabled: Boolean(params.productId),
    });

    const values = localValues ?? (product ? buildFormValues(product) : null);

    const handleValuesChange = useCallback((newValues: ProductFormValues): void => {
        setLocalValues(newValues);
    }, []);

    const handleSubmit = async (): Promise<void> => {
        if (!product || !values) return;
        if (!values.name.trim()) {
            toast.error("Product name is required.");
            return;
        }

        setIsSubmitting(true);
        try {
            await updateProduct(product.id, buildPayload(values));
            if (image) {
                await uploadProductImage(product.id, image, values.name.trim());
            }
            toast.success("Product saved.");
            setTimeout(() => router.push(basePath), 400);
        } catch (_error: unknown) {
            toast.error("Unable to save product. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue" />
                </div>
            </AdminLayout>
        );
    }

    if (isError || !product || !values) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <p className="text-sm text-gray-500">Unable to load product.</p>
                    <button
                        type="button"
                        onClick={() => router.push(basePath)}
                        className="text-sm text-brand-blue underline"
                    >
                        Back to Products
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <header className="border-b border-gray-200 bg-white">
                <div className="px-8 py-4">
                    <nav className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                        <a href="/admin" className="hover:text-brand-blue">Admin</a>
                        <span>/</span>
                        <a href={basePath} className="hover:text-brand-blue">Products</a>
                        <span>/</span>
                        <span className="text-gray-700">{product.name}</span>
                        <span>/</span>
                        <span className="text-gray-700">Edit</span>
                    </nav>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                            <p className="mt-0.5 text-xs font-mono text-gray-400">
                                {product.internal_code}
                            </p>
                        </div>
                        <p className="text-xs text-gray-400">
                            Updated {new Date(product.updated_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </header>
            <main className="bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
                    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                        <ProductForm
                            values={values}
                            onValuesChange={handleValuesChange}
                            onImageChange={setImage}
                            selectedImageName={image?.name ?? null}
                            onSubmit={handleSubmit}
                            onCancel={() => router.push(basePath)}
                            submitLabel="Save Changes"
                            isSubmitting={isSubmitting}
                        />
                    </div>
                    <section className="rounded-2xl border border-gray-200 bg-white p-6">
                        <SpecGroupsBuilder
                            productId={product.id}
                            pricingMode={values.pricing_mode}
                        />
                    </section>
                </div>
            </main>
        </AdminLayout>
    );
}
