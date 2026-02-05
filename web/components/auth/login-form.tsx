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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label
                    htmlFor="username"
                    className="block text-sm font-medium text-brand-black mb-2"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter your username"
                />
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-brand-black mb-2"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter your password"
                />
            </div>

            {loginMutation.isError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                        {loginMutation.error.message}
                    </p>
                </div>
            )}

            <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full py-3 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/90 focus:ring-4 focus:ring-brand-blue/50 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
        </form>
    );
}
