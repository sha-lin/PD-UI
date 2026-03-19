"use client";

import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchProduct, updateProduct, uploadProductImage } from "@/services/products";
import type { Product, ProductFormValues } from "@/types/products";
import { buildFormValues, buildPayload } from "@/features/products/utils/product-form";

interface UseEditProductReturn {
    product: Product | undefined;
    values: ProductFormValues | null;
    isLoading: boolean;
    isError: boolean;
    isSubmitting: boolean;
    image: File | null;
    handleValuesChange: (newValues: ProductFormValues) => void;
    handleImageChange: (file: File | null) => void;
    handleSubmit: () => Promise<void>;
}

export function useEditProduct(productId: number, basePath: string): UseEditProductReturn {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [localValues, setLocalValues] = useState<ProductFormValues | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const { data: product, isLoading, isError } = useQuery<Product>({
        queryKey: ["product", productId],
        queryFn: () => fetchProduct(productId),
        enabled: Boolean(productId),
    });

    const values = localValues ?? (product ? buildFormValues(product) : null);

    const handleValuesChange = useCallback((newValues: ProductFormValues): void => {
        setLocalValues(newValues);
    }, []);

    const handleImageChange = useCallback((file: File | null): void => {
        setImage(file);
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
            await queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Product saved.");
            router.push(basePath);
        } catch (_error: unknown) {
            toast.error("Unable to save product. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        product,
        values,
        isLoading,
        isError,
        isSubmitting,
        image,
        handleValuesChange,
        handleImageChange,
        handleSubmit,
    };
}
