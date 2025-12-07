import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/wishlist-context";
import { cn } from "@/lib/utils";

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  rating = 4.8,
  category,
}) {
  const { isInWishlist, addItem, removeItem } = useWishlist();
  const inWishlist = isInWishlist(id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (inWishlist) {
      removeItem(id);
    } else {
      addItem({ id, name, price, image, category });
    }
  };

  return (
    <Link
      to={`/product/${id}`}
      className="group block overflow-hidden rounded-lg bg-card shadow-soft transition-all duration-300 hover:shadow-elevated"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-secondary">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Wishlist button */}
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            "absolute right-3 top-3 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm transition-all duration-300",
            "opacity-0 group-hover:opacity-100",
            inWishlist && "opacity-100"
          )}
          onClick={handleWishlistClick}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              inWishlist ? "fill-primary text-primary" : "text-foreground"
            )}
          />
        </Button>

        {/* Quick add button */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <Button
            className="w-full gap-2 bg-primary/90 backdrop-blur-sm hover:bg-primary"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/product/${id}`;
            }}
          >
            <ShoppingBag className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>

        {/* Discount badge */}
        {originalPrice && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
            -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {category}
        </p>
        <h3 className="mt-1 font-medium text-foreground line-clamp-1">{name}</h3>
        
        <div className="mt-2 flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <span className="text-sm font-medium text-foreground">{rating}</span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold text-foreground">₹{price}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{originalPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// Default export for backward compatibility
export default ProductCard;
