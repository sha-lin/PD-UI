import type { ReactElement } from "react";

export const inputCls =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue";

export const selectCls =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue";

export const textareaCls =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue resize-y";

interface FormFieldProps {
    label: string;
    required?: boolean;
    hint?: string;
    children: ReactElement;
}

export default function FormField({ label, required, hint, children }: FormFieldProps): ReactElement {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </label>
            {hint && <p className="text-xs text-gray-500 leading-snug">{hint}</p>}
            {children}
        </div>
    );
}
