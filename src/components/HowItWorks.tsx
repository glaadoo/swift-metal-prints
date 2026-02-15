import { Upload, Palette, Package } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Your Photo",
    description: "Choose any image — we accept all formats and enhance for print quality.",
  },
  {
    icon: Palette,
    step: "02",
    title: "Choose Size & Material",
    description: "Pick from 21 standard sizes or go custom. Metal or acrylic — both stunning.",
  },
  {
    icon: Package,
    step: "03",
    title: "Delivered to Your Door",
    description: "Handcrafted and shipped in 48–72 hours. Ready to hang.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-xs tracking-[0.3em] uppercase text-primary font-body mb-4">
            Simple Process
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
            Three Steps to Your Masterpiece
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {steps.map((s, i) => (
            <div key={s.step} className="text-center group">
              <div className="relative mb-8">
                <span className="text-7xl font-display font-bold text-foreground/[0.04] absolute -top-4 left-1/2 -translate-x-1/2">
                  {s.step}
                </span>
                <div className="relative w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <s.icon className="w-7 h-7 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                {s.title}
              </h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed max-w-xs mx-auto">
                {s.description}
              </p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
