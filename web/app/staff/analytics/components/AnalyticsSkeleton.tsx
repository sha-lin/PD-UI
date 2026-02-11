export default function AnalyticsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                        <div className="h-3 bg-gray-200 rounded w-24 mb-3"></div>
                        <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="h-5 bg-gray-200 rounded w-40 mb-6"></div>
                <div className="h-64 bg-gray-100 rounded"></div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="h-5 bg-gray-200 rounded w-40 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-3">
                            <div className="h-10 bg-gray-100 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
