'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { checkSession, logoutUserSession } from '@/lib/api/auth';
import type { User } from '@/types/auth';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifySession = async () => {
            try {
                const response = await checkSession();

                if (!response.authenticated || !response.user) {
                    router.push('/login');
                    return;
                }

                setUser(response.user);
            } catch {
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        verifySession();
    }, [router]);

    const handleLogout = async () => {
        try {
            await logoutUserSession();
        } catch {
            // Logout failed but redirect anyway to clear client state
        } finally {
            router.push('/login');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-lg text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-brand-black mb-2">
                                Dashboard
                            </h1>
                            <p className="text-gray-600">
                                Welcome to Print Duka
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-2 bg-brand-red text-white font-semibold rounded-lg hover:bg-brand-red/90 transition-colors"
                        >
                            Logout
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-green-800 mb-2">
                                ✅ Authentication Successful
                            </h2>
                            <p className="text-green-700">
                                You are successfully logged in with session-based authentication
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-brand-black mb-4">
                                User Information
                            </h3>
                            <dl className="space-y-3">
                                <div className="flex border-b border-gray-100 pb-3">
                                    <dt className="font-medium text-gray-700 w-48">User ID:</dt>
                                    <dd className="text-gray-900">{user.id}</dd>
                                </div>
                                <div className="flex border-b border-gray-100 pb-3">
                                    <dt className="font-medium text-gray-700 w-48">Username:</dt>
                                    <dd className="text-gray-900">{user.username}</dd>
                                </div>
                                <div className="flex border-b border-gray-100 pb-3">
                                    <dt className="font-medium text-gray-700 w-48">Email:</dt>
                                    <dd className="text-gray-900">{user.email || 'N/A'}</dd>
                                </div>
                                <div className="flex border-b border-gray-100 pb-3">
                                    <dt className="font-medium text-gray-700 w-48">Full Name:</dt>
                                    <dd className="text-gray-900">{user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : 'N/A'}</dd>
                                </div>
                                <div className="flex border-b border-gray-100 pb-3">
                                    <dt className="font-medium text-gray-700 w-48">Staff Status:</dt>
                                    <dd className="text-gray-900">{user.is_staff ? 'Yes' : 'No'}</dd>
                                </div>
                                <div className="flex border-b border-gray-100 pb-3">
                                    <dt className="font-medium text-gray-700 w-48">Superuser:</dt>
                                    <dd className="text-gray-900">{user.is_superuser ? 'Yes' : 'No'}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="text-sm font-semibold text-blue-800 mb-2">
                                🔒 Security Note
                            </h3>
                            <p className="text-sm text-blue-700 mb-3">
                                Your session is secured with httpOnly cookies. This protects against XSS attacks and meets enterprise security standards.
                            </p>
                            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                                <li>Session cookies are httpOnly (not accessible via JavaScript)</li>
                                <li>SameSite protection enabled</li>
                                <li>CSRF token validation on all requests</li>
                                <li>7-day session expiration</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
