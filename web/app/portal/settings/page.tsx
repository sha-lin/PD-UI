"use client";

import { useState, useEffect, type ReactElement } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ClientLayout from "@/components/client/client-layout";
import { User, Building2, Mail, Phone, MapPin, Lock, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import {
    fetchClientPortalProfile,
    updateClientPortalProfile,
    changeClientPortalPassword,
} from "@/services/client-portal";
import type { UpdateClientPortalProfilePayload, PreferredChannel } from "@/types/client-portal";

interface ProfileFormState {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
}

interface CompanyFormState {
    company: string;
    industry: string;
    address: string;
    vat_tax_id: string;
    kra_pin: string;
    preferred_channel: PreferredChannel;
    delivery_instructions: string;
}

interface PasswordFormState {
    old_password: string;
    new_password: string;
    confirm_password: string;
}

interface SaveStatus {
    type: "success" | "error";
    message: string;
}

const PREFERRED_CHANNELS: PreferredChannel[] = ["Email", "Phone", "WhatsApp", "In-Person"];

export default function SettingsPage(): ReactElement {
    const queryClient = useQueryClient();

    const [profileForm, setProfileForm] = useState<ProfileFormState>({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
    });

    const [companyForm, setCompanyForm] = useState<CompanyFormState>({
        company: "",
        industry: "",
        address: "",
        vat_tax_id: "",
        kra_pin: "",
        preferred_channel: "Email",
        delivery_instructions: "",
    });

    const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
        old_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [profileStatus, setProfileStatus] = useState<SaveStatus | null>(null);
    const [passwordStatus, setPasswordStatus] = useState<SaveStatus | null>(null);

    const { data: profile, isLoading, isError, error } = useQuery({
        queryKey: ["portal-me"],
        queryFn: fetchClientPortalProfile,
        retry: 1,
        staleTime: 30_000,
    });

    useEffect(() => {
        if (profile) {
            setProfileForm({
                first_name: profile.first_name,
                last_name: profile.last_name,
                email: profile.email,
                phone: profile.phone,
            });
            setCompanyForm({
                company: profile.company,
                industry: profile.industry,
                address: profile.address,
                vat_tax_id: profile.vat_tax_id,
                kra_pin: profile.kra_pin,
                preferred_channel: profile.preferred_channel,
                delivery_instructions: profile.delivery_instructions,
            });
        }
    }, [profile]);

    const profileMutation = useMutation({
        mutationFn: (payload: UpdateClientPortalProfilePayload) =>
            updateClientPortalProfile(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["portal-me"] });
            setProfileStatus({ type: "success", message: "Profile updated successfully." });
            setTimeout(() => setProfileStatus(null), 4000);
        },
        onError: (error: Error) => {
            setProfileStatus({ type: "error", message: error.message });
        },
    });

    const passwordMutation = useMutation({
        mutationFn: () =>
            changeClientPortalPassword({
                old_password: passwordForm.old_password,
                new_password: passwordForm.new_password,
            }),
        onSuccess: () => {
            setPasswordForm({ old_password: "", new_password: "", confirm_password: "" });
            setPasswordStatus({ type: "success", message: "Password changed successfully." });
            setTimeout(() => setPasswordStatus(null), 4000);
        },
        onError: (error: Error) => {
            setPasswordStatus({ type: "error", message: error.message });
        },
    });

    function handleSaveProfile(): void {
        setProfileStatus(null);
        profileMutation.mutate({ ...profileForm, ...companyForm });
    }

    function handleChangePassword(): void {
        setPasswordStatus(null);
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setPasswordStatus({ type: "error", message: "New passwords do not match." });
            return;
        }
        if (passwordForm.new_password.length < 8) {
            setPasswordStatus({ type: "error", message: "Password must be at least 8 characters." });
            return;
        }
        passwordMutation.mutate();
    }

    return (
        <ClientLayout>
            <div className="p-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-brand-black">Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your account preferences and information</p>
                </div>

                {isError && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>
                            Could not load your profile.{" "}
                            {error instanceof Error ? error.message : "Please make sure you are logged in and try again."}
                        </span>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Profile & Company Card */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-8">

                            {/* Profile section */}
                            <section className="space-y-5">
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-brand-blue" />
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
                                        <p className="text-sm text-gray-500">Your personal contact details used for login and communication</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            First Name
                                        </label>
                                        <p className="text-xs text-gray-400">Your given name as it appears on official documents</p>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                value={profileForm.first_name}
                                                onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                                placeholder="John"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Last Name
                                        </label>
                                        <p className="text-xs text-gray-400">Your family name or surname</p>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                value={profileForm.last_name}
                                                onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Email Address
                                        </label>
                                        <p className="text-xs text-gray-400">Used for login and order notifications</p>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="email"
                                                value={profileForm.email}
                                                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Phone Number
                                        </label>
                                        <p className="text-xs text-gray-400">Include country code, e.g. +254…</p>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="tel"
                                                value={profileForm.phone}
                                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                                placeholder="+254712345678"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Company section */}
                            <section className="space-y-5 pt-6 border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-brand-blue" />
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Company</h2>
                                        <p className="text-sm text-gray-500">Business details tied to your account — used on quotes and invoices</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Company Name
                                        </label>
                                        <p className="text-xs text-gray-400">Legal business name printed on all quotes, invoices, and delivery notes</p>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                value={companyForm.company}
                                                onChange={(e) => setCompanyForm({ ...companyForm, company: e.target.value })}
                                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                                placeholder="Acme Ltd"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Industry{" "}
                                            <span className="text-gray-400 font-normal">(optional)</span>
                                        </label>
                                        <p className="text-xs text-gray-400">Helps us tailor product recommendations for your sector</p>
                                        <input
                                            type="text"
                                            value={companyForm.industry}
                                            onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                            placeholder="e.g. Retail, Healthcare, NGO"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Preferred Contact Channel
                                        </label>
                                        <p className="text-xs text-gray-400">How you prefer we reach you for order updates and communication</p>
                                        <select
                                            value={companyForm.preferred_channel}
                                            onChange={(e) => setCompanyForm({ ...companyForm, preferred_channel: e.target.value as PreferredChannel })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white"
                                        >
                                            {PREFERRED_CHANNELS.map((ch) => (
                                                <option key={ch} value={ch}>{ch}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            VAT / Tax ID{" "}
                                            <span className="text-gray-400 font-normal">(optional)</span>
                                        </label>
                                        <p className="text-xs text-gray-400">Printed on invoices if provided — required for VAT-registered businesses</p>
                                        <input
                                            type="text"
                                            value={companyForm.vat_tax_id}
                                            onChange={(e) => setCompanyForm({ ...companyForm, vat_tax_id: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                            placeholder="e.g. V123456789"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            KRA PIN{" "}
                                            <span className="text-gray-400 font-normal">(optional)</span>
                                        </label>
                                        <p className="text-xs text-gray-400">Kenya Revenue Authority PIN — required for tax compliance on B2B invoices</p>
                                        <input
                                            type="text"
                                            value={companyForm.kra_pin}
                                            onChange={(e) => setCompanyForm({ ...companyForm, kra_pin: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                            placeholder="e.g. A001234567Z"
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Business Address{" "}
                                            <span className="text-gray-400 font-normal">(optional)</span>
                                        </label>
                                        <p className="text-xs text-gray-400">Your registered or operational address — used on invoices and for delivery</p>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                                            <textarea
                                                value={companyForm.address}
                                                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                                                rows={2}
                                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
                                                placeholder="123 Main St, Nairobi, Kenya"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Delivery Instructions{" "}
                                            <span className="text-gray-400 font-normal">(optional)</span>
                                        </label>
                                        <p className="text-xs text-gray-400">Specific instructions for our delivery team, e.g. gate codes or a contact person on site</p>
                                        <textarea
                                            value={companyForm.delivery_instructions}
                                            onChange={(e) => setCompanyForm({ ...companyForm, delivery_instructions: e.target.value })}
                                            rows={2}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
                                            placeholder="e.g. Call before delivery, gate code #1234, leave with reception"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Profile save feedback & button */}
                            <div className="pt-4 border-t border-gray-200 flex items-center justify-between gap-4">
                                {profileStatus && (
                                    <span className={`flex items-center gap-1.5 text-sm ${profileStatus.type === "success" ? "text-green-600" : "text-red-600"}`}>
                                        {profileStatus.type === "success"
                                            ? <CheckCircle className="w-4 h-4" />
                                            : <AlertCircle className="w-4 h-4" />}
                                        {profileStatus.message}
                                    </span>
                                )}
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={profileMutation.isPending}
                                    className="ml-auto px-6 py-2.5 bg-brand-blue text-white font-medium text-sm rounded-md hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-60"
                                >
                                    {profileMutation.isPending
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <Save className="w-4 h-4" />}
                                    Save Profile &amp; Company
                                </button>
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-5">
                            <div className="flex items-center gap-2">
                                <Lock className="w-5 h-5 text-brand-blue" />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                                    <p className="text-sm text-gray-500">Change your login password. Choose something strong and unique.</p>
                                </div>
                            </div>

                            <div className="max-w-md space-y-5">
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Current Password
                                    </label>
                                    <p className="text-xs text-gray-400">Enter the password you currently use to sign in</p>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="password"
                                            value={passwordForm.old_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                            placeholder="Enter your current password"
                                            autoComplete="current-password"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        New Password
                                    </label>
                                    <p className="text-xs text-gray-400">Minimum 8 characters — use a mix of letters, numbers and symbols</p>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="password"
                                            value={passwordForm.new_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                            placeholder="At least 8 characters"
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Confirm New Password
                                    </label>
                                    <p className="text-xs text-gray-400">Re-type your new password to confirm it matches</p>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="password"
                                            value={passwordForm.confirm_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                            placeholder="Re-enter your new password"
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    {passwordForm.confirm_password.length > 0 &&
                                        passwordForm.new_password !== passwordForm.confirm_password && (
                                            <p className="text-xs text-red-500">Passwords do not match</p>
                                        )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 flex items-center gap-4">
                                {passwordStatus && (
                                    <span className={`flex items-center gap-1.5 text-sm ${passwordStatus.type === "success" ? "text-green-600" : "text-red-600"}`}>
                                        {passwordStatus.type === "success"
                                            ? <CheckCircle className="w-4 h-4" />
                                            : <AlertCircle className="w-4 h-4" />}
                                        {passwordStatus.message}
                                    </span>
                                )}
                                <button
                                    onClick={handleChangePassword}
                                    disabled={
                                        passwordMutation.isPending ||
                                        !passwordForm.old_password ||
                                        !passwordForm.new_password ||
                                        !passwordForm.confirm_password
                                    }
                                    className="ml-auto px-6 py-2.5 bg-brand-blue text-white font-medium text-sm rounded-md hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-60"
                                >
                                    {passwordMutation.isPending
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <Lock className="w-4 h-4" />}
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ClientLayout>
    );
}
