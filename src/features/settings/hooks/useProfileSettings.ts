import { useState } from 'react';
import { getSupabaseClient } from '../../../lib/supabase/client';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../hooks/useToast';
import { settingsService } from '../services/settings.service';

export function useProfileSettings() {
    const supabase = getSupabaseClient();
    const toast = useToast();
    const { user, profile, updateProfileLocally } = useApp();

    const [editingName, setEditingName] = useState(false);
    const [name, setName] = useState('');
    const [savingName, setSavingName] = useState(false);

    const [editingEmail, setEditingEmail] = useState(false);
    const [email, setEmail] = useState('');
    const [savingEmail, setSavingEmail] = useState(false);

    function startEditName() {
        setName(profile?.name || '');
        setEditingName(true);
        setEditingEmail(false);
    }

    function startEditEmail() {
        setEmail(user?.email || '');
        setEditingEmail(true);
        setEditingName(false);
    }

    async function saveName() {
        const trimmed = name.trim();
        if (!trimmed) return toast.error('Name cannot be empty');

        setSavingName(true);
        try {
            await settingsService.updateUserName(supabase, user.id, trimmed);
            updateProfileLocally({ name: trimmed });
            toast.success('Name updated');
            setEditingName(false);
        } catch (e: any) {
            toast.error(e.message || 'Failed to update name');
        } finally {
            setSavingName(false);
        }
    }

    async function saveEmail() {
        const trimmed = email.trim();
        if (!trimmed || !/\S+@\S+\.\S+/.test(trimmed)) return toast.error('Enter a valid email');

        setSavingEmail(true);
        try {
            await settingsService.updateEmail(supabase, trimmed);
            toast.success('Confirmation sent to new email');
            setEditingEmail(false);
        } catch (e: any) {
            toast.error(e.message || 'Failed to update email');
        } finally {
            setSavingEmail(false);
        }
    }

    return {
        user, profile,
        name, setName, editingName, savingName, startEditName, saveName, cancelName: () => setEditingName(false),
        email, setEmail, editingEmail, savingEmail, startEditEmail, saveEmail, cancelEmail: () => setEditingEmail(false),
    };
}