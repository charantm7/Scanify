import "../style/globals.css";

export const metadata = {
    title: "Scanify | Console",
    description: "Replace printed menus with a smart digital solution. Customers scan a QR code and instantly browse your full menu — contactless, fast, and always up to date.",
};

export default async function ConsoleLayout({ children }) {

    return (
        <>
            {children}
        </>

    );
}