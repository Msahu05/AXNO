import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Flame, PhoneCall, ShieldHalf, Star, UploadCloud, Waves, HeartHandshake } from "lucide-react";
import LandingAnimation from "@/components/LandingAnimation";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { allProducts } from "@/data/products";
import { toast } from "@/hooks/use-toast";

const heroDescriptions = {
  Hoodie: "Hand-painted gradients layered on plush, breathable fleece.",
  "T-Shirt": "Structured oversized fit with premium bio-washed cotton.",
  Sweatshirt: "3D puff-print loops that react beautifully to neon lighting.",
};

const heroSlides = allProducts.slice(0, 5);

const customizationSteps = [
  {
    icon: <UploadCloud className="h-6 w-6" />,
    title: "Upload your art",
    description: "Drop AI prompts, PSD, PDF, or even a quick pencil sketch.",
  },
  {
    icon: <HeartHandshake className="h-6 w-6" />,
    title: "WhatsApp confirmation",
    description: "We hop on a WhatsApp call within 12 hours to finesse the details.",
  },
  {
    icon: <ShieldHalf className="h-6 w-6" />,
    title: "Hyper-quality proofing",
    description: "Color-calibrated proofs and stitch maps before production.",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();
  const [heroIndex, setHeroIndex] = useState(0);
  const [activeFilters, setActiveFilters] = useState({});

  const productTypes = [
    { key: "Hoodie", label: "Hoodies", route: "hoodies" },
    { key: "T-Shirt", label: "T-Shirts", route: "t-shirts" },
    { key: "Sweatshirt", label: "Sweatshirts", route: "sweatshirts" },
  ];

  const heroCount = heroSlides.length || 1;

  const cycleHero = (direction) => {
    setHeroIndex((current) => {
      const next = direction === "next" ? current + 1 : current - 1;
      return (next + heroCount) % heroCount;
    });
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      cycleHero("next");
    }, 4200);
    return () => window.clearInterval(interval);
  }, [heroCount]);

  const requireAuth = (destination) => {
    if (isAuthenticated) {
      navigate(destination);
    } else {
      navigate(`/auth?redirect=${encodeURIComponent(destination)}`);
    }
  };

  const handleProtectedAction = (destination) => {
    requireAuth(destination);
  };

  const handleAddToWishlist = (productId) => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent("/")}`);
      return;
    }
    const product = allProducts.find((p) => p.id === productId);
    if (product && !isInWishlist(productId)) {
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
    } else if (isInWishlist(productId)) {
      toast({
        title: "Already in wishlist",
        description: "This item is already in your wishlist.",
      });
    }
  };

  const activeHero = heroSlides[heroIndex % heroSlides.length];
  const heroSlideKey = `${activeHero.id}-${heroIndex}`;
  const handleHeroPrev = () => cycleHero("prev");
  const handleHeroNext = () => cycleHero("next");

  // Show loading state while auth is initializing (after all hooks)
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_60%)]">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_60%)] pt-6">
      <LandingAnimation />
      <div className="flex w-full flex-col gap-8 sm:gap-12 lg:gap-16 px-4 sm:px-6 pb-8 sm:pb-12 lg:px-16">
        <Header />
        {/* Brand Name and Tagline - Home Page Only */}
        <div className="flex flex-col items-center justify-center mt-4 sm:mt-6 lg:mt-8">
          <Logo size="default" showTagline={true} inlineTagline={false} className="text-foreground" />
        </div>

        <section className="grid gap-6 sm:gap-8 lg:gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="order-2 lg:order-1 rounded-[32px] sm:rounded-[40px] lg:rounded-[56px] border border-white/20 bg-[var(--gradient-hero)] p-6 sm:p-8 lg:p-10 shadow-[var(--shadow-soft)] backdrop-blur dark:border-white/5 dark:shadow-[var(--shadow-strong)]">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">Custom Upperwear Studio</p>
            <h1 className="mt-4 sm:mt-6 font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl leading-tight text-foreground">
              Build your <span className="text-primary">signature</span> drop. Hoodies, tees, sweatshirts crafted for India.
            </h1>
            <p className="mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base lg:text-lg text-muted-foreground">
              Browse our in-house drops or upload your art. Every stitch is mapped, proofed, and confirmed with you on WhatsApp within 12 hours.
            </p>

            <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
              <Button
                className="rounded-full bg-foreground px-6 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-background"
                onClick={() => requireAuth(`/product/${activeHero.id}`)}
              >
                Buy now
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-foreground px-6 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm font-semibold uppercase tracking-[0.18em]"
                onClick={() => document.getElementById("custom")?.scrollIntoView({ behavior: "smooth" })}
              >
                Custom flow
              </Button>
            </div>

            <div className="mt-6 sm:mt-10 flex flex-wrap gap-4 sm:gap-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                <p className="font-display text-sm sm:text-base tracking-[0.18em] text-muted-foreground">
                  4.9/5<br />Community rated
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                <p className="font-display text-sm sm:text-base tracking-[0.18em] text-muted-foreground">
                  48h<br />Production
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Waves className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                <p className="font-display text-sm sm:text-base tracking-[0.18em] text-muted-foreground">
                  Zero<br />Cracking ink
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 rounded-[32px] sm:rounded-[40px] lg:rounded-[56px] border border-white/15 bg-[var(--card)]/90 p-4 sm:p-6 lg:p-8 shadow-[var(--shadow-soft)] backdrop-blur dark:border-white/5">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-muted-foreground">
              <span>Top drops</span>
              <span>
                {heroIndex + 1} / {heroSlides.length}
              </span>
            </div>
            <div className="relative mt-4 sm:mt-6 overflow-hidden rounded-[24px] sm:rounded-[28px] lg:rounded-[32px] bg-[var(--gradient-card)] p-2 sm:p-4 shadow-inner">
              <button
                className="absolute left-2 sm:left-4 lg:left-6 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/70 p-1.5 sm:p-2 text-foreground shadow-lg hover:bg-white transition-colors"
                onClick={handleHeroPrev}
                aria-label="Previous product"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                className="absolute right-2 sm:right-4 lg:right-6 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/70 p-1.5 sm:p-2 text-foreground shadow-lg hover:bg-white transition-colors"
                onClick={handleHeroNext}
                aria-label="Next product"
              >
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <img
                key={heroSlideKey}
                src={activeHero.gallery[0]}
                alt={activeHero.name}
                loading="eager"
                className="hero-slide h-48 sm:h-64 lg:h-72 w-full cursor-pointer rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] object-cover object-top"
                onClick={() => navigate(`/product/${activeHero.id}`)}
              />
            </div>
            <div className="mt-4 sm:mt-6">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{activeHero.category}</p>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mt-1">{activeHero.name}</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">{heroDescriptions[activeHero.category] ?? "Tailored for everyday legends."}</p>
            </div>
            <div className="mt-4 sm:mt-6 flex gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  className={`h-1 flex-1 rounded-full ${index === heroIndex ? "bg-foreground" : "bg-muted"}`}
                  onClick={() => setHeroIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="catalogue" className="space-y-8 sm:space-y-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-display text-xs sm:text-sm uppercase tracking-[0.22em] text-muted-foreground">Top products</p>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl">Layer up in Looklyn</h2>
            </div>
          </div>

          <div className="space-y-16">
            {productTypes.map((type) => {
              const typeProducts = allProducts.filter((p) => p.category === type.key);
              const menProducts = typeProducts.filter((p) => p.audience === "men").slice(0, 6);
              const womenProducts = typeProducts.filter((p) => p.audience === "women").slice(0, 6);
              const kidsProducts = typeProducts.filter((p) => p.audience === "kids").slice(0, 6);
              
              const activeFilter = activeFilters[type.key] || null;
              
              // If no filter is selected, show all products from this category (mixed from all audiences)
              let displayProducts;
              if (!activeFilter) {
                displayProducts = typeProducts.slice(0, 6);
              } else {
                // Get products for the selected audience in this category
                displayProducts = activeFilter === "men" 
                  ? menProducts 
                  : activeFilter === "women" 
                  ? womenProducts 
                  : kidsProducts;
                
                // If no products found for this category+audience, show products from that audience across all categories
                if (displayProducts.length === 0) {
                  displayProducts = allProducts
                    .filter((p) => p.audience === activeFilter)
                    .slice(0, 6);
                }
              }
              
              const handleFilterChange = (filter) => {
                // If clicking the same filter, deselect it (show all)
                if (activeFilter === filter) {
                  setActiveFilters(prev => {
                    const newFilters = { ...prev };
                    delete newFilters[type.key];
                    return newFilters;
                  });
                } else {
                  setActiveFilters(prev => ({ ...prev, [type.key]: filter }));
                }
              };
              
              return (
                <div key={type.key} id={`${type.key.toLowerCase()}-section`} className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-primary/20 dark:bg-primary/30 px-4 sm:px-6 py-3 sm:py-4 rounded-[20px] sm:rounded-[24px] border border-primary/30">
                    <p className="font-display text-2xl uppercase tracking-[0.16em] text-foreground">{type.label}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        variant={activeFilter === "men" ? "default" : "outline"}
                        className={`font-display rounded-full border-foreground px-4 py-2 text-sm tracking-[0.12em] font-semibold ${
                          activeFilter === "men" 
                            ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                            : "bg-primary/15 dark:bg-primary/25 hover:bg-primary/25 dark:hover:bg-primary/35"
                        }`}
                        onClick={() => handleFilterChange("men")}
                      >
                        Men
                      </Button>
                      <Button
                        variant={activeFilter === "women" ? "default" : "outline"}
                        className={`font-display rounded-full border-foreground px-4 py-2 text-sm tracking-[0.12em] font-semibold ${
                          activeFilter === "women" 
                            ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                            : "bg-primary/15 dark:bg-primary/25 hover:bg-primary/25 dark:hover:bg-primary/35"
                        }`}
                        onClick={() => handleFilterChange("women")}
                      >
                        Women
                      </Button>
                      <Button
                        variant={activeFilter === "kids" ? "default" : "outline"}
                        className={`font-display rounded-full border-foreground px-4 py-2 text-sm tracking-[0.12em] font-semibold ${
                          activeFilter === "kids" 
                            ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                            : "bg-primary/15 dark:bg-primary/25 hover:bg-primary/25 dark:hover:bg-primary/35"
                        }`}
                        onClick={() => handleFilterChange("kids")}
                      >
                        Kids
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {displayProducts.length > 0 ? (
                      displayProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          id={product.id}
                          name={product.name}
                          category={product.category}
                          price={product.price}
                          originalPrice={product.original}
                          image={product.gallery[0]}
                          accent={product.accent}
                          onView={() => navigate(`/product/${product.id}`)}
                          onAdd={() => handleProtectedAction(`/product/${product.id}`)}
                          onWishlist={() => handleAddToWishlist(product.id)}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12 text-muted-foreground">
                        <p className="text-lg">No {activeFilter} products available in this category.</p>
                        <p className="text-sm mt-2">Check back soon for new arrivals!</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      className="font-display rounded-full border-foreground px-8 py-3 tracking-[0.12em]"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        navigate(`/category/${type.route}`);
                      }}
                    >
                      View All {type.label}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="custom" className="grid gap-4 sm:gap-6 lg:gap-8 rounded-[32px] sm:rounded-[40px] lg:rounded-[56px] border border-white/15 bg-gradient-to-r from-[var(--card)] via-[var(--muted)] to-[var(--card)] p-4 sm:p-6 lg:p-10 xl:p-12 shadow-[var(--shadow-soft)] lg:grid-cols-2">
          <div className="space-y-4 sm:space-y-5 lg:space-y-6">
            <p className="font-display text-xs sm:text-sm uppercase tracking-[0.22em] text-muted-foreground">Custom studio</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black leading-tight">Upload, confirm, conquer.</h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
              Start with our templates or drop your own artwork. Checkout collects your inspiration, Pinterest links or AI prompts. We ping you on WhatsApp within 12 hours to align colours, placements, and fit. Satisfaction over everything.
            </p>
            <div className="space-y-3 sm:space-y-4">
              {customizationSteps.map((step) => (
                <div key={step.title} className="flex gap-3 sm:gap-4 rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] border border-white/20 bg-background/60 p-3 sm:p-4 lg:p-5 backdrop-blur">
                  <div className="rounded-xl sm:rounded-2xl bg-primary/10 p-2 sm:p-3 lg:p-4 text-primary flex-shrink-0">{step.icon}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base lg:text-lg font-semibold">{step.title}</p>
                    <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <Button className="rounded-full bg-primary px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-xs sm:text-sm font-semibold uppercase tracking-[0.4em] w-auto" onClick={() => navigate("/checkout")}>
                Start custom order
              </Button>
            </div>
          </div>  

          <div className="rounded-[28px] sm:rounded-[32px] lg:rounded-[40px] border border-white/15 bg-[var(--gradient-card)] p-4 sm:p-6 lg:p-8 xl:p-10 shadow-[var(--shadow-soft)]">
            <div className="space-y-3 sm:space-y-4 lg:space-y-5">
              <p className="font-display text-xs sm:text-sm uppercase tracking-[0.22em] text-muted-foreground">Why Looklyn</p>
              <ul className="space-y-2 sm:space-y-3 lg:space-y-4 text-xs sm:text-sm lg:text-base text-muted-foreground">
                <li className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary flex-shrink-0 mt-0.5" /> <span>Eco pigment + puff + reflective inks.</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary flex-shrink-0 mt-0.5" /> <span>Saved addresses & reorder within 30 seconds.</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary flex-shrink-0 mt-0.5" /> <span>Wishlist syncs everywhere after login.</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary flex-shrink-0 mt-0.5" /> <span>Premium custom fabric selection — Choose from our curated quality fabrics.</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary flex-shrink-0 mt-0.5" /> <span>24/7 customer support — Always here when you need us.</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary flex-shrink-0 mt-0.5" /> <span>Best quality guarantee — Premium materials and craftsmanship in every piece.</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary flex-shrink-0 mt-0.5" /> <span>Zero cracking ink guarantee — Long-lasting prints that stay vibrant.</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary flex-shrink-0 mt-0.5" /> <span>Fast production & delivery — Quick turnaround without compromising quality.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] sm:rounded-[32px] lg:rounded-[40px] border border-white/15 bg-[var(--card)]/95 p-4 sm:p-6 lg:p-8 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-8">
            <div className="flex-1 max-w-2xl">
              <p className="font-display text-xs uppercase tracking-[0.7em] text-muted-foreground">Support</p>
              <h3 className="text-2xl sm:text-3xl font-black mt-1">Talk to the creators</h3>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                Text us on WhatsApp with your order ID + custom references. We&apos;ll respond within 12 hours with mockups and timelines.
              </p>
            </div>
            <div className="flex flex-row gap-3 sm:gap-4 w-full lg:w-auto lg:flex-shrink-0">
              <Button className="rounded-full bg-[#25D366] px-3 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-lg w-auto" onClick={() => window.open("https://wa.me/918734884862", "_blank")}>
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </Button>
              <Button variant="ghost" className="rounded-full border border-foreground px-3 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-semibold uppercase tracking-[0.4em] w-auto" onClick={() => window.open("tel:+918734884862", "_self")}>
                <PhoneCall className="mr-2 h-4 w-4" /> Call
              </Button>
            </div>
          </div>
        </section>

        <footer className="py-10 text-center text-sm sm:text-base uppercase tracking-[0.5em] text-muted-foreground font-normal">
          © {new Date().getFullYear()} Looklyn — Own The Look
        </footer>
      </div>
    </div>
  );
};

export default Home;

