"use client";

import type { ReactElement } from "react";
import type { ProductFormValues } from "@/types/products";
import FormField, { textareaCls } from "./FormField";

interface NotesTabProps {
    values: ProductFormValues;
    onValuesChange: (values: ProductFormValues) => void;
}

export default function NotesTab({ values, onValuesChange }: NotesTabProps): ReactElement {
    const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]): void => {
        onValuesChange({ ...values, [key]: value });
    };

    return (
        <div className="max-w-2xl space-y-5">
            <FormField label="Internal Notes" hint="Visible only to staff — never exposed to clients. Use for supplier details, pricing rationale, or production instructions.">
                <textarea
                    className={textareaCls}
                    rows={4}
                    placeholder="Notes for the production team, pricing rationale, supplier details..."
                    value={values.internal_notes}
                    onChange={(e) => set("internal_notes", e.target.value)}
                />
            </FormField>
            <FormField label="Client Notes" hint="Additional notes shown to clients when viewing this product on the storefront or receiving a quotation">
                <textarea
                    className={textareaCls}
                    rows={4}
                    placeholder="Additional notes you want clients to see when viewing this product..."
                    value={values.client_notes}
                    onChange={(e) => set("client_notes", e.target.value)}
                />
            </FormField>
        </div>
    );
}
