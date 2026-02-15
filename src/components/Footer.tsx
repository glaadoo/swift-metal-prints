const scrollTo = (href: string) => {
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
};

const Footer = () => {
  return (
    <footer className="border-t border-border py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-xl font-bold text-gradient-gold block mb-4">
              PORTRILUX
            </span>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Museum-grade metal & acrylic prints. Handcrafted in the USA.
            </p>
          </div>

          <div>
            <p className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-4">
              Shop
            </p>
            <ul className="space-y-2">
              {[
                { label: "Metal Prints", href: "#shop-by-size" },
                { label: "Acrylic Prints", href: "#shop-by-size" },
                { label: "Bundles", href: "#bundles" },
                { label: "Photo Gallery", href: "#shop-by-image" },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => scrollTo(item.href)}
                    className="text-sm text-muted-foreground font-body hover:text-primary transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-4">
              Support
            </p>
            <ul className="space-y-2">
              {[
                { label: "FAQ", href: "#faq" },
                { label: "Shipping Info", href: "#faq" },
                { label: "Contact Us", href: "#contact" },
                { label: "Custom Quote", href: "#calculator" },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => scrollTo(item.href)}
                    className="text-sm text-muted-foreground font-body hover:text-primary transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-4">
              Company
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground font-body">
              <li>Made in USA</li>
              <li>Lifetime Guarantee</li>
              <li>Free Shipping $150+</li>
              <li>48–72 Hour Delivery</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-body">
            © {new Date().getFullYear()} Portrilux. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground font-body">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Shipping Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
