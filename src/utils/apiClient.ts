import { TokenManager } from './tokenManager';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export class ApiClient {
    private static baseURL = process.env.NEXT_PUBLIC_API_KEY;
    private static isRefreshing = false;
    private static refreshPromise: Promise<boolean> | null = null;

    static async request<T = any>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;
        let accessToken = TokenManager.getAccessToken();

        if (accessToken && TokenManager.isTokenExpired()) {
            const refreshed = await this.refreshAccessToken();
            if (refreshed) {
                accessToken = TokenManager.getAccessToken();
            } else {
                TokenManager.clearAllTokens();
                return { success: false, error: 'Session expired. Please login again.' };
            }
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        };

        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, data, message: data.message };
            } else {
                if (response.status === 401 && accessToken) {
                    const refreshed = await this.refreshAccessToken();
                    if (refreshed) {
                        return this.request(endpoint, options);
                    } else {
                        TokenManager.clearAllTokens();
                        return { success: false, error: 'Session expired. Please login again.' };
                    }
                }
                return { success: false, error: data.message || 'Request failed', message: data.message };
            }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Network error' };
        }
    }

    private static async refreshAccessToken(): Promise<boolean> {
        if (this.isRefreshing) {
            if (this.refreshPromise) {
                return await this.refreshPromise;
            }
            return false;
        }

        this.isRefreshing = true;
        this.refreshPromise = this.performTokenRefresh();

        try {
            const result = await this.refreshPromise;
            return result;
        } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
        }
    }

    private static async performTokenRefresh(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.accessToken) {
                    const rememberMe = TokenManager.isRememberMe();
                    TokenManager.setAccessToken(data.accessToken, rememberMe);
                    return true;
                }
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    static async login(email: string, password: string): Promise<ApiResponse<{ accessToken: string }>> {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    static async logout(): Promise<ApiResponse> {
        const result = await this.request('/auth/logout', { method: 'POST' });
        TokenManager.clearAllTokens();
        return result;
    }

    static async checkServerStatus(): Promise<boolean> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_STATUS}`, {
                method: 'GET',
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    static async getErrorMessage(error: any): Promise<string> {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                await fetch('https://www.google.com/favicon.ico', {
                    method: 'HEAD',
                    mode: 'no-cors',
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                return 'Server sedang mengalami gangguan. Silakan coba lagi dalam beberapa saat.';
            } catch (internetError) {
                return 'Koneksi internet Anda bermasalah. Silakan periksa koneksi internet dan coba lagi.';
            }
        }
        
        if (error.name === 'AbortError') {
            return 'Koneksi ke server terlalu lambat. Silakan periksa koneksi internet Anda atau coba lagi nanti.';
        }
        
        return 'Server sedang tidak dapat dijangkau. Silakan coba lagi nanti.';
    }
}
