import { useState } from 'react';
import toast from 'react-hot-toast';
import { Section, Button } from '../../../components/ui/UiComponents';
import { useApp } from '../../../context/AppContext';
import { settingsService } from '../services/settings.service';

export function OperatingHoursSettings() {
    const { hotel, refreshHotel, supabase } = useApp();
    const [isOpen, setIsOpen] = useState(hotel?.is_open ?? true);
    const [openTime, setOpenTime] = useState(hotel?.open_time || '09:00');
    const [closeTime, setCloseTime] = useState(hotel?.close_time || '22:00');
    const [saving, setSaving] = useState(false);

    async function save() {
        setSaving(true);
        try {
            await settingsService.updateOperatingHours(supabase, hotel.id, {
                is_open: isOpen, open_time: openTime, close_time: closeTime,
            });
            await refreshHotel();
            toast.success('Operating hours updated');
        } catch (e: any) {
            toast.error(e.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    }

    return (
        <Section title="Operating Hours">
            <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
                <div>
                    <p className="text-sm font-medium text-theme">Restaurant is currently</p>
                    <p className="text-xs text-theme2">Manually override open/closed status for customers</p>
                </div>
                <button
                    onClick={() => setIsOpen((v) => !v)}
                    className="px-4 py-2 rounded-full text-xs font-semibold"
                    style={{ background: isOpen ? '#16a34a' : '#dc2626', color: 'white' }}
                >
                    {isOpen ? 'OPEN' : 'CLOSED'}
                </button>
            </div>
            <div className="px-6 py-4 flex flex-col sm:flex-row gap-4">
                <label className="flex-1">
                    <span className="text-sm text-theme2">Opens at</span>
                    <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl border bg-card text-theme text-sm outline-none"
                        style={{ borderColor: 'var(--border)' }} />
                </label>
                <label className="flex-1">
                    <span className="text-sm text-theme2">Closes at</span>
                    <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl border bg-card text-theme text-sm outline-none"
                        style={{ borderColor: 'var(--border)' }} />
                </label>
            </div>
            <div className="px-6 py-4 flex justify-end border-t" style={{ borderColor: 'var(--border)' }}>
                <Button variant="primary" loading={saving} onClick={save}>Save Hours</Button>
            </div>
        </Section>
    );
}