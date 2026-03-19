"use client";

import type { ReactElement } from "react";
import { MoreHorizontalIcon, PencilIcon, TrashIcon, CheckCircleIcon, ArchiveIcon } from "lucide-react";
import { useRef, useState } from "react";
import type { Product, ProductStatus } from "@/types/products";

interface ProductsTableProps {
    products: Product[];
    onEdit: (productId: number) => void;
    onDelete: (productId: number) => void;
    onPublish: (productId: number) => void;
    onArchive: (productId: number) => void;
}

const statusStyles: Record<ProductStatus, string> = {
    draft: "bg-gray-100 text-gray-600",
    published: "bg-green-100 text-green-700",
    archived: "bg-orange-100 text-orange-700",
};

const pricingModeStyles: Record<string, string> = {
    auto_calculate: "bg-blue-100 text-blue-700",
    quote_only: "bg-purple-100 text-purple-700",
};

const pricingModeLabels: Record<string, string> = {
    auto_calculate: "Auto",
    quote_only: "Quote Only",
};

const stockStatusStyles: Record<string, string> = {
    in_stock: "bg-green-100 text-green-700",
    low_stock: "bg-yellow-100 text-yellow-700",
    out_of_stock: "bg-red-100 text-red-700",
    made_to_order: "bg-blue-100 text-blue-700",
    discontinued: "bg-gray-100 text-gray-500",
};

const stockStatusLabels: Record<string, string> = {
    in_stock: "In Stock",
    low_stock: "Low Stock",
    out_of_stock: "Out of Stock",
    made_to_order: "MTO",
    discontinued: "Discontinued",
};

function ProductRowMenu({
    product,
    onEdit,
    onDelete,
    onPublish,
    onArchive,
}: {
    product: Product;
    onEdit: () => void;
    onDelete: () => void;
    onPublish: () => void;
    onArchive: () => void;
}): ReactElement {
    const [open, setOpen] = useState<boolean>(false);
    const [menuPos, setMenuPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);

    const handleOpen = (): void => {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setMenuPos({
                top: rect.bottom + window.scrollY + 4,
                right: window.innerWidth - rect.right,
            });
        }
        setOpen((prev) => !prev);
    };

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                onClick={handleOpen}
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
                <MoreHorizontalIcon className="h-4 w-4" />
            </button>
            {open && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                    />
                    <div
                        style={{ top: menuPos.top, right: menuPos.right }}
                        className="fixed z-50 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                    >
                        <button
                            type="button"
                            onClick={() => { onEdit(); setOpen(false); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <PencilIcon className="h-4 w-4" />
                            Edit
                        </button>
                        {product.status !== "published" && (
                            <button
                                type="button"
                                onClick={() => { onPublish(); setOpen(false); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-gray-50"
                            >
                                <CheckCircleIcon className="h-4 w-4" />
                                Publish
                            </button>
                        )}
                        {product.status !== "archived" && (
                            <button
                                type="button"
                                onClick={() => { onArchive(); setOpen(false); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-gray-50"
                            >
                                <ArchiveIcon className="h-4 w-4" />
                                Archive
                            </button>
                        )}
                        <div className="my-1 border-t border-gray-100" />
                        <button
                            type="button"
                            onClick={() => { onDelete(); setOpen(false); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                            <TrashIcon className="h-4 w-4" />
                            Delete
                        </button>
                    </div>
                </>
            )}
        </>
    );
}

export default function ProductsTable({
    products,
    onEdit,
    onDelete,
    onPublish,
    onArchive,
}: ProductsTableProps): ReactElement {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Product
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Print Category
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Category
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Pricing
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Stock
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Updated
                            </th>
                            <th className="w-10 px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        {product.primary_image_url ? (
                                            <img
                                                src={product.primary_image_url}
                                                alt={product.name}
                                                className="h-10 w-10 shrink-0 rounded-lg object-cover border border-gray-100"
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => onEdit(product.id)}
                                                className="text-sm font-medium text-gray-900 hover:text-brand-blue text-left"
                                            >
                                                {product.name}
                                            </button>
                                            <p className="text-xs font-mono text-gray-400">
                                                {product.internal_code}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    {product.print_category_name ? (
                                        <span className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                                            {product.print_category_name}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-400">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            {product.primary_category_name ?? "—"}
                                        </p>
                                        {product.sub_category_name && (
                                            <p className="text-xs text-gray-400">
                                                {product.sub_category_name}
                                            </p>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${pricingModeStyles[product.pricing_mode]}`}
                                    >
                                        {pricingModeLabels[product.pricing_mode]}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${stockStatusStyles[product.stock_status]}`}
                                    >
                                        {stockStatusLabels[product.stock_status]}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[product.status]}`}
                                    >
                                        {product.status.charAt(0).toUpperCase() +
                                            product.status.slice(1)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                                    {new Date(product.updated_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                    <ProductRowMenu
                                        product={product}
                                        onEdit={() => onEdit(product.id)}
                                        onDelete={() => onDelete(product.id)}
                                        onPublish={() => onPublish(product.id)}
                                        onArchive={() => onArchive(product.id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
