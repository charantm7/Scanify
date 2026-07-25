export const LOGIN_REASON_MESSAGES: Record<string, { title: string; body: string; tone: 'error' | 'warning' | 'info' }> = {
    account_deleted: {
        title: 'This account has been deleted',
        body: 'Your restaurant and associated data have been removed. If this was a mistake, contact support to discuss recovery options.',
        tone: 'error',
    },
    hotel_lookup_failed: {
        title: 'Something went wrong',
        body: 'We couldn\'t load your account. Please try signing in again.',
        tone: 'error',
    },
    restaurant_deactivated: {
        title: 'Restaurant deactivated',
        body: 'Your restaurant is currently paused. Sign in and head to Settings to reactivate it.',
        tone: 'warning',
    },
};

export function getLoginReasonMessage(reason: string | null) {
    if (!reason) return null;
    return LOGIN_REASON_MESSAGES[reason] || null;
}