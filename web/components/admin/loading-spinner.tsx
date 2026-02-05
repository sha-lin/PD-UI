import { LoaderOne } from "@/components/ui/loader";

interface LoadingSpinnerProps {
    message?: string;
}

export default function LoadingSpinner({
    message = "Loading...",
}: LoadingSpinnerProps) {
    return (
        <div className="p-12 text-center">
            <div className="flex justify-center mb-4">
                <LoaderOne />
            </div>
            <p className="text-gray-600">{message}</p>
        </div>
    );
}
