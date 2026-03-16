"use client";

import { useState, type ReactElement } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlusIcon, PencilIcon, Trash2Icon, CheckIcon, XIcon } from "lucide-react";
import AdminLayout from "@/components/admin/admin-layout";
import type { PrintCategory, ProductCategory, ProductFamily, ProductSubCategory } from "@/types/products";
import {
    fetchPrintCategories,
    fetchProductCategories,
    fetchProductFamilies,
    fetchProductSubCategories,
    createPrintCategory,
    createProductCategory,
    createProductFamily,
    createProductSubCategory,
    updatePrintCategory,
    updateProductCategory,
    updateProductFamily,
    updateProductSubCategory,
    deletePrintCategory,
    deleteProductCategory,
    deleteProductFamily,
    deleteProductSubCategory,
} from "@/services/product-catalog-setup";

type TabId = "categories" | "subcategories" | "families" | "print-categories";

interface FormState {
    name: string;
    description: string;
    category: string;
}

const EMPTY_FORM: FormState = { name: "", description: "", category: "" };

const inputCls = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue";
const selectCls = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue";

function SectionLabel({ label, hint }: { label: string; hint: string }): ReactElement {
    return (
        <div className="mb-1">
            <p className="text-sm font-medium text-gray-700">{label}</p>
            <p className="text-xs text-gray-500">{hint}</p>
        </div>
    );
}

export default function CatalogSetupPage(): ReactElement {
    const [activeTab, setActiveTab] = useState<TabId>("categories");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const qc = useQueryClient();

    const { data: categories = [], isLoading: loadingCategories } = useQuery({
        queryKey: ["product-categories"],
        queryFn: fetchProductCategories,
    });
    const { data: subcategories = [], isLoading: loadingSubcategories } = useQuery({
        queryKey: ["product-subcategories"],
        queryFn: () => fetchProductSubCategories(),
    });
    const { data: families = [], isLoading: loadingFamilies } = useQuery({
        queryKey: ["product-families"],
        queryFn: fetchProductFamilies,
    });
    const { data: printCategories = [], isLoading: loadingPrint } = useQuery({
        queryKey: ["print-categories"],
        queryFn: fetchPrintCategories,
    });

    const invalidate = (keys: string[]): void => {
        keys.forEach((k) => void qc.invalidateQueries({ queryKey: [k] }));
    };

    const createCategoryMutation = useMutation({
        mutationFn: (d: FormState) => createProductCategory({ name: d.name, description: d.description }),
        onSuccess: () => { invalidate(["product-categories"]); toast.success("Category created."); resetForm(); },
        onError: () => toast.error("Failed to create category."),
    });
    const updateCategoryMutation = useMutation({
        mutationFn: (d: FormState & { id: number }) => updateProductCategory(d.id, { name: d.name, description: d.description }),
        onSuccess: () => { invalidate(["product-categories"]); toast.success("Category updated."); resetForm(); },
        onError: () => toast.error("Failed to update category."),
    });
    const deleteCategoryMutation = useMutation({
        mutationFn: (id: number) => deleteProductCategory(id),
        onSuccess: () => { invalidate(["product-categories"]); toast.success("Category deleted."); setDeletingId(null); },
        onError: () => toast.error("Failed to delete category."),
    });

    const createSubMutation = useMutation({
        mutationFn: (d: FormState) => createProductSubCategory({ name: d.name, description: d.description, category: Number(d.category) }),
        onSuccess: () => { invalidate(["product-subcategories"]); toast.success("Sub-category created."); resetForm(); },
        onError: () => toast.error("Failed to create sub-category."),
    });
    const updateSubMutation = useMutation({
        mutationFn: (d: FormState & { id: number }) => updateProductSubCategory(d.id, { name: d.name, description: d.description, category: Number(d.category) }),
        onSuccess: () => { invalidate(["product-subcategories"]); toast.success("Sub-category updated."); resetForm(); },
        onError: () => toast.error("Failed to update sub-category."),
    });
    const deleteSubMutation = useMutation({
        mutationFn: (id: number) => deleteProductSubCategory(id),
        onSuccess: () => { invalidate(["product-subcategories"]); toast.success("Sub-category deleted."); setDeletingId(null); },
        onError: () => toast.error("Failed to delete sub-category."),
    });

    const createFamilyMutation = useMutation({
        mutationFn: (d: FormState) => createProductFamily({ name: d.name, description: d.description }),
        onSuccess: () => { invalidate(["product-families"]); toast.success("Product family created."); resetForm(); },
        onError: () => toast.error("Failed to create product family."),
    });
    const updateFamilyMutation = useMutation({
        mutationFn: (d: FormState & { id: number }) => updateProductFamily(d.id, { name: d.name, description: d.description }),
        onSuccess: () => { invalidate(["product-families"]); toast.success("Product family updated."); resetForm(); },
        onError: () => toast.error("Failed to update product family."),
    });
    const deleteFamilyMutation = useMutation({
        mutationFn: (id: number) => deleteProductFamily(id),
        onSuccess: () => { invalidate(["product-families"]); toast.success("Product family deleted."); setDeletingId(null); },
        onError: () => toast.error("Failed to delete product family."),
    });

    const createPrintMutation = useMutation({
        mutationFn: (d: FormState) => createPrintCategory({ name: d.name, description: d.description }),
        onSuccess: () => { invalidate(["print-categories"]); toast.success("Print category created."); resetForm(); },
        onError: () => toast.error("Failed to create print category."),
    });
    const updatePrintMutation = useMutation({
        mutationFn: (d: FormState & { id: number }) => updatePrintCategory(d.id, { name: d.name, description: d.description }),
        onSuccess: () => { invalidate(["print-categories"]); toast.success("Print category updated."); resetForm(); },
        onError: () => toast.error("Failed to update print category."),
    });
    const deletePrintMutation = useMutation({
        mutationFn: (id: number) => deletePrintCategory(id),
        onSuccess: () => { invalidate(["print-categories"]); toast.success("Print category deleted."); setDeletingId(null); },
        onError: () => toast.error("Failed to delete print category."),
    });

    const resetForm = (): void => {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setShowForm(false);
    };

    const openCreate = (): void => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setShowForm(true);
    };

    const openEdit = (item: ProductCategory | ProductSubCategory | ProductFamily | PrintCategory): void => {
        setEditingId(item.id);
        setForm({
            name: item.name,
            description: item.description ?? "",
            category: "category" in item ? String((item as ProductSubCategory).category) : "",
        });
        setShowForm(true);
    };

    const handleTabChange = (tab: TabId): void => {
        setActiveTab(tab);
        resetForm();
        setDeletingId(null);
    };

    const isSaving =
        createCategoryMutation.isPending || updateCategoryMutation.isPending ||
        createSubMutation.isPending || updateSubMutation.isPending ||
        createFamilyMutation.isPending || updateFamilyMutation.isPending ||
        createPrintMutation.isPending || updatePrintMutation.isPending;

    const handleSubmit = (): void => {
        if (!form.name.trim()) { toast.error("Name is required."); return; }
        if (activeTab === "subcategories" && !form.category) { toast.error("Parent category is required."); return; }

        if (activeTab === "categories") {
            editingId !== null
                ? updateCategoryMutation.mutate({ ...form, id: editingId })
                : createCategoryMutation.mutate(form);
        } else if (activeTab === "subcategories") {
            editingId !== null
                ? updateSubMutation.mutate({ ...form, id: editingId })
                : createSubMutation.mutate(form);
        } else if (activeTab === "families") {
            editingId !== null
                ? updateFamilyMutation.mutate({ ...form, id: editingId })
                : createFamilyMutation.mutate(form);
        } else {
            editingId !== null
                ? updatePrintMutation.mutate({ ...form, id: editingId })
                : createPrintMutation.mutate(form);
        }
    };

    const handleDelete = (id: number): void => {
        if (activeTab === "categories") deleteCategoryMutation.mutate(id);
        else if (activeTab === "subcategories") deleteSubMutation.mutate(id);
        else if (activeTab === "families") deleteFamilyMutation.mutate(id);
        else deletePrintMutation.mutate(id);
    };

    const isDeleting =
        deleteCategoryMutation.isPending || deleteSubMutation.isPending ||
        deleteFamilyMutation.isPending || deletePrintMutation.isPending;

    const tabs: { id: TabId; label: string; count: number }[] = [
        { id: "categories", label: "Categories", count: categories.length },
        { id: "subcategories", label: "Sub-Categories", count: subcategories.length },
        { id: "families", label: "Product Families", count: families.length },
        { id: "print-categories", label: "Print Categories", count: printCategories.length },
    ];

    const activeItems: Array<ProductCategory | ProductSubCategory | ProductFamily | PrintCategory> =
        activeTab === "categories" ? categories :
            activeTab === "subcategories" ? subcategories :
                activeTab === "families" ? families :
                    printCategories;

    const isLoading = loadingCategories || loadingSubcategories || loadingFamilies || loadingPrint;

    return (
        <AdminLayout>
            <header className="border-b border-gray-200 bg-white px-8 py-5">
                <nav className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <a href="/admin" className="hover:text-brand-blue">Admin</a>
                    <span>/</span>
                    <a href="/admin/products" className="hover:text-brand-blue">Products</a>
                    <span>/</span>
                    <span className="text-gray-700">Catalog Setup</span>
                </nav>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Catalog Setup</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Manage categories, sub-categories, product families, and print categories used across products.
                        </p>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="border-b border-gray-200 bg-white px-8">
                <div className="flex gap-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleTabChange(tab.id)}
                            className={`relative px-5 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                                    ? "border-brand-blue text-brand-blue"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab.label}
                            <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === tab.id ? "bg-brand-blue/10 text-brand-blue" : "bg-gray-100 text-gray-500"
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex h-[calc(100vh-180px)]">
                {/* List */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-500">
                            {activeItems.length} {tabs.find(t => t.id === activeTab)?.label.toLowerCase()}
                        </p>
                        <button
                            type="button"
                            onClick={openCreate}
                            className="flex items-center gap-1.5 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90 transition-colors"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Add New
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-14 rounded-lg bg-gray-100 animate-pulse" />
                            ))}
                        </div>
                    ) : activeItems.length === 0 ? (
                        <div className="rounded-lg border-2 border-dashed border-gray-200 py-12 text-center">
                            <p className="text-sm text-gray-400">No items yet. Click &quot;Add New&quot; to create one.</p>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                                        {activeTab === "subcategories" && (
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Parent Category</th>
                                        )}
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                                        <th className="w-20 px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {activeItems.map((item) => (
                                        <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${editingId === item.id ? "bg-brand-blue/5" : ""}`}>
                                            <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                                            {activeTab === "subcategories" && (
                                                <td className="px-4 py-3 text-gray-500 text-xs">
                                                    {(item as ProductSubCategory).category_name}
                                                </td>
                                            )}
                                            <td className="px-4 py-3 text-xs font-mono text-gray-400">{item.slug}</td>
                                            <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{item.description || "—"}</td>
                                            <td className="px-4 py-3">
                                                {deletingId === item.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(item.id)}
                                                            disabled={isDeleting}
                                                            className="rounded p-1 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                            title="Confirm delete"
                                                        >
                                                            <CheckIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingId(null)}
                                                            className="rounded p-1 text-gray-400 hover:bg-gray-100 transition-colors"
                                                            title="Cancel"
                                                        >
                                                            <XIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(item)}
                                                            className="rounded p-1.5 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <PencilIcon className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingId(item.id)}
                                                            className="rounded p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2Icon className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Side form panel */}
                {showForm && (
                    <div className="w-80 shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-gray-900">
                                {editingId !== null ? "Edit" : "New"} {tabs.find(t => t.id === activeTab)?.label.replace(/s$/, "")}
                            </h2>
                            <button type="button" onClick={resetForm} className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                                <XIcon className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="px-5 py-5 space-y-4">
                            <div>
                                <SectionLabel label="Name" hint="Used in product forms and storefront navigation" />
                                <input
                                    type="text"
                                    className={inputCls}
                                    placeholder="e.g. Brochures"
                                    value={form.name}
                                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                                />
                            </div>

                            {activeTab === "subcategories" && (
                                <div>
                                    <SectionLabel label="Parent Category" hint="The main category this sub-category belongs to" />
                                    <select
                                        className={selectCls}
                                        value={form.category}
                                        onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                                    >
                                        <option value="">Select a category…</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <SectionLabel label="Description" hint="Optional — explains what belongs in this grouping" />
                                <textarea
                                    className={`${inputCls} resize-y`}
                                    rows={3}
                                    placeholder="Brief description…"
                                    value={form.description}
                                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                                />
                            </div>

                            <div className="flex gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    className="flex-1 rounded-lg bg-brand-blue py-2.5 text-sm font-bold text-white hover:bg-brand-blue/90 disabled:opacity-50 transition-colors"
                                >
                                    {isSaving ? "Saving…" : editingId !== null ? "Save Changes" : "Create"}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
