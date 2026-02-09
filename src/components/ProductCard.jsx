import { useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/wishlist-context";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { cn, generateSlug, getProductUrl } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

const HOVER_SLIDESHOW_INTERVAL_MS = 1200;

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  gallery, // Optional: array of image URLs for slideshow / scroll
  rating = 4.8,
  category,
  slug, // Optional slug, will be generated from name if not provided
}) {
  const images = (() => {
    if (gallery && Array.isArray(gallery) && gallery.length > 0) {
      return gallery.filter(Boolean);
    }
    return image ? [image] : [];
  })();

  const [hoverIndex, setHoverIndex] = useState(0);
  const intervalRef = useRef(null);
  const galleryScrollRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartTranslate = useRef(0);
  const didScrollGallery = useRef(false);
  const [mobileTranslate, setMobileTranslate] = useState(0);

  const startHoverSlideshow = () => {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setHoverIndex((prev) => (prev + 1) % images.length); // cycles: last → first
    }, HOVER_SLIDESHOW_INTERVAL_MS);
  };

  const stopHoverSlideshow = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setHoverIndex(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
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
    e.stopPropagation();
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

  const handleGalleryTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartTranslate.current = mobileTranslate;
    didScrollGallery.current = false;
  };

  const handleGalleryTouchMove = (e) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 5) {
      didScrollGallery.current = true;
      if (images.length > 1) e.preventDefault();
    }
    const w = galleryScrollRef.current?.getBoundingClientRect().width ?? 1;
    const deltaPercent = (dx / w) * 100;
    let next = touchStartTranslate.current + deltaPercent;
    // Allow one slide past each end so user can drag into "wrap" zone, then snap to other end
    const max = 100;
    const min = images.length > 1 ? -(images.length * 100) : 0;
    next = Math.max(min, Math.min(max, next));
    setMobileTranslate(next);
  };

  const handleGalleryTouchEnd = () => {
    if (images.length <= 1) {
      setMobileTranslate(0);
      return;
    }
    let index = Math.round(-mobileTranslate / 100);
    // Infinite cycle: past first (index < 0) → last; past last (index >= length) → first
    if (index < 0) index = images.length - 1;
    else if (index >= images.length) index = 0;
    else index = Math.max(0, Math.min(images.length - 1, index));
    setMobileTranslate(-index * 100);
  };

  const galleryTouchMoveRef = useRef(handleGalleryTouchMove);
  galleryTouchMoveRef.current = handleGalleryTouchMove;
  useEffect(() => {
    const el = galleryScrollRef.current;
    if (!el) return;
    const onMove = (e) => galleryTouchMoveRef.current(e);
    el.addEventListener('touchmove', onMove, { passive: false });
    return () => el.removeEventListener('touchmove', onMove);
  }, []);

  const handleCardClick = (e) => {
    if (didScrollGallery.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    navigate(productUrl);
  };

  const handleCardKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(productUrl);
    }
  };

  const cardClassName = "group block h-full w-full min-w-0 overflow-hidden rounded-lg bg-card shadow-soft transition-all duration-300 hover:shadow-elevated flex flex-col cursor-pointer";
  const cardStyle = { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', flex: '1 1 auto', minWidth: 0 };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      onTouchStart={() => { didScrollGallery.current = false; }}
      className={cardClassName}
      style={cardStyle}
    >
      <div
        className="relative w-full min-w-0 overflow-hidden bg-secondary flex-shrink-0 aspect-square lg:aspect-[4/3]"
        style={{ position: 'relative', width: '100%', minWidth: 0 }}
        onMouseEnter={startHoverSlideshow}
        onMouseLeave={stopHoverSlideshow}
      >
        {/* Desktop: sliding slideshow on hover */}
        <div className="absolute inset-0 hidden md:block overflow-hidden">
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{
              width: `${images.length * 100}%`,
              transform: `translateX(-${(hoverIndex / images.length) * 100}%)`,
            }}
          >
            {images.map((img, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 h-full group-hover:scale-105 transition-transform duration-500"
                style={{ width: `${100 / images.length}%` }}
              >
                <img
                  src={img}
                  alt={name}
                  className="h-full w-full object-cover object-center"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>
        {/* Mobile: one image at a time, change by sliding - viewport clips to single slide */}
        <div
          ref={galleryScrollRef}
          role="region"
          aria-label="Product images"
          className="product-card-gallery md:hidden absolute inset-0 z-[1] w-full h-full max-w-full touch-pan-y"
          style={{
            touchAction: 'pan-y',
            overflow: 'hidden',
            isolation: 'isolate',
          }}
          onTouchStart={handleGalleryTouchStart}
          onTouchEnd={handleGalleryTouchEnd}
        >
          <div
            className="h-full transition-transform duration-200 ease-out"
            style={{
              width: `${images.length * 100}%`,
              minWidth: `${images.length * 100}%`,
              transform: `translateX(${images.length ? mobileTranslate / images.length : 0}%)`,
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'nowrap',
            }}
          >
            {images.map((img, idx) => (
              <div
                key={idx}
                style={{
                  width: `${100 / images.length}%`,
                  minWidth: `${100 / images.length}%`,
                  flexShrink: 0,
                  height: '100%',
                  position: 'relative',
                }}
              >
                <img
                  src={img}
                  alt={`${name} ${idx + 1}`}
                  className="w-full h-full object-cover object-center select-none pointer-events-none block"
                  style={{ objectFit: 'cover', display: 'block' }}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
        
        {/* Wishlist icon - Always visible */}
        <button
          type="button"
          className="absolute right-2 top-2 z-10 cursor-pointer p-1 rounded-full hover:bg-white/20 transition-colors"
          onClick={handleWishlistClick}
          style={{ 
            pointerEvents: 'auto',
            backgroundColor: inWishlist ? 'rgba(220, 38, 38, 0.7)' : 'rgba(255, 255, 255, 0.3)', // brighter red with higher opacity
            backdropFilter: 'blur(4px)'
          }}
        >
          <Heart
            className={cn(
              "h-6 w-6 transition-all duration-300",
              inWishlist 
                ? "fill-red-500 text-red-500 stroke-red-500" // bright red
                : "fill-white text-white stroke-gray-900"
            )}
            strokeWidth={2.5}
            style={{ 
              display: 'block',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))'
            }}
          />
        </button>

      </div>

      <div className="p-2 sm:p-3 lg:p-2 flex flex-col flex-grow w-full overflow-hidden min-h-[120px] lg:min-h-[100px]" style={{ width: '100%', flex: '1 1 auto' }}>
        <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {category}
        </p>
        <h3 className="mt-0.5 lg:mt-1 text-xs sm:text-sm lg:text-xs font-medium text-foreground line-clamp-2 min-h-[2rem] lg:min-h-[1.75rem]">{name}</h3>

        <div className="mt-1 lg:mt-1.5 flex items-center gap-1.5">
          <span className="text-xs sm:text-sm lg:text-xs font-semibold text-foreground">₹{price}</span>
          {originalPrice && (
            <span className="text-[10px] sm:text-xs lg:text-[10px] text-muted-foreground line-through">
              ₹{originalPrice}
            </span>
          )}
        </div>

        {/* Buy Now and Add to Cart Buttons */}
        <div className="mt-auto pt-1.5 lg:pt-2 flex gap-1 sm:gap-1.5 w-full max-w-full">
          <Button
            onClick={handleBuyNow}
            className="hidden sm:flex flex-1 gap-1.5 lg:gap-2 bg-black hover:bg-black/90 text-white h-7 sm:h-8 lg:h-7 text-[8px] sm:text-[9px] lg:text-[8px] px-2 sm:px-4 lg:px-2 w-full max-w-full min-w-0"
            style={{ maxWidth: '100%' }}
          >
            <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-3 lg:w-3 flex-shrink-0" />
            <span className="whitespace-nowrap">Buy</span>
          </Button>
          <Button
            onClick={handleAddToCart}
            variant="outline"
            className="flex-1 gap-1.5 lg:gap-2 border-primary text-primary hover:bg-primary/10 h-7 sm:h-8 lg:h-7 text-[8px] sm:text-[9px] lg:text-[8px] px-2 sm:px-4 lg:px-2 w-full max-w-full min-w-0"
            style={{ maxWidth: '100%' }}
          >
            <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-3 lg:w-3 flex-shrink-0" />
            <span className="whitespace-nowrap">Cart</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Default export for backward compatibility
export default ProductCard;
