export type PreferredChannel = "Email" | "Phone" | "WhatsApp" | "In-Person";

export type PortalRole = "owner" | "admin" | "user" | "viewer";

export interface ClientPortalProfile {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    company: string;
    industry: string;
    address: string;
    vat_tax_id: string;
    kra_pin: string;
    preferred_channel: PreferredChannel;
    delivery_instructions: string;
    role: PortalRole;
    client_id: string;
}

export interface UpdateClientPortalProfilePayload {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    company?: string;
    industry?: string;
    address?: string;
    vat_tax_id?: string;
    kra_pin?: string;
    preferred_channel?: PreferredChannel;
    delivery_instructions?: string;
}

export interface ChangePasswordPayload {
    old_password: string;
    new_password: string;
}
