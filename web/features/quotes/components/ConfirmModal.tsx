import { X } from "lucide-react";

interface ConfirmModalProps {
    title: string;
    message: string;
    confirmText?: string;
    confirmColor?: "yellow" | "green" | "purple" | "red" | "blue";
    onClose: () => void;
    onConfirm: () => void;
}

export default function ConfirmModal({
    title,
    message,
    confirmText = "Confirm",
    confirmColor = "blue",
    onClose,
    onConfirm,
}: ConfirmModalProps) {
    const getConfirmButtonClass = (): string => {
        const baseClass = "px-4 py-2 text-sm font-medium rounded transition-colors";
        switch (confirmColor) {
            case "yellow":
                return `${baseClass} bg-brand-yellow text-brand-black hover:bg-brand-yellow/90`;
            case "green":
                return `${baseClass} bg-brand-green text-white hover:bg-brand-green/90`;
            case "purple":
                return `${baseClass} bg-brand-purple text-white hover:bg-brand-purple/90`;
            case "red":
                return `${baseClass} bg-brand-red text-white hover:bg-brand-red/90`;
            default:
                return `${baseClass} bg-brand-blue text-white hover:bg-brand-blue/90`;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            type="button"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    <p className="text-sm text-gray-700">{message}</p>
                </div>

                <div className="border-t border-gray-200 p-4 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button type="button" onClick={onConfirm} className={getConfirmButtonClass()}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
