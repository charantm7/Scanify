'use client';


import { useState } from 'react';
import {
    User, Lock, Building2, Globe, Phone, MapPin,
    Loader2, Eye, EyeOff, AlertCircle, Zap, Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getSupabaseClient } from '../../../lib/supabase/client';
import { useApp } from '../../../context/AppContext';
import { Section, Button, Input, Textarea, Card, Badge, Alert } from '../../shared/ui';

function ProfileTab() {
    const supabase = getSupabaseClient()
    const { user, profile, updateProfileLocally } = useApp();


    const [editingName, setEditingName] = useState(false);
    const [name, setName] = useState('');
    const [savingName, setSavingName] = useState(false);

    const [editingEmail, setEditingEmail] = useState(false);
    const [email, setEmail] = useState('');
    const [savingEmail, setSavingEmail] = useState(false);

    const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
    const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
    const [pwErrors, setPwErrors] = useState({});
    const [savingPw, setSavingPw] = useState(false);

    async function saveName() {
        const trimmed = name.trim();
        if (!trimmed) { toast.error('Name cannot be empty'); return; }
        setSavingName(true);
        try {
            const { error } = await supabase.from('users').update({ name: trimmed }).eq('id', user.id);
            if (error) throw error;
            updateProfileLocally({ name: trimmed });
            toast.success('Name updated');
            setEditingName(false);
        } catch (e) {
            toast.error(e.message || 'Failed to update name');
        } finally {
            setSavingName(false);
        }
    }

    async function saveEmail() {
        const trimmed = email.trim();
        if (!trimmed || !/\S+@\S+\.\S+/.test(trimmed)) { toast.error('Enter a valid email'); return; }
        setSavingEmail(true);
        try {
            const { error } = await supabase.auth.updateUser({ email: trimmed });
            if (error) throw error;
            toast.success('Confirmation sent to new email');
            setEditingEmail(false);
        } catch (e) {
            toast.error(e.message || 'Failed to update email');
        } finally {
            setSavingEmail(false);
        }
    }

    interface ErrorForm {
        current?: string;
        next?: string;
        confirm?: string;
    }

    function validatePw() {
        const e: ErrorForm = {};
        if (!pw.current) e.current = 'Current password required';
        if (!pw.next) e.next = 'New password required';
        else if (pw.next.length < 8) e.next = 'Minimum 8 characters';
        if (pw.next !== pw.confirm) e.confirm = 'Passwords do not match';
        setPwErrors(e);
        return !Object.keys(e).length;
    }

    async function savePassword() {
        if (!validatePw()) return;
        setSavingPw(true);
        try {
            const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email, password: pw.current });
            if (signInErr) throw new Error('Current password is incorrect');
            const { error } = await supabase.auth.updateUser({ password: pw.next });
            if (error) throw error;
            toast.success('Password updated');
            setPw({ current: '', next: '', confirm: '' });
            setPwErrors({});
        } catch (e) {
            toast.error(e.message || 'Failed to update password');
        } finally {
            setSavingPw(false);
        }
    }

    interface FieldRowProps {
        label: string;
        value?: string | React.ReactNode;
        editing: boolean;
        editValue: string;
        onChange: (value: string) => void;
        onEdit: () => void;
        onSave: () => void;
        onCancel: () => void;
        saving?: boolean;
        inputType?: string;
    }


    function FieldRow({ label, value, editing, editValue, onChange, onEdit, onSave, onCancel, saving, inputType }: FieldRowProps) {
        return (
            <div className="flex md:flex-row flex-col sm:flex-row md:items-center sm:items-center gap-2 px-6 py-4 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                <span className="md:w-28 flex-shrink-0 text-sm text-theme2">{label}</span>
                <div className={`flex md:flex-row sm:flex-row gap-2 ${editing ? 'flex-col' : 'flex-row'}`}>
                    <div className="flex-1 min-w-0">
                        {editing ? (
                            <input
                                type={inputType || 'text'}
                                value={editValue}
                                onChange={(e) => onChange(e.target.value)}
                                autoFocus
                                className="w-full max-w-xs px-3 py-2 rounded-xl border bg-card text-theme text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                                style={{ borderColor: 'var(--border)' }}
                            />
                        ) : (
                            <span className="text-sm text-theme font-medium">{value || <span className="text-theme2 italic">Not set</span>}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {editing ? (
                            <>
                                <Button size="sm" variant="primary" loading={saving} onClick={onSave}>Save</Button>
                                <Button size="sm" variant="secondary" onClick={onCancel}>Cancel</Button>
                            </>
                        ) : (
                            <Button size="sm" variant="ghost" onClick={onEdit}>Edit</Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Section title="Profile">
                <FieldRow
                    label="Name" value={profile?.name} editing={editingName}
                    editValue={name} onChange={setName}
                    onEdit={() => { setName(profile?.name || ''); setEditingName(true); setEditingEmail(false); }}
                    onSave={saveName} onCancel={() => setEditingName(false)} saving={savingName}
                />
                <FieldRow
                    label="Email" value={user?.email} editing={editingEmail}
                    editValue={email} onChange={setEmail} inputType="email"
                    onEdit={() => { setEmail(user?.email || ''); setEditingEmail(true); setEditingName(false); }}
                    onSave={saveEmail} onCancel={() => setEditingEmail(false)} saving={savingEmail}
                />
                <div className="px-6 py-3 flex items-center gap-2">
                    <AlertCircle size={13} className="text-theme2 flex-shrink-0" />
                    <p className="text-xs text-theme2">Email changes require confirmation via the new address.</p>
                </div>
            </Section>

            <Section title="Password">
                {['current', 'next', 'confirm'].map((key) => (
                    <div key={key}>
                        <div className="flex md:flex-row sm:flex-row  flex-col md:items-center sm:items-center gap-2 px-6 py-3 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                            <span className="md:w-40 flex-shrink-0 text-sm text-theme2">
                                {{ current: 'Current', next: 'New Password', confirm: 'Confirm' }[key]}
                            </span>
                            <div className="flex-1 max-w-xs relative">
                                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme2" />
                                <input
                                    type={showPw[key] ? 'text' : 'password'}
                                    value={pw[key]}
                                    onChange={(e) => { setPw((p) => ({ ...p, [key]: e.target.value })); setPwErrors((e2) => ({ ...e2, [key]: '' })); }}
                                    placeholder="••••••••"
                                    className="w-full pl-9 pr-9 py-2.5 rounded-xl border bg-card text-theme text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                                    style={{ borderColor: pwErrors[key] ? '#f87171' : 'var(--border)' }}
                                />
                                <button type="button" onClick={() => setShowPw((s) => ({ ...s, [key]: !s[key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-theme2">
                                    {showPw[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>
                        {pwErrors[key] && <p className="text-red-500 text-xs px-6 pb-2">{pwErrors[key]}</p>}
                    </div>
                ))}
                <div className="px-6 py-4 flex md:flex-row flex-col gap-2 md:items-center sm:items-center justify-between border-t" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-xs text-theme2 flex items-center gap-1.5">
                        <AlertCircle size={12} /> Minimum 8 characters
                    </p>
                    <Button className='bg-submit' loading={savingPw} onClick={savePassword}>
                        Update Password
                    </Button>
                </div>
            </Section>
        </div>
    );
}

// ─── Restaurant Tab ────────────────────────────────────────────────────────────
function RestaurantTab() {
    const { hotel, refreshHotel, supabase } = useApp();
    const [form, setForm] = useState({
        name: hotel?.name || '',
        description: hotel?.description || '',
        logo_url: hotel?.logo_url || '',
        address: hotel?.address || '',
    });
    const [saving, setSaving] = useState(false);
    const isDirty = JSON.stringify(form) !== JSON.stringify({
        name: hotel?.name || '', description: hotel?.description || '',
        logo_url: hotel?.logo_url || '', address: hotel?.address || '',
    });

    function set(field) {
        return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
    }

    async function save() {
        if (!form.name.trim()) { toast.error('Restaurant name required'); return; }
        setSaving(true);
        try {
            const { error } = await supabase
                .from('hotels')
                .update({
                    name: form.name.trim(),
                    description: form.description.trim() || null,
                    logo_url: form.logo_url.trim() || null,
                    address: form.address.trim() || null,
                })
                .eq('id', hotel.id);
            if (error) throw error;
            await refreshHotel();
            toast.success('Restaurant profile updated');
        } catch (e) {
            toast.error(e.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-5 max-w-xl">
            <Input label="Restaurant Name *" value={form.name} onChange={set('name')} icon={Building2} />
            <Textarea label="Description" value={form.description} onChange={set('description')} rows={3} hint="Describe your cuisine, vibe, and specialties" />
            <Input label="Logo URL" value={form.logo_url} onChange={set('logo_url')} icon={Globe} placeholder="https://..." />
            <Input label="Address" value={form.address} onChange={set('address')} icon={MapPin} />
            <div className="flex justify-end">
                <Button variant="primary" loading={saving} onClick={save} disabled={!isDirty}>
                    {saving ? 'Saving…' : isDirty ? 'Save Changes' : <><Check size={14} /> Saved</>}
                </Button>
            </div>
        </div>
    );
}

// ─── Main Settings Panel ──────────────────────────────────────────────────────
export default function SettingsPanel() {
    const [tab, setTab] = useState('profile');
    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'restaurant', label: 'Restaurant', icon: Building2 }
    ];

    return (
        <div className="space-y-5">
            <div>
                <h1 className="font-syne font-bold text-2xl text-theme">Settings</h1>
                <p className="text-sm text-theme2 mt-0.5">Manage your account and restaurant details</p>
            </div>

            {/* Tabs */}
            <div
                className="flex gap-1 p-1 rounded-xl w-fit"
                style={{ background: 'var(--border)' }}
            >
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === id ? 'text-white shadow' : 'text-theme2 hover:text-theme'}`}
                        style={tab === id ? { background: 'var(--accent)' } : {}}
                    >
                        <Icon size={14} /> {label}
                    </button>
                ))}
            </div>

            {tab === 'profile' && <ProfileTab />}
            {tab === 'restaurant' && <RestaurantTab />}
        </div>
    );
}