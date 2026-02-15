import { bundles, type Bundle } from "@/lib/pricing";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Percent } from "lucide-react";

const BundleCard = ({ bundle }: { bundle: Bundle }) => {
  const totalPrints = bundle.prints.reduce((sum, p) => sum + p.qty, 0);
  const sizeSummary = bundle.prints
    .map((p) => `${p.qty > 1 ? `${p.qty}×` : ""}${p.w}"×${p.h}"`)
    .join(" + ");

  return (
    <Card className="bg-card border-border hover:border-primary/40 transition-all group overflow-hidden">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div className="flex gap-2">
            {bundle.tag && (
              <Badge
                variant="secondary"
                className="bg-primary/15 text-primary border-primary/20 text-[10px] uppercase tracking-wider"
              >
                {bundle.tag}
              </Badge>
            )}
            <Badge
              variant="outline"
              className="border-primary/30 text-primary text-[10px] uppercase tracking-wider"
            >
              <Percent className="w-3 h-3 mr-1" />
              {bundle.discount} off
            </Badge>
          </div>
        </div>

        <h3 className="text-xl font-display font-semibold text-foreground mb-1">
          {bundle.name}
        </h3>
        <p className="text-sm text-muted-foreground font-body mb-1">
          {bundle.description}
        </p>
        <p className="text-xs text-muted-foreground/70 font-body mb-4">
          {totalPrints} print{totalPrints > 1 ? "s" : ""} — {sizeSummary}
        </p>

        <div className="mt-auto flex items-end justify-between">
          <div>
            <span className="text-2xl font-display font-bold text-gradient-gold">
              ${bundle.salePrice}
            </span>
            <span className="text-sm text-muted-foreground font-body line-through ml-2">
              ${bundle.originalPrice}
            </span>
          </div>
          <Button
            size="sm"
            className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90"
          >
            Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const BundlesSection = () => {
  return (
    <section id="bundles" className="py-24 px-6 bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm tracking-[0.3em] uppercase text-primary font-body">
            Shop by Bundle
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-3 text-foreground">
            Wall-Ready Bundles
          </h2>
          <p className="text-muted-foreground font-body mt-4 max-w-xl mx-auto">
            Save up to 31% with curated multi-print bundles. Each set ships
            ready to hang with free shipping on orders over $150.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((bundle) => (
            <BundleCard key={bundle.id} bundle={bundle} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BundlesSection;
