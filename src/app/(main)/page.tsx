import Benefits from "../../components/home/Benefits";
import Footer from "../../components/home/Footer";
import Hero from "../../components/home/Hero";
import HowItWorks from "../../components/home/HowItWorks";
import Pricing from "../../components/home/Pricing";
import WhySwitch from "../../components/home/WhySwitch";
import ContactPage from "../../components/home/Contact";
import { AppProvider } from "../../context/AppContext";
import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import CTASection from "../../components/home/CTAsection";

export const metadata = {
  title: "Scanify",
  description: "Replace printed menus with a smart digital solution. Customers scan a QR code and instantly browse your full menu — contactless, fast, and always up to date.",
};

export default async function Home() {
  const supabase = await createClient();

  const { data: { session }, } = await supabase.auth.getSession();


  if (session) {
    redirect('/onboarding')
  }

  return (
    <AppProvider>
      <HomeInner />
    </AppProvider>
  )
}

function HomeInner() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Benefits />
      <Pricing />
      <CTASection />
      <WhySwitch />
      <ContactPage />
      <Footer />
    </>
  )
}
