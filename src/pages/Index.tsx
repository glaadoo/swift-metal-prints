import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductsSection from "@/components/ProductsSection";
import CardsSection from "@/components/CardsSection";
import ShopBySize from "@/components/ShopBySize";
import BundlesSection from "@/components/BundlesSection";
import ShopByImage from "@/components/ShopByImage";
import PrintDesigner from "@/components/PrintDesigner";
import PriceCalculator from "@/components/PriceCalculator";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div id="top" className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <ProductsSection />
      <ShopBySize />
      <BundlesSection />
      <ShopByImage />
      <CardsSection />
      <PrintDesigner />
      <PriceCalculator />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
