import AuthPanelPage from "../../../features/authentication/pages/AuthPanelPage";
import { Suspense } from "react";

export const metadata = {
    title: "Login | Scanify",
    description: "Get Started with Scanify",
};

export default function Authentication() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthPanelPage />
        </Suspense>
    );
}