import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="py-24 md:py-32 px-6 bg-secondary/30">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-primary font-body mb-4">
          Ready to Start?
        </p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
          Transform Your Photos <br className="hidden sm:block" />
          <span className="text-gradient-gold italic">Into Art</span>
        </h2>
        <p className="text-foreground/50 font-body mb-10 max-w-lg mx-auto leading-relaxed">
          Upload any photo, choose your size, and receive a handcrafted
          museum-grade print delivered to your door. Free shipping on orders
          over $150.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            className="bg-gradient-gold text-primary-foreground font-body font-semibold tracking-wider hover:opacity-90 px-10 h-14 text-sm gap-2"
            onClick={() =>
              document
                .getElementById("shop-by-size")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            START YOUR ORDER <ArrowRight className="w-4 h-4" />
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
            GET A CUSTOM QUOTE
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
