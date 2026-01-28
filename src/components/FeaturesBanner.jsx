import { Truck, CreditCard, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Free shipping for orders above ₹999",
  },
  {
    icon: CreditCard,
    title: "Flexible Payment",
    description: "Multiple secure payment options",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "We support online 24 hours a day",
  },
];

export function FeaturesBanner() {
  return (
    <section className="border-y border-border bg-muted py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="flex items-center gap-4 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

