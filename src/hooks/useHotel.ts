'use client';

import { useApp } from "../context/AppContext";
import type { HotelRow } from "../types/supabase";


export interface useHotelReturn {
    hotel: HotelRow | null;
    hasHotel: boolean;
    menuUrl: string | null;
    refreshHotel: () => Promise<void>;
}

export function useHotel(): useHotelReturn {
    const { hotel, refreshHotel } = useApp();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
    const menuUrl = hotel?.slug ? `${appUrl}/menu/${hotel.slug}` : null;

    return {
        hotel,
        hasHotel: hotel !== null,
        menuUrl,
        refreshHotel
    };
}
