"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ValidationResult {
    valid: boolean;
    error?: string;
}

export default function ActivatePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [validating, setValidating] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [validationError, setValidationError] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [activating, setActivating] = useState(false);
    const [activated, setActivated] = useState(false);
    const [error, setError] = useState("");
    const [username, setUsername] = useState("");

    useEffect(() => {
        if (!token) {
            setValidating(false);
            setIsValid(false);
            setValidationError("No activation token provided");
            return;
        }

        validateToken();
    }, [token]);

    async function validateToken() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/users/validate_invite/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
            });

            if (response.ok) {
                const data: ValidationResult = await response.json();
                setIsValid(data.valid);
                if (data.valid) {
                    toast.success("Invitation validated successfully");
                }
            } else {
                const errorData = await response.json();
                setIsValid(false);
                const errorMsg = errorData.detail || "Invalid or expired invitation link";
                setValidationError(errorMsg);
                toast.error(errorMsg);
            }
        } catch (err) {
            setIsValid(false);
            const errorMsg = "Failed to validate invitation link";
            setValidationError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setValidating(false);
        }
    }

    async function handleActivate(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            const errorMsg = "Password must be at least 8 characters long";
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        if (password !== confirmPassword) {
            const errorMsg = "Passwords do not match";
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        setActivating(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/users/activate_invite/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, password }),
            });

            if (response.ok) {
                const data = await response.json();
                setUsername(data.username);
                setActivated(true);
                toast.success("Account activated successfully! Redirecting to login...");
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            } else {
                const errorData = await response.json();
                const errorMsg = errorData.detail || "Failed to activate account";
                setError(errorMsg);
                toast.error(errorMsg);
            }
        } catch (err) {
            const errorMsg = "Failed to activate account. Please try again.";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setActivating(false);
        }
    }

    if (validating) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-brand-blue animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Validating invitation...</p>
                </div>
            </div>
        );
    }

    if (!isValid) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
                    <p className="text-gray-600 mb-6">
                        {validationError || "This invitation link is invalid or has expired."}
                    </p>
                    <button
                        onClick={() => router.push("/login")}
                        className="px-6 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 transition-all duration-150"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (activated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Activated!</h1>
                    <p className="text-gray-600 mb-6">
                        Your account has been successfully activated. You will be redirected to the login page shortly.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold">Username:</span> {username}
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/login")}
                        className="px-6 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 transition-all duration-150"
                    >
                        Go to Login Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <Image
                        src="/logo/pd.png"
                        alt="PrintDuka"
                        width={80}
                        height={26}
                        className="w-24 h-auto mx-auto mb-4"
                        priority
                    />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Activate Your Account</h1>
                    <p className="text-gray-600">Set your password to complete activation</p>
                </div>

                <form onSubmit={handleActivate} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-1.5">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={8}
                                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                placeholder="Confirm your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={activating || !password || !confirmPassword}
                        className="w-full px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 transition-all duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {activating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Activating...
                            </>
                        ) : (
                            "Activate Account"
                        )}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{" "}
                        <button
                            onClick={() => router.push("/login")}
                            className="text-brand-blue hover:underline font-medium"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
