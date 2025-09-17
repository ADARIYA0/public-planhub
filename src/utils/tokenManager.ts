export interface TokenData {
    accessToken: string;
    expiresAt: number;
}

export class TokenManager {
    private static readonly ACCESS_TOKEN_KEY = 'accessToken';
    private static readonly TOKEN_EXPIRY_KEY = 'tokenExpiry';
    private static readonly REMEMBER_ME_KEY = 'rememberMe';
    private static readonly USER_DATA_KEY = 'userData';

    static setAccessToken(token: string, rememberMe: boolean = false): void {
        const payload = this.decodeJWT(token);
        const expiresAt = payload?.exp ? payload.exp * 1000 : Date.now() + (15 * 60 * 1000);

        if (rememberMe) {
            localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
            localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiresAt.toString());
            localStorage.setItem(this.REMEMBER_ME_KEY, 'true');
            sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
            sessionStorage.removeItem(this.TOKEN_EXPIRY_KEY);
        } else {
            sessionStorage.setItem(this.ACCESS_TOKEN_KEY, token);
            sessionStorage.setItem(this.TOKEN_EXPIRY_KEY, expiresAt.toString());
            localStorage.removeItem(this.ACCESS_TOKEN_KEY);
            localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
            localStorage.removeItem(this.REMEMBER_ME_KEY);
        }
    }

    static getAccessToken(): string | null {
        const rememberMe = localStorage.getItem(this.REMEMBER_ME_KEY) === 'true';
        return rememberMe ? localStorage.getItem(this.ACCESS_TOKEN_KEY) : sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
    }

    static isTokenExpired(): boolean {
        const rememberMe = localStorage.getItem(this.REMEMBER_ME_KEY) === 'true';
        const expiryStr = rememberMe ? localStorage.getItem(this.TOKEN_EXPIRY_KEY) : sessionStorage.getItem(this.TOKEN_EXPIRY_KEY);
        
        if (!expiryStr) return true;
        
        const expiresAt = parseInt(expiryStr, 10);
        const bufferTime = 60 * 1000;
        return Date.now() >= (expiresAt - bufferTime);
    }

    static isRememberMe(): boolean {
        return localStorage.getItem(this.REMEMBER_ME_KEY) === 'true';
    }

    static setUserData(userData: any, rememberMe: boolean = false): void {
        const userDataStr = JSON.stringify(userData);
        
        if (rememberMe) {
            localStorage.setItem(this.USER_DATA_KEY, userDataStr);
            sessionStorage.removeItem(this.USER_DATA_KEY);
        } else {
            sessionStorage.setItem(this.USER_DATA_KEY, userDataStr);
            localStorage.removeItem(this.USER_DATA_KEY);
        }
    }

    static getUserData(): any | null {
        const rememberMe = this.isRememberMe();
        const userDataStr = rememberMe ? localStorage.getItem(this.USER_DATA_KEY) : sessionStorage.getItem(this.USER_DATA_KEY);
        
        if (!userDataStr) return null;
        
        try {
            return JSON.parse(userDataStr);
        } catch (error) {
            this.clearAllTokens();
            return null;
        }
    }

    static clearAllTokens(): void {
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
        localStorage.removeItem(this.REMEMBER_ME_KEY);
        localStorage.removeItem(this.USER_DATA_KEY);
        
        sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
        sessionStorage.removeItem(this.TOKEN_EXPIRY_KEY);
        sessionStorage.removeItem(this.USER_DATA_KEY);
    }

    private static decodeJWT(token: string): any {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            return null;
        }
    }

    static getTimeUntilExpiry(): number {
        const rememberMe = this.isRememberMe();
        const expiryStr = rememberMe ? localStorage.getItem(this.TOKEN_EXPIRY_KEY) : sessionStorage.getItem(this.TOKEN_EXPIRY_KEY);
        
        if (!expiryStr) return 0;
        
        const expiresAt = parseInt(expiryStr, 10);
        return Math.max(0, expiresAt - Date.now());
    }
}
