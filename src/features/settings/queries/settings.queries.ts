import type { SupabaseClient } from '@supabase/supabase-js';

export const settingsQueries = {
    async getHotelSettings(supabase: SupabaseClient, hotelId: string) {
        const { data, error } = await supabase
            .from('hotels')
            .select('name, description, logo_url, address, phone, website, google_maps_url, cuisine_type, service_type, restaurant_type, is_open, open_time, close_time, is_active')
            .eq('id', hotelId)
            .single();
        if (error) throw error;
        return data;
    },
};