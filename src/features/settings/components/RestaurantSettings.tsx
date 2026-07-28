import { Building2, Globe, MapPin, Phone } from 'lucide-react';
import { Input, Textarea, Button } from '../../../components/shared/UiComponents';
import { Check } from 'lucide-react';
import { useRestaurantSettings } from '../hooks/useRestaurantSettings';
import { CUISINE_OPTIONS, SERVICE_TYPE_OPTIONS, RESTAURANT_TYPE_OPTIONS } from '../constants';

function ChipGroup({ label, options, selected, onToggle }: {
    label: string; options: string[]; selected: string[]; onToggle: (v: string) => void;
}) {
    return (
        <div>
            <p className="text-sm text-theme2 mb-2">{label}</p>
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => {
                    const active = selected.includes(opt);
                    return (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => onToggle(opt)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${active ? 'text-white' : 'text-theme2'}`}
                            style={{
                                borderColor: active ? 'var(--accent)' : 'var(--border)',
                                background: active ? 'var(--accent)' : 'transparent',
                            }}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function RestaurantSettings() {
    const { form, setField, toggleListValue, isDirty, saving, save } = useRestaurantSettings();

    return (
        <div className="space-y-6 max-w-xl">
            <Input label="Restaurant Name *" value={form.name} onChange={(e) => setField('name', e.target.value)} icon={Building2} />
            <Textarea label="Description" value={form.description} onChange={(e) => setField('description', e.target.value)} rows={3} hint="Describe your cuisine, vibe, and specialties" />
            <Input label="Logo URL" value={form.logo_url} onChange={(e) => setField('logo_url', e.target.value)} icon={Globe} placeholder="https://..." />
            <Input label="Address" value={form.address} onChange={(e) => setField('address', e.target.value)} icon={MapPin} />
            <Input label="Phone" value={form.phone} onChange={(e) => setField('phone', e.target.value)} icon={Phone} />
            <Input label="Website" value={form.website} onChange={(e) => setField('website', e.target.value)} icon={Globe} placeholder="https://..." />
            <Input label="Google Maps URL" value={form.google_maps_url} onChange={(e) => setField('google_maps_url', e.target.value)} icon={MapPin} />

            <ChipGroup label="Cuisine Type" options={CUISINE_OPTIONS} selected={form.cuisine_type} onToggle={(v) => toggleListValue('cuisine_type', v)} />
            <ChipGroup label="Service Type" options={SERVICE_TYPE_OPTIONS} selected={form.service_type} onToggle={(v) => toggleListValue('service_type', v)} />
            <ChipGroup label="Restaurant Type" options={RESTAURANT_TYPE_OPTIONS} selected={form.restaurant_type} onToggle={(v) => toggleListValue('restaurant_type', v)} />

            <div className="flex justify-end">
                <Button variant="primary" loading={saving} onClick={save} disabled={!isDirty}>
                    {saving ? 'Saving…' : isDirty ? 'Save Changes' : <><Check size={14} /> Saved</>}
                </Button>
            </div>
        </div>
    );
}