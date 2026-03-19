"use client";

import type { ReactElement } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/admin-layout";
import { resolveProductsBasePath } from "@/lib/product-routes";
import ProductForm from "@/features/products/components/ProductForm";
import SpecGroupsBuilder from "@/features/products/components/SpecGroupsBuilder";
import EditProductSkeleton from "@/features/products/components/EditProductSkeleton";
import EditProductHeader from "@/features/products/components/EditProductHeader";
import { useEditProduct } from "@/features/products/hooks/useEditProduct";

export default function EditProductPage(): ReactElement {
    const params = useParams<{ productId: string }>();
    const pathname = usePathname();
    const router = useRouter();
    const basePath = resolveProductsBasePath(pathname);
    const productId = Number(params.productId);

    const {
        product,
        values,
        isLoading,
        isError,
        isSubmitting,
        image,
        handleValuesChange,
        handleImageChange,
        handleSubmit,
    } = useEditProduct(productId, basePath);

    if (isLoading) {
        return <EditProductSkeleton />;
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
            <EditProductHeader product={product} basePath={basePath} />
            <main className="bg-gray-50 min-h-screen">
                <div className="px-4 py-6 space-y-6">
                    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                        <ProductForm
                            values={values}
                            onValuesChange={handleValuesChange}
                            onImageChange={handleImageChange}
                            selectedImageName={image?.name ?? null}
                            existingImageUrl={product.primary_image_url}
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

