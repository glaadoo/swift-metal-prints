import { standardSizes, calcMetalPrice, metalOptions } from "@/lib/pricing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import roomBackdrop from "@/assets/room-backdrop.jpg";

interface Props {
  imageUrl: string;
  sizeIdx: number;
  onSelect: (idx: number) => void;
  onNext: () => void;
  onBack: () => void;
}

// Group sizes for visual comparison
const sizeGroups = [
  { label: "Desk & Shelf", range: [0, 4] as const },
  { label: "Wall Art", range: [4, 10] as const },
  { label: "Statement Pieces", range: [10, 16] as const },
  { label: "Grand Scale", range: [16, 21] as const },
];

// The backdrop represents roughly a 120" wide × 80" tall wall view
const WALL_WIDTH_IN = 120;
const WALL_HEIGHT_IN = 80;

const StepSize = ({ imageUrl, sizeIdx, onSelect, onNext, onBack }: Props) => {
  const selected = standardSizes[sizeIdx];

  // Calculate print size as percentage of the wall
  const printWidthPct = (selected.w / WALL_WIDTH_IN) * 100;
  const printHeightPct = (selected.h / WALL_HEIGHT_IN) * 100;

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Choose Your Size
        </h2>
        <p className="text-muted-foreground font-body mt-2 tracking-wide text-sm">
          Tap any size to preview your art at real-world scale.
        </p>
      </div>

      {/* Room mockup preview */}
      <div className="flex justify-center">
        <div className="relative w-full overflow-hidden rounded-lg border border-border" style={{ maxWidth: 520, aspectRatio: "16/9" }}>
          <img
            src={roomBackdrop}
            alt="Room scene"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Print overlay — centered on wall above couch */}
          <div
            className="absolute left-1/2 -translate-x-1/2 shadow-2xl transition-all duration-500 ease-out overflow-hidden"
            style={{
              width: `${Math.max(printWidthPct, 8)}%`,
              height: `${Math.max(printHeightPct, 8)}%`,
              top: `${Math.max(5, 35 - printHeightPct / 2)}%`,
            }}
          >
            <img src={imageUrl} alt="Print preview" className="w-full h-full object-cover" />
          </div>
          {/* Size label badge */}
          <div className="absolute bottom-2 right-2 bg-card/80 backdrop-blur-sm border border-border rounded px-2 py-0.5">
            <span className="text-xs font-body text-primary font-semibold">{selected.label}</span>
            <span className="text-[9px] text-muted-foreground font-body ml-1">{selected.w * selected.h} sq in</span>
          </div>
        </div>
      </div>

      {/* Horizontal scrollable size rows */}
      {sizeGroups.map((group) => {
        const items = standardSizes.slice(group.range[0], group.range[1]);
        return (
          <div key={group.label}>
            <h3 className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-primary mb-1.5">
              {group.label}
            </h3>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {items.map((size, i) => {
                const idx = group.range[0] + i;
                const isSelected = idx === sizeIdx;
                const price = calcMetalPrice(size.w, size.h, metalOptions[0]);
                return (
                  <Card
                    key={idx}
                    className={`px-2.5 py-1.5 text-center cursor-pointer transition-all duration-200 shrink-0 ${
                      isSelected
                        ? "ring-2 ring-primary border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                    onClick={() => onSelect(idx)}
                  >
                    <p className="text-[11px] font-display font-bold text-foreground leading-tight whitespace-nowrap">{size.label}</p>
                    <p className="text-[10px] font-display font-bold text-primary">${price}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="font-body gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 gap-2">
          Choose Material <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default StepSize;
