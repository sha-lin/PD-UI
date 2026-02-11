import { TopProduct } from "../types";

interface TopProductsTableProps {
    products: TopProduct[];
}

export default function TopProductsTable({ products }: TopProductsTableProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Top Selling Products
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                                Product
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                                Orders
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                                Revenue
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map((product, index) => (
                                <tr key={index} className="border-b border-gray-100 last:border-0">
                                    <td className="py-3 px-4">
                                        <span className="font-medium text-gray-900">
                                            {product.product_name}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right text-gray-700">
                                        {product.order_count}
                                    </td>
                                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                                        KES {product.total_revenue.toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="py-8 text-center text-gray-500">
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
