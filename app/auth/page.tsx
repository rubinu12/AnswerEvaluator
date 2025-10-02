'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthContext } from '@/lib/AuthContext';
import { useEvaluationStore } from '@/lib/store'; // 1. Import the store

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { user, loading } = useAuthContext();
    const { setPageLoading } = useEvaluationStore(); // 2. Get the loader action

    // This effect handles redirecting the user if they are already logged in
    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setPageLoading(true); // 3. Show the loader immediately on submit

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            // The useEffect above will handle the redirect to /dashboard once the user state is updated.
            // No need to call router.push here.
        } catch (error: any) {
            setError(error.message);
            console.error('Auth Error:', error);
            setPageLoading(false); // Hide loader on error
        }
    };
    
    // Don't render the form if the user is logged in and about to be redirected.
    if (loading || user) {
        return null;
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    {isLogin ? 'Welcome Back' : 'Create an Account'}
                </h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4 text-left">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="mb-6 text-left">
                        <label htmlFor="password"className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                    >
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>
                <p className="mt-6 text-sm text-gray-600">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="ml-1 font-semibold text-blue-600 hover:underline"
                    >
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </div>
        </main>
    );
}