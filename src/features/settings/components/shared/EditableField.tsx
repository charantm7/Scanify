import { Button } from '../../../../components/ui/UiComponents';

interface EditableFieldProps {
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

export function EditableField({
    label, value, editing, editValue, onChange, onEdit, onSave, onCancel, saving, inputType,
}: EditableFieldProps) {
    return (
        <div className="flex md:flex-row flex-col gap-2 px-6 py-4 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
            <span className="md:w-28 flex-shrink-0 text-sm text-theme2">{label}</span>
            <div className={`flex gap-2 ${editing ? 'flex-col' : 'flex-row'} md:flex-row`}>
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