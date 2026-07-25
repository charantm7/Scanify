import type { SupabaseClient } from '@supabase/supabase-js';
import type { RestaurantFormData, OperatingHoursFormData } from '../types';

export const settingsService = {
    async updateUserName(supabase: SupabaseClient, userId: string, name: string) {
        const { error } = await supabase.from('users').update({ name }).eq('id', userId);
        if (error) throw error;
    },

    async updateEmail(supabase: SupabaseClient, email: string) {
        const { error } = await supabase.auth.updateUser({ email });
        if (error) throw error;
    },

    async verifyCurrentPassword(supabase: SupabaseClient, email: string, currentPassword: string) {
        const { error } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
        if (error) throw new Error('Current password is incorrect');
    },

    async updatePassword(supabase: SupabaseClient, newPassword: string) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
    },

    async updateRestaurant(supabase: SupabaseClient, hotelId: string, data: Partial<RestaurantFormData>) {
        const payload = {
            name: data.name?.trim(),
            description: data.description?.trim() || null,
            logo_url: data.logo_url?.trim() || null,
            address: data.address?.trim() || null,
            phone: data.phone?.trim() || null,
            website: data.website?.trim() || null,
            google_maps_url: data.google_maps_url?.trim() || null,
            cuisine_type: data.cuisine_type,
            service_type: data.service_type,
            restaurant_type: data.restaurant_type,
        };
        const { error } = await supabase.from('hotels').update(payload).eq('id', hotelId);
        if (error) throw error;
    },

    async updateOperatingHours(supabase: SupabaseClient, hotelId: string, data: OperatingHoursFormData) {
        const { error } = await supabase
            .from('hotels')
            .update({
                is_open: data.is_open,
                open_time: data.open_time,
                close_time: data.close_time,
            })
            .eq('id', hotelId);
        if (error) throw error;
    },

    async deactivateRestaurant(supabase: SupabaseClient, hotelId: string) {
        const { error } = await supabase.from('hotels').update({ is_active: false }).eq('id', hotelId);
        if (error) throw error;
    },

    async reactivateRestaurant(supabase: SupabaseClient, hotelId: string) {
        const { error } = await supabase.from('hotels').update({ is_active: true }).eq('id', hotelId);
        if (error) throw error;
    },

    async softDeleteRestaurant(supabase: SupabaseClient, hotelId: string) {
        const { error } = await supabase
            .from('hotels')
            .update({ is_active: false, deleted_at: new Date().toISOString() })
            .eq('id', hotelId);
        if (error) throw error;
    },
};