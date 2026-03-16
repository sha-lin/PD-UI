import type { ReactElement } from "react";

export default function ProductsSkeleton(): ReactElement {
    return (
        <div className="animate-pulse">
            <div className="mb-4 h-10 rounded-lg bg-gray-200" />
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="h-4 w-48 rounded bg-gray-200" />
                </div>
                {Array.from({ length: 8 }).map((_item, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-4 border-b border-gray-100 px-4 py-3 last:border-0"
                    >
                        <div className="h-10 w-10 rounded-lg bg-gray-200 shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-48 rounded bg-gray-200" />
                            <div className="h-3 w-32 rounded bg-gray-100" />
                        </div>
                        <div className="h-5 w-20 rounded-full bg-gray-200" />
                        <div className="h-5 w-16 rounded-full bg-gray-200" />
                        <div className="h-5 w-16 rounded-full bg-gray-200" />
                        <div className="h-4 w-24 rounded bg-gray-200" />
                    </div>
                ))}
            </div>
        </div>
    );
}
