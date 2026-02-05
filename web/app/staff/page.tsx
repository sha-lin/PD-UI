'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser, logoutUserSession } from '@/lib/api/auth';
import AdminLayout from '@/components/admin/admin-layout';

export default function StaffPage() {
    const router = useRouter();

    const { data: user, isLoading, error } = useQuery({
        queryKey: ['currentUser'],
        queryFn: getCurrentUser,
        retry: false,
    });

    const handleLogout = async () => {
        try {
            await logoutUserSession();
        } catch {
        } finally {
            router.push('/login');
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </AdminLayout>
        );
    }

    if (error || !user) {
        router.push('/login');
        return null;
    }

    return (
        <AdminLayout>
            <header className="bg-white shadow">
                <div className="px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-black">
                            Staff Portal
                        </h1>
                        <p className="text-gray-600 text-sm mt-1">
                            Internal Staff Dashboard
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 bg-brand-red text-white font-semibold rounded-lg hover:bg-brand-red/90 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-lg shadow p-8 mb-6">

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold text-blue-800 mb-2">
                                👤 Staff Member Access
                            </h2>
                            <p className="text-blue-700">
                                You are logged in as an internal staff member
                            </p>
                        </div>

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
                                <dd className="text-gray-900">
                                    {user.first_name || user.last_name
                                        ? `${user.first_name} ${user.last_name}`.trim()
                                        : 'N/A'}
                                </dd>
                            </div>
                            <div className="flex border-b border-gray-100 pb-3">
                                <dt className="font-medium text-gray-700 w-48">Staff Status:</dt>
                                <dd className="text-gray-900">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${user.is_staff ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.is_staff ? '✓ Staff Member' : 'Not Staff'}
                                    </span>
                                </dd>
                            </div>
                            <div className="flex border-b border-gray-100 pb-3">
                                <dt className="font-medium text-gray-700 w-48">Superuser:</dt>
                                <dd className="text-gray-900">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${user.is_superuser ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.is_superuser ? '✓ Admin Access' : 'Regular User'}
                                    </span>
                                </dd>
                            </div>
                            <div className="flex pb-3">
                                <dt className="font-medium text-gray-700 w-48">Account Status:</dt>
                                <dd className="text-gray-900">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {user.is_active ? '✓ Active' : 'Inactive'}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
                        <h3 className="text-sm font-semibold text-green-800 mb-2">
                            🔒 Secure Authentication
                        </h3>
                        <p className="text-sm text-green-700">
                            You are authenticated using httpOnly cookies. Session data is securely stored on the server.
                        </p>
                    </div>
                </div>
            </main>
        </AdminLayout>
    );
}
