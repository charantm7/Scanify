import ScrollButtons from "../../components/shared/ScrollButtons";
import "../style/globals.css";



export default async function UtilsLayout({ children }) {

    return (
        <>
            <ScrollButtons />
            {children}
        </>

    );
}