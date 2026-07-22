import { useState } from 'react';
import { getSupabaseClient } from '../../../lib/supabase/client';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../hooks/useToast';
import { settingsService } from '../services/settings.service';
import { PASSWORD_MIN_LENGTH } from '../constants';
import type { PasswordFormData, PasswordFieldErrors } from '../types';

const EMPTY: PasswordFormData = { current: '', next: '', confirm: '' };

export function usePasswordChange() {
    const supabase = getSupabaseClient();
    const { user } = useApp();
    const toast = useToast();

    const [pw, setPw] = useState<PasswordFormData>(EMPTY);
    const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
    const [errors, setErrors] = useState<PasswordFieldErrors>({});
    const [saving, setSaving] = useState(false);

    function setField(key: keyof PasswordFormData, value: string) {
        setPw((p) => ({ ...p, [key]: value }));
        setErrors((e) => ({ ...e, [key]: undefined }));
    }

    function toggleShow(key: keyof PasswordFormData) {
        setShowPw((s) => ({ ...s, [key]: !s[key] }));
    }

    function validate(): boolean {
        const e: PasswordFieldErrors = {};
        if (!pw.current) e.current = 'Current password required';
        if (!pw.next) e.next = 'New password required';
        else if (pw.next.length < PASSWORD_MIN_LENGTH) e.next = `Minimum ${PASSWORD_MIN_LENGTH} characters`;
        if (pw.next !== pw.confirm) e.confirm = 'Passwords do not match';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function save() {
        if (!validate()) return;
        setSaving(true);
        try {
            await settingsService.verifyCurrentPassword(supabase, user.email, pw.current);
            await settingsService.updatePassword(supabase, pw.next);
            toast.success('Password updated');
            setPw(EMPTY);
            setErrors({});
        } catch (e: any) {
            toast.error(e.message || 'Failed to update password');
        } finally {
            setSaving(false);
        }
    }

    return { pw, setField, showPw, toggleShow, errors, saving, save };
}