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
      className="group block h-full w-full max-w-full overflow-hidden rounded-lg bg-card shadow-soft transition-all duration-300 hover:shadow-elevated flex flex-col"
      style={{ maxWidth: '100%' }}
    >
      <div className="relative w-full max-w-full overflow-hidden bg-secondary" style={{ aspectRatio: '1 / 1', position: 'relative', maxWidth: '100%' }}>
        <img
          src={image}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          style={{ objectFit: 'cover', maxWidth: '100%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Wishlist icon - Always visible */}
        <button
          type="button"
          className="absolute right-2 top-2 z-10 cursor-pointer p-1 rounded-full hover:bg-white/20 transition-colors"
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

        {/* Discount badge */}
        {originalPrice && (
          <span className="absolute left-2 top-2 sm:left-3 sm:top-3 rounded-full bg-primary px-0.5 py-0.5 sm:px-2 sm:py-1 lg:px-1.5 lg:py-1 text-[6px] sm:text-[4px] lg:text-[8px] font-medium text-primary-foreground leading-tight">
            -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
          </span>
        )}
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-grow w-full max-w-full overflow-hidden" style={{ minHeight: '180px', maxWidth: '100%' }}>
        <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {category}
        </p>
        <h3 className="mt-1 text-sm sm:text-base font-medium text-foreground line-clamp-2 min-h-[2.5rem]">{name}</h3>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm sm:text-base font-semibold text-foreground">₹{price}</span>
          {originalPrice && (
            <span className="text-xs sm:text-sm text-muted-foreground line-through">
              ₹{originalPrice}
            </span>
          )}
        </div>

        {/* Buy Now and Add to Cart Buttons */}
        <div className="mt-auto pt-2 sm:pt-3 flex gap-1.5 sm:gap-2 w-full max-w-full">
          <Button
            onClick={handleBuyNow}
            className="hidden sm:flex flex-1 gap-2 sm:gap-2.5 lg:gap-3 bg-gray-500 hover:bg-gray-600 text-white h-8 sm:h-9 lg:h-10 text-[8px] sm:text-[9px] lg:text-[10px] px-3 sm:px-5 lg:px-6 w-full max-w-full min-w-0"
            style={{ maxWidth: '100%', backgroundColor: '#6B7280', color: '#FFFFFF' }}
          >
            <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 flex-shrink-0" style={{ color: '#FFFFFF' }} />
            <span className="whitespace-nowrap">Buy</span>
          </Button>
          <Button
            onClick={handleAddToCart}
            variant="outline"
            className="flex-1 gap-2 sm:gap-2.5 lg:gap-3 border-primary text-primary hover:bg-primary/10 h-8 sm:h-9 lg:h-10 text-[8px] sm:text-[9px] lg:text-[10px] px-3 sm:px-5 lg:px-6 w-full max-w-full min-w-0"
            style={{ maxWidth: '100%' }}
          >
            <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Cart</span>
          </Button>
        </div>
      </div>
    </Link>
  );
}

// Default export for backward compatibility
export default ProductCard;
