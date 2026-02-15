import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const reviews = [
  {
    name: "Rose B.",
    location: "Phoenix, AZ",
    text: "Stunning quality! My grandkids' photo came out amazing. The metal gives it depth you can't get with regular prints.",
    rating: 5,
  },
  {
    name: "James A.",
    location: "Fort Worth, TX",
    text: "You have to see this in person to appreciate the color. The vibrancy on metal is unreal. Highly recommend!",
    rating: 5,
  },
  {
    name: "Steven G.",
    location: "San Diego, CA",
    text: "I sent in a phone photo of our wedding day. They enhanced it and it turned out incredible. Museum quality.",
    rating: 5,
  },
  {
    name: "Maria L.",
    location: "Austin, TX",
    text: "Ordered a 3-pack bundle for my living room. The prints arrived perfectly packaged and look absolutely stunning.",
    rating: 5,
  },
  {
    name: "David K.",
    location: "Denver, CO",
    text: "Fast shipping, incredible quality. I've ordered from several print companies and this is by far the best.",
    rating: 5,
  },
  {
    name: "Sarah M.",
    location: "Miami, FL",
    text: "The acrylic print has this incredible luminous quality. Everyone who visits asks where I got it.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="reviews" className="py-24 md:py-32 px-6 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-primary font-body mb-4">
            Customer Reviews
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Loved by Thousands
          </h2>
          <div className="flex items-center justify-center gap-1.5 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-primary text-primary" />
            ))}
          </div>
          <p className="text-sm text-muted-foreground font-body">
            4.8 out of 5 based on 2,000+ reviews
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <Card key={r.name} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 font-body leading-relaxed mb-4 italic">
                  "{r.text}"
                </p>
                <div>
                  <p className="text-sm font-body font-semibold text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground font-body">{r.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
