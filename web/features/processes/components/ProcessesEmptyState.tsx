import type { ReactElement } from "react";

interface ProcessesEmptyStateProps {
    title: string;
    description: string;
}

export default function ProcessesEmptyState({ title, description }: ProcessesEmptyStateProps): ReactElement {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-2">{description}</p>
        </div>
    );
}
