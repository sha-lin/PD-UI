import type { ReactElement } from "react";

export default function JobsSkeleton(): ReactElement {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {[1, 2, 3].map((item: number): ReactElement => (
                        <div key={item} className="h-10 bg-gray-100 rounded"></div>
                    ))}
                </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="h-10 bg-gray-100"></div>
                {[1, 2, 3, 4, 5, 6].map((item: number): ReactElement => (
                    <div key={item} className="flex gap-4 px-4 py-4 border-t border-gray-100">
                        <div className="h-4 bg-gray-100 rounded w-24"></div>
                        <div className="h-4 bg-gray-100 rounded w-32"></div>
                        <div className="h-4 bg-gray-100 rounded w-40"></div>
                        <div className="h-4 bg-gray-100 rounded w-24 ml-auto"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
