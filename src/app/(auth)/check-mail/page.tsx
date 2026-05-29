import EmailSentPage from "../../../features/authentication/pages/EmailSentPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Check Mail | Scanify",
  description: "Email Sent to your mail box.",
};

export default function CheckMail() {
  return <EmailSentPage />;
}
