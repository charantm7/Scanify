'use client';

import {
    Building2,
    Link2,
    Globe,
    Calendar,
    Copy,
    Check,
    ExternalLink,
} from 'lucide-react';

import { Card } from '../../../components/ui/UiComponents';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import type { Hotel } from '../types';
import { navigate } from 'next/dist/client/components/segment-cache/navigation';

function DetailRow({
    icon: Icon,
    label,
    value,
    mono,
    copyable,
}: {
    icon: any;
    label: string;
    value: string;
    mono?: boolean;
    copyable?: boolean;
}) {
    const { copied, copy } = useCopyToClipboard();

    return (
        <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-theme2 mb-1.5">
                <Icon size={14} />
                <span>{label}</span>
            </div>

            <div className="flex items-center gap-2 min-w-0">
                <p
                    className={`truncate text-theme text-sm ${mono ? 'font-mono' : 'font-medium'
                        }`}
                >
                    {value}
                </p>

                {copyable && (
                    <button
                        onClick={() => copy(value)}
                        className="flex-shrink-0 p-1 rounded hover:bg-theme3 text-theme3 hover:text-theme transition"
                        aria-label={`Copy ${label}`}
                    >
                        {copied ? (
                            <Check size={13} />
                        ) : (
                            <Copy size={13} />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

export function HotelDetailsCard({
    hotel,
    menuUrl,
    isTrialExpired,
    navigate,
}: {
    hotel: Hotel;
    menuUrl: string | null;
    isTrialExpired: boolean;
    navigate: (section: string) => void;
}) {
    return (
        <Card className="overflow-hidden" padding="p-0">
            <div className="p-5 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                    <div className="flex items-center gap-4 min-w-0 lg:flex-1">
                        <div
                            className="hidden w-14 h-14 rounded-xl md:flex items-center justify-center flex-shrink-0"
                            style={{
                                background: 'var(--accentlt)',
                                color: 'var(--accent)',
                            }}
                        >
                            <Building2 size={23} />
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-lg sm:text-xl font-semibold text-theme truncate">
                                    {hotel.name}
                                </h2>

                                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold bg-green-500/10 text-green-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    Live
                                </span>
                            </div>

                            <p className="text-sm text-theme2 mt-1">
                                Your digital menu is active and ready for customers.
                            </p>

                            <div className="flex flex-wrap gap-2 mt-4">
                                <a
                                    href={menuUrl ?? '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(event) => {
                                        if (isTrialExpired || !menuUrl) {
                                            event.preventDefault();
                                        }
                                    }}
                                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
                                    style={{
                                        background: 'var(--accent)',
                                    }}
                                >
                                    <ExternalLink size={14} />
                                    Open Menu
                                </a>

                                <button
                                    onClick={() => navigate('menu-builder')}
                                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-semibold text-theme hover:bg-theme3 transition"
                                    style={{
                                        borderColor: 'var(--border)',
                                    }}
                                >
                                    <Building2 size={14} />
                                    Manage Menu
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        className="hidden lg:block w-px self-stretch"
                        style={{ background: 'var(--border)' }}
                    />

                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 lg:w-[48%]">
                        <DetailRow
                            icon={Globe}
                            label="Menu URL"
                            value={menuUrl ?? '—'}
                            mono
                            copyable={!!menuUrl}
                        />

                        <DetailRow
                            icon={Link2}
                            label="Slug"
                            value={`/${hotel.slug}`}
                            mono
                            copyable
                        />
                        <DetailRow
                            icon={Building2}
                            label="Restaurant ID"
                            value={hotel.id}
                            mono
                            copyable
                        />

                        <DetailRow
                            icon={Calendar}
                            label="Created"
                            value={new Date(
                                hotel.created_at
                            ).toLocaleDateString('en-IN')}
                        />


                    </div>
                </div>
            </div>
        </Card>
    );
}