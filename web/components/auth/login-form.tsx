'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { loginUserSession } from '@/lib/api/auth';
import type { LoginCredentials, User } from '@/types/auth';

interface LoginFormProps {
    onSuccess: (user: User) => void;
    onError?: (error: Error) => void;
}

export default function LoginForm({ onSuccess, onError }: LoginFormProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const loginMutation = useMutation({
        mutationFn: (credentials: LoginCredentials) => loginUserSession(credentials),
        onSuccess: (data) => {
            onSuccess(data.user);
        },
        onError: (error: Error) => {
            if (onError) {
                onError(error);
            }
        },
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!username.trim() || !password.trim()) {
            return;
        }

        loginMutation.mutate({
            username: username.trim(),
            password: password.trim(),
        });
    };

    const isFormValid = username.trim().length > 0 && password.trim().length > 0;
    const isSubmitting = loginMutation.isPending;

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label
                    htmlFor="username"
                    className="block text-sm font-semibold text-white mb-2"
                >
                    Username
                </label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isSubmitting}
                    required
                    autoComplete="username"
                    className="w-full px-4 py-3 bg-white/95 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:border-white disabled:bg-white/50 disabled:cursor-not-allowed transition-all placeholder-gray-400"
                    placeholder="Enter your username"
                />
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-white mb-2"
                >
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-3 bg-white/95 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:border-white disabled:bg-white/50 disabled:cursor-not-allowed transition-all placeholder-gray-400"
                    placeholder="Enter your password"
                />
            </div>

            {loginMutation.isError && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-sm">
                    <p className="text-sm text-white font-medium">
                        Invalid username or password. Please try again.
                    </p>
                </div>
            )}

            <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full py-3 px-4 bg-white text-brand-blue font-semibold rounded-lg hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-blue disabled:bg-white/50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
                {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                    </span>
                ) : (
                    'Sign In'
                )}
            </button>
        </form>
    );
}
