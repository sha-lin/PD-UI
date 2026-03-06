import { z } from "zod";

export const contactSchema = z.object({
    name: z.string().min(1, "Contact name is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
    role: z.enum(["None", "Approve Quotes", "Approve Artwork", "Billing Contact"]),
});

export const brandAssetSchema = z.object({
    file: z.instanceof(File),
    asset_type: z.enum(["Logo", "Brand Guide", "Color Palette", "Font", "Other"]),
});

export const complianceDocSchema = z.object({
    file: z.instanceof(File),
    document_type: z.enum([
        "Certificate of Incorporation",
        "KRA Pin Certificate",
        "PO Terms",
        "NDA",
        "Other",
    ]),
    expiry_date: z.string().optional(),
});

const baseClientSchema = z.object({
    client_type: z.enum(["B2B", "B2C"]),
    name: z.string().min(1, "Contact name is required"),
    phone: z.string().min(1, "Phone number is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    status: z.enum(["Active", "Dormant", "Inactive"]),
    preferred_channel: z.enum(["Email", "Phone", "WhatsApp", "In-Person"]),
    lead_source: z.string().optional(),
    address: z.string().optional(),
    delivery_address: z.string().optional(),
    delivery_instructions: z.string().optional(),
    payment_terms: z.enum(["Prepaid", "Net 7", "Net 15", "Net 30", "Net 60"]),
});

const b2bClientSchema = baseClientSchema.extend({
    client_type: z.literal("B2B"),
    company: z.string().min(1, "Company name is required for B2B clients"),
    industry: z.string().optional(),
    vat_tax_id: z.string().optional(),
    kra_pin: z.string().optional(),
    credit_limit: z.number().min(0).optional(),
    default_markup: z.number().min(0).optional(),
    risk_rating: z.enum(["Low", "Medium", "High"]),
    is_reseller: z.boolean().optional(),
});

const b2cClientSchema = baseClientSchema.extend({
    client_type: z.literal("B2C"),
});

export const clientFormSchema = z.discriminatedUnion("client_type", [
    b2bClientSchema,
    b2cClientSchema,
]);

export type ClientFormData = z.infer<typeof clientFormSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type BrandAssetData = z.infer<typeof brandAssetSchema>;
export type ComplianceDocData = z.infer<typeof complianceDocSchema>;
