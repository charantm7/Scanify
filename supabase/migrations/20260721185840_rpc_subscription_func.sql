create or replace function fulfill_subscription_payment(
    p_hotel_id uuid,
  p_user_id uuid,
  p_plan text,
  p_billing_cycle text,
  p_status text,
  p_current_period_start timestamptz,
  p_current_period_end timestamptz,
  p_needs_fresh_period boolean,
  p_last_payment_id text,
  p_provider_subscription_id text,
  p_now timestamptz
) returns void as $$
begin 
    if p_needs_fresh_period then 
        update subscriptions set
            plan = p_plan,
            billing_cycle = p_billing_cycle,
            status = p_status,
            current_period_start = p_current_period_start,
            current_period_end = p_current_period_end,
            pending_plan = null,
            pending_billing_cycle = null,
            last_payment_id = p_last_payment_id,
            provider_subscription_id = p_provider_subscription_id,
            cancel_at_period_end = false,
            updated_at = p_now
        where hotel_id = p_hotel_id;

    else
        update subscriptions set
            plan = p_plan,
            billing_cycle = p_billing_cycle,
            status = p_status,
            pending_plan = null,
            pending_billing_cycle = null,
            last_payment_id = p_last_payment_id,
            provider_subscription_id = p_provider_subscription_id,
            updated_at = p_now
        where hotel_id = p_hotel_id;
    end if;

    update users set plan = p_plan where id = p_user_id;
end;
$$ language plpgsql security definer;