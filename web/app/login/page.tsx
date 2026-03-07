'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LoginForm from '@/components/auth/login-form';
import type { User, PortalRole } from '@/types/auth';

const ROLE_DASHBOARD: Record<PortalRole, string> = {
    client: '/portal',
    admin: '/admin/dashboard',
    account_manager: '/account-manager',
    production_team: '/production/dashboard',
    vendor: '/vendors',
};

export default function LoginPage() {
    const router = useRouter();

    const handleLoginSuccess = (user: User) => {
        const destination = user.portal_role ? ROLE_DASHBOARD[user.portal_role] : '/';
        router.push(destination);
    };

    const handleLoginError = (error: Error) => {
        // handle
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-blue via-brand-blue/90 to-brand-blue/80 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/logo/pd.png"
                            alt="PrintDuka"
                            width={240}
                            height={80}
                            className="h-24 w-auto"
                            priority
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-white/80">
                        Sign in to access your dashboard
                    </p>
                </div>

                <LoginForm
                    onSuccess={handleLoginSuccess}
                    onError={handleLoginError}
                />

                <div className="mt-8 text-center">
                    <p className="text-xs text-white/60">
                        Need access? Contact your administrator
                    </p>
                </div>

                <div className="mt-8 text-center">
                    <a
                        href="/"
                        className="text-sm text-white/90 hover:text-white transition-colors inline-flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to home
                    </a>
                </div>
            </div>
        </div>
    );
}
