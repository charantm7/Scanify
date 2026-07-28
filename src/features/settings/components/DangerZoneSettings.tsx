import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Section, Button } from '../../../components/shared/UiComponents';
import { useDangerZone } from '../hooks/useDangerZone';

const DELETE_CONFIRM_PHRASE = 'delete my restaurant';

export function DangerZoneSettings() {
    const { isActive, processing, deactivate, softDelete } = useDangerZone();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const canConfirm = confirmText.trim().toLowerCase() === DELETE_CONFIRM_PHRASE;

    return (
        <Section title="Danger Zone">
            <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
                <div>
                    <p className="text-sm font-medium text-theme">Deactivate restaurant</p>
                    <p className="text-xs text-theme2">Menu becomes inaccessible to customers. Reversible anytime.</p>
                </div>
                <Button variant="secondary" loading={processing} disabled={!isActive} onClick={deactivate}>
                    {isActive ? 'Deactivate' : 'Deactivated'}
                </Button>
            </div>

            <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-500 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-theme">Delete restaurant</p>
                        <p className="text-xs text-theme2">Permanently removes access. This cannot be undone.</p>
                    </div>
                </div>
                <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete</Button>
            </div>

            {showDeleteModal && (
                <DeleteConfirmModal
                    confirmText={confirmText}
                    onConfirmTextChange={setConfirmText}
                    canConfirm={canConfirm}
                    processing={processing}
                    onCancel={() => { setShowDeleteModal(false); setConfirmText(''); }}
                    onConfirm={softDelete}
                />
            )}
        </Section>
    );
}

function DeleteConfirmModal({
    confirmText, onConfirmTextChange, canConfirm, processing, onCancel, onConfirm,
}: {
    confirmText: string;
    onConfirmTextChange: (v: string) => void;
    canConfirm: boolean;
    processing: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl" style={{ background: 'var(--surface, #fff)' }}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 text-red-500">
                        <AlertTriangle size={20} />
                        <h3 className="font-semibold text-theme text-base">Delete this restaurant?</h3>
                    </div>
                    <button onClick={onCancel} className="text-theme2">
                        <X size={18} />
                    </button>
                </div>

                <div className="text-sm text-theme2 space-y-2 mb-4">
                    <p>This will immediately and permanently:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Take your menu, QR codes, and ordering pages offline</li>
                        <li>Sign you out of this account</li>
                        <li>Remove access to your console and analytics</li>
                    </ul>
                    <p className="text-xs">This action cannot be reversed. Contact support first if you&apos;re unsure.</p>
                </div>

                <label className="block mb-4">
                    <span className="text-xs text-theme2">
                        Type <span className="font-mono font-semibold text-theme">{DELETE_CONFIRM_PHRASE}</span> to confirm
                    </span>
                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => onConfirmTextChange(e.target.value)}
                        autoFocus
                        className="w-full mt-1 px-3 py-2 rounded-xl border bg-card text-theme text-sm outline-none focus:ring-2 focus:ring-red-300"
                        style={{ borderColor: 'var(--border)' }}
                    />
                </label>

                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button variant="danger" disabled={!canConfirm} loading={processing} onClick={onConfirm}>
                        Permanently Delete
                    </Button>
                </div>
            </div>
        </div>
    );
}