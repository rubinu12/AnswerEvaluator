// lib/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, getAuth, User } from 'firebase/auth';
import firebase_app from './firebase';

const auth = getAuth(firebase_app);

// Define the shape (type) of your context data
interface AuthContextType {
    user: User | null;
    loading: boolean; // Add the loading property here
}

// Create the context with a default value that matches the type
export const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

// Custom hook to use the auth context
export const useAuthContext = () => useContext(AuthContext);

interface AuthContextProviderProps {
    children: ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {loading ? <div className="min-h-screen flex items-center justify-center">Loading...</div> : children}
        </AuthContext.Provider>
    );
};