'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, getAuth, User, signOut } from 'firebase/auth'; // Import signOut
import firebase_app from '@/lib/firebase';

const auth = getAuth(firebase_app);

export const AuthContext = createContext<{ user: User | null; loading: boolean; logout: () => Promise<void> }>({
    user: null,
    loading: true,
    logout: async () => {}, // Add logout to the context type
});

export const useAuthContext = () => useContext(AuthContext);

interface AuthContextProviderProps {
    children: ReactNode;
}

export function AuthContextProvider({ children }: AuthContextProviderProps) {
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

    // --- NEW LOGOUT FUNCTION ---
    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {loading ? <div className="min-h-screen flex items-center justify-center">Loading...</div> : children}
        </AuthContext.Provider>
    );
}