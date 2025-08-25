'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LoaderCircle } from 'lucide-react';
// --- Step 1: Import Firebase auth functions ---
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

interface SignUpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // --- Step 2: Use the real Firebase sign-up function ---
            const auth = getAuth();
            await createUserWithEmailAndPassword(auth, email, password);
            
            console.log("Firebase sign up successful for", email);

            // The AuthContext will now update the landing page in the background.
            // We wait a moment before closing the modal for a smooth transition.
            setTimeout(() => {
                onClose();
                setIsLoading(false);
            }, 1000);

        } catch (err: any) {
            // Firebase provides detailed error messages (e.g., "auth/email-already-in-use")
            setError(err.message);
            console.error("Firebase sign up error:", err);
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative overflow-hidden"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 disabled:opacity-50" disabled={isLoading}>
                            <X size={24} />
                        </button>

                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex flex-col items-center justify-center h-64"
                                >
                                    <LoaderCircle className="w-12 h-12 text-emerald-500 animate-spin" />
                                    <p className="mt-4 text-lg font-semibold text-gray-700">Creating Your Account...</p>
                                    <p className="text-gray-500">Please wait a moment.</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <h2 className="text-2xl font-bold text-center text-gray-900">Create Your Free Account</h2>
                                    <p className="text-center text-gray-500 mt-2">to start your first evaluation.</p>

                                    <form onSubmit={handleSignUp} className="mt-6 space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                                            <input 
                                                type="email" 
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                                                placeholder="you@example.com"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Password</label>
                                            <input 
                                                type="password" 
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                        {error && <p className="text-sm text-red-600 text-center">{error.replace('Firebase: ', '')}</p>}
                                        <button type="submit" className="w-full btn py-3 px-4 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700">
                                            Sign Up & Continue
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}