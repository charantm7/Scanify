import type { TypedSupabaseClient, OrderRow, OrderItemsRow } from "../../types/supabase";



export async function getOrders(
    supabase: TypedSupabaseClient,
    hotelId: string,
    since: Date
): Promise<OrderRow[] | null> {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('hotel_id', hotelId)
        .gte('created_at', since.toISOString())

    if (error) throw new Error(`getOrder: ${error?.message}`);

    return data ?? [];

}

// Fetch order items


export async function getOrderItems(
    supabase: TypedSupabaseClient,
    orders: OrderRow[]
) {
    const { data, error } = await supabase
        .from('order_items')
        .select('menu_item_id, quantity, order_id')
        .in('order_id', orders.map(o => o.id));

    if (error) throw new Error(`getOrderItems: ${error?.message}`);

    return data ?? [];
}

