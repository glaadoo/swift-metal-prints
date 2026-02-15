import { Button } from "@/components/ui/button";
import { Star, Shield, Truck } from "lucide-react";
import heroImg from "@/assets/hero-lifestyle.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-end pb-20 md:pb-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Luxury metal print displayed in modern living room"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-2xl">
          {/* Trust badge */}
          <div className="flex items-center gap-1.5 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-primary text-primary" />
            ))}
            <span className="text-sm font-body text-foreground/80 ml-2">
              Rated 4.8 by 2,000+ customers
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.05] mb-6">
            <span className="text-foreground">Your Photos,</span>
            <br />
            <span className="text-gradient-gold italic">Immortalized</span>
            <br />
            <span className="text-foreground">in Metal</span>
          </h1>

          <p className="text-base md:text-lg text-foreground/60 font-body font-light max-w-lg mb-8 leading-relaxed">
            Museum-grade metal & acrylic prints that transform your cherished
            memories into stunning wall art. Handcrafted in the USA.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Button
              size="lg"
              className="bg-gradient-gold text-primary-foreground font-body font-semibold tracking-wider hover:opacity-90 px-10 h-14 text-sm"
              onClick={() =>
                document
                  .getElementById("shop-by-size")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              SHOP NOW
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-foreground/20 text-foreground font-body tracking-wider hover:bg-foreground/5 px-10 h-14 text-sm"
              onClick={() =>
                document
                  .getElementById("calculator")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              CUSTOM QUOTE
            </Button>
          </div>

          {/* Value props */}
          <div className="flex flex-wrap gap-6 text-xs font-body text-foreground/50 uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              Free Shipping $150+
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Lifetime Guarantee
            </span>
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Made in USA
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
