// app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../lib/AuthContext';

export default function HomePage() {
    const { user, loading } = useAuthContext();
    const router = useRouter();

    // This effect will run when the component mounts and whenever the user or loading state changes.
    useEffect(() => {
        // If the loading is finished and there IS a user, redirect to the dashboard.
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    // While Firebase is checking the auth state, we can show a simple loading message.
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    // If loading is finished and there is NO user, show the marketing page content.
    return (
        <main className="flex min-h-screen flex-col items-center justify-center text-center p-8">
            <h1 className="text-5xl font-extrabold font-serif mb-4">Welcome to Root & Rise</h1>
            <p className="text-lg text-slate-600 mb-8 max-w-xl">
                The ultimate platform for UPSC aspirants to get instant, AI-powered feedback on their Mains answers and accelerate their preparation.
            </p>
            <Link href="/auth">
                <button className="px-8 py-3 font-semibold text-white rounded-lg shadow-md transition-colors" style={{backgroundColor: 'var(--primary-accent)'}}>
                    Login / Get Started
                </button>
            </Link>
        </main>
    );
}