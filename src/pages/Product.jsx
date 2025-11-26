import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Heart, Star, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ProductReviews from "@/components/ProductReviews";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { allProducts, findProductById } from "@/data/products";
import { toast } from "@/hooks/use-toast";

const sizes = ["S", "M", "L", "XL"];

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlist();
  const product = findProductById(id || '') || allProducts[0];
  const related = allProducts.filter((item) => item.audience === product.audience && item.id !== product.id).slice(0, 3);
  const [size, setSize] = useState("M");
  const [imageIndex, setImageIndex] = useState(0);
  const galleryLength = product.gallery.length || 1;
  const currentImage = product.gallery[imageIndex % galleryLength] || product.gallery[0];
  const touchStartX = useRef(null);

  const handleProtected = (destination) => {
    if (isAuthenticated) {
      navigate(destination);
    } else {
      navigate(`/auth?redirect=${encodeURIComponent(destination)}`);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const showNextImage = () => setImageIndex((prev) => (prev + 1) % galleryLength);
  const showPrevImage = () => setImageIndex((prev) => (prev - 1 + galleryLength) % galleryLength);

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0]?.clientX || null;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const diff = event.changedTouches[0]?.clientX - touchStartX.current;
    touchStartX.current = null;
    if (!diff || Math.abs(diff) < 40) return;
    if (diff > 0) {
      showPrevImage();
    } else {
      showNextImage();
    }
  };

  useEffect(() => {
    setImageIndex(0);
  }, [product.id]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent(`/product/${product.id}`)}`);
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      original: product.original,
      image: product.gallery[0],
      size,
    });
    toast({
      title: "Item added to cart",
      description: `${product.name} (Size ${size}) has been added to your cart.`,
    });
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent(`/product/${product.id}`)}`);
      return;
    }
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        original: product.original,
        image: product.gallery[0],
      });
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.1),_transparent_65%)]">
      <div className="px-4 sm:px-6 pb-8 sm:pb-12 pt-6">
        <Header />
      </div>
      <div className="px-4 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8 lg:space-y-10 rounded-[32px] sm:rounded-[40px] lg:rounded-[56px] border border-white/10 bg-[var(--card)]/90 p-4 sm:p-6 lg:p-8 shadow-[var(--shadow-soft)] mt-4 sm:mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <button className="flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] transition-all duration-200 bg-transparent hover:bg-purple-200 hover:shadow-sm active:bg-purple-300" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back</span>
          </button>
          <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground hidden sm:block">Product details</p>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:gap-10 lg:grid-cols-2">
          <div className="space-y-4 sm:space-y-6">
            <div
              className="relative rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] border border-white/15 bg-[var(--gradient-card)] p-4 sm:p-6 lg:p-10 shadow-[var(--shadow-soft)]"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <button
                className="absolute left-2 sm:left-4 lg:left-6 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-1.5 sm:p-2 text-foreground shadow-lg hover:bg-white transition-colors"
                onClick={showPrevImage}
                aria-label="Previous image"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                className="absolute right-2 sm:right-4 lg:right-6 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-1.5 sm:p-2 text-foreground shadow-lg hover:bg-white transition-colors"
                onClick={showNextImage}
                aria-label="Next image"
              >
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <img
                key={currentImage}
                src={currentImage}
                alt={product.name}
                loading="eager"
                className="gallery-slide h-[280px] sm:h-[350px] lg:h-[420px] w-full rounded-[20px] sm:rounded-[24px] lg:rounded-[32px] object-cover object-center"
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <button 
                className={`absolute right-4 sm:right-6 lg:right-8 top-4 sm:top-6 lg:top-8 rounded-full bg-background/70 p-2 sm:p-3 backdrop-blur transition-colors ${
                  isInWishlist(product.id) ? "text-primary fill-primary" : "text-foreground"
                }`}
                onClick={handleToggleWishlist}
              >
                <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {product.gallery.map((photo, index) => (
                <button
                  key={photo}
                  className={`overflow-hidden rounded-xl sm:rounded-2xl border-2 ${index === imageIndex ? "border-primary" : "border-transparent"} focus:outline-none`}
                  onClick={() => setImageIndex(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={photo} alt={`${product.name} ${index + 1}`} loading="lazy" className="h-12 sm:h-16 lg:h-20 w-full object-cover" style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">{product.type}</p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mt-1">{product.name}</h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">Built with ultra-soft 320 GSM fleece, double needle stitching, and reinforced drop shoulder panels.</p>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              {[...Array(5)].map((_, index) => (
                <Star key={index} className="h-3 w-3 sm:h-4 sm:w-4 fill-secondary text-secondary" />
              ))}
              <span className="font-semibold text-foreground">4.9 · 212 reviews</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3 sm:gap-4">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black">₹{product.price}</p>
              <p className="text-xl sm:text-2xl text-muted-foreground line-through">₹{product.original}</p>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-secondary">India pricing</p>
            </div>

            <div>
              <p className="font-display text-xs uppercase tracking-[0.6em] text-muted-foreground">Select size</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {sizes.map((item) => (
                  <button key={item} className={`rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] ${item === size ? "bg-foreground text-background" : "bg-muted text-foreground"}`} onClick={() => setSize(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] sm:rounded-[28px] lg:rounded-[32px] border border-dashed border-primary/40 bg-primary/5 p-4 sm:p-6">
              <p className="text-xs sm:text-sm font-semibold text-primary">Customise this drop</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Want your own art? Continue with AXNO design or upload your concept at checkout. You can attach AI prompts, PSDs, or references there. We confirm on WhatsApp within 12 hours to deliver exactly what you want.
              </p>
              <Button variant="outline" className="mt-3 sm:mt-4 rounded-full border-primary text-primary hover:bg-primary/10 text-xs sm:text-sm" onClick={() => navigate("/checkout")}>
                Upload later at checkout
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button className="flex-1 rounded-full bg-foreground px-6 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm font-semibold uppercase tracking-[0.4em] text-background" onClick={handleAddToCart}>
                Add to cart
              </Button>
              <Button variant="outline" className="flex-1 rounded-full border-foreground px-6 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm font-semibold uppercase tracking-[0.4em]" onClick={() => handleProtected("/checkout")}>
                Buy now
              </Button>
            </div>

            <div className="rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] border border-white/20 bg-background/70 p-4 sm:p-6">
              <p className="font-display text-xs uppercase tracking-[0.6em] text-muted-foreground">Custom assurance</p>
              <div className="mt-3 space-y-2 text-xs sm:text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" /> WhatsApp confirmation in 12 hours.
                </p>
                <p className="flex items-center gap-2">
                  <Wand2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" /> Free mockups until you approve.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-10">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl sm:text-3xl font-black">Related products</h2>
            <Button variant="ghost" className="text-xs font-semibold uppercase tracking-[0.4em] flex-shrink-0" onClick={() => navigate("/")}>
              View all
            </Button>
          </div>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory" style={{ WebkitOverflowScrolling: 'touch' }}>
            {related.map((item) => (
              <div key={item.id} className="flex-shrink-0 w-[45%] sm:w-[180px] lg:w-[200px] snap-start rounded-[16px] sm:rounded-[20px] border border-white/15 bg-background/80 p-2 sm:p-3 shadow-inner hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>
                <img
                  src={item.gallery[0]}
                  alt={item.name}
                  loading="lazy"
                  className="h-36 sm:h-40 lg:h-44 w-full rounded-lg sm:rounded-xl object-cover mb-2"
                />
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-muted-foreground truncate">{item.category}</p>
                <h3 className="text-xs sm:text-sm font-semibold truncate mt-1">{item.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <p className="text-xs sm:text-sm font-bold">₹{item.price}</p>
                  <p className="text-[10px] text-muted-foreground line-through">₹{item.original}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ProductReviews productId={product.id} />
        </div>
      </div>
    </div>
  );
};

export default Product;
