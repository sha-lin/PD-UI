"use client";

import { useState } from "react";
import { AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react";
import type { ReactElement } from "react";

interface QuotePTCostBannerProps {
    productionCost: number;
    currentSellingTotal: number;
    costedByName?: string;
}

const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 2,
    }).format(value);

export default function QuotePTCostBanner({
    productionCost,
    currentSellingTotal,
    costedByName,
}: QuotePTCostBannerProps): ReactElement {
    const [marginInput, setMarginInput] = useState("");

    const isPriced = currentSellingTotal > 0;
    const margin =
        isPriced && productionCost > 0
            ? ((currentSellingTotal - productionCost) / currentSellingTotal) * 100
            : null;

    const suggestedPrice =
        marginInput !== "" && productionCost > 0
            ? productionCost / (1 - Number(marginInput) / 100)
            : null;

    return (
        <div
            className={`rounded-lg border px-5 py-4 ${isPriced
                    ? "bg-green-50 border-green-200"
                    : "bg-amber-50 border-amber-200"
                }`}
        >
            <div className="flex items-start gap-3">
                <div className="mt-0.5">
                    {isPriced ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isPriced ? "text-green-800" : "text-amber-800"}`}>
                        {isPriced
                            ? "Selling prices set — ready to send to client"
                            : "PT has costed this job — you need to set selling prices"}
                    </p>
                    <p className={`text-xs mt-0.5 ${isPriced ? "text-green-700" : "text-amber-700"}`}>
                        {costedByName
                            ? `Costed by ${costedByName}.`
                            : "Costed by Production Team."}{" "}
                        Update the Rate (KES) on each line item below before emailing the client.
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">PT Production Cost</p>
                            <p className="text-base font-bold text-gray-900">{formatCurrency(productionCost)}</p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Your Selling Total</p>
                            <p className={`text-base font-bold ${isPriced ? "text-green-700" : "text-red-500"}`}>
                                {isPriced ? formatCurrency(currentSellingTotal) : "Not set yet"}
                            </p>
                        </div>

                        {margin !== null && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Your Margin</p>
                                <p
                                    className={`text-base font-bold ${margin >= 20
                                            ? "text-green-700"
                                            : margin >= 10
                                                ? "text-amber-600"
                                                : "text-red-600"
                                        }`}
                                >
                                    {margin.toFixed(1)}%
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <p className="text-xs text-gray-500">Margin calculator:</p>
                        <div className="flex items-center gap-1.5">
                            <input
                                type="number"
                                value={marginInput}
                                onChange={(e): void => setMarginInput(e.target.value)}
                                placeholder="e.g. 30"
                                min="0"
                                max="99"
                                className="w-20 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                            <span className="text-xs text-gray-500">% margin</span>
                            {suggestedPrice !== null && (
                                <span className="text-xs font-semibold text-brand-blue">
                                    → Sell for {formatCurrency(suggestedPrice)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
