import { SubscriptionRow } from "../../../types/supabase";
import { compareSubscription, PlanKey, BillingCycle } from "../lib/plans";

export type SubscriptionAction =
    | "new"
    | "upgrade"
    | "downgrade"
    | "same";

export interface SubscriptionDecision {
    action: SubscriptionAction;
    existingSubscription: SubscriptionRow | null;
}


export async function determineSubscriptionAction(existingSub: SubscriptionRow, newPlan: PlanKey, newBillingCycle: BillingCycle): Promise<SubscriptionDecision> {

    let response: SubscriptionDecision = { action: "new", existingSubscription: existingSub };

    const hasActiveSub = existingSub && existingSub.status === 'active';

    if (hasActiveSub) {

        const direction = compareSubscription(existingSub.plan as PlanKey, existingSub.billing_cycle, newPlan as PlanKey, newBillingCycle as BillingCycle)


        if (direction === 'downgrade') {
            response.action = 'downgrade'
        }

        else if (direction === 'upgrade') {
            response.action = 'upgrade'
        }
        else if (direction === 'same') {
            response.action = 'same'
        }

    }

    return response;

}