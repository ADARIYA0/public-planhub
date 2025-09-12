'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

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

// Helper function to check if server is reachable
const checkServerStatus = async (): Promise<boolean> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_STATUS}`, {
            method: 'GET',
            signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        return false;
    }
};

// Helper function to determine error message based on error type
const getErrorMessage = async (error: any): Promise<string> => {
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
        // Try to ping a reliable service to check internet connectivity
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            await fetch('https://www.google.com/favicon.ico', {
                method: 'HEAD',
                mode: 'no-cors',
                signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            // Internet is working, so it's likely a server issue
            return 'Server sedang mengalami gangguan. Silakan coba lagi dalam beberapa saat.';
        } catch (internetError) {
            // Internet connection issue
            return 'Koneksi internet Anda bermasalah. Silakan periksa koneksi internet dan coba lagi.';
        }
    }
    
    // Check if it's a timeout error
    if (error.name === 'AbortError') {
        return 'Koneksi ke server terlalu lambat. Silakan periksa koneksi internet Anda atau coba lagi nanti.';
    }
    
    // Default server error message
    return 'Server sedang tidak dapat dijangkau. Silakan coba lagi nanti.';
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on app start
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // Check if user chose to be remembered
                const rememberMe = localStorage.getItem('rememberMe');
                
                let token: string | null = null;
                let userData: string | null = null;
                
                if (rememberMe === 'true') {
                    // Check localStorage for persistent login
                    token = localStorage.getItem('authToken');
                    userData = localStorage.getItem('userData');
                } else {
                    // For session-only login - should auto-logout on refresh ONLY if server is reachable
                    // Get token before clearing for API logout call
                    const existingToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
                    
                    if (existingToken) {
                        // Check if server is reachable first
                        try {
                            const isServerReachable = await checkServerStatus();
                            if (isServerReachable) {
                                // Server is reachable - proceed with logout
                                await fetch(`${process.env.NEXT_PUBLIC_API_KEY}/auth/logout`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${existingToken}`,
                                        'Content-Type': 'application/json',
                                    },
                                });
                                
                                // Clear storage after successful API call
                                localStorage.removeItem('authToken');
                                localStorage.removeItem('userData');
                                localStorage.removeItem('rememberMe');
                                sessionStorage.removeItem('authToken');
                                sessionStorage.removeItem('userData');
                                
                                // Force logout
                                token = null;
                                userData = null;
                            } else {
                                // Server is down - keep user logged in, don't clear storage
                                token = existingToken;
                                userData = sessionStorage.getItem('userData') || localStorage.getItem('userData');
                            }
                        } catch (error) {
                            // Server check failed - keep user logged in
                            token = existingToken;
                            userData = sessionStorage.getItem('userData') || localStorage.getItem('userData');
                        }
                    } else {
                        // No token found - proceed with logout
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('userData');
                        localStorage.removeItem('rememberMe');
                        sessionStorage.removeItem('authToken');
                        sessionStorage.removeItem('userData');
                        
                        token = null;
                        userData = null;
                    }
                }

                if (token && userData) {
                    try {
                        const parsedUser = JSON.parse(userData);
                        setUser(parsedUser);
                    } catch (parseError) {
                        // Clear corrupted data
                        localStorage.clear();
                        sessionStorage.clear();
                        setUser(null);
                    }
                } else {
                    // No valid session found - ensure complete logout
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userData');
                    localStorage.removeItem('rememberMe');
                    sessionStorage.removeItem('authToken');
                    sessionStorage.removeItem('userData');
                    setUser(null);
                }
            } catch (error) {
                // Clear all data on error
                localStorage.clear();
                sessionStorage.clear();
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        // Add small delay to ensure DOM is ready
        const timeoutId = setTimeout(checkAuthStatus, 100);
        
        return () => clearTimeout(timeoutId);
    }, []);

    const login = async (email: string, password: string, rememberMe: boolean = false): Promise<{ success: boolean; message?: string }> => {
        try {
            setLoading(true);


            const response = await fetch(`${process.env.NEXT_PUBLIC_API_KEY}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                // Store token and remember preference
                if (rememberMe) {
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('rememberMe', 'true');
                    // Clear sessionStorage to avoid conflicts
                    sessionStorage.removeItem('authToken');
                    sessionStorage.removeItem('userData');
                } else {
                    sessionStorage.setItem('authToken', data.token);
                    // Explicitly mark as session-only by NOT setting rememberMe
                    // Clear localStorage completely to ensure session-only login
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userData');
                    localStorage.removeItem('rememberMe');
                }
                
                // Create user object from email (since backend doesn't return user data)
                const userData = {
                    id: 'user-id', // You might want to decode this from JWT token
                    name: email.split('@')[0], // Use email prefix as name for now
                    email: email
                };
                
                if (rememberMe) {
                    localStorage.setItem('userData', JSON.stringify(userData));
                } else {
                    sessionStorage.setItem('userData', JSON.stringify(userData));
                }
                
                setUser(userData);
                return { success: true };
            } else {
                return {
                    success: false,
                    message: data.message || 'Login gagal. Silakan coba lagi.'
                };
            }
        } catch (error) {
            const errorMessage = await getErrorMessage(error);
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
            // Get token from either storage
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            if (token) {
                // Check if server is reachable before attempting logout
                const isServerReachable = await checkServerStatus();
                
                if (!isServerReachable) {
                    return {
                        success: false,
                        message: 'Server sedang tidak dapat dijangkau. Logout tidak dapat dilakukan saat ini.'
                    };
                }
                
                // Server is reachable, proceed with logout API call
                await fetch(`${process.env.NEXT_PUBLIC_API_KEY}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            }
            
            // Clear storage only after successful API call or if no token
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            localStorage.removeItem('rememberMe');
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('userData');
            
            // Force state update
            setUser(null);
            
            return { success: true };
        } catch (error) {
            // API call failed - don't logout locally
            const errorMessage = await getErrorMessage(error);
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
