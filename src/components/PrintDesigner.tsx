import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  metalOptions,
  calcMetalPrice,
  calcAcrylicPrice,
  getShippingCost,
  addOns,
  standardSizes,
} from "@/lib/pricing";
import { Maximize2, Move, RotateCcw } from "lucide-react";

const WALL_WIDTH_IN = 120; // 10ft reference wall
const WALL_HEIGHT_IN = 96; // 8ft reference wall

const PrintDesigner = () => {
  const [material, setMaterial] = useState<"metal" | "acrylic">("metal");
  const [metalIdx, setMetalIdx] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(2); // default 16x20
  const [roundedCorners, setRoundedCorners] = useState(false);
  const [standOff, setStandOff] = useState<"none" | "silver" | "black">("none");
  const [standOffQty, setStandOffQty] = useState(4);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [offsetX, setOffsetX] = useState(50);
  const [offsetY, setOffsetY] = useState(40);

  const size = standardSizes[sizeIdx];
  const w = orientation === "portrait" ? size.w : size.h;
  const h = orientation === "portrait" ? size.h : size.w;

  const printPrice =
    material === "metal"
      ? calcMetalPrice(size.w, size.h, metalOptions[metalIdx])
      : calcAcrylicPrice(size.w, size.h);

  const shipping = getShippingCost(size.w, size.h);

  let addOnTotal = 0;
  if (roundedCorners) addOnTotal += addOns.roundedCorners;
  if (material === "acrylic" && standOff === "silver") addOnTotal += addOns.standOffSilver * standOffQty;
  if (material === "acrylic" && standOff === "black") addOnTotal += addOns.standOffBlack * standOffQty;

  const total = printPrice + shipping.cost + addOnTotal;

  // Calculate print dimensions relative to wall preview
  const printWidthPct = (w / WALL_WIDTH_IN) * 100;
  const printHeightPct = (h / WALL_HEIGHT_IN) * 100;

  const materialLabel = material === "metal" ? metalOptions[metalIdx].label : "Acrylic";

  return (
    <section id="designer" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm tracking-[0.3em] uppercase text-primary font-body">
            Design Studio
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-3 text-foreground">
            Interactive Designer
          </h2>
          <p className="text-muted-foreground font-body mt-4 max-w-xl mx-auto">
            Visualize your custom print on a wall to scale. Configure material, size, and add-ons.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Wall Preview — 3 cols */}
          <div className="lg:col-span-3">
            <Card className="bg-card border-border overflow-hidden">
              <CardContent className="p-0">
                {/* Wall mockup */}
                <div
                  className="relative w-full bg-[hsl(30,8%,30%)]"
                  style={{ aspectRatio: `${WALL_WIDTH_IN}/${WALL_HEIGHT_IN}` }}
                >
                  {/* Subtle wall texture */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `repeating-linear-gradient(
                      0deg, transparent, transparent 20px, hsl(30 8% 25%) 20px, hsl(30 8% 25%) 21px
                    ), repeating-linear-gradient(
                      90deg, transparent, transparent 20px, hsl(30 8% 25%) 20px, hsl(30 8% 25%) 21px
                    )`
                  }} />

                  {/* Scale ruler */}
                  <div className="absolute bottom-3 left-3 flex items-end gap-1">
                    <div className="w-[8.33%] border-b border-l border-r border-foreground/40 h-3" />
                    <span className="text-[10px] text-foreground/50 font-body">1 ft</span>
                  </div>

                  {/* Print on wall */}
                  <div
                    className="absolute transition-all duration-500 ease-out"
                    style={{
                      width: `${printWidthPct}%`,
                      height: `${printHeightPct}%`,
                      left: `${offsetX - printWidthPct / 2}%`,
                      top: `${offsetY - printHeightPct / 2}%`,
                    }}
                  >
                    {/* Shadow behind print */}
                    <div
                      className="absolute inset-0 translate-x-1 translate-y-1"
                      style={{
                        background: "rgba(0,0,0,0.4)",
                        filter: "blur(8px)",
                      }}
                    />

                    {/* The print itself */}
                    <div
                      className={`relative w-full h-full border transition-all duration-300 ${
                        roundedCorners ? "rounded-lg" : ""
                      } ${
                        material === "metal"
                          ? "bg-gradient-to-br from-[hsl(220,10%,55%)] via-[hsl(220,8%,70%)] to-[hsl(220,10%,50%)] border-[hsl(220,8%,60%)]"
                          : "bg-gradient-to-br from-[hsl(200,20%,80%)] via-[hsl(200,30%,90%)] to-[hsl(200,20%,75%)] border-[hsl(200,15%,70%)]"
                      }`}
                      style={{
                        boxShadow: material === "acrylic" && standOff !== "none"
                          ? "4px 4px 12px rgba(0,0,0,0.5)"
                          : "1px 1px 4px rgba(0,0,0,0.3)",
                      }}
                    >
                      {/* Sample image placeholder */}
                      <div className="absolute inset-2 flex items-center justify-center overflow-hidden">
                        <div className="text-center opacity-60">
                          <Maximize2 className="w-6 h-6 mx-auto mb-1 text-foreground/40" />
                          <p className="text-[10px] font-body text-foreground/40">
                            {w}" × {h}"
                          </p>
                        </div>
                      </div>

                      {/* Stand-off dots for acrylic */}
                      {material === "acrylic" && standOff !== "none" && (
                        <>
                          <div className={`absolute w-2 h-2 rounded-full top-2 left-2 ${
                            standOff === "silver" ? "bg-[hsl(0,0%,75%)]" : "bg-[hsl(0,0%,15%)]"
                          }`} />
                          <div className={`absolute w-2 h-2 rounded-full top-2 right-2 ${
                            standOff === "silver" ? "bg-[hsl(0,0%,75%)]" : "bg-[hsl(0,0%,15%)]"
                          }`} />
                          <div className={`absolute w-2 h-2 rounded-full bottom-2 left-2 ${
                            standOff === "silver" ? "bg-[hsl(0,0%,75%)]" : "bg-[hsl(0,0%,15%)]"
                          }`} />
                          <div className={`absolute w-2 h-2 rounded-full bottom-2 right-2 ${
                            standOff === "silver" ? "bg-[hsl(0,0%,75%)]" : "bg-[hsl(0,0%,15%)]"
                          }`} />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Position controls */}
                <div className="p-4 bg-secondary/50 border-t border-border space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                    <Move className="w-3 h-3" /> Adjust position on wall
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-body text-muted-foreground">Horizontal</Label>
                      <Slider
                        value={[offsetX]}
                        onValueChange={([v]) => setOffsetX(v)}
                        min={10}
                        max={90}
                        step={1}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-body text-muted-foreground">Vertical</Label>
                      <Slider
                        value={[offsetY]}
                        onValueChange={([v]) => setOffsetY(v)}
                        min={10}
                        max={90}
                        step={1}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls — 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* Material */}
            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-5">
                <div>
                  <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs mb-3 block">
                    Material
                  </Label>
                  <RadioGroup
                    value={material}
                    onValueChange={(v) => {
                      setMaterial(v as "metal" | "acrylic");
                      if (v === "metal") setStandOff("none");
                    }}
                    className="flex gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="metal" id="d-metal" />
                      <Label htmlFor="d-metal" className="font-body text-foreground cursor-pointer">Metal</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="acrylic" id="d-acrylic" />
                      <Label htmlFor="d-acrylic" className="font-body text-foreground cursor-pointer">Acrylic</Label>
                    </div>
                  </RadioGroup>
                </div>

                {material === "metal" && (
                  <div>
                    <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs mb-2 block">
                      Metal Type
                    </Label>
                    <Select value={String(metalIdx)} onValueChange={(v) => setMetalIdx(Number(v))}>
                      <SelectTrigger className="bg-secondary border-border text-foreground font-body">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {metalOptions.map((opt, i) => (
                          <SelectItem key={i} value={String(i)}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Size */}
                <div>
                  <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs mb-2 block">
                    Size
                  </Label>
                  <Select value={String(sizeIdx)} onValueChange={(v) => setSizeIdx(Number(v))}>
                    <SelectTrigger className="bg-secondary border-border text-foreground font-body">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {standardSizes.map((s, i) => (
                        <SelectItem key={i} value={String(i)}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Orientation */}
                <div>
                  <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs mb-2 block">
                    Orientation
                  </Label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOrientation("portrait")}
                      className={`flex items-center gap-2 px-4 py-2 rounded font-body text-sm border transition-colors ${
                        orientation === "portrait"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary text-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="w-3 h-4 border border-current rounded-sm" />
                      Portrait
                    </button>
                    <button
                      onClick={() => setOrientation("landscape")}
                      className={`flex items-center gap-2 px-4 py-2 rounded font-body text-sm border transition-colors ${
                        orientation === "landscape"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary text-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="w-4 h-3 border border-current rounded-sm" />
                      Landscape
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add-ons */}
            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-4">
                <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs block">
                  Add-Ons
                </Label>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="d-rounded"
                    checked={roundedCorners}
                    onCheckedChange={(v) => setRoundedCorners(!!v)}
                  />
                  <Label htmlFor="d-rounded" className="font-body text-foreground cursor-pointer">
                    Rounded Corners (+$5.00)
                  </Label>
                </div>

                {material === "acrylic" && (
                  <div>
                    <Label className="text-foreground font-body text-sm mb-2 block">
                      Stand-Off Mounting
                    </Label>
                    <RadioGroup
                      value={standOff}
                      onValueChange={(v) => setStandOff(v as "none" | "silver" | "black")}
                      className="flex flex-wrap gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="none" id="d-so-none" />
                        <Label htmlFor="d-so-none" className="font-body text-foreground cursor-pointer">None</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="silver" id="d-so-silver" />
                        <Label htmlFor="d-so-silver" className="font-body text-foreground cursor-pointer">
                          Silver ($2.50)
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="black" id="d-so-black" />
                        <Label htmlFor="d-so-black" className="font-body text-foreground cursor-pointer">
                          Black ($3.50)
                        </Label>
                      </div>
                    </RadioGroup>

                    {standOff !== "none" && (
                      <div className="mt-3">
                        <Label className="text-foreground font-body text-sm mb-1 block">
                          Stand-off quantity
                        </Label>
                        <Select value={String(standOffQty)} onValueChange={(v) => setStandOffQty(Number(v))}>
                          <SelectTrigger className="bg-secondary border-border text-foreground font-body w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[2, 4, 6, 8, 10, 12].map((n) => (
                              <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Price summary */}
            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-3">
                <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs block">
                  Price Summary
                </Label>

                <div className="flex justify-between font-body text-sm text-muted-foreground">
                  <span>{materialLabel} — {w}" × {h}"</span>
                  <span>${printPrice.toFixed(2)}</span>
                </div>

                {roundedCorners && (
                  <div className="flex justify-between font-body text-sm text-muted-foreground">
                    <span>Rounded Corners</span>
                    <span>${addOns.roundedCorners.toFixed(2)}</span>
                  </div>
                )}

                {material === "acrylic" && standOff !== "none" && (
                  <div className="flex justify-between font-body text-sm text-muted-foreground">
                    <span>Stand-Off ({standOff}) × {standOffQty}</span>
                    <span>
                      ${((standOff === "silver" ? addOns.standOffSilver : addOns.standOffBlack) * standOffQty).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between font-body text-sm text-muted-foreground">
                  <span>Shipping ({shipping.label})</span>
                  <span>
                    ${shipping.cost.toFixed(2)}
                    {shipping.note && <span className="text-xs ml-1">({shipping.note})</span>}
                  </span>
                </div>

                <div className="flex justify-between font-body text-lg font-bold text-foreground border-t border-border pt-3">
                  <span>Total</span>
                  <span className="text-gradient-gold">${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrintDesigner;
