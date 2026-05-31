import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AdminUser, AdminStats, TrackerMetaAdmin, AuditLog, Announcement, AnalyticsData, SeedStatus } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
    private http = inject(HttpClient);

    users = signal<AdminUser[]>([]);
    stats = signal<AdminStats | null>(null);
    trackerMeta = signal<TrackerMetaAdmin | null>(null);
    auditLogs = signal<AuditLog[]>([]);
    announcements = signal<Announcement[]>([]);
    analytics = signal<AnalyticsData | null>(null);
    seedStatus = signal<SeedStatus | null>(null);

    // ─── Users ───────────────────────────────────────────────
    async loadUsers(): Promise<void> {
        try {
            const data = await firstValueFrom(this.http.get<AdminUser[]>('/api/admin/users'));
            this.users.set(data);
        } catch (error) {
            console.error('Failed to load users', error);
        }
    }

    async toggleUserStatus(userId: string, enabled: boolean): Promise<boolean> {
        try {
            await firstValueFrom(
                this.http.put(`/api/admin/users/${userId}/status`, { enabled })
            );
            this.users.update(users =>
                users.map(u => u.id === userId ? { ...u, enabled } : u)
            );
            return true;
        } catch {
            return false;
        }
    }

    async resetUserPassword(userId: string, newPassword: string): Promise<boolean> {
        try {
            await firstValueFrom(
                this.http.post(`/api/admin/users/${userId}/reset-password`, { password: newPassword })
            );
            return true;
        } catch {
            return false;
        }
    }

    async deleteUser(userId: string): Promise<boolean> {
        try {
            await firstValueFrom(this.http.delete(`/api/admin/users/${userId}`));
            this.users.update(users => users.filter(u => u.id !== userId));
            return true;
        } catch {
            return false;
        }
    }

    async bulkImportUsers(file: File): Promise<{ success: boolean; imported?: number; error?: string }> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const result = await firstValueFrom(
                this.http.post<{ imported: number }>('/api/admin/users/bulk-import', formData)
            );
            await this.loadUsers();
            return { success: true, imported: result.imported };
        } catch (error: any) {
            return { success: false, error: error?.error?.message || 'Import failed' };
        }
    }

    // ─── Stats ───────────────────────────────────────────────
    async loadStats(): Promise<void> {
        try {
            const data = await firstValueFrom(this.http.get<AdminStats>('/api/admin/stats'));
            this.stats.set(data);
        } catch (error) {
            console.error('Failed to load admin stats', error);
        }
    }

    // ─── Tracker Meta ────────────────────────────────────────
    async loadTrackerMeta(): Promise<void> {
        try {
            const data = await firstValueFrom(this.http.get<TrackerMetaAdmin>('/api/tracker/meta'));
            this.trackerMeta.set(data);
        } catch (error) {
            console.error('Failed to load tracker meta', error);
        }
    }

    async updateTrackerMeta(meta: TrackerMetaAdmin): Promise<boolean> {
        try {
            await firstValueFrom(this.http.put('/api/admin/tracker/meta', meta));
            this.trackerMeta.set(meta);
            return true;
        } catch {
            return false;
        }
    }

    // ─── Audit Logs ──────────────────────────────────────────
    async loadAuditLogs(params?: { from?: string; to?: string; userId?: string; action?: string }): Promise<void> {
        try {
            let url = '/api/admin/audit-logs';
            const queryParams: string[] = [];
            if (params?.from) queryParams.push(`from=${params.from}`);
            if (params?.to) queryParams.push(`to=${params.to}`);
            if (params?.userId) queryParams.push(`userId=${params.userId}`);
            if (params?.action) queryParams.push(`action=${params.action}`);
            if (queryParams.length) url += '?' + queryParams.join('&');

            const data = await firstValueFrom(this.http.get<AuditLog[]>(url));
            this.auditLogs.set(data);
        } catch (error) {
            console.error('Failed to load audit logs', error);
        }
    }

    // ─── Announcements ───────────────────────────────────────
    async loadAnnouncements(): Promise<void> {
        try {
            const data = await firstValueFrom(this.http.get<Announcement[]>('/api/admin/announcements'));
            this.announcements.set(data);
        } catch (error) {
            console.error('Failed to load announcements', error);
        }
    }

    async createAnnouncement(announcement: Partial<Announcement>): Promise<boolean> {
        try {
            const created = await firstValueFrom(
                this.http.post<Announcement>('/api/admin/announcements', announcement)
            );
            this.announcements.update(list => [created, ...list]);
            return true;
        } catch {
            return false;
        }
    }

    async updateAnnouncement(id: string, announcement: Partial<Announcement>): Promise<boolean> {
        try {
            const updated = await firstValueFrom(
                this.http.put<Announcement>(`/api/admin/announcements/${id}`, announcement)
            );
            this.announcements.update(list => list.map(a => a.id === id ? updated : a));
            return true;
        } catch {
            return false;
        }
    }

    async deleteAnnouncement(id: string): Promise<boolean> {
        try {
            await firstValueFrom(this.http.delete(`/api/admin/announcements/${id}`));
            this.announcements.update(list => list.filter(a => a.id !== id));
            return true;
        } catch {
            return false;
        }
    }

    // ─── Analytics ───────────────────────────────────────────
    async loadAnalytics(): Promise<void> {
        try {
            const data = await firstValueFrom(this.http.get<AnalyticsData>('/api/admin/analytics'));
            this.analytics.set(data);
        } catch (error) {
            console.error('Failed to load analytics', error);
        }
    }

    // ─── Seed Data ───────────────────────────────────────────
    async loadSeedStatus(): Promise<void> {
        try {
            const data = await firstValueFrom(this.http.get<SeedStatus>('/api/admin/seed/status'));
            this.seedStatus.set(data);
        } catch (error) {
            console.error('Failed to load seed status', error);
        }
    }

    async triggerSeed(tables?: string[]): Promise<boolean> {
        try {
            await firstValueFrom(this.http.post('/api/admin/seed', { tables }));
            await this.loadSeedStatus();
            return true;
        } catch {
            return false;
        }
    }

    // ─── Catalog CRUD ────────────────────────────────────────
    async createCatalogItem<T>(endpoint: string, item: T): Promise<T | null> {
        try {
            return await firstValueFrom(this.http.post<T>(endpoint, item));
        } catch {
            return null;
        }
    }

    async updateCatalogItem<T>(endpoint: string, id: string, item: T): Promise<T | null> {
        try {
            return await firstValueFrom(this.http.put<T>(`${endpoint}/${id}`, item));
        } catch {
            return null;
        }
    }

    async deleteCatalogItem(endpoint: string, id: string): Promise<boolean> {
        try {
            await firstValueFrom(this.http.delete(`${endpoint}/${id}`));
            return true;
        } catch {
            return false;
        }
    }

    async bulkDeleteCatalogItems(endpoint: string, ids: string[]): Promise<boolean> {
        try {
            await firstValueFrom(this.http.post(`${endpoint}/bulk-delete`, { ids }));
            return true;
        } catch {
            return false;
        }
    }
}
