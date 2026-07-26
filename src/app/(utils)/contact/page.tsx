import "../../style/utils.css"
import ContactPage from "../../../components/home/Contact";
import UtilsNavbar from "../../../components/utils/Navbar";

export const metadata = {
    title: "Contact | Scanify",
    description: "Get a Support from Scanify",
};


export default function Careers() {
    return (
        <>
            <UtilsNavbar />
            <ContactPage />
        </>
    )
}