export interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    avatar?: string;
    designation?: string;
    company?: string;
    address?: string;
    city?: string;
    country?: string;
    joinDate: string;
    currency: string;
    language: string;
    timezone: string;
}

export interface UserSettings {
    notifications: {
        email: boolean;
        push: boolean;
        budgetAlerts: boolean;
        weeklyReport: boolean;
    };
    privacy: {
        showProfile: boolean;
        showActivity: boolean;
    };
    display: {
        currency: string;
        dateFormat: string;
        language: string;
    };
}
