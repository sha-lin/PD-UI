import { AlertTriangle } from "lucide-react";

interface DeleteDialogProps {
    title: string;
    description: React.ReactNode;
    isPending?: boolean;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function DeleteDialog({
    title,
    description,
    isPending = false,
    confirmLabel = "Delete",
    onConfirm,
    onCancel,
}: DeleteDialogProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                </div>
                <div className="text-sm text-gray-600 mb-6">{description}</div>
                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isPending}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isPending}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                        {isPending ? "Deleting..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
