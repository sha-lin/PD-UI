import type { ReactElement } from "react";

interface ProductsEmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function ProductsEmptyState({
    title,
    description,
    actionLabel,
    onAction,
}: ProductsEmptyStateProps): ReactElement {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-2">{description}</p>
            {actionLabel && onAction && (
                <button
                    type="button"
                    onClick={onAction}
                    className="mt-4 inline-flex items-center justify-center rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
