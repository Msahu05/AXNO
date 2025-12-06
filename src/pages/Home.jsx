import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Flame, PhoneCall, ShieldHalf, Star, UploadCloud, Waves, HeartHandshake, MessageCircle } from "lucide-react";
import LandingAnimation from "@/components/LandingAnimation";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { productsAPI, getImageUrl } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const heroDescriptions = {
  Hoodie: "Hand-painted gradients layered on plush, breathable fleece.",
  "T-Shirt": "Structured oversized fit with premium bio-washed cotton.",
  Sweatshirt: "3D puff-print loops that react beautifully to neon lighting.",
};

// Hero slides will be loaded from API

const customizationSteps = [
  {
    step: 1,
    icon: UploadCloud,
    title: "Upload art",
    description: "Drop AI prompts, PSD, PDF, or pencil sketch.",
  },
  {
    step: 2,
    icon: HeartHandshake,
    title: "WhatsApp confirm",
    description: "We call within 12 hours to finesse details.",
  },
  {
    step: 3,
    icon: ShieldHalf,
    title: "Quality proofing",
    description: "Color-calibrated proofs before production.",
  },
];

const whyLooklynFeatures = [
  { icon: CheckCircle2, title: "Eco inks", subtext: "Puff + reflective" },
  { icon: CheckCircle2, title: "Quick reorder", subtext: "Saved addresses in 30s" },
  { icon: CheckCircle2, title: "Wishlist sync", subtext: "Everywhere after login" },
  { icon: CheckCircle2, title: "Premium fabric", subtext: "Curated quality selection" },
  { icon: CheckCircle2, title: "24/7 support", subtext: "Always here when needed" },
  { icon: CheckCircle2, title: "Quality guarantee", subtext: "Premium materials always" },
  { icon: CheckCircle2, title: "Zero cracking", subtext: "Long-lasting vibrant prints" },
  { icon: CheckCircle2, title: "Fast delivery", subtext: "Quick turnaround guaranteed" },
];

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();
  const [heroIndex, setHeroIndex] = useState(0);
  const [activeFilters, setActiveFilters] = useState({});
  const [featureCarouselIndex, setFeatureCarouselIndex] = useState(0);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const productTypes = [
    { key: "Hoodie", label: "Hoodies", route: "hoodies" },
    { key: "T-Shirt", label: "T-Shirts", route: "t-shirts" },
    { key: "Sweatshirt", label: "Sweatshirts", route: "sweatshirts" },
  ];

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll();
        setAllProducts(response.products || []);
      } catch (error) {
        console.error('Error loading products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products',
          variant: 'destructive',
        });
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Calculate heroSlides and heroCount after allProducts is loaded
  const heroSlides = allProducts.length > 0 ? allProducts.slice(0, 5) : [];
  const heroCount = heroSlides.length || 1;

  const cycleHero = (direction) => {
    if (heroCount === 0) return;
    setHeroIndex((current) => {
      const next = direction === "next" ? current + 1 : current - 1;
      return (next + heroCount) % heroCount;
    });
  };

  useEffect(() => {
    if (heroCount > 0) {
      const interval = window.setInterval(() => {
        cycleHero("next");
      }, 4200);
      return () => window.clearInterval(interval);
    }
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
        original: product.original || product.originalPrice,
        image: getImageUrl(Array.isArray(product.gallery) ? product.gallery[0] : product.gallery),
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

  const activeHero = heroSlides.length > 0 ? heroSlides[heroIndex % heroSlides.length] : null;
  const heroSlideKey = activeHero ? `${activeHero.id}-${heroIndex}` : `hero-${heroIndex}`;
  const handleHeroPrev = () => cycleHero("prev");
  const handleHeroNext = () => cycleHero("next");

  // Feature carousel state and navigation
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Reset carousel index on resize to prevent out-of-bounds
      setFeatureCarouselIndex(0);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCardsPerView = () => {
    if (windowWidth >= 1024) return 3;
    if (windowWidth >= 768) return 2;
    return 1;
  };

  const cardsPerView = getCardsPerView();
  const totalSlides = Math.ceil(whyLooklynFeatures.length / 3);
  const currentSlide = Math.floor(featureCarouselIndex / 3);

  const handleFeaturePrev = () => {
    setFeatureCarouselIndex((prev) => {
      const newIndex = Math.max(0, prev - 3);
      return newIndex;
    });
  };

  const handleFeatureNext = () => {
    setFeatureCarouselIndex((prev) => {
      const maxIndex = Math.max(0, whyLooklynFeatures.length - 3);
      return Math.min(maxIndex, prev + 3);
    });
  };

  const goToFeatureSlide = (slideIndex) => {
    setFeatureCarouselIndex(slideIndex * cardsPerView);
  };

  const canGoPrev = featureCarouselIndex > 0;
  const canGoNext = featureCarouselIndex < whyLooklynFeatures.length - 3;

  // Show loading state while auth is initializing or products are loading
  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-[#f8f7ff] to-white">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!activeHero) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-[#f8f7ff] to-white">
        <div className="text-center">
          <p className="text-muted-foreground">No products available</p>
        </div>
      </div>
    );
  }

  // Feature cards data
  const featureCards = [
    { icon: Star, label: "4.9/5", sublabel: "Community rated" },
    { icon: Flame, label: "48h", sublabel: "Production" },
    { icon: Waves, label: "Zero", sublabel: "Cracking ink" },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-white via-[#f8f7ff] to-white dark:from-[#0f0a1a] dark:via-[#1a1526] dark:to-[#0f0a1a] pt-6">
      <style>{`
        .product-carousel-wrapper > div:first-child {
          height: 450px !important;
          min-height: 450px !important;
          max-height: 450px !important;
        }
        @media (min-width: 640px) {
          .product-carousel-wrapper > div:first-child {
            height: 550px !important;
            min-height: 550px !important;
            max-height: 550px !important;
          }
        }
        @media (min-width: 1024px) {
          .product-carousel-wrapper > div:first-child {
            height: 650px !important;
            min-height: 650px !important;
            max-height: 650px !important;
          }
        }
        .product-carousel-wrapper img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          object-position: center !important;
          display: block !important;
          flex-shrink: 0 !important;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .filter-button {
          cursor: pointer;
          outline: none;
        }
        .filter-button-active {
          background-color: #2f2540 !important;
          color: #ffffff !important;
          border: 2px solid #2f2540 !important;
        }
        .filter-button-active:hover {
          background-color: #3d3150 !important;
          transform: scale(1.05) translateY(-2px) !important;
          box-shadow: 0 4px 16px rgba(47, 37, 64, 0.3) !important;
        }
        .filter-button-inactive {
          background-color: #ffffff !important;
          color: #2a2a3a !important;
          border: 2px solid rgba(47, 37, 64, 0.12) !important;
        }
        .filter-button-inactive:hover {
          background-color: #f6f1f8 !important;
          border-color: #7b51f5 !important;
          color: #7b51f5 !important;
          transform: scale(1.05) translateY(-2px) !important;
          box-shadow: 0 2px 8px rgba(123, 81, 245, 0.15) !important;
        }
        .filter-button:focus {
          outline: 2px solid #7b51f5;
          outline-offset: 2px;
        }
      `}</style>
      <LandingAnimation />
      <div className="flex w-full flex-col gap-16 sm:gap-20 lg:gap-24 px-4 sm:px-6 pb-16 sm:pb-20 lg:px-16">
        <Header />

        <section className="flex flex-col gap-8 sm:gap-10 pt-8 relative">
          {/* Carousel - Full Width on Top */}
          <div className="w-full relative z-10 product-carousel-wrapper group">
            {/* Fixed size container - NEVER changes between slides */}
            <div className="relative w-full overflow-hidden rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.12)] bg-white dark:!bg-white flex-shrink-0">
              <img
                key={heroSlideKey}
                src={getImageUrl(Array.isArray(activeHero.gallery) ? activeHero.gallery[0] : activeHero.gallery)}
                alt={activeHero.name}
                loading="eager"
                className="w-full h-full object-cover cursor-pointer block"
                onClick={() => navigate(`/product/${activeHero.id}`)}
              />
              {/* Carousel Controls - Show on hover */}
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(255,255,255,0.4)] backdrop-blur-sm border-none p-2.5 w-12 h-12 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 hover:bg-[rgba(255,255,255,0.7)] focus:outline-2 focus:outline-[#7b51f5] focus:outline-offset-2"
                onClick={handleHeroPrev}
                aria-label="Previous product"
              >
                <ArrowLeft className="h-5 w-5 text-[#2f2540] dark:text-[#2f2540]" strokeWidth={2} />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(255,255,255,0.4)] backdrop-blur-sm border-none p-2.5 w-12 h-12 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 hover:bg-[rgba(255,255,255,0.7)] focus:outline-2 focus:outline-[#7b51f5] focus:outline-offset-2"
                onClick={handleHeroNext}
                aria-label="Next product"
              >
                <ArrowRight className="h-5 w-5 text-[#2f2540] dark:text-[#2f2540]" strokeWidth={2} />
              </button>
            </div>
            {/* Text content - Below image */}
            <div className="mt-4 sm:mt-6">
              <div className="bg-white dark:bg-white rounded-lg p-5 shadow-lg border border-[rgba(47,37,64,0.08)]">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#8b8794] dark:text-[#8b8794] mb-2 font-semibold">{activeHero.category}</p>
                <h3 className="font-heading text-h3 text-[#2f2540] dark:text-[#2f2540] mb-2">{activeHero.name}</h3>
                <p className="text-sm text-[#8b8794] dark:text-[#8b8794] leading-[1.5] font-normal">{heroDescriptions[activeHero.category] ?? "Tailored for everyday legends."}</p>
              </div>
            </div>
            {/* Pagination dots */}
            <div className="mt-4 sm:mt-6 flex gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-all ${index === heroIndex ? "bg-[#7b51f5] dark:bg-[#7b51f5]" : "bg-[#ececf5] dark:bg-white/20"}`}
                  onClick={() => setHeroIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Custom Flow Card - Full Width Below Carousel */}
          <div className="w-full rounded-[20px] border border-[rgba(47,37,64,0.08)] dark:border-[rgba(47,37,64,0.08)] bg-[#fbf9fb] dark:!bg-[#fbf9fb] p-8 sm:p-10 lg:p-12 shadow-[0_4px_16px_rgba(47,37,64,0.04)] dark:shadow-[0_4px_16px_rgba(47,37,64,0.04)] backdrop-blur relative z-10">
            {/* Ultra-minimal, premium text */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8b8794] dark:!text-[#8b8794] mb-6">CUSTOM UPPERWEAR STUDIO</p>
            <h1 className="mt-0 font-heading text-h1 text-[#2f2540] dark:!text-[#2f2540] mb-8">
              Build your drop. Hoodies, tees & sweatshirts crafted for India.
            </h1>
            
            {/* Soft icon chips - minimal bullets */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center gap-3 text-body text-[#8b8794] dark:!text-[#8b8794] font-normal">
                <div className="w-1.5 h-1.5 rounded-full bg-[#7b51f5] dark:!bg-[#7b51f5] flex-shrink-0"></div>
                <span>Upload your design or pick from ours</span>
                </div>
              <div className="flex items-center gap-3 text-body text-[#8b8794] dark:!text-[#8b8794] font-normal">
                <div className="w-1.5 h-1.5 rounded-full bg-[#7b51f5] dark:!bg-[#7b51f5] flex-shrink-0"></div>
                <span>Every stitch proofed & confirmed</span>
                </div>
              <div className="flex items-center gap-3 text-body text-[#8b8794] dark:!text-[#8b8794] font-normal">
                <div className="w-1.5 h-1.5 rounded-full bg-[#7b51f5] dark:!bg-[#7b51f5] flex-shrink-0"></div>
                <span>WhatsApp update in 12 hrs</span>
              </div>
            </div>

            {/* Premium CTAs */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Button
                className="rounded-[20px] !bg-[#7b51f5] px-8 py-3.5 h-12 text-small font-body font-medium uppercase tracking-[0.5px] !text-white hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(123,81,245,0.35)] transition-all shadow-[0_4px_12px_rgba(123,81,245,0.25)] focus:outline-2 focus:outline-[#7b51f5] focus:outline-offset-2"
                onClick={() => requireAuth(`/product/${activeHero.id}`)}
              >
                BUY NOW
              </Button>
              <Button
                variant="outline"
                className="rounded-[20px] border-2 border-[#2f2540] dark:border-[#2f2540] text-[#2f2540] dark:text-[#2f2540] px-8 py-3.5 h-12 text-small font-body font-medium uppercase tracking-[0.5px] hover:scale-[1.02] hover:bg-[#2f2540] hover:text-white transition-all focus:outline-2 focus:outline-[#2f2540] focus:outline-offset-2"
                onClick={() => document.getElementById("custom")?.scrollIntoView({ behavior: "smooth" })}
              >
                CUSTOM FLOW
              </Button>
            </div>

            {/* Stats Row - Minimal icon chips */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2.5 text-[14px] text-[#2f2540] dark:!text-[#2f2540] font-medium">
                <Star className="h-4 w-4 text-[#7b51f5] dark:!text-[#7b51f5] fill-[#7b51f5] dark:!fill-[#7b51f5]" />
                <span>4.9/5 Rated</span>
              </div>
              <div className="flex items-center gap-2.5 text-[14px] text-[#2f2540] dark:!text-[#2f2540] font-medium">
                <Flame className="h-4 w-4 text-[#7b51f5] dark:!text-[#7b51f5]" />
                <span>48h Production</span>
              </div>
              <div className="flex items-center gap-2.5 text-[14px] text-[#2f2540] dark:!text-[#2f2540] font-medium">
                <Waves className="h-4 w-4 text-[#7b51f5] dark:!text-[#7b51f5]" />
                <span>Zero Cracking Ink</span>
              </div>
            </div>
          </div>
        </section>

        <div className="border-t border-[#ececf5] dark:border-white/20 my-8"></div>

        <section id="catalogue" className="space-y-12 sm:space-y-16 pt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-display text-xs sm:text-sm uppercase tracking-[0.22em] text-[#6f6f80] dark:!text-[#6f6f80]">Top products</p>
              <h2 className="font-heading text-h2 text-[#2a2a3a] dark:!text-[#2a2a3a]">Layer up in Looklyn</h2>
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
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-[#f8f7ff] dark:!bg-white px-4 sm:px-6 py-3 sm:py-4 rounded-[12px] border border-[#ececf5] dark:border-[#ececf5]">
                    <p className="font-display text-2xl uppercase tracking-[0.16em] text-[#2a2a3a] dark:!text-[#2a2a3a] tracking-[0.01em]">{type.label}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        className={`filter-button font-display rounded-full px-6 py-2.5 text-sm tracking-[0.12em] font-semibold transition-all duration-300 ${
                          activeFilter === "men" 
                            ? "filter-button-active" 
                            : "filter-button-inactive"
                        }`}
                        onClick={() => handleFilterChange("men")}
                      >
                        Men
                      </button>
                      <button
                        type="button"
                        className={`filter-button font-display rounded-full px-6 py-2.5 text-sm tracking-[0.12em] font-semibold transition-all duration-300 ${
                          activeFilter === "women" 
                            ? "filter-button-active" 
                            : "filter-button-inactive"
                        }`}
                        onClick={() => handleFilterChange("women")}
                      >
                        Women
                      </button>
                      <button
                        type="button"
                        className={`filter-button font-display rounded-full px-6 py-2.5 text-sm tracking-[0.12em] font-semibold transition-all duration-300 ${
                          activeFilter === "kids" 
                            ? "filter-button-active" 
                            : "filter-button-inactive"
                        }`}
                        onClick={() => handleFilterChange("kids")}
                      >
                        Kids
                      </button>
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
                          originalPrice={product.original || product.originalPrice}
                          image={getImageUrl(Array.isArray(product.gallery) ? product.gallery[0] : product.gallery)}
                          accent={product.accent}
                          onView={() => navigate(`/product/${product.id}`)}
                          onAdd={() => handleProtectedAction(`/product/${product.id}`)}
                          onWishlist={() => handleAddToWishlist(product.id)}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12 text-[#6f6f80] dark:text-[#6f6f80]">
                        <p className="text-lg">No {activeFilter} products available in this category.</p>
                        <p className="text-sm mt-2">Check back soon for new arrivals!</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      className="font-display rounded-[10px] border-[#ececf5] dark:border-[#ececf5] text-[#2a2a3a] dark:text-[#2a2a3a] px-8 py-3 tracking-[0.12em] hover:opacity-90 hover:scale-[1.02] transition-all"
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

        <div className="border-t border-[#ececf5] dark:border-white/20 my-8"></div>

        <section id="custom" className="rounded-[12px] border border-[#e9e9f4] dark:border-[#3a3a4a] bg-[#fbf8ff] dark:!bg-[#1a1526] p-12 sm:p-14 lg:p-16 xl:p-20 shadow-[0_1px_3px_rgba(140,115,230,0.06)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)] pt-16 custom-section">
          <div className="max-w-7xl mx-auto space-y-16 sm:space-y-20">
            {/* Custom Studio Section */}
            <div className="space-y-5">
              <div className="text-center sm:text-left">
                <p className="font-display text-xs sm:text-sm uppercase tracking-[0.25em] text-[#6f6f80] dark:!text-white/70 mb-2">Custom studio</p>
                <h2 className="font-heading text-h2 text-[#2e2644] dark:!text-white mb-3">
                  Upload, confirm, conquer.
                </h2>
                <p className="text-[15px] text-[#7a7590] dark:!text-white/80 max-w-xl leading-relaxed">
                  Start with templates or drop your own artwork. We align everything within 12 hours.
                </p>
              </div>

              {/* Modern Horizontal Stepper - Responsive */}
              <div className="relative py-6 w-full">
                {/* Steps Container */}
                <div className="flex flex-col sm:flex-row items-center justify-center w-full gap-4 sm:gap-6 md:gap-8 flex-nowrap">
                  {/* Vertical on mobile only, Horizontal on small+ screens */}
                      {customizationSteps.map((step, idx) => {
                        const Icon = step.icon;
                        const isLast = idx === customizationSteps.length - 1;
                        return (
                          <React.Fragment key={step.step}>
                            <div
                          className="rounded-[16px] border border-[#ece6f8] dark:border-[#4a4a5a] bg-white/45 dark:bg-[#2a2538] p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(141,109,240,0.12)] dark:hover:shadow-[0_6px_20px_rgba(141,109,240,0.25)] transition-all flex flex-col items-center text-center w-full sm:w-[240px] md:w-[280px] flex-shrink-0 step-box"
                              style={{ 
                            padding: '24px 32px'
                              }}
                            >
                              <div className="w-12 h-12 rounded-full bg-[#8d6df0]/10 dark:bg-[#8d6df0]/20 flex items-center justify-center mb-4">
                                <span className="text-lg font-bold text-[#8d6df0] dark:!text-[#8d6df0]" style={{ color: '#8d6df0' }}>
                                  {step.step}
                                </span>
                              </div>
                              <Icon className="h-8 w-8 text-[#8d6df0] dark:!text-[#8d6df0] mb-4 stroke-[1.5]" style={{ color: '#8d6df0' }} />
                              <h3 className="font-heading text-h5 text-[#2c2440] dark:!text-white mb-2 step-title">
                                {step.title}
                              </h3>
                              <p className="text-sm text-[#7d7a8f] dark:!text-white/70 leading-relaxed step-desc">
                                {step.description}
                              </p>
                            </div>
                            {!isLast && (
                          <div className="flex items-center justify-center px-2 md:px-4 flex-shrink-0">
                                <ArrowRight className="h-8 w-8 text-[#8d6df0] dark:!text-[#8d6df0] flex-shrink-0" strokeWidth={2.5} style={{ color: '#8d6df0', width: '32px', height: '32px' }} />
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                </div>
              </div>

              <div className="flex justify-center sm:justify-start pt-1">
                <Button 
                  className="rounded-[10px] px-7 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white hover:opacity-90 hover:scale-[1.02] transition-all shadow-[0_4px_12px_rgba(138,107,223,0.2)]" 
                  style={{ 
                    background: 'linear-gradient(90deg, #8a6bdf, #b093ff)',
                    color: 'white',
                    padding: '12px 28px'
                  }}
                  onClick={() => navigate("/checkout")}
                >
                  Start custom order
                </Button>
              </div>
            </div>

            {/* Why Looklyn Section */}
            <div className="space-y-6">
              <div className="text-center sm:text-left">
                <p className="font-display text-xs sm:text-sm uppercase tracking-[0.25em] text-[#6f6f80] dark:!text-white/70 mb-2">Why Looklyn</p>
                <h2 className="font-heading text-h2 text-[#2e2644] dark:!text-white">
                  Built for quality.
                </h2>
              </div>

              {/* Feature Carousel */}
              <div className="relative py-8 sm:py-12 lg:py-16">
                <div className="flex items-center justify-center gap-4">
                  {/* Arrow Buttons */}
                  <button
                    onClick={handleFeaturePrev}
                    disabled={!canGoPrev}
                    aria-label="Previous features"
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-white/80 dark:bg-[#2a2538]/80 border border-[#ebe6f8] dark:border-[#4a4a5a] shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:bg-white dark:hover:bg-[#2a2538] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#8d73e8] focus:ring-offset-2"
                  >
                    <ArrowLeft className="h-5 w-5 text-[#8d73e8] dark:text-[#8d73e8]" />
                  </button>

                  {/* Carousel Container - Exactly 3 cards visible */}
                  <div className="overflow-hidden mx-auto feature-carousel-container" style={{ width: '752px', maxWidth: '752px', position: 'relative' }}>
                    <div
                      className="flex transition-transform duration-300 ease-in-out"
                      style={{
                        transform: `translateX(-${featureCarouselIndex * 256}px)`,
                        width: 'max-content',
                      }}
                    >
                      {whyLooklynFeatures.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                          <div
                            key={idx}
                            className="flex-shrink-0 rounded-[14px] border border-[#ebe6f8] dark:border-[#4a4a5a] p-4 shadow-[0_6px_18px_rgba(0,0,0,0.04)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:-translate-y-[6px] transition-all duration-300 cursor-pointer group feature-card backdrop-blur-[6px]"
                            style={{
                              width: '240px',
                              marginRight: idx < whyLooklynFeatures.length - 1 ? '16px' : '0',
                              background: 'rgba(255,255,255,0.6)',
                              backdropFilter: 'blur(6px)',
                            }}
                          >
                            <div className="w-9 h-9 rounded-full bg-[#f5f0ff]/60 dark:bg-[#8d6df0]/20 flex items-center justify-center mb-3" style={{ width: '36px', height: '36px' }}>
                              <Icon className="h-5 w-5 text-[#8d73e8] dark:!text-[#8d73e8] stroke-[1.5] group-hover:text-[#8d73e8]" style={{ color: '#8d73e8' }} />
                            </div>
                            <h3 className="font-heading text-h6 text-[#322a46] dark:!text-white mb-1 feature-title">
                              {feature.title}
                            </h3>
                            <p className="text-[14px] text-[#6F6A87] dark:!text-white/70 leading-snug feature-desc line-clamp-1">
                              {feature.subtext}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={handleFeatureNext}
                    disabled={!canGoNext}
                    aria-label="Next features"
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-white/80 dark:bg-[#2a2538]/80 border border-[#ebe6f8] dark:border-[#4a4a5a] shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:bg-white dark:hover:bg-[#2a2538] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#8d73e8] focus:ring-offset-2"
                  >
                    <ArrowRight className="h-5 w-5 text-[#8d73e8] dark:text-[#8d73e8]" />
                  </button>
                </div>

                {/* Pagination Dots */}
                <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
                  {Array.from({ length: totalSlides }).map((_, idx) => {
                    const isActive = currentSlide === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => goToFeatureSlide(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#8d73e8] focus:ring-offset-2 ${
                          isActive
                            ? 'bg-[#8d73e8] dark:bg-[#8d73e8] w-8'
                            : 'bg-[#d5c8ff] dark:bg-[#6a5a8a] w-2 hover:bg-[#8d73e8]/60 dark:hover:bg-[#8d73e8]/60'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="border-t border-[#ececf5] dark:border-white/20 my-8"></div>

        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="rounded-[20px] border border-[#e8e0f6] dark:border-[#4a4a5a] shadow-[0_8px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)] backdrop-blur-[6px]" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f9f4ff 100%)', backdropFilter: 'blur(6px)', padding: '40px 56px' }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
                {/* Left Column: Content */}
                <div className="space-y-6 support-section-content">
                  <div>
                    <p className="font-display text-xs uppercase tracking-widest text-[#978ba7] dark:!text-[#6f6a87] mb-4">Support</p>
                    <div className="mb-5">
                      <h3 className="font-heading text-h3 text-[#2e2644] dark:!text-[#2e2644]">
                        Talk to the creators
                      </h3>
                      {/* Accent underline */}
                      <div className="w-[60px] h-[3px] bg-[#9d8aea] dark:bg-[#9d8aea] rounded-[2px] mt-1"></div>
                    </div>
                    <p className="text-[15px] text-[#6f6a87] dark:!text-[#6f6a87] leading-[1.45]">
                      Get instant support via WhatsApp or call us directly for personalized assistance.
                    </p>
                  </div>
                  
                  {/* Button Group */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      className="rounded-full bg-[#25D366] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[#20ba5a] hover:shadow-[0_4px_12px_rgba(37,211,102,0.25)] hover:-translate-y-[2px] transition-all flex items-center justify-center gap-2"
                      onClick={() => window.open("https://wa.me/918734884862", "_blank")}
                    >
                      <svg className="h-5 w-5 animate-pulse-slow" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'pulse 1.6s ease-in-out infinite' }}>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      WhatsApp
                    </Button>
                    <Button 
                      variant="outline"
                      className="rounded-full border-2 border-[#9d8aea] dark:border-[#9d8aea] px-8 py-3.5 text-sm font-semibold text-[#2e2644] dark:!text-[#9d8aea] hover:bg-[#f5f0ff] dark:hover:bg-[#2a2538] hover:border-[#b093ff] dark:hover:border-[#b093ff] hover:shadow-[0_4px_12px_rgba(157,138,234,0.15)] dark:hover:shadow-[0_4px_12px_rgba(157,138,234,0.25)] transition-all flex items-center justify-center gap-2"
                      onClick={() => window.open("tel:+918734884862", "_self")}
                    >
                      <PhoneCall className="h-5 w-5 dark:!text-[#9d8aea]" />
                      Call
                    </Button>
                  </div>

                  {/* Feature Icons Row */}
                  <div className="flex flex-wrap items-baseline gap-6 pt-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[18px] leading-none">⚡</span>
                      <span className="text-[14px] text-[#6f6a87] dark:!text-[#6f6a87] leading-tight">Fast responses</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[18px] leading-none">👤</span>
                      <span className="text-[14px] text-[#6f6a87] dark:!text-[#6f6a87] leading-tight">Real humans, not bots</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[18px] leading-none">🎨</span>
                      <span className="text-[14px] text-[#6f6a87] dark:!text-[#6f6a87] leading-tight">Speak directly to your designers</span>
                    </div>
                  </div>

                  {/* Avg Response Time */}
                  <p className="text-[13px] text-[#7f7993] dark:!text-[#7f7993] mt-1.5">
                    Avg response time: 1–4 hours
                  </p>
                </div>

                {/* Right Column: Visual - WhatsApp Chat Mockup */}
                <div className="hidden lg:flex items-center justify-center">
                  <div className="relative w-full max-w-sm">
                    {/* WhatsApp-style chat bubble mockup */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9d8aea] to-[#b093ff] flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(157,138,234,0.2)]">
                          <MessageCircle className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 bg-white/90 dark:bg-[#2a2538]/90 rounded-2xl rounded-tl-sm p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] backdrop-blur-sm">
                          <p className="text-sm text-[#2e2644] dark:!text-white/90 leading-relaxed">Hey! Need help with your order?</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 justify-end">
                        <div className="flex-1 bg-[#25D366]/90 rounded-2xl rounded-tr-sm p-3.5 shadow-[0_2px_8px_rgba(37,211,102,0.15)] backdrop-blur-sm">
                          <p className="text-sm text-white leading-relaxed">Yes, I have a question</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f5f0ff] to-[#e8dfff] dark:from-[#2a2538] dark:to-[#1a1526] flex items-center justify-center flex-shrink-0 border-2 border-[#e8e0f6] dark:border-[#4a4a5a] shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
                          <MessageCircle className="h-5 w-5 text-[#9d8aea] dark:text-[#9d8aea]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-10 text-center text-sm sm:text-base uppercase tracking-[0.5em] text-[#6f6f80] dark:!text-[#6f6f80] font-normal">
          © {new Date().getFullYear()} Looklyn — Own The Look
        </footer>
      </div>
    </div>
  );
};

export default Home;

