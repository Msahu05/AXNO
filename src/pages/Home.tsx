import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Flame, PhoneCall, ShieldHalf, Star, UploadCloud, Waves, HeartHandshake, Heart, Search, ShoppingCart } from "lucide-react";
import LandingAnimation from "@/components/LandingAnimation";
import ThemeToggle from "@/components/ThemeToggle";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { userAPI } from "@/lib/api";
import { allProducts } from "@/data/products";
import { toast } from "@/hooks/use-toast";

const heroDescriptions = {
  Hoodie: "Hand-painted gradients layered on plush, breathable fleece.",
  "T-Shirt": "Structured oversized fit with premium bio-washed cotton.",
  Sweatshirt: "3D puff-print loops that react beautifully to neon lighting.",
};

const heroSlides = allProducts.slice(0, 5);

const keywordBuckets = {
  hoodie: ["hoodie", "hoodies", "sweatjacket", "winterwear"],
  "t-shirt": ["tshirt", "tshirts", "t-shirt", "tee", "tees", "halfshirt", "fullshirt", "shirt", "shirts"],
  sweatshirt: ["sweatshirt", "sweatshirts", "crewneck", "jumper", "sweater"],
};

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

const condense = (value) => value.replace(/[\s\-]/g, "");

const matchesKeyword = (category, normalizedTerm, condensedTerm) => {
  const categoryKey = condense(category.toLowerCase());
  return Object.entries(keywordBuckets).some(([bucket, synonyms]) => {
    if (!categoryKey.includes(condense(bucket))) return false;
    return synonyms.some((keyword) => {
      const condensedKeyword = condense(keyword.toLowerCase());
      return condensedTerm.includes(condensedKeyword) || normalizedTerm.includes(keyword.toLowerCase());
    });
  });
};

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, refreshUser } = useAuth();
  const { itemCount } = useCart();
  const [heroIndex, setHeroIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      userAPI.getAddresses()
        .then((data) => setAddresses(data.addresses || []))
        .catch(() => setAddresses([]));
    } else {
      setAddresses([]);
    }
  }, [isAuthenticated, user]);

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

  const searchSuggestions = useMemo(() => {
    if (!debouncedSearchTerm.trim() || debouncedSearchTerm.length < 2) return [];
    const term = debouncedSearchTerm.toLowerCase();
    const suggestions = [];
    
    // Category suggestions
    Object.entries(keywordBuckets).forEach(([category, synonyms]) => {
      if (synonyms.some((s) => s.toLowerCase().includes(term))) {
        const categoryName = category === "t-shirt" ? "T-Shirts" : category.charAt(0).toUpperCase() + category.slice(1) + "s";
        suggestions.push({ type: "category", label: categoryName, value: category });
      }
    });
    
    // Product name suggestions - include all products (men, women, kids)
    allProducts.forEach((product) => {
      if (product.name.toLowerCase().includes(term) && suggestions.length < 8) {
        suggestions.push({ type: "product", label: `${product.name} (${product.audience})`, value: product.id });
      }
    });
    
    return suggestions.slice(0, 8);
  }, [debouncedSearchTerm]);

  const filteredProducts = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return allProducts;
    const normalizedTerm = debouncedSearchTerm.toLowerCase().trim();
    const condensedTerm = condense(normalizedTerm);
    return allProducts.filter((product) => {
      const tokens = `${product.name} ${product.category} ${product.id}`.toLowerCase();
      if (tokens.includes(normalizedTerm)) return true;
      if (condense(tokens).includes(condensedTerm)) return true;
      return matchesKeyword(product.category, normalizedTerm, condensedTerm);
    });
  }, [debouncedSearchTerm]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchTerm.trim()) {
      const suggestion = searchSuggestions[0];
      if (suggestion?.type === "category") {
        navigate(`/category/${suggestion.value}`);
      } else if (suggestion?.type === "product") {
        navigate(`/product/${suggestion.value}`);
      }
      setShowSuggestions(false);
    }
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleWishlistNav = () => {
    requireAuth("/wishlist");
  };

  const activeHero = heroSlides[heroIndex % heroSlides.length];
  const wishlistPicks = allProducts.slice(6, 10);
  const heroSlideKey = `${activeHero.id}-${heroIndex}`;
  const handleHeroPrev = () => cycleHero("prev");
  const handleHeroNext = () => cycleHero("next");

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_60%)] pt-6">
      <LandingAnimation />
      <div className="flex w-full flex-col gap-16 px-6 pb-12 sm:px-10 lg:px-16">
        <header className="sticky top-0 z-40 rounded-[48px] border border-transparent bg-[#5c3d8a] px-6 py-4 text-white shadow-[0_20px_60px_rgba(92,61,138,0.35)] backdrop-blur dark:bg-[#120c1b]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="font-display text-2xl uppercase tracking-[0.18em]">Looklyn - Own The Look</div>
            <nav className="flex flex-1 items-center justify-center gap-5 font-display text-lg tracking-[0.06em]">
              <button className="hover:text-secondary">Home</button>
              <button className="hover:text-secondary" onClick={() => document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" })}>
                Products
              </button>
              <button className="hover:text-secondary" onClick={() => document.getElementById("custom")?.scrollIntoView({ behavior: "smooth" })}>
                Customise
              </button>
            </nav>
            <div className="flex flex-wrap items-center gap-3">
              <div ref={searchRef} className="relative w-48 sm:w-64">
                <form onSubmit={handleSearchSubmit}>
                  <Input
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search drops"
                    className="rounded-full border-white/40 bg-white/20 pl-10 text-white placeholder:text-white/70 focus-visible:ring-white"
                  />
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                </form>
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full mt-2 w-full rounded-2xl border border-white/20 bg-[#5c3d8a] shadow-xl z-50">
                    {searchSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        className="w-full px-4 py-3 text-left hover:bg-white/10 first:rounded-t-2xl last:rounded-b-2xl"
                        onClick={() => {
                          if (suggestion.type === "category") {
                            navigate(`/category/${suggestion.value}`);
                          } else {
                            navigate(`/product/${suggestion.value}`);
                          }
                          setShowSuggestions(false);
                          setSearchTerm("");
                        }}
                      >
                        <div className="text-sm font-semibold">{suggestion.label}</div>
                        <div className="text-xs text-white/70">{suggestion.type === "category" ? "Category" : "Product"}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="rounded-full border border-white/40 p-3 text-white hover:bg-white/10 relative"
                aria-label="Wishlist"
                onClick={handleWishlistNav}
              >
                <Heart className="h-4 w-4" />
              </button>
              <button
                className="rounded-full border border-white/40 p-3 text-white hover:bg-white/10 relative"
                aria-label="Cart"
                onClick={() => requireAuth("/cart")}
              >
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-secondary text-xs font-bold flex items-center justify-center text-foreground">
                    {itemCount}
                  </span>
                )}
              </button>
              <Button className="rounded-full bg-white/90 px-6 py-2 font-display text-base tracking-[0.1em] text-[#5c3d8a]" onClick={() => navigate("/auth")}>
                Login
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[56px] border border-white/20 bg-[var(--gradient-hero)] p-10 shadow-[var(--shadow-soft)] backdrop-blur dark:border-white/5 dark:shadow-[var(--shadow-strong)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">Custom Upperwear Studio</p>
            <h1 className="mt-6 font-display text-4xl leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Build your <span className="text-primary">signature</span> drop. Hoodies, tees, sweatshirts crafted for India.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Browse our in-house drops or upload your art. Every stitch is mapped, proofed, and confirmed with you on WhatsApp within 12 hours.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                className="rounded-full bg-foreground px-8 py-6 text-sm font-semibold uppercase tracking-[0.18em] text-background"
                onClick={() => requireAuth(`/product/${activeHero.id}`)}
              >
                Buy now
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-foreground px-8 py-6 text-sm font-semibold uppercase tracking-[0.18em]"
                onClick={() => document.getElementById("custom")?.scrollIntoView({ behavior: "smooth" })}
              >
                Custom flow
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6 text-secondary" />
                <p className="font-display text-base tracking-[0.18em] text-muted-foreground">
                  4.9/5<br />Community rated
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Flame className="h-6 w-6 text-secondary" />
                <p className="font-display text-base tracking-[0.18em] text-muted-foreground">
                  48h<br />Production
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Waves className="h-6 w-6 text-secondary" />
                <p className="font-display text-base tracking-[0.18em] text-muted-foreground">
                  Zero<br />Cracking ink
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[56px] border border-white/15 bg-[var(--card)]/90 p-8 shadow-[var(--shadow-soft)] backdrop-blur dark:border-white/5">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-muted-foreground">
              <span>Top drops</span>
              <span>
                {heroIndex + 1} / {heroSlides.length}
              </span>
            </div>
            <div className="relative mt-6 overflow-hidden rounded-[32px] bg-[var(--gradient-card)] p-4 shadow-inner">
              <button
                className="absolute left-6 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/70 p-2 text-foreground shadow-lg hover:bg-white"
                onClick={handleHeroPrev}
                aria-label="Previous product"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                className="absolute right-6 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/70 p-2 text-foreground shadow-lg hover:bg-white"
                onClick={handleHeroNext}
                aria-label="Next product"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
              <img
                key={heroSlideKey}
                src={activeHero.gallery[0]}
                alt={activeHero.name}
                loading="eager"
                className="hero-slide h-72 w-full cursor-pointer rounded-[28px] object-cover object-top"
                onClick={() => navigate(`/product/${activeHero.id}`)}
              />
            </div>
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{activeHero.category}</p>
              <h3 className="text-2xl font-semibold">{activeHero.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{heroDescriptions[activeHero.category] ?? "Tailored for everyday legends."}</p>
            </div>
            <div className="mt-6 flex gap-2">
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

        <section id="catalogue" className="space-y-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-display text-sm uppercase tracking-[0.22em] text-muted-foreground">Top products</p>
              <h2 className="font-display text-4xl">Layer up in Looklyn</h2>
            </div>
          </div>

          <div className="space-y-16">
            {productTypes.map((type) => {
              const typeProducts = allProducts.filter((p) => p.category === type.key);
              const menProducts = typeProducts.filter((p) => p.audience === "men").slice(0, 6);
              const womenProducts = typeProducts.filter((p) => p.audience === "women").slice(0, 6);
              const kidsProducts = typeProducts.filter((p) => p.audience === "kids").slice(0, 6);
              
              return (
                <div key={type.key} id={`${type.key.toLowerCase()}-section`} className="space-y-6">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="font-display text-2xl uppercase tracking-[0.16em] text-muted-foreground">{type.label}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        variant="outline"
                        className="font-display rounded-full border-foreground px-4 py-2 text-sm tracking-[0.12em]"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          navigate(`/category/${type.route}?filter=men`);
                        }}
                      >
                        Men
                      </Button>
                      <Button
                        variant="outline"
                        className="font-display rounded-full border-foreground px-4 py-2 text-sm tracking-[0.12em]"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          navigate(`/category/${type.route}?filter=women`);
                        }}
                      >
                        Women
                      </Button>
                      <Button
                        variant="outline"
                        className="font-display rounded-full border-foreground px-4 py-2 text-sm tracking-[0.12em]"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          navigate(`/category/${type.route}?filter=kids`);
                        }}
                      >
                        Kids
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {typeProducts.slice(0, 6).map((product) => (
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
                        onWishlist={() => handleWishlistNav()}
                      />
                    ))}
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

        <section id="custom" className="grid gap-8 rounded-[56px] border border-white/15 bg-gradient-to-r from-[var(--card)] via-[var(--muted)] to-[var(--card)] p-10 shadow-[var(--shadow-soft)] lg:grid-cols-2">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Custom studio</p>
            <h2 className="text-4xl font-black">Upload, confirm, conquer.</h2>
            <p className="text-muted-foreground">
              Start with our templates or drop your own artwork. Checkout collects your inspiration, Pinterest links or AI prompts. We ping you on WhatsApp within 12 hours to align colours, placements, and fit. Satisfaction over everything.
            </p>
            <div className="space-y-4">
              {customizationSteps.map((step) => (
                <div key={step.title} className="flex gap-4 rounded-[28px] border border-white/20 bg-background/60 p-4 backdrop-blur">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">{step.icon}</div>
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="rounded-full bg-primary px-8 py-6 text-xs font-semibold uppercase tracking-[0.4em]" onClick={() => navigate("/checkout")}>
              Start custom order
            </Button>
          </div>

          <div className="rounded-[40px] border border-white/15 bg-[var(--gradient-card)] p-8 shadow-[var(--shadow-soft)]">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Why Looklyn</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary" /> Eco pigment + puff + reflective inks.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary" /> Saved addresses & reorder within 30 seconds.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary" /> Wishlist syncs everywhere after login.
                </li>
              </ul>
              <div className="rounded-[28px] bg-background/80 p-6">
                <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">WhatsApp support</p>
                <p className="mt-2 text-2xl font-semibold">+91 88288 44110</p>
                <p className="text-sm text-muted-foreground">Drop us your order ID & concept. We respond in 12 hours.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[40px] border border-white/15 bg-[var(--card)]/90 p-8 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">Wishlist</p>
                <h3 className="text-2xl font-bold">Save & sync designs</h3>
              </div>
              <Button variant="outline" className="rounded-full border-foreground px-6 py-2 text-xs font-semibold uppercase tracking-[0.4em]" onClick={handleWishlistNav}>
                View all
              </Button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {wishlistPicks.map((pick) => (
                <div key={pick.id} className="rounded-[28px] border border-white/20 bg-background/70 p-4 shadow-inner backdrop-blur">
                  <img
                    src={pick.gallery[0]}
                    alt={pick.name}
                    loading="lazy"
                    className="h-40 w-full cursor-pointer rounded-2xl object-cover"
                    onClick={() => navigate(`/product/${pick.id}`)}
                  />
                  <p className="mt-3 font-semibold">{pick.name}</p>
                  <Button variant="ghost" className="mt-2 w-full rounded-full border border-transparent text-xs font-semibold uppercase tracking-[0.3em]" onClick={() => handleProtectedAction(`/product/${pick.id}`)}>
                    Move to cart
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[40px] border border-white/15 bg-[var(--gradient-card)] p-8 text-sm text-muted-foreground shadow-[var(--shadow-soft)]">
            <p className="text-xs uppercase tracking-[0.7em] text-muted-foreground">Saved address</p>
            <div className="mt-4 space-y-4">
              {isAuthenticated ? (
                addresses.length > 0 ? (
                  addresses.map((addr, idx) => (
                    <div key={idx} className="rounded-[24px] border border-white/30 bg-background/80 p-5">
                      <p className="text-lg font-semibold text-foreground">{addr.name}</p>
                      <p>{addr.address}</p>
                      <p>{addr.city}, {addr.state} {addr.pincode}</p>
                      {addr.phone && <p>Phone: {addr.phone}</p>}
                      {addr.isDefault && <p className="text-xs uppercase tracking-[0.4em] text-primary">Default</p>}
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/40 p-5">
                    <p className="font-semibold text-foreground">No saved addresses</p>
                    <p>Add an address to save time at checkout.</p>
                  </div>
                )
              ) : (
                <div className="rounded-[24px] border border-dashed border-white/40 p-5">
                  <p className="font-semibold text-foreground">Login to save addresses</p>
                  <p>Save once, skip typing forever.</p>
                  <Button className="mt-2 rounded-full" onClick={() => navigate("/auth")}>
                    Login
                  </Button>
                </div>
              )}
              {isAuthenticated && (
                <div className="rounded-[24px] border border-dashed border-white/40 p-5 cursor-pointer hover:bg-white/5" onClick={() => navigate("/checkout")}>
                  <p className="font-semibold text-foreground">Add new address</p>
                  <p>Save once, skip typing forever.</p>
                </div>
              )}
            </div>
            <div className="mt-6 rounded-[24px] bg-background/70 p-5">
              <p className="text-xs uppercase tracking-[0.5em] text-muted-foreground">Payment ready</p>
              <p className="text-2xl font-bold text-foreground">Razorpay + UPI</p>
              <p>Secure payments with Razorpay. Head to payment page for setup steps.</p>
              <Button className="mt-4 rounded-full bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em]" onClick={() => navigate("/payment")}>
                Payment guide
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-[40px] border border-white/15 bg-[var(--card)]/95 p-8 shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.7em] text-muted-foreground">Support</p>
              <h3 className="text-3xl font-black">Talk to the creators</h3>
              <p className="mt-2 text-muted-foreground">
                Text us on WhatsApp with your order ID + custom references. We&apos;ll respond within 12 hours with mockups and timelines.
              </p>
            </div>
            <div className="flex gap-4">
              <Button className="rounded-full bg-[#25D366] px-8 py-4 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-lg" onClick={() => window.open("https://wa.me/918828844110", "_blank")}>
                WhatsApp
              </Button>
              <Button variant="ghost" className="rounded-full border border-foreground px-8 py-4 text-sm font-semibold uppercase tracking-[0.4em]" onClick={() => window.open("tel:+918828844110", "_self")}>
                <PhoneCall className="mr-2 h-4 w-4" /> Call
              </Button>
            </div>
          </div>
        </section>

        <footer className="py-10 text-center text-xs uppercase tracking-[0.5em] text-muted-foreground">
          © {new Date().getFullYear()} Looklyn — Own The Look
        </footer>
      </div>
    </div>
  );
};

export default Home;

