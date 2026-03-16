"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/admin-layout";
import { resolveProductsBasePath } from "@/lib/product-routes";
import ProductForm from "@/features/products/components/ProductForm";
import { createProduct, uploadProductImage } from "@/services/products";
import type { CreateProductPayload, ProductFormValues } from "@/types/products";

const INITIAL_VALUES: ProductFormValues = {
    name: "",
    short_description: "",
    long_description: "",
    maintenance: "",
    technical_specs: "",
    print_category: "",
    primary_category: "",
    sub_category: "",
    product_family: "",
    tag_ids: [],
    product_type: "physical",
    pricing_mode: "auto_calculate",
    status: "draft",
    is_visible: true,
    visibility: "catalog-search",
    feature_product: false,
    bestseller_badge: false,
    new_arrival: false,
    new_arrival_expires: "",
    on_sale_badge: false,
    unit_of_measure: "pieces",
    unit_of_measure_custom: "",
    weight: "",
    weight_unit: "kg",
    length: "",
    width: "",
    height: "",
    dimension_unit: "cm",
    warranty: "satisfaction-guarantee",
    country_of_origin: "kenya",
    stock_status: "made_to_order",
    stock_quantity: 0,
    low_stock_threshold: 10,
    track_inventory: false,
    allow_backorders: true,
    internal_notes: "",
    client_notes: "",
};

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

const getMissingFields = (values: ProductFormValues): string[] => {
    const missing: string[] = [];
    if (!values.name.trim()) missing.push("Product Name");
    if (!values.short_description.trim()) missing.push("Short Description");
    if (!values.long_description.trim()) missing.push("Full Description");
    return missing;
};

export default function NewProductPage(): ReactElement {
    const router = useRouter();
    const pathname = usePathname();
    const basePath = resolveProductsBasePath(pathname);

    const [values, setValues] = useState<ProductFormValues>(INITIAL_VALUES);
    const [image, setImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleSubmit = async (): Promise<void> => {
        const missing = getMissingFields(values);
        if (missing.length > 0) {
            toast.error(`Required: ${missing.join(", ")}`);
            return;
        }

        setIsSubmitting(true);
        try {
            const product = await createProduct(buildPayload(values));
            if (image) {
                await uploadProductImage(product.id, image, values.name.trim());
            }
            toast.success("Product created.");
            setTimeout(() => router.push(basePath), 400);
        } catch (_error: unknown) {
            toast.error("Unable to create product. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AdminLayout>
            <header className="border-b border-gray-200 bg-white">
                <div className="px-8 py-4">
                    <nav className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                        <a href="/admin" className="hover:text-brand-blue">Admin</a>
                        <span>/</span>
                        <a href={basePath} className="hover:text-brand-blue">Products</a>
                        <span>/</span>
                        <span className="text-gray-700">New</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-gray-900">Create Product</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Saved as draft until you publish it to the storefront.
                    </p>
                </div>
            </header>
            <main className="bg-gray-50 min-h-screen">
                <div className="px-4 py-6">
                    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                        <ProductForm
                            values={values}
                            onValuesChange={setValues}
                            onImageChange={setImage}
                            selectedImageName={image?.name ?? null}
                            onSubmit={handleSubmit}
                            onCancel={() => router.push(basePath)}
                            submitLabel="Create Product"
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </div>
            </main>
        </AdminLayout>
    );
}
