import { useState, useRef, useCallback } from "react";
import { standardSizes, calcMetalPrice, calcAcrylicPrice, metalOptions } from "@/lib/pricing";
import { Image as ImageIcon, Upload, Check, ArrowRight, Sparkles, Shield, Gem, AlertTriangle, Ruler, RotateCw, ZoomIn, ZoomOut, Move, Plus, RectangleHorizontal, RectangleVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import couchWall from "@/assets/couch-wall.jpg";
import shelfBackdrop from "@/assets/shelf-backdrop.jpg";
import acrylicImg from "@/assets/acrylic-print.jpg";
import metalImg from "@/assets/metal-print.jpg";
import metalMuseumImg from "@/assets/metal-museum-print.jpg";
import cornerLuxMetal from "@/assets/corner-lux-metal.jpg";
import cornerDesignerMetal from "@/assets/corner-designer-metal.jpg";
import cornerAcrylic from "@/assets/corner-acrylic.jpg";
import type { MaterialChoice, AdditionalPrint, SelectedImage } from "./types";
import { CUSTOM_SIZE_IDX } from "./types";
import ImagePickerModal from "./ImagePickerModal";

interface Props {
  imageUrl: string;
  sizeIdx: number;
  customWidth: number;
  customHeight: number;
  quantity: number;
  material: MaterialChoice;
  additionalPrints: AdditionalPrint[];
  imageNaturalWidth: number;
  imageNaturalHeight: number;
  rotation: number;
  zoom: number;
  panX: number;
  panY: number;
  onSelect: (idx: number) => void;
  onCustomSize: (w: number, h: number) => void;
  onQuantity: (q: number) => void;
  onAdditionalPrints: (ap: AdditionalPrint[]) => void;
  onSelectMaterial: (m: MaterialChoice) => void;
  onRotate: (r: number) => void;
  onZoom: (z: number) => void;
  onPan: (x: number, y: number) => void;
  onUpload: (dataUrl: string, width: number, height: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const materialOpts: {
  id: MaterialChoice;
  label: string;
  subtitle: string;
  img: string;
  cornerImg: string;
  icon: React.ReactNode;
  benefits: string[];
  badge?: string;
}[] = [
  {
    id: "metal-designer",
    label: "Lux Metal",
    subtitle: '.040" Lightweight',
    img: metalImg,
    cornerImg: cornerLuxMetal,
    icon: <Gem className="w-3.5 h-3.5" />,
    benefits: ["Vibrant HD color", "Scratch-resistant", "Easy to hang"],
    badge: "Most Popular",
  },
  {
    id: "metal-museum",
    label: "Museum Metal",
    subtitle: '.080" Heirloom Grade',
    img: metalMuseumImg,
    cornerImg: cornerDesignerMetal,
    icon: <Shield className="w-3.5 h-3.5" />,
    benefits: ["2× thicker panel", "Zero warp guarantee", "Archival pigments"],
    badge: "Best Quality",
  },
  {
    id: "acrylic",
    label: "Acrylic",
    subtitle: "Vivid & Luminous",
    img: acrylicImg,
    cornerImg: cornerAcrylic,
    icon: <Sparkles className="w-3.5 h-3.5" />,
    benefits: ["Glass-like depth", "Backlit glow effect", "Ultra-modern look"],
  },
];

const sizeGroups = [
  { label: "Desk & Shelf", sizes: [0, 1, 2, 3, 4] },
  { label: "Wall Art", sizes: [4, 5, 6, 7, 8, 9] },
  { label: "Statement", sizes: [10, 11, 12, 13, 14] },
  { label: "Grand Scale", sizes: [15, 16, 17, 18, 19, 20] },
];

const DESK_SHELF_MAX_IDX = 4;

const buildTransform = (z: number, px: number, py: number, rot: number, aspect: number) => {
  const isRotated = rot % 180 !== 0;
  const rotScale = isRotated && aspect !== 1 ? Math.min(aspect, 1 / aspect) : 1;
  return `scale(${z * rotScale}) translate(${px / z}px, ${py / z}px) rotate(${rot}deg)`;
};

const StepSize = ({
  imageUrl, sizeIdx, customWidth, customHeight, quantity, material,
  additionalPrints, imageNaturalWidth, imageNaturalHeight,
  rotation, zoom, panX, panY,
  onSelect, onCustomSize, onQuantity, onAdditionalPrints, onSelectMaterial,
  onRotate, onZoom, onPan, onUpload, onNext,
}: Props) => {
  const isCustom = sizeIdx === CUSTOM_SIZE_IDX;
  const selected = isCustom
    ? { label: `${customWidth}"×${customHeight}"`, w: customWidth, h: customHeight }
    : standardSizes[sizeIdx];

  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [activePrintIdx, setActivePrintIdx] = useState(0);
  const [activeGroup, setActiveGroup] = useState(0);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const isSquare = selected.w === selected.h;
  const displayW = orientation === "portrait" ? Math.min(selected.w, selected.h) : Math.max(selected.w, selected.h);
  const displayH = orientation === "portrait" ? Math.max(selected.w, selected.h) : Math.min(selected.w, selected.h);
  const printAspect = displayW / displayH;
  const isDesk = !isCustom && sizeIdx >= 0 && sizeIdx < DESK_SHELF_MAX_IDX;
  const hasImage = !!imageUrl;

  // DPI / quality check
  const requiredPxW = displayW * 300;
  const requiredPxH = displayH * 300;
  const hasImageDimensions = imageNaturalWidth > 0 && imageNaturalHeight > 0;
  const isLowQuality = hasImageDimensions && (imageNaturalWidth < requiredPxW * 0.75 || imageNaturalHeight < requiredPxH * 0.75);
  const effectiveDpi = hasImageDimensions ? Math.min(Math.round(imageNaturalWidth / displayW), Math.round(imageNaturalHeight / displayH)) : 0;

  // Price helpers
  const unitPrice = (mat: MaterialChoice, w: number, h: number) => {
    if (mat === "acrylic") return calcAcrylicPrice(w, h);
    if (mat === "metal-designer") return calcMetalPrice(w, h, metalOptions[0]);
    return calcMetalPrice(w, h, metalOptions[2]);
  };
  const startingPrice = (w: number, h: number) => Math.min(
    calcMetalPrice(w, h, metalOptions[0]),
    calcAcrylicPrice(w, h)
  );

  const currentUnitPrice = unitPrice(material, selected.w, selected.h);
  const totalPrice = currentUnitPrice * quantity;

  // Pointer drag for image panning
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    const curPanX = activePrintIdx === 0 ? panX : (additionalPrints[activePrintIdx - 1]?.panX ?? 0);
    const curPanY = activePrintIdx === 0 ? panY : (additionalPrints[activePrintIdx - 1]?.panY ?? 0);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: curPanX, panY: curPanY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [panX, panY, activePrintIdx, additionalPrints]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const curZoom = activePrintIdx === 0 ? zoom : (additionalPrints[activePrintIdx - 1]?.zoom ?? 1);
    const maxPan = (curZoom - 1) * 50;
    const newX = Math.max(-maxPan, Math.min(maxPan, dragStart.current.panX + dx));
    const newY = Math.max(-maxPan, Math.min(maxPan, dragStart.current.panY + dy));
    if (activePrintIdx === 0) {
      onPan(newX, newY);
    } else {
      const updated = [...additionalPrints];
      const i = activePrintIdx - 1;
      if (updated[i]) { updated[i] = { ...updated[i], panX: newX, panY: newY }; onAdditionalPrints(updated); }
    }
  }, [zoom, onPan, activePrintIdx, additionalPrints, onAdditionalPrints]);

  const handlePointerUp = useCallback(() => { isDragging.current = false; }, []);

  const getSlotImg = (idx: number) => {
    const ap = additionalPrints[idx];
    if (!ap) return "";
    return ap.uploadedFile || ap.image?.url || "";
  };

  const handleSlotSelect = (slotIndex: number, image: SelectedImage) => {
    const updated = [...additionalPrints];
    while (updated.length <= slotIndex) updated.push({ image: null, uploadedFile: null, orientation: "landscape", zoom: 1, panX: 0, panY: 0, rotation: 0 });
    updated[slotIndex] = { ...updated[slotIndex], image, uploadedFile: null };
    onAdditionalPrints(updated);
  };

  const handleSlotUpload = (slotIndex: number, dataUrl: string) => {
    const updated = [...additionalPrints];
    while (updated.length <= slotIndex) updated.push({ image: null, uploadedFile: null, orientation: "landscape", zoom: 1, panX: 0, panY: 0, rotation: 0 });
    updated[slotIndex] = { ...updated[slotIndex], image: null, uploadedFile: dataUrl };
    onAdditionalPrints(updated);
  };

  const getActiveZoom = () => activePrintIdx === 0 ? zoom : (additionalPrints[activePrintIdx - 1]?.zoom ?? 1);
  const getActivePanX = () => activePrintIdx === 0 ? panX : (additionalPrints[activePrintIdx - 1]?.panX ?? 0);
  const getActivePanY = () => activePrintIdx === 0 ? panY : (additionalPrints[activePrintIdx - 1]?.panY ?? 0);
  const getActiveRotation = () => activePrintIdx === 0 ? rotation : (additionalPrints[activePrintIdx - 1]?.rotation ?? 0);

  const setActiveZoom = (z: number) => {
    if (activePrintIdx === 0) { onZoom(z); return; }
    const updated = [...additionalPrints];
    const i = activePrintIdx - 1;
    if (updated[i]) { updated[i] = { ...updated[i], zoom: z, panX: 0, panY: 0 }; onAdditionalPrints(updated); }
  };
  const setActivePan = (x: number, y: number) => {
    if (activePrintIdx === 0) { onPan(x, y); return; }
    const updated = [...additionalPrints];
    const i = activePrintIdx - 1;
    if (updated[i]) { updated[i] = { ...updated[i], panX: x, panY: y }; onAdditionalPrints(updated); }
  };
  const setActiveRotation = (r: number) => {
    if (activePrintIdx === 0) { onRotate(r); return; }
    const updated = [...additionalPrints];
    const i = activePrintIdx - 1;
    if (updated[i]) { updated[i] = { ...updated[i], rotation: r }; onAdditionalPrints(updated); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new window.Image();
      img.onload = () => onUpload(dataUrl, img.naturalWidth, img.naturalHeight);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // ─── UPLOAD SCREEN (no image yet) ──────────────────────────────────────────
  if (!hasImage) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Start With Your Photo
          </h2>
          <p className="text-muted-foreground font-body mt-2 text-sm">
            Upload any photo — we'll help you pick the perfect size and material.
          </p>
        </div>

        <label className="group flex flex-col items-center justify-center gap-5 w-full py-20 border-2 border-dashed border-primary/30 hover:border-primary rounded-2xl cursor-pointer transition-all bg-primary/3 hover:bg-primary/8">
          <div className="w-20 h-20 rounded-full bg-gradient-gold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Upload className="w-9 h-9 text-primary-foreground" />
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-xl text-foreground">Drop your photo here</p>
            <p className="font-body text-sm text-muted-foreground mt-1">or click to browse — JPG, PNG, TIFF</p>
          </div>
          <div className="flex gap-6 text-xs font-body text-muted-foreground/70">
            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-primary" /> Museum-grade print</span>
            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-primary" /> Ships in 3–5 days</span>
            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-primary" /> Lifetime guarantee</span>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>
    );
  }

  // ─── SIZE + MATERIAL SELECTION (after upload) ───────────────────────────────
  const backdropImg = isDesk ? shelfBackdrop : couchWall;
  const WALL_W = isDesk ? 48 : 60;
  const maxDim = Math.max(displayW, displayH);
  const printWPct = Math.max((maxDim / WALL_W) * 100, 10);
  const displayLabel = isSquare
    ? selected.label
    : orientation === "portrait"
      ? `${Math.min(selected.w, selected.h)}"×${Math.max(selected.w, selected.h)}"`
      : `${Math.max(selected.w, selected.h)}"×${Math.min(selected.w, selected.h)}"`;

  return (
    <div className="space-y-6">
      <ImagePickerModal
        open={pickerSlot !== null}
        slotIndex={pickerSlot ?? 0}
        onClose={() => setPickerSlot(null)}
        onSelectImage={handleSlotSelect}
        onUploadImage={handleSlotUpload}
      />

      {/* ── LIVE PREVIEW ─────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden rounded-xl border border-border shadow-md" style={{ aspectRatio: "16/9", maxHeight: 380 }}>
        <img src={backdropImg} alt="Room backdrop" className="absolute inset-0 w-full h-full object-cover" />

        {quantity >= 2 ? (
          (() => {
            const totalPrints = quantity;
            const gapPct = 2;
            const totalGap = (totalPrints - 1) * gapPct;
            const maxGroupWidth = 85;
            const perPrintPct = Math.min((maxGroupWidth - totalGap) / totalPrints, printWPct);
            return (
              <div className="absolute left-1/2 -translate-x-1/2 flex items-end" style={{ bottom: isDesk ? "38%" : "30%", gap: `${gapPct}%` }}>
                <div
                  className={`shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden shrink-0 cursor-pointer transition-all ${activePrintIdx === 0 ? "ring-2 ring-primary ring-offset-1" : "hover:ring-1 hover:ring-primary/40"}`}
                  style={{ width: `${perPrintPct}%`, aspectRatio: `${printAspect}` }}
                  onClick={() => setActivePrintIdx(0)}
                  onPointerDown={activePrintIdx === 0 ? handlePointerDown : undefined}
                  onPointerMove={activePrintIdx === 0 ? handlePointerMove : undefined}
                  onPointerUp={activePrintIdx === 0 ? handlePointerUp : undefined}
                >
                  <img src={imageUrl} alt="Print 1" className="w-full h-full object-contain select-none pointer-events-none bg-black" draggable={false} style={{ transform: buildTransform(zoom, panX, panY, rotation, printAspect), transformOrigin: "center center" }} />
                </div>
                {Array.from({ length: quantity - 1 }).map((_, idx) => {
                  const slotImg = getSlotImg(idx);
                  const slotOri = additionalPrints[idx]?.orientation || "landscape";
                  const slotW = slotOri === "portrait" ? Math.min(selected.w, selected.h) : Math.max(selected.w, selected.h);
                  const slotH = slotOri === "portrait" ? Math.max(selected.w, selected.h) : Math.min(selected.w, selected.h);
                  const slotAspect = slotW / slotH;
                  const isActive = activePrintIdx === idx + 1;
                  const ap = additionalPrints[idx];
                  return (
                    <div
                      key={idx}
                      className={`shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden shrink-0 cursor-pointer transition-all ${isActive ? "ring-2 ring-primary ring-offset-1" : "hover:ring-1 hover:ring-primary/40"} ${!slotImg ? "bg-muted/50" : ""}`}
                      style={{ width: `${perPrintPct}%`, aspectRatio: `${slotAspect}` }}
                      onClick={() => { setActivePrintIdx(idx + 1); if (!slotImg) setPickerSlot(idx); }}
                      onPointerDown={isActive && slotImg ? handlePointerDown : undefined}
                      onPointerMove={isActive && slotImg ? handlePointerMove : undefined}
                      onPointerUp={isActive && slotImg ? handlePointerUp : undefined}
                    >
                      {slotImg ? (
                        <img src={slotImg} alt={`Print ${idx + 2}`} className="w-full h-full object-contain select-none pointer-events-none bg-black" draggable={false} style={{ transform: buildTransform(ap?.zoom ?? 1, ap?.panX ?? 0, ap?.panY ?? 0, ap?.rotation ?? 0, slotAspect), transformOrigin: "center center" }} />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 hover:bg-muted/70 transition-colors">
                          <Plus className="w-5 h-5 text-muted-foreground" />
                          <span className="text-[9px] text-muted-foreground font-body">Print {idx + 2}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()
        ) : (
          <div
            className="absolute left-1/2 -translate-x-1/2 shadow-[0_4px_30px_rgba(0,0,0,0.3)] overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-500"
            style={{ width: `${printWPct}%`, paddingBottom: `${printWPct / printAspect}%`, height: 0, bottom: isDesk ? "38%" : "35%" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <img src={imageUrl} alt="Print preview" className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none bg-black" draggable={false} style={{ transform: buildTransform(zoom, panX, panY, rotation, printAspect), transformOrigin: "center center" }} />
          </div>
        )}

        {/* Image tools */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {(() => {
            const aZoom = getActiveZoom();
            const aRotation = getActiveRotation();
            const aPanX = getActivePanX();
            const aPanY = getActivePanY();
            return (
              <>
                <button onClick={(e) => { e.stopPropagation(); setActiveZoom(Math.min(aZoom + 0.25, 3)); onPan(0, 0); }} className="w-7 h-7 bg-card/80 backdrop-blur-sm border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Zoom in"><ZoomIn className="w-4 h-4" /></button>
                <button onClick={(e) => { e.stopPropagation(); setActiveZoom(Math.max(aZoom - 0.25, 1)); }} className="w-7 h-7 bg-card/80 backdrop-blur-sm border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Zoom out"><ZoomOut className="w-4 h-4" /></button>
                <button onClick={(e) => { e.stopPropagation(); setActiveRotation((aRotation + 90) % 360); }} className="w-7 h-7 bg-card/80 backdrop-blur-sm border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Rotate"><RotateCw className="w-4 h-4" /></button>
                {(aZoom > 1 || aPanX !== 0 || aPanY !== 0) && (
                  <button onClick={(e) => { e.stopPropagation(); setActiveZoom(1); setActivePan(0, 0); }} className="w-7 h-7 bg-card/80 backdrop-blur-sm border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Reset"><Move className="w-4 h-4" /></button>
                )}
                {activePrintIdx > 0 && (
                  <button onClick={(e) => { e.stopPropagation(); setPickerSlot(activePrintIdx - 1); }} className="w-7 h-7 bg-card/80 backdrop-blur-sm border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Change image"><Upload className="w-4 h-4" /></button>
                )}
              </>
            );
          })()}
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
          <div className="bg-card/85 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="text-sm font-body text-primary font-bold">{displayLabel}</span>
            {quantity > 1 && <span className="text-[10px] text-muted-foreground font-body">×{quantity}</span>}
          </div>
          <div className="flex items-center gap-1.5">
            {/* Orientation toggle */}
            {!isSquare && (
              <div className="flex bg-card/85 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
                <button onClick={() => setOrientation("landscape")} className={`p-1.5 transition-colors ${orientation === "landscape" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}><RectangleHorizontal className="w-4 h-4" /></button>
                <button onClick={() => setOrientation("portrait")} className={`p-1.5 transition-colors ${orientation === "portrait" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}><RectangleVertical className="w-4 h-4" /></button>
              </div>
            )}
            {/* Change photo */}
            <label className="flex items-center gap-1.5 bg-card/85 backdrop-blur-sm border border-border rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-card transition-colors">
              <ImageIcon className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-body text-foreground">Change Photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </div>
      </div>

      {/* ── LOW QUALITY WARNING ───────────────────────────────────── */}
      {isLowQuality && (
        <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs font-body text-destructive/90">
            Image may be too low-res at this size (~{effectiveDpi} DPI). For crisp 300 DPI results we recommend a {requiredPxW}×{requiredPxH}px source file.
          </p>
        </div>
      )}

      {/* ── SIZE PICKER ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-primary">Choose Size</h3>
          <span className="text-xs font-body text-muted-foreground">Drag image to reposition</span>
        </div>

        {/* Group tabs */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {sizeGroups.map((g, gi) => (
            <button
              key={g.label}
              onClick={() => setActiveGroup(gi)}
              className={`px-3 py-1.5 rounded-full text-xs font-body font-semibold transition-all ${activeGroup === gi ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
            >
              {g.label}
            </button>
          ))}
          <button
            onClick={() => { setShowCustomInput(true); onSelect(CUSTOM_SIZE_IDX); }}
            className={`px-3 py-1.5 rounded-full text-xs font-body font-semibold transition-all flex items-center gap-1 ${isCustom ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
          >
            <Ruler className="w-3 h-3" /> Custom
          </button>
        </div>

        {/* Custom size inputs */}
        {isCustom && (
          <div className="flex items-center gap-2 mb-3 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
            <Ruler className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-body text-foreground font-semibold">Custom dimensions:</span>
            <Input type="number" min={4} max={96} value={customWidth} onChange={(e) => onCustomSize(Math.max(4, Math.min(96, Number(e.target.value) || 4)), customHeight)} className="w-16 h-7 text-xs text-center font-body" />
            <span className="text-xs text-muted-foreground font-body">×</span>
            <Input type="number" min={4} max={96} value={customHeight} onChange={(e) => onCustomSize(customWidth, Math.max(4, Math.min(96, Number(e.target.value) || 4)))} className="w-16 h-7 text-xs text-center font-body" />
            <span className="text-xs text-muted-foreground font-body">inches</span>
            <button onClick={() => { setShowCustomInput(false); onSelect(0); }} className="ml-auto text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Size cards grid — visual ratio previews */}
        {!isCustom && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {sizeGroups[activeGroup].sizes.filter(i => i < standardSizes.length).map((i) => {
              const size = standardSizes[i];
              const isSelected = i === sizeIdx;
              const aspect = size.w / size.h;
              // Visual preview: cap the rendered ratio to 0.4–2.5 for readability
              const previewAspect = Math.max(0.4, Math.min(2.5, aspect));
              const price = startingPrice(size.w, size.h);

              return (
                <button
                  key={i}
                  onClick={() => {
                    onSelect(i);
                    if (i >= 10) { onQuantity(1); onAdditionalPrints([]); }
                  }}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-left w-full ${
                    isSelected
                      ? "border-primary bg-primary/8 shadow-md"
                      : "border-border hover:border-primary/50 bg-card hover:bg-card/80"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                  {/* Visual ratio rectangle */}
                  <div className="flex items-center justify-center w-full" style={{ height: 44 }}>
                    <div
                      className={`border-2 transition-colors ${isSelected ? "border-primary bg-primary/15" : "border-muted-foreground/30 bg-muted/30"}`}
                      style={{
                        aspectRatio: previewAspect,
                        maxWidth: "100%",
                        maxHeight: 44,
                        width: previewAspect >= 1 ? "100%" : `${previewAspect * 44}px`,
                        height: previewAspect >= 1 ? `${(1 / previewAspect) * 100}%` : "100%",
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <p className={`text-[11px] font-display font-bold leading-tight ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {size.label}
                    </p>
                    <p className={`text-[10px] font-body mt-0.5 ${isSelected ? "text-primary/80" : "text-muted-foreground"}`}>
                      from ${price}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Quantity selector for smaller sizes */}
        {!isCustom && sizeIdx < 10 && sizeIdx >= 0 && (
          <div className="mt-3 flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-xs font-body text-foreground font-semibold">Great in sets!</span>
            <span className="text-xs text-muted-foreground font-body">Quantity:</span>
            <div className="flex items-center gap-0.5 ml-auto">
              {[1, 2, 3, 4, 5, 6].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    onQuantity(q);
                    if (q >= 2) {
                      const current = [...additionalPrints];
                      while (current.length < q - 1) current.push({ image: null, uploadedFile: null, orientation: "landscape", zoom: 1, panX: 0, panY: 0, rotation: 0 });
                      onAdditionalPrints(current.slice(0, q - 1));
                    } else {
                      onAdditionalPrints([]);
                    }
                  }}
                  className={`w-7 h-7 rounded-md text-xs font-body font-bold transition-all ${quantity === q ? "bg-gradient-gold text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"}`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MATERIAL PICKER ───────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-primary mb-3">Choose Material</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {materialOpts.map((mat) => {
            const isSelected = material === mat.id;
            const price = unitPrice(mat.id, selected.w, selected.h) * quantity;

            return (
              <button
                key={mat.id}
                onClick={() => onSelectMaterial(mat.id)}
                className={`relative text-left rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                  isSelected ? "border-primary shadow-md" : "border-border hover:border-primary/50"
                }`}
              >
                {mat.badge && (
                  <div className="absolute top-2 left-2 z-10 bg-gradient-gold text-primary-foreground text-[9px] font-body font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {mat.badge}
                  </div>
                )}
                {isSelected && (
                  <div className="absolute top-2 right-2 z-10 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                {/* Material photo */}
                <div className="relative aspect-[16/7] overflow-hidden">
                  <img src={mat.img} alt={mat.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
                  {/* Corner detail */}
                  <div className="absolute bottom-2 right-2 w-10 h-10 rounded border border-border/50 overflow-hidden shadow-md">
                    <img src={mat.cornerImg} alt={`${mat.label} corner`} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1.5 text-primary mb-0.5">
                    {mat.icon}
                    <span className="text-sm font-display font-bold text-foreground">{mat.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-body mb-2">{mat.subtitle}</p>
                  <ul className="space-y-0.5 mb-2">
                    {mat.benefits.map((b) => (
                      <li key={b} className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-body">
                        <Check className="w-3 h-3 text-primary shrink-0" />{b}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-display font-bold text-gradient-gold">${price}</span>
                    {quantity > 1 && <span className="text-[10px] text-muted-foreground font-body">for {quantity}</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── STICKY CTA ─────────────────────────────────────────────── */}
      <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-background/95 backdrop-blur-sm border-t border-border flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-body text-muted-foreground">Your selection</p>
          <p className="text-sm font-display font-bold text-foreground">
            {displayLabel} · {materialOpts.find(m => m.id === material)?.label}
            {quantity > 1 && ` · ×${quantity}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-body text-muted-foreground">Total</p>
            <p className="text-xl font-display font-bold text-gradient-gold">${totalPrice}</p>
          </div>
          <Button
            onClick={onNext}
            className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 gap-2 h-11 px-6"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepSize;
