import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { KEYCLOAK_CONFIG } from './keycloak.config';

export interface AuthUser {
    id?: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    fullName: string;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_expires_in: number;
    token_type: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    currentUser = signal<AuthUser | null>(null);
    accessToken = signal<string | null>(null);
    refreshToken = signal<string | null>(null);
    isAuthenticated = computed(() => !!this.accessToken());

    private rememberMe = false;

    constructor() {
        // Restore session from localStorage or sessionStorage
        const token = localStorage.getItem('finox_access_token') || sessionStorage.getItem('finox_access_token');
        const refresh = localStorage.getItem('finox_refresh_token') || sessionStorage.getItem('finox_refresh_token');
        const user = localStorage.getItem('finox_user') || sessionStorage.getItem('finox_user');

        if (token) {
            this.accessToken.set(token);
            this.refreshToken.set(refresh);
            this.rememberMe = !!localStorage.getItem('finox_access_token');
            if (user) {
                this.currentUser.set(JSON.parse(user));
            }
        }
    }

    /**
     * Login using Direct Access Grants (Resource Owner Password Credentials)
     */
    async login(username: string, password: string, rememberMe: boolean = false): Promise<{ success: boolean; error?: string }> {
        this.rememberMe = rememberMe;
        try {
            const body = new HttpParams()
                .set('grant_type', 'password')
                .set('client_id', KEYCLOAK_CONFIG.clientId)
                .set('username', username)
                .set('password', password);

            const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

            const response = await firstValueFrom(
                this.http.post<TokenResponse>(KEYCLOAK_CONFIG.tokenEndpoint, body.toString(), { headers })
            );

            this.setTokens(response);
            await this.loadUserInfo();

            return { success: true };
        } catch (error: any) {
            const message = error?.error?.error_description || error?.error?.error || 'Invalid username or password';
            return { success: false, error: message };
        }
    }

    /**
     * Register a new user via Keycloak Admin API
     * Requires getting an admin token first (using admin-cli or service account)
     */
    async register(username: string, email: string, password: string, firstName: string, lastName: string): Promise<{ success: boolean; error?: string }> {
        try {
            // Step 1: Get admin token using admin credentials
            const adminToken = await this.getAdminToken();

            if (!adminToken) {
                return { success: false, error: 'Unable to connect to authentication server.' };
            }

            // Step 2: Create user via Admin REST API
            const userPayload = {
                username,
                email,
                firstName,
                lastName,
                enabled: true,
                emailVerified: true,
                credentials: [
                    {
                        type: 'password',
                        value: password,
                        temporary: false
                    }
                ]
            };

            const headers = new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminToken}`
            });

            await firstValueFrom(
                this.http.post(KEYCLOAK_CONFIG.adminUsersEndpoint, userPayload, { headers })
            );

            return { success: true };
        } catch (error: any) {
            if (error?.status === 409) {
                return { success: false, error: 'User already exists with this username or email.' };
            }
            if (error?.status === 403) {
                return { success: false, error: 'Registration not permitted. Contact administrator.' };
            }
            const message = error?.error?.errorMessage || error?.error?.error_description || 'Registration failed. Please try again.';
            return { success: false, error: message };
        }
    }

    /**
     * Get admin token for user management operations
     * Uses the admin-cli client or a dedicated service account
     */
    private async getAdminToken(): Promise<string | null> {
        try {
            const body = new HttpParams()
                .set('grant_type', 'password')
                .set('client_id', 'admin-cli')
                .set('username', 'admin')
                .set('password', 'admin');

            const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

            const response = await firstValueFrom(
                this.http.post<TokenResponse>(KEYCLOAK_CONFIG.masterTokenEndpoint, body.toString(), { headers })
            );

            return response.access_token;
        } catch {
            return null;
        }
    }

    /**
     * Refresh the access token using the refresh token
     */
    async refreshAccessToken(): Promise<boolean> {
        const refresh = this.refreshToken();
        if (!refresh) return false;

        try {
            const body = new HttpParams()
                .set('grant_type', 'refresh_token')
                .set('client_id', KEYCLOAK_CONFIG.clientId)
                .set('refresh_token', refresh);

            const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

            const response = await firstValueFrom(
                this.http.post<TokenResponse>(KEYCLOAK_CONFIG.tokenEndpoint, body.toString(), { headers })
            );

            this.setTokens(response);
            return true;
        } catch {
            this.clearSession();
            return false;
        }
    }

    /**
     * Load user info from Keycloak userinfo endpoint
     */
    async loadUserInfo(): Promise<void> {
        try {
            const headers = new HttpHeaders({ Authorization: `Bearer ${this.accessToken()}` });
            const userInfo = await firstValueFrom(
                this.http.get<any>(KEYCLOAK_CONFIG.userInfoEndpoint, { headers })
            );

            const user: AuthUser = {
                id: userInfo.sub,
                username: userInfo.preferred_username || userInfo.username,
                email: userInfo.email || '',
                firstName: userInfo.given_name || '',
                lastName: userInfo.family_name || '',
                fullName: userInfo.name || userInfo.preferred_username || ''
            };

            this.currentUser.set(user);
            const storage = this.rememberMe ? localStorage : sessionStorage;
            storage.setItem('finox_user', JSON.stringify(user));
        } catch {
            // Token might be invalid
        }
    }

    /**
     * Logout — revoke token and clear session
     */
    logout(): void {
        const refresh = this.refreshToken();

        if (refresh) {
            const body = new HttpParams()
                .set('client_id', KEYCLOAK_CONFIG.clientId)
                .set('refresh_token', refresh);

            const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

            this.http.post(KEYCLOAK_CONFIG.logoutEndpoint, body.toString(), { headers }).subscribe();
        }

        this.clearSession();
        window.location.href = '/auth/login';
    }

    getToken(): string | null {
        return this.accessToken();
    }

    /**
     * Change password for the currently logged-in user via Keycloak Admin API
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
        try {
            // Get current user info
            const user = this.currentUser();
            const username = user?.username || user?.email;

            if (!username) {
                // Try to get username from stored data
                const stored = localStorage.getItem('finox_user') || sessionStorage.getItem('finox_user');
                if (!stored) {
                    return { success: false, error: 'User session expired. Please login again.' };
                }
                const storedUser = JSON.parse(stored);
                if (!storedUser.username && !storedUser.email) {
                    return { success: false, error: 'User session expired. Please login again.' };
                }
            }

            const loginUsername = username || user?.email || '';

            // Verify current password by attempting a login
            const verifyBody = new HttpParams()
                .set('grant_type', 'password')
                .set('client_id', KEYCLOAK_CONFIG.clientId)
                .set('username', loginUsername)
                .set('password', currentPassword);

            const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

            try {
                await firstValueFrom(
                    this.http.post<TokenResponse>(KEYCLOAK_CONFIG.tokenEndpoint, verifyBody.toString(), { headers })
                );
            } catch {
                return { success: false, error: 'Current password is incorrect.' };
            }

            // Get admin token to update password
            const adminToken = await this.getAdminToken();
            if (!adminToken) {
                return { success: false, error: 'Unable to connect to authentication server.' };
            }

            const adminHeaders = new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminToken}`
            });

            // Find user ID if not available
            let userId = user?.id;
            if (!userId) {
                const users = await firstValueFrom(
                    this.http.get<any[]>(`${KEYCLOAK_CONFIG.adminUsersEndpoint}?username=${encodeURIComponent(loginUsername)}`, { headers: adminHeaders })
                );
                if (users && users.length > 0) {
                    userId = users[0].id;
                } else {
                    return { success: false, error: 'User not found in the system.' };
                }
            }

            // Update password via Admin API
            await firstValueFrom(
                this.http.put(`${KEYCLOAK_CONFIG.adminUsersEndpoint}/${userId}/reset-password`, {
                    type: 'password',
                    value: newPassword,
                    temporary: false
                }, { headers: adminHeaders })
            );

            return { success: true };
        } catch (error: any) {
            const message = error?.error?.errorMessage || 'Failed to change password. Please try again.';
            return { success: false, error: message };
        }
    }

    /**
     * Forgot password — find user by email and send reset password email via Keycloak
     */
    async forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
        try {
            const adminToken = await this.getAdminToken();
            if (!adminToken) {
                return { success: false, error: 'Unable to connect to authentication server.' };
            }

            const adminHeaders = new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminToken}`
            });

            // Find user by email
            const users = await firstValueFrom(
                this.http.get<any[]>(`${KEYCLOAK_CONFIG.adminUsersEndpoint}?email=${encodeURIComponent(email)}`, { headers: adminHeaders })
            );

            if (!users || users.length === 0) {
                return { success: false, error: 'No account found with this email address.' };
            }

            const userId = users[0].id;

            // Send reset password email action
            await firstValueFrom(
                this.http.put(`${KEYCLOAK_CONFIG.adminUsersEndpoint}/${userId}/execute-actions-email`, ['UPDATE_PASSWORD'], { headers: adminHeaders })
            );

            return { success: true };
        } catch (error: any) {
            const message = error?.error?.errorMessage || 'Failed to send reset email. Please try again.';
            return { success: false, error: message };
        }
    }

    private setTokens(response: TokenResponse): void {
        this.accessToken.set(response.access_token);
        this.refreshToken.set(response.refresh_token);

        const storage = this.rememberMe ? localStorage : sessionStorage;
        storage.setItem('finox_access_token', response.access_token);
        storage.setItem('finox_refresh_token', response.refresh_token);
    }

    private clearSession(): void {
        this.accessToken.set(null);
        this.refreshToken.set(null);
        this.currentUser.set(null);
        localStorage.removeItem('finox_access_token');
        localStorage.removeItem('finox_refresh_token');
        localStorage.removeItem('finox_user');
        sessionStorage.removeItem('finox_access_token');
        sessionStorage.removeItem('finox_refresh_token');
        sessionStorage.removeItem('finox_user');
    }
}
