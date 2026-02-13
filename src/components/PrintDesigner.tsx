import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  ImagePlus,
  Type,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Trash2,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layers,
  ChevronUp,
  ChevronDown,
  Download,
} from "lucide-react";

interface DesignElement {
  id: string;
  type: "image" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content: string; // src for image, text for text
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  color?: string;
}

const CANVAS_DISPLAY_W = 600;

const PrintDesigner = () => {
  const [material, setMaterial] = useState<"metal" | "acrylic">("metal");
  const [metalIdx, setMetalIdx] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(2);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [roundedCorners, setRoundedCorners] = useState(false);
  const [standOff, setStandOff] = useState<"none" | "silver" | "black">("none");
  const [standOffQty, setStandOffQty] = useState(4);
  const [zoom, setZoom] = useState(100);

  const [elements, setElements] = useState<DesignElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; elX: number; elY: number } | null>(null);
  const [activeTab, setActiveTab] = useState<"design" | "settings">("design");

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const size = standardSizes[sizeIdx];
  const w = orientation === "portrait" ? size.w : size.h;
  const h = orientation === "portrait" ? size.h : size.w;
  const aspectRatio = w / h;

  // Canvas display dimensions
  const canvasW = CANVAS_DISPLAY_W * (zoom / 100);
  const canvasH = canvasW / aspectRatio;

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

  const selectedElement = elements.find((e) => e.id === selectedId) || null;

  const addImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(80 / img.width, 80 / img.height, 1);
        const newEl: DesignElement = {
          id: crypto.randomUUID(),
          type: "image",
          x: 10,
          y: 10,
          width: (img.width * scale),
          height: (img.height * scale),
          rotation: 0,
          content: ev.target?.result as string,
        };
        setElements((prev) => [...prev, newEl]);
        setSelectedId(newEl.id);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const addText = useCallback(() => {
    const newEl: DesignElement = {
      id: crypto.randomUUID(),
      type: "text",
      x: 20,
      y: 20,
      width: 60,
      height: 10,
      rotation: 0,
      content: "Your text here",
      fontSize: 24,
      fontWeight: "normal",
      fontStyle: "normal",
      textAlign: "center",
      color: "#ffffff",
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<DesignElement>) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  }, []);

  const deleteElement = useCallback((id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const moveLayer = useCallback((id: string, direction: "up" | "down") => {
    setElements((prev) => {
      const idx = prev.findIndex((el) => el.id === id);
      if (idx === -1) return prev;
      const newArr = [...prev];
      const swapIdx = direction === "up" ? idx + 1 : idx - 1;
      if (swapIdx < 0 || swapIdx >= newArr.length) return prev;
      [newArr[idx], newArr[swapIdx]] = [newArr[swapIdx], newArr[idx]];
      return newArr;
    });
  }, []);

  // Mouse drag handling
  const handleMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    const el = elements.find((el) => el.id === id);
    if (!el) return;
    setDragging({ id, startX: e.clientX, startY: e.clientY, elX: el.x, elY: el.y });
  }, [elements]);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      const dx = ((e.clientX - dragging.startX) / canvasW) * 100;
      const dy = ((e.clientY - dragging.startY) / canvasH) * 100;
      updateElement(dragging.id, { x: dragging.elX + dx, y: dragging.elY + dy });
    };
    const handleUp = () => setDragging(null);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, canvasW, canvasH, updateElement]);

  const materialLabel = material === "metal" ? metalOptions[metalIdx].label : "Acrylic";

  return (
    <section id="designer" className="py-24 px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm tracking-[0.3em] uppercase text-primary font-body">
            Design Studio
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-3 text-foreground">
            Create Your Print
          </h2>
          <p className="text-muted-foreground font-body mt-4 max-w-xl mx-auto">
            Upload images, add text, and preview your custom print before ordering.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 min-h-[700px]">
          {/* Left toolbar */}
          <div className="lg:w-16 flex lg:flex-col gap-2 bg-card border border-border rounded-lg p-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
              title="Add Image"
            >
              <ImagePlus className="w-5 h-5" />
            </button>
            <button
              onClick={addText}
              className="w-12 h-12 rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
              title="Add Text"
            >
              <Type className="w-5 h-5" />
            </button>
            <div className="border-t border-border lg:border-t lg:border-l-0 my-1" />
            <button
              onClick={() => setZoom((z) => Math.min(z + 10, 150))}
              className="w-12 h-12 rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 10, 50))}
              className="w-12 h-12 rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setZoom(100); }}
              className="w-12 h-12 rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) addImage(file);
                e.target.value = "";
              }}
            />
          </div>

          {/* Canvas area */}
          <div className="flex-1 bg-[hsl(220,10%,6%)] rounded-lg border border-border overflow-auto flex items-center justify-center p-8 min-h-[500px]">
            <div className="relative" style={{ width: canvasW, height: canvasH }}>
              {/* Print surface */}
              <div
                ref={canvasRef}
                className={`absolute inset-0 overflow-hidden cursor-crosshair ${
                  roundedCorners ? "rounded-xl" : ""
                } ${
                  material === "metal"
                    ? "bg-gradient-to-br from-[hsl(220,8%,50%)] via-[hsl(220,6%,62%)] to-[hsl(220,8%,48%)]"
                    : "bg-gradient-to-br from-[hsl(200,15%,85%)] via-[hsl(200,20%,92%)] to-[hsl(200,15%,80%)]"
                }`}
                style={{
                  boxShadow: material === "acrylic" && standOff !== "none"
                    ? "8px 8px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)"
                    : "4px 4px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
                }}
                onClick={() => setSelectedId(null)}
              >
                {/* Brushed metal texture overlay */}
                {material === "metal" && (
                  <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
                    backgroundImage: `repeating-linear-gradient(
                      90deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px
                    )`
                  }} />
                )}

                {/* Acrylic gloss overlay */}
                {material === "acrylic" && (
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)"
                  }} />
                )}

                {/* Design elements */}
                {elements.map((el) => (
                  <div
                    key={el.id}
                    className={`absolute cursor-move select-none ${
                      selectedId === el.id
                        ? "ring-2 ring-primary ring-offset-1 ring-offset-transparent"
                        : "hover:ring-1 hover:ring-primary/50"
                    }`}
                    style={{
                      left: `${el.x}%`,
                      top: `${el.y}%`,
                      width: `${el.width}%`,
                      height: el.type === "text" ? "auto" : `${el.height}%`,
                      transform: `rotate(${el.rotation}deg)`,
                      zIndex: selectedId === el.id ? 50 : undefined,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, el.id)}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                  >
                    {el.type === "image" ? (
                      <img
                        src={el.content}
                        alt="Design element"
                        className="w-full h-full object-cover pointer-events-none"
                        draggable={false}
                      />
                    ) : (
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className="w-full outline-none pointer-events-auto font-body"
                        style={{
                          fontSize: `${(el.fontSize || 24) * (zoom / 100)}px`,
                          fontWeight: el.fontWeight,
                          fontStyle: el.fontStyle,
                          textAlign: el.textAlign as any,
                          color: el.color,
                          lineHeight: 1.3,
                        }}
                        onBlur={(e) => updateElement(el.id, { content: e.currentTarget.textContent || "" })}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {el.content}
                      </div>
                    )}

                    {/* Resize handle */}
                    {selectedId === el.id && el.type === "image" && (
                      <div
                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-sm cursor-se-resize"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const startX = e.clientX;
                          const startY = e.clientY;
                          const startW = el.width;
                          const startH = el.height;
                          const onMove = (ev: MouseEvent) => {
                            const dw = ((ev.clientX - startX) / canvasW) * 100;
                            const dh = ((ev.clientY - startY) / canvasH) * 100;
                            updateElement(el.id, {
                              width: Math.max(5, startW + dw),
                              height: Math.max(5, startH + dh),
                            });
                          };
                          const onUp = () => {
                            window.removeEventListener("mousemove", onMove);
                            window.removeEventListener("mouseup", onUp);
                          };
                          window.addEventListener("mousemove", onMove);
                          window.addEventListener("mouseup", onUp);
                        }}
                      />
                    )}
                  </div>
                ))}

                {/* Empty state */}
                {elements.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground/30">
                    <ImagePlus className="w-12 h-12 mb-3" />
                    <p className="font-body text-sm">Click the image icon to upload</p>
                    <p className="font-body text-xs mt-1">or add text to get started</p>
                  </div>
                )}

                {/* Stand-off dots */}
                {material === "acrylic" && standOff !== "none" && (
                  <>
                    {[
                      "top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"
                    ].map((pos, i) => (
                      <div key={i} className={`absolute ${pos} w-3 h-3 rounded-full pointer-events-none shadow-md ${
                        standOff === "silver" ? "bg-[hsl(0,0%,78%)]" : "bg-[hsl(0,0%,18%)]"
                      }`} />
                    ))}
                  </>
                )}
              </div>

              {/* Size label */}
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-body">
                {w}" × {h}" — {zoom}%
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="lg:w-72 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
            {/* Panel tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab("design")}
                className={`flex-1 py-3 text-xs font-body font-semibold tracking-wider uppercase transition-colors ${
                  activeTab === "design" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Design
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex-1 py-3 text-xs font-body font-semibold tracking-wider uppercase transition-colors ${
                  activeTab === "settings" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Print Settings
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {activeTab === "design" ? (
                <>
                  {/* Selected element properties */}
                  {selectedElement ? (
                    <>
                      <div className="flex items-center justify-between">
                        <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs">
                          {selectedElement.type === "image" ? "Image" : "Text"} Properties
                        </Label>
                        <button
                          onClick={() => deleteElement(selectedElement.id)}
                          className="text-destructive hover:text-destructive/80 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {selectedElement.type === "text" && (
                        <>
                          <div>
                            <Label className="text-xs text-muted-foreground font-body mb-1 block">Font Size</Label>
                            <Slider
                              value={[selectedElement.fontSize || 24]}
                              onValueChange={([v]) => updateElement(selectedElement.id, { fontSize: v })}
                              min={8}
                              max={120}
                              step={1}
                            />
                            <span className="text-xs text-muted-foreground font-body">{selectedElement.fontSize}px</span>
                          </div>

                          <div className="flex gap-1">
                            <button
                              onClick={() => updateElement(selectedElement.id, {
                                fontWeight: selectedElement.fontWeight === "bold" ? "normal" : "bold"
                              })}
                              className={`w-8 h-8 rounded flex items-center justify-center border transition-colors ${
                                selectedElement.fontWeight === "bold"
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-border text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <Bold className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => updateElement(selectedElement.id, {
                                fontStyle: selectedElement.fontStyle === "italic" ? "normal" : "italic"
                              })}
                              className={`w-8 h-8 rounded flex items-center justify-center border transition-colors ${
                                selectedElement.fontStyle === "italic"
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-border text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <Italic className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => updateElement(selectedElement.id, { textAlign: "left" })}
                              className={`w-8 h-8 rounded flex items-center justify-center border transition-colors ${
                                selectedElement.textAlign === "left"
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-border text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <AlignLeft className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => updateElement(selectedElement.id, { textAlign: "center" })}
                              className={`w-8 h-8 rounded flex items-center justify-center border transition-colors ${
                                selectedElement.textAlign === "center"
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-border text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <AlignCenter className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => updateElement(selectedElement.id, { textAlign: "right" })}
                              className={`w-8 h-8 rounded flex items-center justify-center border transition-colors ${
                                selectedElement.textAlign === "right"
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-border text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <AlignRight className="w-3 h-3" />
                            </button>
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground font-body mb-1 block">Color</Label>
                            <input
                              type="color"
                              value={selectedElement.color || "#ffffff"}
                              onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                              className="w-full h-8 rounded border border-border cursor-pointer"
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <Label className="text-xs text-muted-foreground font-body mb-1 block">Rotation</Label>
                        <Slider
                          value={[selectedElement.rotation]}
                          onValueChange={([v]) => updateElement(selectedElement.id, { rotation: v })}
                          min={-180}
                          max={180}
                          step={1}
                        />
                        <span className="text-xs text-muted-foreground font-body">{selectedElement.rotation}°</span>
                      </div>

                      {/* Layer controls */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => moveLayer(selectedElement.id, "up")}
                          className="flex-1 flex items-center justify-center gap-1 py-2 rounded border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors font-body"
                        >
                          <ChevronUp className="w-3 h-3" /> Forward
                        </button>
                        <button
                          onClick={() => moveLayer(selectedElement.id, "down")}
                          className="flex-1 flex items-center justify-center gap-1 py-2 rounded border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors font-body"
                        >
                          <ChevronDown className="w-3 h-3" /> Back
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Layers className="w-8 h-8 mx-auto text-muted-foreground/40 mb-3" />
                      <p className="text-sm text-muted-foreground font-body">
                        Select an element to edit its properties
                      </p>
                      <p className="text-xs text-muted-foreground/60 font-body mt-2">
                        Use the toolbar to add images or text
                      </p>
                    </div>
                  )}

                  {/* Layers list */}
                  {elements.length > 0 && (
                    <div>
                      <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs mb-2 block">
                        Layers
                      </Label>
                      <div className="space-y-1">
                        {[...elements].reverse().map((el) => (
                          <button
                            key={el.id}
                            onClick={() => setSelectedId(el.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-body text-left transition-colors ${
                              selectedId === el.id
                                ? "bg-primary/15 text-primary border border-primary/30"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
                            }`}
                          >
                            {el.type === "image" ? (
                              <ImagePlus className="w-3 h-3 shrink-0" />
                            ) : (
                              <Type className="w-3 h-3 shrink-0" />
                            )}
                            <span className="truncate">
                              {el.type === "image" ? "Image" : el.content.slice(0, 20)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Print settings tab */
                <>
                  <div>
                    <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs mb-2 block">
                      Material
                    </Label>
                    <RadioGroup
                      value={material}
                      onValueChange={(v) => {
                        setMaterial(v as "metal" | "acrylic");
                        if (v === "metal") setStandOff("none");
                      }}
                      className="flex gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="metal" id="pd-metal" />
                        <Label htmlFor="pd-metal" className="font-body text-foreground cursor-pointer text-sm">Metal</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="acrylic" id="pd-acrylic" />
                        <Label htmlFor="pd-acrylic" className="font-body text-foreground cursor-pointer text-sm">Acrylic</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {material === "metal" && (
                    <div>
                      <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs mb-2 block">
                        Metal Type
                      </Label>
                      <Select value={String(metalIdx)} onValueChange={(v) => setMetalIdx(Number(v))}>
                        <SelectTrigger className="bg-secondary border-border text-foreground font-body text-sm">
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

                  <div>
                    <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs mb-2 block">
                      Size
                    </Label>
                    <Select value={String(sizeIdx)} onValueChange={(v) => setSizeIdx(Number(v))}>
                      <SelectTrigger className="bg-secondary border-border text-foreground font-body text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {standardSizes.map((s, i) => (
                          <SelectItem key={i} value={String(i)}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs mb-2 block">
                      Orientation
                    </Label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setOrientation("portrait")}
                        className={`flex items-center gap-2 px-3 py-2 rounded font-body text-sm border transition-colors ${
                          orientation === "portrait"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-secondary text-foreground border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="w-2.5 h-3.5 border border-current rounded-sm" />
                        Portrait
                      </button>
                      <button
                        onClick={() => setOrientation("landscape")}
                        className={`flex items-center gap-2 px-3 py-2 rounded font-body text-sm border transition-colors ${
                          orientation === "landscape"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-secondary text-foreground border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="w-3.5 h-2.5 border border-current rounded-sm" />
                        Landscape
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs block">
                      Add-Ons
                    </Label>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="pd-rounded"
                        checked={roundedCorners}
                        onCheckedChange={(v) => setRoundedCorners(!!v)}
                      />
                      <Label htmlFor="pd-rounded" className="font-body text-foreground cursor-pointer text-sm">
                        Rounded Corners (+$5)
                      </Label>
                    </div>

                    {material === "acrylic" && (
                      <div>
                        <Label className="text-foreground font-body text-sm mb-2 block">Stand-Off Mounting</Label>
                        <RadioGroup
                          value={standOff}
                          onValueChange={(v) => setStandOff(v as "none" | "silver" | "black")}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="none" id="pd-so-none" />
                            <Label htmlFor="pd-so-none" className="font-body text-foreground cursor-pointer text-sm">None</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="silver" id="pd-so-silver" />
                            <Label htmlFor="pd-so-silver" className="font-body text-foreground cursor-pointer text-sm">Silver ($2.50)</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="black" id="pd-so-black" />
                            <Label htmlFor="pd-so-black" className="font-body text-foreground cursor-pointer text-sm">Black ($3.50)</Label>
                          </div>
                        </RadioGroup>
                        {standOff !== "none" && (
                          <div className="mt-2">
                            <Select value={String(standOffQty)} onValueChange={(v) => setStandOffQty(Number(v))}>
                              <SelectTrigger className="bg-secondary border-border text-foreground font-body text-sm w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[2, 4, 6, 8, 10, 12].map((n) => (
                                  <SelectItem key={n} value={String(n)}>×{n}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-xs font-body text-muted-foreground">
                      <span>{materialLabel} — {w}"×{h}"</span>
                      <span>${printPrice.toFixed(2)}</span>
                    </div>
                    {roundedCorners && (
                      <div className="flex justify-between text-xs font-body text-muted-foreground">
                        <span>Rounded Corners</span>
                        <span>$5.00</span>
                      </div>
                    )}
                    {material === "acrylic" && standOff !== "none" && (
                      <div className="flex justify-between text-xs font-body text-muted-foreground">
                        <span>Stand-Off ({standOff}) ×{standOffQty}</span>
                        <span>${((standOff === "silver" ? addOns.standOffSilver : addOns.standOffBlack) * standOffQty).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs font-body text-muted-foreground">
                      <span>Shipping</span>
                      <span>${shipping.cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-body font-bold text-foreground border-t border-border pt-2">
                      <span>Total</span>
                      <span className="text-gradient-gold">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-gold text-primary-foreground font-body font-semibold tracking-wide hover:opacity-90">
                    Request This Quote
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrintDesigner;
