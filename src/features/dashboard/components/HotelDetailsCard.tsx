'use client';

import { Building2, Link2, Globe, Calendar, Copy, Check, ExternalLink } from 'lucide-react';
import { Card } from '../../../components/ui/UiComponents';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import type { Hotel } from '../types';

function DetailRow({ icon: Icon, label, value, mono }: { icon: any; label: string; value: string; mono?: boolean }) {
    return (
        <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 text-xs text-theme2">
                <Icon size={15} />
                {label}
            </div>
            <p className={`truncate text-theme ${mono ? 'font-mono text-sm' : 'font-medium'}`}>{value}</p>
        </div>
    );
}

export function HotelDetailsCard({
    hotel, menuUrl, isTrialExpired,
}: { hotel: Hotel; menuUrl: string | null; isTrialExpired: boolean }) {
    const { copied, copy } = useCopyToClipboard();


    return (
        <Card className="overflow-hidden border-[var(--accent)] bg-gradient-to-br from-[var(--accentlt)] to-[var(--background)] " padding='p-3'>
            <div className="flex items-center justify-between border-b border-[var(--border)] px-1 sm:px-6 py-4 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 flex-shrink-0">
                        <Building2 className="text-[var(--accent)]" size={20} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg text-theme truncate">{hotel.name}</h3>
                        <p className="text-sm text-theme2">Public Hotel Information</p>
                    </div>
                </div>
                <span className="flex-shrink-0 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
                    Active
                </span>
            </div>

            <div className="grid gap-5 p-5 sm:p-6 sm:grid-cols-2">
                <DetailRow icon={Link2} label="Slug" value={`/${hotel.slug}`} mono />
                <DetailRow icon={Globe} label="Menu URL" value={menuUrl ?? '—'} mono />
                <DetailRow icon={Calendar} label="Created" value={new Date(hotel.created_at).toLocaleDateString()} mono />
                <DetailRow icon={Building2} label="Hotel ID" value={hotel.id} mono />
            </div>

            <div className="flex flex-wrap gap-3 border-t border-[var(--border)] bg-[var(--card)] px-5 sm:px-6 py-4">
                <button
                    onClick={() => menuUrl && copy(menuUrl)}
                    disabled={!menuUrl}
                    className="flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs transition hover:bg-[var(--accentlt)] disabled:opacity-50"
                    style={{ borderColor: 'var(--border)' }}
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy URL'}
                </button>

                <a
                    href={menuUrl ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => { if (isTrialExpired || !menuUrl) e.preventDefault(); }}
                    className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-xs font-mono text-white transition hover:opacity-90 disabled:opacity-50"
                >
                    <ExternalLink size={14} />
                    {isTrialExpired ? 'Disabled' : 'Open Menu'}
                </a>
            </div>
        </Card >
    );
}