import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Search, Loader2, Upload, RotateCw, Plus, ImagePlus } from "lucide-react";
import { standardSizes, calcMetalPrice, metalOptions } from "@/lib/pricing";
import type { SelectedImage, MaterialChoice } from "./types";

const PEXELS_API_KEY = "X6x17AZ7r5kg7ViRIiE33JuEwA7RHF17EbdFYNXg5jqn5mNRg2EAvkwl";

interface PexelsPhoto {
  id: number;
  photographer: string;
  alt: string;
  src: { large2x: string; medium: string };
}

interface Props {
  frontImage: string;
  backImage: SelectedImage | null;
  backUploadedFile: string | null;
  doubleSided: boolean;
  material: MaterialChoice;
  sizeIdx: number;
  onToggleDouble: (v: boolean) => void;
  onSelectBack: (img: SelectedImage) => void;
  onUploadBack: (dataUrl: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepUpsell = ({ frontImage, backImage, backUploadedFile, doubleSided, material, sizeIdx, onToggleDouble, onSelectBack, onUploadBack, onNext, onBack }: Props) => {
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCurated = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.pexels.com/v1/curated?per_page=12`, { headers: { Authorization: PEXELS_API_KEY } });
        const data = await res.json();
        setPhotos(data.photos || []);
      } catch { setPhotos([]); }
      finally { setLoading(false); }
    };
    loadCurated();
  }, []);

  const searchPhotos = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=12&orientation=landscape`, { headers: { Authorization: PEXELS_API_KEY } });
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch { setPhotos([]); }
    finally { setLoading(false); }
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { onUploadBack(reader.result as string); onToggleDouble(true); };
    reader.readAsDataURL(file);
  };

  const backUrl = backUploadedFile || backImage?.url;

  const size = standardSizes[sizeIdx];
  const singleIdx = material === "metal-designer" ? 0 : 2;
  const doubleIdx = material === "metal-designer" ? 1 : 3;
  const singlePrice = calcMetalPrice(size.w, size.h, metalOptions[singleIdx]);
  const doublePrice = calcMetalPrice(size.w, size.h, metalOptions[doubleIdx]);
  const upsellCost = doublePrice - singlePrice;

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Two Prints in One
        </h2>
        <p className="text-muted-foreground font-body mt-2 tracking-wide text-sm max-w-md mx-auto">
          Flip your metal print to reveal a completely different piece. Change your room's mood in seconds.
        </p>
      </div>

      {/* Price callout + front/back preview */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex flex-col md:flex-row items-center gap-5">
          {/* Front image */}
          <div className="text-center shrink-0">
            <div className="w-32 h-24 rounded-lg overflow-hidden border-2 border-primary shadow-lg">
              <img src={frontImage} alt="Front" className="w-full h-full object-cover" />
            </div>
            <p className="text-[10px] text-primary font-body mt-1.5 font-semibold tracking-wider">FRONT</p>
          </div>

          <RotateCw className="w-6 h-6 text-primary shrink-0" />

          {/* Back image — big drop target */}
          <div className="text-center shrink-0">
            <label className="block cursor-pointer">
              <div className={`w-32 h-24 rounded-lg overflow-hidden border-2 shadow-lg transition-all ${
                backUrl ? "border-primary" : "border-dashed border-primary/50 hover:border-primary bg-primary/5"
              }`}>
                {backUrl ? (
                  <img src={backUrl} alt="Back" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center flex-col gap-1">
                    <ImagePlus className="w-5 h-5 text-primary" />
                    <p className="text-[9px] text-primary font-body font-semibold">Add Image</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
            <p className="text-[10px] text-muted-foreground font-body mt-1.5 font-semibold tracking-wider">BACK</p>
          </div>

          {/* Price CTA */}
          <div className="flex-1 text-center md:text-left">
            <Badge className="bg-gradient-gold text-primary-foreground border-0 text-xs font-body px-3 py-1 mb-2">
              Only +${upsellCost} more
            </Badge>
            <p className="text-sm text-muted-foreground font-body">
              Add a second image for just <span className="text-primary font-bold">${upsellCost}</span> — that's two prints for the price of ${doublePrice} total.
            </p>
            <div className="flex gap-2 mt-3 justify-center md:justify-start">
              <Button
                size="sm"
                variant={doubleSided ? "default" : "outline"}
                onClick={() => onToggleDouble(true)}
                className={doubleSided ? "bg-gradient-gold text-primary-foreground font-body text-xs hover:opacity-90" : "font-body text-xs"}
              >
                Yes, add 2nd side
              </Button>
              <Button
                size="sm"
                variant={!doubleSided ? "default" : "outline"}
                onClick={() => onToggleDouble(false)}
                className={!doubleSided ? "bg-secondary text-foreground font-body text-xs" : "font-body text-xs"}
              >
                No thanks
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Image picker — always visible when double-sided */}
      {doubleSided && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {/* Upload button */}
            <label className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-border hover:border-primary/50 rounded cursor-pointer transition-colors text-xs shrink-0">
              <Upload className="w-3.5 h-3.5 text-primary" />
              <span className="font-body text-foreground">Upload Photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
            {/* Search */}
            <form onSubmit={(e) => { e.preventDefault(); searchPhotos(query); }} className="flex gap-1.5 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search free photos..."
                  className="pl-7 bg-secondary border-border text-foreground font-body text-xs h-8"
                />
              </div>
              <Button type="submit" size="sm" disabled={loading} className="bg-gradient-gold text-primary-foreground font-body hover:opacity-90 h-8 w-8 p-0">
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
              </Button>
            </form>
          </div>

          {loading && <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />}

          {photos.length > 0 && !loading && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-1.5">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`aspect-[4/3] rounded overflow-hidden cursor-pointer border-2 transition-all ${
                    backImage?.url === photo.src.large2x ? "border-primary ring-1 ring-primary" : "border-transparent hover:border-primary/40"
                  }`}
                  onClick={() => { onSelectBack({ url: photo.src.large2x, photographer: photo.photographer, alt: photo.alt }); onToggleDouble(true); }}
                >
                  <img src={photo.src.medium} alt={photo.alt} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="font-body gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          onClick={onNext}
          disabled={doubleSided && !backUrl}
          className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 gap-2"
        >
          Finishing Options <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default StepUpsell;
