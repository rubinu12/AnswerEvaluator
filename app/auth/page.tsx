// app/auth/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    createUserWithEmailAndPassword, 
    getAuth, 
    signInWithEmailAndPassword 
} from 'firebase/auth';
import { getFirestore, doc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import firebase_app from '@/lib/firebase';
import { useAuthContext } from '@/lib/AuthContext';
import { useEvaluationStore } from '@/lib/store';
// 👇 Import the server action
import { syncUserToPostgres } from '@/app/actions/auth';

const auth = getAuth(firebase_app);
const db = getFirestore(firebase_app);

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [targetExamYear, setTargetExamYear] = useState(new Date().getFullYear() + 1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { user, loading } = useAuthContext();
    const { setPageLoading } = useEvaluationStore();

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setPageLoading(true);

        try {
            if (isLogin) {
                // --- LOGIN FLOW ---
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const firebaseUser = userCredential.user;

                // 👇 SYNC TO POSTGRES (Login Mode)
                await syncUserToPostgres({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || null,
                    fullName: firebaseUser.displayName || null,
                    avatarUrl: firebaseUser.photoURL || null,
                    // We don't send phone here as we don't have it in the login form
                });

                // Original Firestore Logic
                const userDocRef = doc(db, "users", firebaseUser.uid);
                await updateDoc(userDocRef, {
                    lastLogin: Timestamp.now()
                });
            } else {
                // --- SIGNUP FLOW ---
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const newUser = userCredential.user;

                // 👇 SYNC TO POSTGRES (Signup Mode)
                await syncUserToPostgres({
                    uid: newUser.uid,
                    email: newUser.email || null,
                    fullName: name,      // Capture Name from state
                    phone: phoneNo,      // Capture Phone from state
                    avatarUrl: null,
                });

                // Original Firestore Logic
                const userDocRef = doc(db, "users", newUser.uid);
                await setDoc(userDocRef, {
                    name: name,
                    email: newUser.email,
                    phoneNo: phoneNo,
                    profilePicture: "",
                    targetExamYear: Number(targetExamYear),
                    createdAt: Timestamp.now(),
                    lastLogin: Timestamp.now(),
                    subscriptionStatus: 'TRIAL',
                    subscriptionExpiry: null,
                    remainingEvaluations: 2,
                    aiCredits: 10
                });
            }
        } catch (error: any) {
            setError(error.message);
            console.error('Auth Error:', error);
            setPageLoading(false);
        }
    };
    
    if (loading || user) {
        return null;
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    {isLogin ? 'Welcome Back' : 'Create an Account'}
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    {!isLogin && (
                        <>
                            <div className="text-left">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Aarav Sharma" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-left">
                                    <label htmlFor="phoneNo" className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                    <input id="phoneNo" type="tel" value={phoneNo} onChange={(e) => setPhoneNo(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="9876543210" />
                                </div>
                                <div className="text-left">
                                    <label htmlFor="targetExamYear" className="block text-sm font-medium text-gray-700 mb-2">Target Year</label>
                                    <input id="targetExamYear" type="number" value={targetExamYear} onChange={(e) => setTargetExamYear(Number(e.target.value))} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                        </>
                    )}
                    
                    <div className="text-left">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" />
                    </div>
                    <div className="text-left">
                        <label htmlFor="password"className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
                    </div>
                    {error && <p className="text-sm text-red-500 text-center pt-2">{error}</p>}
                    <button type="submit" className="w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 !mt-6">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>
                <p className="mt-6 text-sm text-gray-600">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => setIsLogin(!isLogin)} className="ml-1 font-semibold text-blue-600 hover:underline">
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </div>
        </main>
    );
}