import type { ReactElement } from "react";
import type { Product } from "@/types/products";

interface EditProductHeaderProps {
    product: Product;
    basePath: string;
}

export default function EditProductHeader({ product, basePath }: EditProductHeaderProps): ReactElement {
    return (
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
    );
}
