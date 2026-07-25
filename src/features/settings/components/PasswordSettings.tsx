import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Section, Button } from '../../../components/shared/ui';
import { usePasswordChange } from '../hooks/usePasswordChange';
import { PASSWORD_MIN_LENGTH } from '../constants';
import type { PasswordFieldKey } from '../types';

const FIELD_LABELS: Record<PasswordFieldKey, string> = {
    current: 'Current',
    next: 'New Password',
    confirm: 'Confirm',
};

export function PasswordSettings() {
    const { pw, setField, showPw, toggleShow, errors, saving, save } = usePasswordChange();

    return (
        <Section title="Password">
            {(Object.keys(FIELD_LABELS) as PasswordFieldKey[]).map((key) => (
                <div key={key}>
                    <div className="flex md:flex-row flex-col md:items-center gap-2 px-6 py-3 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                        <span className="md:w-40 flex-shrink-0 text-sm text-theme2">{FIELD_LABELS[key]}</span>
                        <div className="flex-1 max-w-xs relative">
                            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme2" />
                            <input
                                type={showPw[key] ? 'text' : 'password'}
                                value={pw[key]}
                                onChange={(e) => setField(key, e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-9 pr-9 py-2.5 rounded-xl border bg-card text-theme text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                                style={{ borderColor: errors[key] ? '#f87171' : 'var(--border)' }}
                            />
                            <button type="button" onClick={() => toggleShow(key)} className="absolute right-3 top-1/2 -translate-y-1/2 text-theme2">
                                {showPw[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>
                    {errors[key] && <p className="text-red-500 text-xs px-6 pb-2">{errors[key]}</p>}
                </div>
            ))}
            <div className="px-6 py-4 flex md:flex-row flex-col gap-2 md:items-center justify-between border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs text-theme2 flex items-center gap-1.5">
                    <AlertCircle size={12} /> Minimum {PASSWORD_MIN_LENGTH} characters
                </p>
                <Button className="bg-submit" loading={saving} onClick={save}>Update Password</Button>
            </div>
        </Section>
    );
}