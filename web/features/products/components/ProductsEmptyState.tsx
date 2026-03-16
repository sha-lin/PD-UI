import type { ReactElement } from "react";
import { PackageIcon, PlusIcon } from "lucide-react";

interface ProductsEmptyStateProps {
    onNewProduct: () => void;
    isFiltered: boolean;
}

export default function ProductsEmptyState({
    onNewProduct,
    isFiltered,
}: ProductsEmptyStateProps): ReactElement {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
                <PackageIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
                {isFiltered ? "No products match your filters" : "No products yet"}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs mb-6">
                {isFiltered
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "Create your first product to get started. Products appear on the storefront once published."}
            </p>
            {!isFiltered && (
                <button
                    type="button"
                    onClick={onNewProduct}
                    className="inline-flex items-center gap-2 rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90"
                >
                    <PlusIcon className="h-4 w-4" />
                    Create Product
                </button>
            )}
        </div>
    );
}
