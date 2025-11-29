import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Heart, Star, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { allProducts, findProductById } from "@/data/products";
import { toast } from "@/hooks/use-toast";

const sizes = ["S", "M", "L", "XL"];

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const product = findProductById(id || '') || allProducts[0];
  const related = allProducts.filter((item) => item.audience === product.audience && item.id !== product.id).slice(0, 6);
  const [size, setSize] = useState("M");
  const [imageIndex, setImageIndex] = useState(0);
  const galleryLength = product.gallery.length || 1;
  const currentImage = product.gallery[imageIndex % galleryLength] ?? product.gallery[0];
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
    touchStartX.current = event.touches[0]?.clientX ?? null;
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.1),_transparent_65%)]">
      <div className="mx-auto max-w-6xl space-y-10 rounded-[56px] border border-white/10 bg-[var(--card)]/90 p-8 shadow-[var(--shadow-soft)] mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em]" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">Product details</p>
          <Button variant="ghost" className="gap-2 text-xs font-semibold uppercase tracking-[0.4em]" onClick={() => handleProtected("/checkout")}>
            Checkout <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div
              className="relative rounded-[40px] border border-white/15 bg-[var(--gradient-card)] p-10 shadow-[var(--shadow-soft)]"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <button
                className="absolute left-6 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-foreground shadow-lg hover:bg-white"
                onClick={showPrevImage}
                aria-label="Previous image"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                className="absolute right-6 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-foreground shadow-lg hover:bg-white"
                onClick={showNextImage}
                aria-label="Next image"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
              <img
                key={currentImage}
                src={currentImage}
                alt={product.name}
                loading="eager"
                className="gallery-slide h-[420px] w-full rounded-[32px] object-cover object-center"
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <button className="absolute right-8 top-8 rounded-full bg-background/70 p-3 text-foreground backdrop-blur" onClick={() => handleProtected("/wishlist")}>
                <Heart className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {product.gallery.map((photo, index) => (
                <button
                  key={photo}
                  className={`overflow-hidden rounded-2xl border-2 ${index === imageIndex ? "border-primary" : "border-transparent"} focus:outline-none`}
                  onClick={() => setImageIndex(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={photo} alt={`${product.name} ${index + 1}`} loading="lazy" className="h-20 w-full object-cover" style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">{product.type}</p>
              <h1 className="text-4xl font-black">{product.name}</h1>
              <p className="mt-2 text-muted-foreground">Built with ultra-soft 320 GSM fleece, double needle stitching, and reinforced drop shoulder panels.</p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {[...Array(5)].map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-secondary text-secondary" />
              ))}
              <span className="font-semibold text-foreground">4.9 · 212 reviews</span>
            </div>

            <div className="flex items-baseline gap-4">
              <p className="text-5xl font-black">₹{product.price}</p>
              <p className="text-2xl text-muted-foreground line-through">₹{product.original}</p>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary">India pricing</p>
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

            <div className="rounded-[32px] border border-dashed border-primary/40 bg-primary/5 p-6">
              <p className="text-sm font-semibold text-primary">Customise this drop</p>
              <p className="text-sm text-muted-foreground">
                Want your own art? Continue with Looklyn design or upload your concept at checkout. You can attach AI prompts, PSDs, or references there. We confirm on WhatsApp within 12 hours to deliver exactly what you want.
              </p>
              <Button variant="outline" className="mt-4 rounded-full border-primary text-primary hover:bg-primary/10" onClick={() => navigate("/checkout")}>
                Upload later at checkout
              </Button>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button className="flex-1 rounded-full bg-foreground px-8 py-6 text-sm font-semibold uppercase tracking-[0.4em] text-background" onClick={handleAddToCart}>
                Add to cart
              </Button>
              <Button variant="outline" className="flex-1 rounded-full border-foreground px-8 py-6 text-sm font-semibold uppercase tracking-[0.4em]" onClick={() => handleProtected("/checkout")}>
                Buy now
              </Button>
            </div>

            <div className="rounded-[28px] border border-white/20 bg-background/70 p-6">
              <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">Custom assurance</p>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> WhatsApp confirmation in 12 hours.
                </p>
                <p className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" /> Free mockups until you approve.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black">Related products</h2>
            <Button variant="ghost" className="text-xs font-semibold uppercase tracking-[0.4em]" onClick={() => navigate("/")}>
              View all
            </Button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <div key={item.id} className="rounded-[28px] border border-white/15 bg-background/80 p-4 shadow-inner">
                <img
                  src={item.gallery[0]}
                  alt={item.name}
                  loading="lazy"
                  className="h-48 w-full cursor-pointer rounded-2xl object-cover"
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  onClick={() => navigate(`/product/${item.id}`)}
                />
                <p className="mt-3 text-sm uppercase tracking-[0.4em] text-muted-foreground">{item.category}</p>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <div className="flex items-baseline gap-2">
                  <p className="font-bold">₹{item.price}</p>
                  <p className="text-xs text-muted-foreground line-through">₹{item.original}</p>
                </div>
                <Button variant="ghost" className="mt-2 rounded-full text-xs font-semibold uppercase tracking-[0.4em]" onClick={() => navigate(`/product/${item.id}`)}>
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
