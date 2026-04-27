import Benefits from "@/components/home/Benefits";
import Footer from "@/components/home/Footer";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import Navbar from "@/components/home/Navbar";
import Pricing from "@/components/home/Pricing";
import WhySwitch from "@/components/home/WhySwitch";

export const metadata = {
  title: "Scanify",
  description: "Replace printed menus with a smart digital solution. Customers scan a QR code and instantly browse your full menu — contactless, fast, and always up to date.",
};

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Benefits />
      <Pricing />
      <WhySwitch />
      <Footer />
    </>
  )
}
