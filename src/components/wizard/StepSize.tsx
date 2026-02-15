import { useState } from "react";
import { standardSizes, calcMetalPrice, calcAcrylicPrice, metalOptions } from "@/lib/pricing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, RectangleHorizontal, RectangleVertical, Sparkles, Shield, Gem, Check, RotateCw } from "lucide-react";
import roomBackdrop from "@/assets/room-backdrop.jpg";
import acrylicImg from "@/assets/acrylic-print.jpg";
import metalImg from "@/assets/metal-print.jpg";
import type { MaterialChoice } from "./types";

interface Props {
  imageUrl: string;
  sizeIdx: number;
  material: MaterialChoice;
  onSelect: (idx: number) => void;
  onSelectMaterial: (m: MaterialChoice) => void;
  onNext: () => void;
  onBack: () => void;
}

const materialOptions: { id: MaterialChoice; label: string; subtitle: string; img: string; icon: React.ReactNode }[] = [
  { id: "acrylic", label: "Acrylic", subtitle: "Vivid & Luminous", img: acrylicImg, icon: <Sparkles className="w-4 h-4" /> },
  { id: "metal-designer", label: "Metal Designer", subtitle: '.040" Lightweight', img: metalImg, icon: <Gem className="w-4 h-4" /> },
  { id: "metal-museum", label: "Metal Museum", subtitle: '.080" Heirloom', img: metalImg, icon: <Shield className="w-4 h-4" /> },
];

// Group sizes for visual comparison
const sizeGroups = [
  { label: "Desk & Shelf", range: [0, 4] as const },
  { label: "Wall Art", range: [4, 10] as const },
  { label: "Statement Pieces", range: [10, 16] as const },
  { label: "Grand Scale", range: [16, 21] as const },
];

// The backdrop represents roughly a 120" wide wall.
// The couch sits at ~62% from top in the image, so prints must stay above that.
const WALL_WIDTH_IN = 120;

const StepSize = ({ imageUrl, sizeIdx, material, onSelect, onSelectMaterial, onNext, onBack }: Props) => {
  const selected = standardSizes[sizeIdx];
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");

  // Apply orientation: swap w/h for portrait when w > h (or vice versa)
  const isSquare = selected.w === selected.h;
  const displayW = orientation === "portrait" ? Math.min(selected.w, selected.h) : Math.max(selected.w, selected.h);
  const displayH = orientation === "portrait" ? Math.max(selected.w, selected.h) : Math.min(selected.w, selected.h);

  // Print width as % of wall; height derived from aspect ratio
  const printWidthPct = Math.max((displayW / WALL_WIDTH_IN) * 100, 8);
  // The couch top is at ~60% of the image. Keep print bottom above 58%.
  const maxBottomPct = 58;
  // Center print vertically in the wall area (top 0% to 58%)
  const wallAreaPct = maxBottomPct;
  // Print height as % of container (approximate: container is 16:9 so height = width * 9/16 of container)
  // Use aspect ratio to calculate height from width
  const printHeightPct = printWidthPct * (displayH / displayW) * (16 / 9);
  const clampedHeightPct = Math.min(printHeightPct, wallAreaPct - 4);
  const topPct = Math.max(2, (wallAreaPct - clampedHeightPct) / 2);

  const displayLabel = isSquare
    ? selected.label
    : orientation === "portrait"
      ? `${Math.min(selected.w, selected.h)}"×${Math.max(selected.w, selected.h)}"`
      : `${Math.max(selected.w, selected.h)}"×${Math.min(selected.w, selected.h)}"`;

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
              width: `${printWidthPct}%`,
              aspectRatio: `${displayW} / ${displayH}`,
              maxHeight: `${maxBottomPct - 4}%`,
              top: `${topPct}%`,
            }}
          >
            <img src={imageUrl} alt="Print preview" className="w-full h-full object-cover" />
          </div>
          {/* Size label + orientation toggle */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
            {!isSquare && (
              <div className="flex bg-card/80 backdrop-blur-sm border border-border rounded overflow-hidden">
                <button
                  onClick={() => setOrientation("landscape")}
                  className={`p-1 transition-colors ${orientation === "landscape" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  title="Landscape"
                >
                  <RectangleHorizontal className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setOrientation("portrait")}
                  className={`p-1 transition-colors ${orientation === "portrait" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  title="Portrait"
                >
                  <RectangleVertical className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded px-2 py-0.5">
              <span className="text-xs font-body text-primary font-semibold">{displayLabel}</span>
              <span className="text-[9px] text-muted-foreground font-body ml-1">{selected.w * selected.h} sq in</span>
            </div>
          </div>
        </div>
      </div>

      {/* Material selection */}
      <div>
        <h3 className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-primary mb-1.5">
          Choose Your Medium
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {materialOptions.map((mat) => {
            const isSelected = material === mat.id;
            const size = standardSizes[sizeIdx];
            const price = mat.id === "acrylic"
              ? calcAcrylicPrice(size.w, size.h)
              : mat.id === "metal-designer"
                ? calcMetalPrice(size.w, size.h, metalOptions[0])
                : calcMetalPrice(size.w, size.h, metalOptions[2]);
            return (
              <Card
                key={mat.id}
                className={`overflow-hidden cursor-pointer transition-all duration-200 ${
                  isSelected ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/40"
                }`}
                onClick={() => onSelectMaterial(mat.id)}
              >
                <div className="aspect-[16/9] relative overflow-hidden">
                  <img src={mat.img} alt={mat.label} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  {mat.id.startsWith("metal") && (
                    <div className="absolute bottom-1 left-1">
                      <Badge className="bg-card/80 backdrop-blur-sm text-foreground border-0 font-body text-[8px] gap-0.5 px-1 py-0">
                        <RotateCw className="w-2.5 h-2.5" /> 2-sided
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-2 text-center">
                  <div className="flex items-center justify-center gap-1 text-primary">
                    {mat.icon}
                    <span className="text-xs font-display font-bold text-foreground">{mat.label}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground font-body">{mat.subtitle}</p>
                  <p className="text-sm font-display font-bold text-gradient-gold mt-0.5">${price}</p>
                </div>
              </Card>
            );
          })}
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
          {material.startsWith("metal") ? "Personalize" : "Finishing"} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default StepSize;
