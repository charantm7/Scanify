import { useState } from 'react';
import type { SettingsTabId } from './types';
import { SettingsTabs } from './components/SettingsTabs';
import { ProfileSettings } from './components/ProfileSettings';
import { PasswordSettings } from './components/PasswordSettings';
import { RestaurantSettings } from './components/RestaurantSettings';
import { OperatingHoursSettings } from './components/OperatingHoursSettings';
import { DangerZoneSettings } from './components/DangerZoneSettings';

export default function SettingsPanel() {
    const [tab, setTab] = useState<SettingsTabId>('profile');

    return (
        <div className="space-y-5">
            <div>
                <h1 className="font-syne font-bold text-2xl text-theme">Settings</h1>
                <p className="text-sm text-theme2 mt-0.5">Manage your account and restaurant details</p>
            </div>

            <SettingsTabs active={tab} onChange={setTab} />

            {tab === 'profile' && (
                <div className="space-y-6">
                    <ProfileSettings />
                    <PasswordSettings />
                </div>
            )}
            {tab === 'restaurant' && <RestaurantSettings />}
            {tab === 'hours' && <OperatingHoursSettings />}
            {tab === 'danger' && <DangerZoneSettings />}
        </div>
    );
}