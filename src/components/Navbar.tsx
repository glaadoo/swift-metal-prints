import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Shop", href: "#shop-by-size" },
  { label: "Bundles", href: "#bundles" },
  { label: "Gallery", href: "#shop-by-image" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Reviews", href: "#reviews" },
  { label: "FAQ", href: "#faq" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 glass border-b border-border shadow-lg shadow-background/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16 md:h-20">
        <button
          onClick={() => scrollTo("#top")}
          className="font-display text-xl md:text-2xl font-bold text-gradient-gold tracking-wide"
        >
          PORTRILUX
        </button>

        {/* Desktop */}
        <ul className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <li key={item.href}>
              <button
                onClick={() => scrollTo(item.href)}
                className="text-xs font-body tracking-[0.15em] text-foreground/70 hover:text-primary transition-colors uppercase"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <Button
          size="sm"
          className="hidden lg:inline-flex bg-gradient-gold text-primary-foreground font-body font-semibold text-xs tracking-wider hover:opacity-90"
          onClick={() => scrollTo("#calculator")}
        >
          GET A QUOTE
        </Button>

        {/* Mobile toggle */}
        <button className="lg:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-background/98 glass border-b border-border">
          <ul className="flex flex-col p-6 gap-4">
            {navItems.map((item) => (
              <li key={item.href}>
                <button
                  onClick={() => scrollTo(item.href)}
                  className="text-sm font-body tracking-wider text-foreground/70 hover:text-primary transition-colors uppercase"
                >
                  {item.label}
                </button>
              </li>
            ))}
            <li>
              <Button
                className="w-full bg-gradient-gold text-primary-foreground font-body font-semibold text-xs tracking-wider hover:opacity-90 mt-2"
                onClick={() => scrollTo("#calculator")}
              >
                GET A QUOTE
              </Button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
