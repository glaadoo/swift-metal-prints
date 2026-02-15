import { standardSizes, calcMetalPrice, metalOptions } from "@/lib/pricing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const ShopBySize = () => {
  const scrollToCalculator = (sizeIdx: number) => {
    const el = document.querySelector("#calculator");
    el?.scrollIntoView({ behavior: "smooth" });
    // Dispatch custom event so calculator can pick up the size
    window.dispatchEvent(
      new CustomEvent("select-size", { detail: { sizeIdx } })
    );
  };

  return (
    <section id="shop-by-size" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm tracking-[0.3em] uppercase text-primary font-body">
            Shop by Size
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-3 text-foreground">
            Find Your Perfect Size
          </h2>
          <p className="text-muted-foreground font-body mt-4 max-w-xl mx-auto">
            Browse all available sizes with instant pricing. Click any size to
            customize in our calculator.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {standardSizes.map((size, idx) => {
            const price = calcMetalPrice(size.w, size.h, metalOptions[0]);
            return (
              <Card
                key={size.label}
                className="bg-card border-border hover:border-primary/50 transition-all group cursor-pointer p-5 text-center"
                onClick={() => scrollToCalculator(idx)}
              >
                <p className="text-lg font-display font-bold text-foreground mb-1">
                  {size.label}
                </p>
                <p className="text-xs text-muted-foreground font-body mb-3">
                  {size.w * size.h} sq in
                </p>
                <p className="text-xl font-display font-bold text-primary">
                  ${price}
                </p>
                <p className="text-[10px] text-muted-foreground font-body mt-1">
                  from (.040" SS)
                </p>
                <div className="mt-3 flex items-center justify-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity font-body">
                  Customize <ArrowRight className="w-3 h-3" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ShopBySize;
