'use client';

import { useCallback, useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import type { QrCodeRow, QrCodeInsert } from "../types/supabase";
import { getQrCodes, createQrCode, deleteQrCode } from "../lib/queries/qr";


export function useQrCodes() {
    const { hotel, supabase, maxQrCodes } = useApp();

    const [qrCodes, setQrCodes] = useState<QrCodeRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        if (!hotel?.id) { setLoading(false); return; }
        let cancelled = false;

        async function load() {
            try {
                const data = await getQrCodes(supabase, hotel?.id);
                if (!cancelled) setQrCodes(data);
            } catch (err) {
                if (!cancelled) setError((err as Error).message)
            } finally {
                if (!cancelled) setLoading(false);
            }

        }
        load();
        return () => { cancelled = true }

    }, [hotel?.id])

    const isUnlimited = maxQrCodes === -1;
    const isAtQrLimit = !isUnlimited && qrCodes.length >= maxQrCodes;
    const canAddQrCode = !isAtQrLimit;

    // Mutations

    const addQrCode = useCallback(async (payload: QrCodeInsert, hotelId: string) => {
        if (!hotel?.id) return;
        if (isAtQrLimit) throw new Error(`Plan limit Reached: max ${maxQrCodes} Qr Codes`);

        const row = await createQrCode(supabase, { ...payload, hotel_id: hotel.id })

        setQrCodes(prev => [row, ...prev]);
        return row;

    }, [hotel?.id, supabase, isAtQrLimit, maxQrCodes])


    const removeQrcode = useCallback(async (qrId: string) => {

        // Optimistic removal
        setQrCodes(prev => prev.filter(q => q.id !== qrId))

        try {
            await deleteQrCode(supabase, qrId);
        } catch (err) {
            if (hotel?.id) {
                const data = await getQrCodes(supabase, hotel.id);
                setQrCodes(data);
            }
            throw err;
        }
    }, [hotel?.id, supabase])

    return {
        qrCodes,
        loading,
        error,
        isAtQrLimit,
        canAddQrCode,
        maxQrCodes,
        addQrCode,
        removeQrcode,
    }

}