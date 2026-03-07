const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ContactFormData {
    first_name: string;
    last_name: string;
    email: string;
    message: string;
    inquiry_type: string;
}

interface ContactFormResponse {
    message: string;
}

export async function submitContactForm(data: ContactFormData): Promise<ContactFormResponse> {
    const response = await fetch(`${API_URL}/api/v1/contact/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit contact form");
    }

    return response.json();
}
