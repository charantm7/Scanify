import EmailSent from "@/components/authentication/EmailSent";

export const metadata = {
  title: "Check Mail | Scanify",
  description: "Email Sent to your mail box.",
};

export default function CheckMail() {
  return <EmailSent />;
}
