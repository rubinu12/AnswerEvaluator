'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, getAuth, User, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, Timestamp } from 'firebase/firestore'; // Import Timestamp
import firebase_app from '@/lib/firebase';

const auth = getAuth(firebase_app);
const db = getFirestore(firebase_app);

// --- THIS IS THE ONLY CHANGE ---
// 1. Expand the UserProfile interface to include all our new fields.
export interface UserProfile {
    // Original fields
    subscriptionStatus: 'TRIAL' | 'PREMIUM' | 'EXPIRED' | 'PACK_USER' | 'ADMIN';
    remainingEvaluations: number;
    
    // New fields from our final data model
    name: string;
    email: string;
    phoneNo: string;
    profilePicture: string;
    targetExamYear: number;
    createdAt: Timestamp;
    lastLogin: Timestamp;
    subscriptionExpiry: Timestamp | null;
    aiCredits: number;
}

// The rest of the file remains IDENTICAL to your original code.
export const AuthContext = createContext<{ 
    user: User | null; 
    userProfile: UserProfile | null;
    loading: boolean; 
    logout: () => Promise<void> 
}>({
    user: null,
    userProfile: null,
    loading: true,
    logout: async () => {},
});

export const useAuthContext = () => useContext(AuthContext);

interface AuthContextProviderProps {
    children: ReactNode;
}

export function AuthContextProvider({ children }: AuthContextProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    setUser(firebaseUser);

                    const userDocRef = doc(db, "users", firebaseUser.uid);
                    const docSnap = await getDoc(userDocRef);

                    if (docSnap.exists()) {
                        // This will now correctly cast to the new, expanded UserProfile type
                        setUserProfile(docSnap.data() as UserProfile);
                    } else {
                        // The default fallback remains, now with default values for new fields
                        setUserProfile({
                            subscriptionStatus: 'TRIAL',
                            remainingEvaluations: 2,
                            aiCredits: 10,
                            name: "New User",
                            email: firebaseUser.email || "",
                            phoneNo: "",
                            profilePicture: "",
                            targetExamYear: new Date().getFullYear() + 1,
                            createdAt: Timestamp.now(),
                            lastLogin: Timestamp.now(),
                            subscriptionExpiry: null,
                        });
                    }
                } else {
                    setUser(null);
                    setUserProfile(null);
                }
            } catch (error) {
                console.error("Error in AuthContextProvider:", error);
                await signOut(auth);
                setUser(null);
                setUserProfile(null);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setUserProfile(null);
    };

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}