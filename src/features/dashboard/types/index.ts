export interface Profile {
    id: string;
    name?: string;
    created_at?: string;
}

export interface Hotel {
    id: string;
    name: string;
    slug: string;
    created_at: string;
}

export interface DashboardStats {
    qrCount: number;
    scanCount: number;
}

export type NavigateFn = (section: string) => void;