import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { productsAPI, getImageUrl } from "@/lib/api";

export function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await productsAPI.getAll({ limit: 4 });
        setProducts(response.products || []);
      } catch (error) {
        console.error('Error loading featured products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Featured <span className="text-gradient">Collection</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Handpicked styles that define the season
          </p>
        </div>

        {loading ? (
          // Show centered loading spinner
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
            <p className="text-muted-foreground text-lg">Loading...</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard
                  id={product.id}
                  name={product.name}
                  category={product.category}
                  price={product.price}
                  originalPrice={product.original || product.originalPrice}
                  image={getImageUrl(Array.isArray(product.gallery) ? product.gallery[0] : product.gallery || product.image)}
                  rating={4.8}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

