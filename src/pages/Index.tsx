import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ShopBySize from "@/components/ShopBySize";
import BundlesSection from "@/components/BundlesSection";
import ShopByImage from "@/components/ShopByImage";
import PriceCalculator from "@/components/PriceCalculator";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Portrilux",
  description:
    "Museum-grade metal & acrylic prints. Custom sizes from 8×10 to 48×96. Handcrafted in the USA with 48-72 hour delivery.",
  url: "https://portrilux.com",
  priceRange: "$18 - $785",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "2000",
  },
};

const Index = () => {
  return (
    <div id="top" className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <ShopBySize />
        <BundlesSection />
        <ShopByImage />
        <PriceCalculator />
        <Testimonials />
        <FAQ />
        <FinalCTA />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
