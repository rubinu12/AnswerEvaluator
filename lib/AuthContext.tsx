'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, getAuth, User, signOut } from 'firebase/auth';
import firebase_app from '@/lib/firebase';

const auth = getAuth(firebase_app);

// --- CONSTANTS ---
const LAST_ACTIVITY_KEY = 'lastActivity';
const INACTIVITY_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const AuthContext = createContext<{ user: User | null; loading: boolean; logout: () => Promise<void> }>({
    user: null,
    loading: true,
    logout: async () => {},
});

export const useAuthContext = () => useContext(AuthContext);

interface AuthContextProviderProps {
    children: ReactNode;
}

export function AuthContextProvider({ children }: AuthContextProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const updateLastActivity = () => {
        localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    };

    useEffect(() => {
        if (user) {
            window.addEventListener('mousedown', updateLastActivity);
            window.addEventListener('keydown', updateLastActivity);
            window.addEventListener('scroll', updateLastActivity);
            updateLastActivity();

            return () => {
                window.removeEventListener('mousedown', updateLastActivity);
                window.removeEventListener('keydown', updateLastActivity);
                window.removeEventListener('scroll', updateLastActivity);
            };
        }
    }, [user]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                const lastActivityString = localStorage.getItem(LAST_ACTIVITY_KEY);
                
                if (lastActivityString) {
                    const lastActivity = parseInt(lastActivityString, 10);
                    const now = Date.now();

                    if (now - lastActivity > INACTIVITY_TIMEOUT) {
                        console.log('User inactive for over 24 hours. Signing out.');
                        signOut(auth);
                        setUser(null);
                    } else {
                        setUser(firebaseUser);
                    }
                } else {
                    setUser(firebaseUser);
                }
            } else {
                setUser(null);
                localStorage.removeItem(LAST_ACTIVITY_KEY);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };

    // --- LOGIC CHANGE ---
    // The provider now renders its children immediately if the `loading` state is true.
    // The PageLoader component will handle the visual loading state.
    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}