import { FileX } from "lucide-react";

interface EmptyStateProps {
    message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FileX className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No results found</p>
            <p className="text-sm text-gray-500">{message}</p>
        </div>
    );
}
