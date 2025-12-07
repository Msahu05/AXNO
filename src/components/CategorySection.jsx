import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    name: "For Women",
    count: "2500+ Items",
    items: ["Dresses", "T-Shirts and Blouses", "Jackets & Coats", "Accessories"],
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80",
    route: "/category/hoodies?filter=women"
  },
  {
    name: "For Men",
    count: "1500+ Items",
    items: ["Blazers", "T-Shirts and Shirts", "Jackets & Coats", "Jeans"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    route: "/category/hoodies?filter=men"
  },
  {
    name: "Accessories",
    count: "800+ Items",
    items: ["Handbags", "Watches", "Sunglasses", "Jewelry"],
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80",
    route: "/category/hoodies"
  },
];

export function CategorySection() {
  const navigate = useNavigate();

  return (
    <section className="bg-secondary/30 py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Shop by <span className="text-gradient">Category</span>
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {categories.map((category, index) => (
            <div
              key={category.name}
              className="group overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-300 hover:shadow-elevated animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-sm font-medium text-primary-foreground/80">
                    {category.count}
                  </p>
                  <h3 className="font-display text-2xl font-bold text-primary-foreground">
                    {category.name}
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <ul className="space-y-2">
                  {category.items.map((item) => (
                    <li key={item}>
                      <button
                        onClick={() => navigate(category.route)}
                        className="flex w-full items-center justify-between text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {item}
                        <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

