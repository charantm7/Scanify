export function pctLabel(n: number) {
    if (n > 0) return `+${n}%`;
    if (n < 0) return `${n}%`;
    return '—';
}

export function currency(n: number) {
    return `₹${n.toLocaleString('en-IN')}`;
}