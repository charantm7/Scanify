import AuthPanelPage from "../../../features/authentication/pages/AuthPanelPage";
import { getLoginReasonMessage } from "../../../features/authentication/components/LoginFailReason";
import { LoginNoticeModal } from "../../../features/authentication/components/LoginNoticeModal";
import "../../style/globals.css"

export const metadata = {
    title: "Login | Scanify",
    description: "Get Started with Scanify",
};

type SearchParams = Promise<{
    reason?: string;
    next?: string;
}>;

export default async function Authentication({ searchParams }: { searchParams: SearchParams }) {

    const params = await searchParams;

    const reasonMessage = getLoginReasonMessage(params.reason ?? null);

    return (
        <div>
            {reasonMessage && (
                <LoginNoticeModal
                    key={params.reason}
                    reason={params.reason}
                    title={reasonMessage.title}
                    body={reasonMessage.body}
                    tone={reasonMessage.tone}
                />
            )}
            <AuthPanelPage />
        </div>
    );
}