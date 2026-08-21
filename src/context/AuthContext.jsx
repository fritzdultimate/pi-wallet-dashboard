import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { createApiClient } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => sessionStorage.getItem('pw_token') || null);

    const login = useCallback((newToken) => {
        sessionStorage.setItem('pw_token', newToken);
        setToken(newToken);
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem('pw_token');
        setToken(null);
    }, []);

    const api = useMemo(() => createApiClient(token), [token]);

    const value = useMemo(() => ({ token, login, logout, api }), [token, login, logout, api]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
