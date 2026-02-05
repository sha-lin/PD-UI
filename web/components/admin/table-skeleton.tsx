interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

export default function TableSkeleton({
    rows = 5,
    columns = 7,
}: TableSkeletonProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200">
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i} className="px-8 py-4 text-left">
                                <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <td key={colIndex} className="px-8 py-5 whitespace-nowrap">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full max-w-[120px]"></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
