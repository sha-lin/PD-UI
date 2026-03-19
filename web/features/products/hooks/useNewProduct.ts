"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createProduct, uploadProductImage } from "@/services/products";
import type { ProductFormValues } from "@/types/products";
import {
    INITIAL_PRODUCT_VALUES,
    buildNewProductPayload,
    getMissingRequiredFields,
} from "@/features/products/utils/product-form";

interface UseNewProductReturn {
    values: ProductFormValues;
    isSubmitting: boolean;
    image: File | null;
    handleValuesChange: (newValues: ProductFormValues) => void;
    handleImageChange: (file: File | null) => void;
    handleSubmit: () => Promise<void>;
}

export function useNewProduct(basePath: string): UseNewProductReturn {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [values, setValues] = useState<ProductFormValues>(INITIAL_PRODUCT_VALUES);
    const [image, setImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleValuesChange = (newValues: ProductFormValues): void => {
        setValues(newValues);
    };

    const handleImageChange = (file: File | null): void => {
        setImage(file);
    };

    const handleSubmit = async (): Promise<void> => {
        const missing = getMissingRequiredFields(values);
        if (missing.length > 0) {
            toast.error(`Required: ${missing.join(", ")}`);
            return;
        }

        setIsSubmitting(true);
        try {
            const product = await createProduct(buildNewProductPayload(values));
            if (image) {
                await uploadProductImage(product.id, image, values.name.trim());
            }
            await queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Product created.");
            router.push(basePath);
        } catch (_error: unknown) {
            toast.error("Unable to create product. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        values,
        isSubmitting,
        image,
        handleValuesChange,
        handleImageChange,
        handleSubmit,
    };
}
