import ScrollButtons from "@/components/utils/ScrollButtons";
import "../style/globals.css";



export default async function UtilsLayout({ children }) {

    return (
        <>
            <ScrollButtons />
            {children}
        </>

    );
}