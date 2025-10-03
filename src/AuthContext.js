import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from './firebase-config';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return unsubscribe; 
    }, []);

    const value = {
        user,
        authLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {/* --- THIS IS THE FIX ---
                The line that was here previously ({!authLoading && children}) has been removed.
                It was preventing the main App component from rendering and showing its own
                loading spinner. Now, the App component will render immediately and can use
                the 'authLoading' state to decide what to show. This fixes the redirect issue.
            */}
            {children}
        </AuthContext.Provider>
    );
};
