'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { TokenManager } from '@/utils/tokenManager';
import { ApiClient } from '@/utils/apiClient';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<{ success: boolean; message?: string }>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    
    useTokenRefresh();

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const accessToken = TokenManager.getAccessToken();
                const userData = TokenManager.getUserData();
                const rememberMe = TokenManager.isRememberMe();

                if (!rememberMe) {
                    const isServerReachable = await ApiClient.checkServerStatus();
                    if (isServerReachable && accessToken) {
                        await fetch(`${process.env.NEXT_PUBLIC_API_KEY}/auth/logout`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                        });
                    }
                    TokenManager.clearAllTokens();
                    setUser(null);
                    return;
                }

                if (accessToken && userData) {
                    if (TokenManager.isTokenExpired()) {
                        const refreshResult = await ApiClient.request('/auth/refresh-token', {
                            method: 'POST'
                        });

                        if (refreshResult.success && refreshResult.data?.accessToken) {
                            TokenManager.setAccessToken(refreshResult.data.accessToken, rememberMe);
                            setUser(userData);
                        } else {
                            TokenManager.clearAllTokens();
                            setUser(null);
                        }
                    } else {
                        setUser(userData);
                    }
                } else {
                    TokenManager.clearAllTokens();
                    setUser(null);
                }
            } catch (error) {
                TokenManager.clearAllTokens();
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(checkAuthStatus, 100);
        return () => clearTimeout(timeoutId);
    }, []);

    const login = async (email: string, password: string, rememberMe: boolean = false): Promise<{ success: boolean; message?: string }> => {
        try {
            setLoading(true);

            const loginResult = await ApiClient.login(email, password);

            if (loginResult.success && loginResult.data?.accessToken) {
                // Store access token
                TokenManager.setAccessToken(loginResult.data.accessToken, rememberMe);
                
                // Create user object from email (decode from JWT if needed)
                const userData = {
                    id: 'user-id', // You might want to decode this from JWT token
                    name: email.split('@')[0], // Use email prefix as name for now
                    email: email
                };
                
                // Store user data
                TokenManager.setUserData(userData, rememberMe);
                
                setUser(userData);
                return { success: true };
            } else {
                return {
                    success: false,
                    message: loginResult.error || loginResult.message || 'Login gagal. Silakan coba lagi.'
                };
            }
        } catch (error) {
            const errorMessage = await ApiClient.getErrorMessage(error);
            return {
                success: false,
                message: errorMessage
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = async (): Promise<{ success: boolean; message?: string }> => {
        try {
            // Check if server is reachable before attempting logout
            const isServerReachable = await ApiClient.checkServerStatus();
            
            if (!isServerReachable) {
                return {
                    success: false,
                    message: 'Server sedang tidak dapat dijangkau. Logout tidak dapat dilakukan saat ini.'
                };
            }
            
            // Server is reachable, proceed with logout API call
            const logoutResult = await ApiClient.logout();
            
            // Force state update
            setUser(null);
            
            return logoutResult.success ? 
                { success: true } : 
                { success: false, message: logoutResult.error || 'Logout gagal' };
        } catch (error) {
            // API call failed - don't logout locally
            const errorMessage = await ApiClient.getErrorMessage(error);
            return {
                success: false,
                message: errorMessage
            };
        }
    };

    const value: AuthContextType = {
        user,
        isLoggedIn: !!user,
        login,
        logout,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
