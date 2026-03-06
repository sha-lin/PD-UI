import { z } from "zod";

export const leadFormSchema = z.object({
    name: z.string().min(1, "Contact name is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().min(1, "Phone number is required"),
    source: z.enum(["Website", "Referral", "Cold Call", "Social Media", "Event", "Other", ""]).optional(),
    product_interest: z.string().optional(),
    preferred_contact: z.enum(["Email", "Phone", "WhatsApp"]),
    preferred_client_type: z.enum(["B2B", "B2C"]),
    follow_up_date: z.string().optional(),
    status: z.enum(["New", "Contacted", "Qualified", "Converted", "Lost"]),
    notes: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;
