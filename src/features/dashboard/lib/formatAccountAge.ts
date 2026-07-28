export function formatAccountAge(createdAt?: string): string {
    if (!createdAt) return '—';
    const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000);
    return `${days}d`;
}