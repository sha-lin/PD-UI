'use client';

import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/login-form';
import type { User } from '@/types/auth';

export default function LoginPage() {
    const router = useRouter();

    const handleLoginSuccess = (user: User) => {
        router.push('/dashboard');
    };

    const handleLoginError = (error: Error) => {
        // handle
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-brand-black mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-gray-600">
                            Sign in to your Print Duka account
                        </p>
                    </div>

                    <LoginForm
                        onSuccess={handleLoginSuccess}
                        onError={handleLoginError}
                    />

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don&apos;t have an account?{' '}
                            <a
                                href="/register"
                                className="text-brand-blue font-semibold hover:underline"
                            >
                                Create one
                            </a>
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <a
                        href="/"
                        className="text-sm text-gray-600 hover:text-brand-blue transition-colors"
                    >
                        ← Back to home
                    </a>
                </div>
            </div>
        </div>
    );
}
