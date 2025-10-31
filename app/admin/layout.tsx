"use client";

import React from 'react';
import { useAuthContext } from '@/lib/AuthContext'; // Using your original context
import PageLoader from '@/components/shared/PageLoader';
import { useRouter } from 'next/navigation';

const AccessDenied = () => {
    const router = useRouter();
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center px-4 bg-gray-50">
            <div className="text-5xl mb-4">
                <i className="ri-lock-2-line text-red-500"></i>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Access Denied</h1>
            <p className="mt-2 text-lg text-gray-600">You do not have permission to view this page.</p>
            <button
                onClick={() => router.push('/dashboard')}
                className="mt-6 btn bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-blue-700"
            >
                Go to Dashboard
            </button>
        </div>
    );
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    // 1. Destructure both user and userProfile from the context
    const { user, userProfile, loading } = useAuthContext();

    if (loading) {
        return <PageLoader />;
    }

    // 2. This is the correct, robust check for your context structure
    if (!user || !userProfile || userProfile.subscriptionStatus !== 'ADMIN') {
        return <AccessDenied />;
    }

    // 3. If all checks pass, render the admin content
    return <>{children}</>;
}