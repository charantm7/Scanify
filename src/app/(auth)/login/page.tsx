import AuthPanelPage from "../../../features/authentication/pages/AuthPanelPage";
import { Suspense } from "react";
import "../../style/globals.css"

export const metadata = {
    title: "Login | Scanify",
    description: "Get Started with Scanify",
};

export default function Authentication() {
    return (

        <AuthPanelPage />
    );
}