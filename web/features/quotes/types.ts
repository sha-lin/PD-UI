export interface LineItem {
    tempId: string;
    product_id: number;
    product_name: string;
    product_sku: string;
    pricing_mode: string;
    quantity: number;
    unit_price: number;
    discount_amount: number;
    discount_type: "percent" | "fixed";
    variable_amount: number;
}
