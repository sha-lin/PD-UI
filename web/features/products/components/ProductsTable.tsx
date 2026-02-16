import Image from "next/image";
import type { ReactElement } from "react";
import type { Product, ProductCustomizationLevel, ProductStatus, ProductStockStatus } from "@/types/products";

interface ProductsTableProps {
    products: Product[];
    onEdit: (product: Product) => void;
    onPublish: (product: Product) => void;
    onArchive: (product: Product) => void;
    onDelete: (product: Product) => void;
}

const statusStyles: Record<ProductStatus, string> = {
    draft: "bg-brand-yellow/20 text-brand-black",
    published: "bg-brand-green/10 text-brand-green",
    archived: "bg-gray-100 text-gray-600",
};

const stockStyles: Record<ProductStockStatus, string> = {
    in_stock: "bg-brand-green/10 text-brand-green",
    low_stock: "bg-brand-yellow/20 text-brand-black",
    out_of_stock: "bg-brand-red/10 text-brand-red",
    made_to_order: "bg-brand-blue/10 text-brand-blue",
    discontinued: "bg-gray-100 text-gray-600",
};

const customizationLabels: Record<ProductCustomizationLevel, string> = {
    non_customizable: "Fixed Price",
    semi_customizable: "Semi-Custom",
    fully_customizable: "Fully Custom",
};

export default function ProductsTable({
    products,
    onEdit,
    onPublish,
    onArchive,
    onDelete,
}: ProductsTableProps): ReactElement {
    const formatDate = (value: string): string =>
        new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });

    const formatPrice = (product: Product): string => {
        if (product.customization_level === "fully_customizable") {
            return "Formula-based";
        }
        if (product.base_price === null) {
            return "—";
        }
        const parsedPrice = typeof product.base_price === "number" ? product.base_price : Number(product.base_price);
        if (!Number.isFinite(parsedPrice)) {
            return "—";
        }
        return `KES ${parsedPrice.toFixed(2)}`;
    };

    const getInitials = (value: string): string =>
        value
            .split(" ")
            .filter((chunk: string): boolean => chunk.length > 0)
            .slice(0, 2)
            .map((chunk: string): string => chunk[0]?.toUpperCase() ?? "")
            .join("");

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customization</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Base Price</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Updated</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product: Product): ReactElement => (
                        <tr key={product.id} className="border-b border-gray-100 last:border-0">
                            <td className="py-3 px-4 text-sm text-gray-700">
                                <div className="flex items-center gap-3">
                                    {product.primary_image_url ? (
                                        <Image
                                            src={product.primary_image_url}
                                            alt={product.name}
                                            width={40}
                                            height={40}
                                            className="h-10 w-10 rounded-md object-cover border border-gray-200"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-md border border-gray-200 bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                                            {getInitials(product.name)}
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-semibold text-gray-900">{product.name}</div>
                                        <div className="text-xs text-gray-500">{product.internal_code}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                <div className="font-semibold text-gray-900">{product.primary_category || "—"}</div>
                                <div className="text-xs text-gray-500">{product.sub_category || "—"}</div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold bg-brand-blue/10 text-brand-blue">
                                    {customizationLabels[product.customization_level]}
                                </span>
                            </td>
                            <td className="py-3 px-4 text-sm">
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${stockStyles[product.stock_status]}`}>
                                    {product.stock_status.replace(/_/g, " ")}
                                    {product.stock_status !== "made_to_order" ? ` · ${product.stock_quantity}` : ""}
                                </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {formatPrice(product)}
                            </td>
                            <td className="py-3 px-4 text-sm">
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[product.status]}`}>
                                    {product.status}
                                </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">
                                {formatDate(product.updated_at)}
                            </td>
                            <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={(): void => onEdit(product)}
                                        className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                                    >
                                        Edit
                                    </button>
                                    {product.status !== "published" && (
                                        <button
                                            type="button"
                                            onClick={(): void => onPublish(product)}
                                            className="text-sm font-semibold text-brand-green hover:text-brand-green/80"
                                        >
                                            Publish
                                        </button>
                                    )}
                                    {product.status !== "archived" && (
                                        <button
                                            type="button"
                                            onClick={(): void => onArchive(product)}
                                            className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80"
                                        >
                                            Archive
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={(): void => onDelete(product)}
                                        className="text-sm font-semibold text-brand-red hover:text-brand-red/80"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
