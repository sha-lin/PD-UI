import type { ReactElement } from "react";
import AdminLayout from "@/components/admin/admin-layout";

const TAB_WIDTHS = [100, 120, 140, 90, 90, 70] as const;
const FIELD_COUNTS = [1, 2, 3, 4, 5] as const;

export default function EditProductSkeleton(): ReactElement {
    return (
        <AdminLayout>
            <div className="border-b border-gray-200 bg-white px-8 py-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-3 w-10 rounded bg-gray-200 animate-pulse" />
                    <div className="h-3 w-2 rounded bg-gray-200 animate-pulse" />
                    <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
                    <div className="h-3 w-2 rounded bg-gray-200 animate-pulse" />
                    <div className="h-3 w-32 rounded bg-gray-200 animate-pulse" />
                </div>
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-7 w-56 rounded-lg bg-gray-200 animate-pulse" />
                        <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
                    </div>
                    <div className="h-3 w-28 rounded bg-gray-200 animate-pulse" />
                </div>
            </div>

            <main className="bg-gray-50 min-h-screen px-4 py-6 space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                    <div className="flex gap-1 border-b border-gray-200 bg-white px-4">
                        {TAB_WIDTHS.map((w, i) => (
                            <div
                                key={i}
                                className="my-3 h-5 rounded-full bg-gray-200 animate-pulse"
                                style={{ width: w }}
                            />
                        ))}
                    </div>
                    <div className="p-6 space-y-5 max-w-2xl">
                        <div className="flex items-start gap-4">
                            <div className="h-24 w-24 shrink-0 rounded-xl bg-gray-200 animate-pulse" />
                            <div className="space-y-2 pt-1">
                                <div className="h-3 w-40 rounded bg-gray-200 animate-pulse" />
                                <div className="h-8 w-32 rounded-lg bg-gray-200 animate-pulse" />
                            </div>
                        </div>
                        {FIELD_COUNTS.map((i) => (
                            <div key={i} className="space-y-1.5">
                                <div className="h-3 w-28 rounded bg-gray-200 animate-pulse" />
                                <div className="h-3 w-48 rounded bg-gray-100 animate-pulse" />
                                <div
                                    className={`w-full rounded-lg bg-gray-200 animate-pulse ${i >= 3 ? "h-20" : "h-9"
                                        }`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                    <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                        <div className="h-5 w-36 rounded bg-gray-200 animate-pulse" />
                        <div className="h-8 w-28 rounded-lg bg-gray-200 animate-pulse" />
                    </div>
                    <div className="p-6 space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-14 w-full rounded-xl bg-gray-100 animate-pulse" />
                        ))}
                    </div>
                </div>
            </main>
        </AdminLayout>
    );
}
