import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { PricingSection } from './components/PricingSection';
import { AboutSection } from './components/AboutSection';
import { StatsSection } from './components/StatsSection';
import { CTASection } from './components/CTASection';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <PricingSection />
        <AboutSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
