import { AlertCircle } from 'lucide-react';
import { Section } from '../../../components/shared/UiComponents';
import { useProfileSettings } from '../hooks/useProfileSettings';
import { EditableField } from './shared/EditableField';

export function ProfileSettings() {
    const {
        user, profile,
        name, setName, editingName, savingName, startEditName, saveName, cancelName,
        email, setEmail, editingEmail, savingEmail, startEditEmail, saveEmail, cancelEmail,
    } = useProfileSettings();

    return (
        <Section title="Profile">
            <EditableField
                label="Name" value={profile?.name} editing={editingName}
                editValue={name} onChange={setName}
                onEdit={startEditName} onSave={saveName} onCancel={cancelName} saving={savingName}
            />
            <EditableField
                label="Email" value={user?.email} editing={editingEmail}
                editValue={email} onChange={setEmail} inputType="email"
                onEdit={startEditEmail} onSave={saveEmail} onCancel={cancelEmail} saving={savingEmail}
            />
            <div className="px-6 py-3 flex items-center gap-2">
                <AlertCircle size={13} className="text-theme2 flex-shrink-0" />
                <p className="text-xs text-theme2">Email changes require confirmation via the new address.</p>
            </div>
        </Section>
    );
}