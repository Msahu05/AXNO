import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/wishlist-context";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { cn, generateSlug, getProductUrl } from "@/lib/utils";

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  rating = 4.8,
  category,
  slug, // Optional slug, will be generated from name if not provided
}) {
  // Generate product URL using slug if available, otherwise use id
  const productUrl = slug ? `/product/${slug}` : (id ? `/product/${id}` : '/');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, addItem, removeItem } = useWishlist();
  const { addItem: addToCart } = useCart();
  const { toast } = useToast();
  const inWishlist = isInWishlist(id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (inWishlist) {
      removeItem(id);
    } else {
      addItem({ id, name, price, image, category });
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent(productUrl)}`);
      return;
    }
    
    // Add with default size 'M' - user can change on product page
    addToCart({
      id,
      name,
      category,
      price,
      original: originalPrice,
      image,
      size: 'M', // Default size
    });
    
    toast({
      title: "Added to cart!",
      description: `${name} has been added to your cart.`,
    });
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent(productUrl)}`);
      return;
    }
    
    // Don't add to cart - buy now is separate
    const buyNowProduct = {
      id,
      name,
      category,
      price,
      original: originalPrice,
      image,
      size: 'M', // Default size
      quantity: 1
    };
    
    // Store buy now product in sessionStorage (separate from cart)
    sessionStorage.setItem('buyNowProduct', JSON.stringify(buyNowProduct));
    
    // Navigate to checkout with buyNow flag
    navigate('/checkout', { 
      state: { 
        buyNow: true
      } 
    });
  };

  return (
    <Link
      to={productUrl}
      className="group block overflow-hidden rounded-lg bg-card shadow-soft transition-all duration-300 hover:shadow-elevated"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-secondary">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Wishlist icon - Always visible */}
        <button
          type="button"
          className="absolute right-2 top-2 z-50 cursor-pointer p-1 rounded-full hover:bg-white/20 transition-colors"
          onClick={handleWishlistClick}
          style={{ 
            pointerEvents: 'auto',
            backgroundColor: inWishlist ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(4px)'
          }}
        >
          <Heart
            className={cn(
              "h-6 w-6 transition-all duration-300",
              inWishlist 
                ? "fill-red-600 text-red-600 stroke-red-600" 
                : "fill-white text-white stroke-gray-900"
            )}
            strokeWidth={2.5}
            style={{ 
              display: 'block',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))'
            }}
          />
        </button>

        {/* Quick add button */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <Button
            className="w-full gap-2 bg-primary/90 backdrop-blur-sm hover:bg-primary"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = productUrl;
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

        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold text-foreground">₹{price}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{originalPrice}
            </span>
          )}
        </div>

        {/* Buy Now and Add to Cart Buttons */}
        <div className="mt-3 flex gap-2">
          <Button
            onClick={handleBuyNow}
            className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            size="sm"
          >
            <ShoppingBag className="h-4 w-4" />
            Buy Now
          </Button>
          <Button
            onClick={handleAddToCart}
            variant="outline"
            className="flex-1 gap-2 border-primary text-primary hover:bg-primary/10"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>
    </Link>
  );
}

// Default export for backward compatibility
export default ProductCard;
