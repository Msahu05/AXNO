import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/wishlist-context";
import ProductCard from "@/components/ProductCard";
import { getImageUrl } from "@/lib/api";

const Wishlist = () => {
  const navigate = useNavigate();
  const { items: wishlistItems, removeItem } = useWishlist();

  return (
    <div className="min-h-screen bg-muted">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <p className="text-sm uppercase font-bold tracking-[0.2em] text-foreground">Wishlist</p>
          <div className="w-9" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-soft">
          {wishlistItems.length === 0 ? (
            <div className="rounded-xl border border-border bg-background p-10 sm:p-12 text-center">
              <p className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                Your wishlist is empty
              </p>
              <p className="text-muted-foreground mb-6">
                Add some products to your wishlist to see them here.
              </p>
              <Button
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6"
                onClick={() => navigate("/")}
              >
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-3">
              {wishlistItems.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  slug={item.slug}
                  name={item.name}
                  category={item.category}
                  price={item.price}
                  originalPrice={item.original}
                  image={getImageUrl(item.image)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;

