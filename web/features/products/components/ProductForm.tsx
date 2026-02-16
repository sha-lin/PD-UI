import type { ChangeEvent, FormEvent, ReactElement } from "react";
import type { ProductFormValues, ProductCustomizationLevel } from "@/types/products";

interface ProductFormProps {
    values: ProductFormValues;
    onValuesChange: (values: ProductFormValues) => void;
    onPrimaryImageChange: (file: File | null) => void;
    onGalleryImagesChange: (files: File[]) => void;
    selectedPrimaryImageName: string | null;
    selectedGalleryImageCount: number;
    existingImageCount?: number;
    hasExistingPrimaryImage?: boolean;
    onSubmit: () => void;
    onCancel: () => void;
    submitLabel: string;
    isSubmitting: boolean;
}

export default function ProductForm({
    values,
    onValuesChange,
    onPrimaryImageChange,
    onGalleryImagesChange,
    selectedPrimaryImageName,
    selectedGalleryImageCount,
    existingImageCount,
    hasExistingPrimaryImage,
    onSubmit,
    onCancel,
    submitLabel,
    isSubmitting,
}: ProductFormProps): ReactElement {
    const updateField = <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]): void => {
        onValuesChange({
            ...values,
            [field]: value,
        });
    };

    const handleTextChange = (field: keyof ProductFormValues) => (event: ChangeEvent<HTMLInputElement>): void => {
        updateField(field, event.target.value as ProductFormValues[keyof ProductFormValues]);
    };

    const handleTextareaChange = (field: keyof ProductFormValues) => (event: ChangeEvent<HTMLTextAreaElement>): void => {
        updateField(field, event.target.value as ProductFormValues[keyof ProductFormValues]);
    };

    const handleSelectChange = <T extends ProductFormValues[keyof ProductFormValues]>(field: keyof ProductFormValues) =>
        (event: ChangeEvent<HTMLSelectElement>): void => {
            updateField(field, event.target.value as T);
        };

    const handleNumberChange = (field: keyof ProductFormValues) => (event: ChangeEvent<HTMLInputElement>): void => {
        updateField(field, Number(event.target.value) as ProductFormValues[keyof ProductFormValues]);
    };

    const handleCheckboxChange = (field: keyof ProductFormValues) => (event: ChangeEvent<HTMLInputElement>): void => {
        updateField(field, event.target.checked as ProductFormValues[keyof ProductFormValues]);
    };

    const handleCustomizationChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        const nextValue = event.target.value as ProductCustomizationLevel;
        updateField("customization_level", nextValue);
        if (nextValue === "fully_customizable") {
            updateField("base_price", "");
        }
    };

    return (
        <form
            className="space-y-6"
            onSubmit={(event: FormEvent<HTMLFormElement>): void => {
                event.preventDefault();
                onSubmit();
            }}
        >
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                <p className="text-xs text-gray-500 mt-2">What customers see in the catalog.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Product Name *</label>
                        <p className="text-xs text-gray-500 mt-1">Simple customer-facing name.</p>
                        <input
                            type="text"
                            value={values.name}
                            onChange={handleTextChange("name")}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Primary Category</label>
                        <p className="text-xs text-gray-500 mt-1">Main group for this product.</p>
                        <input
                            type="text"
                            value={values.primary_category}
                            onChange={handleTextChange("primary_category")}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            placeholder="Print Products"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sub-Category</label>
                        <p className="text-xs text-gray-500 mt-1">Smaller group under the main category.</p>
                        <input
                            type="text"
                            value={values.sub_category}
                            onChange={handleTextChange("sub_category")}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            placeholder="Business Cards"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Product Family</label>
                        <p className="text-xs text-gray-500 mt-1">Optional grouping for related items.</p>
                        <input
                            type="text"
                            value={values.product_family}
                            onChange={handleTextChange("product_family")}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            placeholder="Business Cards Family"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Product Type</label>
                        <p className="text-xs text-gray-500 mt-1">Pick physical, digital, or service.</p>
                        <select
                            value={values.product_type}
                            onChange={handleSelectChange("product_type")}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="physical">Physical</option>
                            <option value="digital">Digital</option>
                            <option value="service">Service</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Short Description *</label>
                        <p className="text-xs text-gray-500 mt-1">One sentence summary for lists.</p>
                        <textarea
                            value={values.short_description}
                            onChange={handleTextareaChange("short_description")}
                            rows={2}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Long Description *</label>
                        <p className="text-xs text-gray-500 mt-1">Full details customers should know.</p>
                        <textarea
                            value={values.long_description}
                            onChange={handleTextareaChange("long_description")}
                            rows={4}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Pricing & Visibility</h2>
                <p className="text-xs text-gray-500 mt-2">Define pricing rules and catalog visibility.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Customization Level</label>
                        <p className="text-xs text-gray-500 mt-1">How flexible the product options are.</p>
                        <select
                            value={values.customization_level}
                            onChange={handleCustomizationChange}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="non_customizable">Non-Customizable</option>
                            <option value="semi_customizable">Semi-Customizable</option>
                            <option value="fully_customizable">Fully Customizable</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Base Price</label>
                        <p className="text-xs text-gray-500 mt-1">Starting price for fixed items.</p>
                        <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={values.base_price}
                            onChange={handleTextChange("base_price")}
                            disabled={values.customization_level === "fully_customizable"}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                        <p className="text-xs text-gray-500 mt-1">Draft keeps it hidden from customers.</p>
                        <select
                            value={values.status}
                            onChange={handleSelectChange("status")}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Visibility</label>
                        <p className="text-xs text-gray-500 mt-1">Where customers can find it.</p>
                        <select
                            value={values.visibility}
                            onChange={handleSelectChange("visibility")}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="catalog-search">Catalog & Search</option>
                            <option value="catalog-only">Catalog Only</option>
                            <option value="search-only">Search Only</option>
                            <option value="hidden">Hidden</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                        <input
                            type="checkbox"
                            checked={values.is_visible}
                            onChange={handleCheckboxChange("is_visible")}
                            className="h-4 w-4"
                        />
                        <div>
                            <div className="text-sm font-semibold text-gray-900">Visible to customers</div>
                            <p className="text-xs text-gray-500">Turn off to hide in the storefront.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>
                <p className="text-xs text-gray-500 mt-2">Track stock and availability.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stock Status</label>
                        <p className="text-xs text-gray-500 mt-1">Current availability for this item.</p>
                        <select
                            value={values.stock_status}
                            onChange={handleSelectChange("stock_status")}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="made_to_order">Made to Order</option>
                            <option value="in_stock">In Stock</option>
                            <option value="low_stock">Low Stock</option>
                            <option value="out_of_stock">Out of Stock</option>
                            <option value="discontinued">Discontinued</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stock Quantity</label>
                        <p className="text-xs text-gray-500 mt-1">How many are on hand.</p>
                        <input
                            type="number"
                            min={0}
                            value={values.stock_quantity}
                            onChange={handleNumberChange("stock_quantity")}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                        <input
                            type="checkbox"
                            checked={values.track_inventory}
                            onChange={handleCheckboxChange("track_inventory")}
                            className="h-4 w-4"
                        />
                        <div>
                            <div className="text-sm font-semibold text-gray-900">Track inventory</div>
                            <p className="text-xs text-gray-500">Count stock automatically.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                        <input
                            type="checkbox"
                            checked={values.allow_backorders}
                            onChange={handleCheckboxChange("allow_backorders")}
                            className="h-4 w-4"
                        />
                        <div>
                            <div className="text-sm font-semibold text-gray-900">Allow backorders</div>
                            <p className="text-xs text-gray-500">Let customers order even if empty.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>
                <p className="text-xs text-gray-500 mt-2">Add one primary image and any other supporting images.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Primary Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(event): void => {
                                const file = event.target.files?.[0] ?? null;
                                onPrimaryImageChange(file);
                            }}
                            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            {selectedPrimaryImageName
                                ? `Selected: ${selectedPrimaryImageName}`
                                : hasExistingPrimaryImage
                                    ? "Primary image already exists."
                                    : "No primary image selected."}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Other Images</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(event): void => {
                                const files = Array.from(event.target.files ?? []).slice(0, 10);
                                onGalleryImagesChange(files);
                            }}
                            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            {selectedGalleryImageCount > 0
                                ? `Selected: ${selectedGalleryImageCount}`
                                : typeof existingImageCount === "number"
                                    ? `Existing images: ${existingImageCount}`
                                    : "No other images selected."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}
