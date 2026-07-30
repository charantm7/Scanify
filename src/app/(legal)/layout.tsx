import ScrollButtons from "../../components/shared/ScrollButtons";
import "../style/globals.css";
import "../style/utils.css";

export default async function LegalLayout({ children }) {

    return (
        <>
            <ScrollButtons />
            {children}
        </>

    );
}