"use client";

import { ArrowLeft } from "lucide-react";
import type { ReactElement } from "react";

interface QuoteTopBarProps {
    isEditMode: boolean;
    quoteDisplayId?: string;
    quoteStatus?: string;
    isSaving: boolean;
    onBack: () => void;
    onSaveDraft: () => void;
    onSendToPT: () => void;
    onEmailClient: () => void;
}

export default function QuoteTopBar({
    isEditMode,
    quoteDisplayId,
    quoteStatus,
    isSaving,
    onBack,
    onSaveDraft,
    onSendToPT,
    onEmailClient,
}: QuoteTopBarProps): ReactElement {
    const isCosted = quoteStatus === "Costed";
    const canEdit = !isEditMode || quoteStatus === "Draft" || isCosted;

    return (
        <div className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-10">
            <div className="flex items-center justify-between max-w-[1400px] mx-auto">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-base font-semibold text-gray-900">
                            {isEditMode
                                ? `Edit Quote${quoteDisplayId ? ` · ${quoteDisplayId}` : ""}`
                                : "New Quote"}
                        </h1>
                        {isEditMode && quoteStatus === "Draft" && (
                            <p className="text-xs text-gray-400 mt-0.5">Draft — editing enabled</p>
                        )}
                        {isEditMode && isCosted && (
                            <p className="text-xs text-amber-600 mt-0.5 font-medium">Costed by PT — set selling prices, then email client</p>
                        )}
                    </div>
                </div>

                {canEdit ? (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onSaveDraft}
                            disabled={isSaving}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            {isEditMode ? "Save Changes" : "Save Draft"}
                        </button>
                        {!isCosted && (
                            <button
                                type="button"
                                onClick={onSendToPT}
                                disabled={isSaving}
                                className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-md hover:bg-brand-blue/90 disabled:opacity-50 transition-colors"
                            >
                                {isEditMode ? "Save & Send to PT" : "Send to PT for Costing"}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onEmailClient}
                            disabled={isSaving}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 transition-colors ${isCosted
                                    ? "bg-brand-green hover:bg-brand-green/90 ring-2 ring-brand-green/30"
                                    : "bg-brand-green hover:bg-brand-green/90"
                                }`}
                        >
                            {isCosted ? "Set Prices & Email Client" : isEditMode ? "Save & Email Client" : "Email Client"}
                        </button>
                    </div>
                ) : (
                    <span className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                        Status:{" "}
                        <span className="font-medium text-gray-700">{quoteStatus}</span> — read only
                    </span>
                )}
            </div>
        </div>
    );
}
