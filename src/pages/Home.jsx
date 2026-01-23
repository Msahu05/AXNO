import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, PhoneCall, UploadCloud, HeartHandshake, Truck, ArrowRight, Leaf, Sparkles, Zap, Award, Shield, Star, Instagram, Mail, Facebook, Headphones, Shirt } from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { productsAPI, userAPI, getImageUrl } from "@/lib/api";

const productTypes = [
  { key: "T-Shirt", label: "T-Shirts", route: "t-shirts" },
  { key: "Sweatshirt", label: "Sweatshirts", route: "sweatshirts" },
  { key: "Hoodie", label: "Hoodies", route: "hoodies" },
];

const customizationSteps = [
  {
    icon: <UploadCloud className="h-6 w-6" />,
    title: "Upload art",
    description: "Drop your own chosen design",
  },
  {
    icon: <HeartHandshake className="h-6 w-6" />,
    title: "WhatsApp confirmation",
    description: "We hop on a WhatsApp call within 12 hours to finesse the details.",
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: "Quick delivery",
    description: "Fast and reliable shipping to your doorstep.",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const [allProducts, setAllProducts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all products without any filter
        const productsResponse = await productsAPI.getAll({});
        setAllProducts(productsResponse.products || []);
      } catch (error) {
        console.error('Error loading products:', error);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      userAPI.getAddresses()
        .then((data) => setAddresses(data.addresses || []))
        .catch(() => setAddresses([]));
    } else {
      setAddresses([]);
    }
  }, [isAuthenticated, user]);

  const handleProtectedAction = (destination) => {
    if (isAuthenticated) {
      navigate(destination);
    } else {
      navigate(`/auth?redirect=${encodeURIComponent(destination)}`);
    }
  };

  const handleWishlistNav = () => {
    handleProtectedAction("/wishlist");
  };

  const wishlistPicks = wishlistItems.slice(0, 4);

  return (
    <div className="min-h-screen bg-purple-soft/40 dark:bg-background">
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-1 sm:py-2 lg:py-4 space-y-4 sm:space-y-6 lg:space-y-8">
        <HeroSection />

        <div className="border-t border-border/50 my-4 sm:my-6"></div>

        <section id="catalogue" className="space-y-6 sm:space-y-8 lg:space-y-12">
          <div className="space-y-8 sm:space-y-8 lg:space-y-16">
            {productTypes.map((type) => {
              const typeProducts = allProducts.filter((p) => p.category === type.key);
              
              return (
                <div key={type.key} id={`${type.key.toLowerCase()}-section`} className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-lg sm:text-xl lg:text-2xl font-bold uppercase tracking-[0.05em] sm:tracking-[0.08em] text-foreground">{type.label}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                      <Button
                        variant="outline"
                        className="font-display rounded-full border-foreground px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm tracking-normal"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          navigate(`/category/${type.route}?filter=unisex`);
                        }}
                      >
                        Unisex
                      </Button>
                      <Button
                        variant="outline"
                        className="font-display rounded-full border-foreground px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm tracking-normal"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          navigate(`/category/${type.route}?filter=men`);
                        }}
                      >
                        Men
                      </Button>
                      <Button
                        variant="outline"
                        className="font-display rounded-full border-foreground px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm tracking-normal"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          navigate(`/category/${type.route}?filter=women`);
                        }}
                      >
                        Women
                      </Button>
                    </div>
                  </div>
                  {loading ? (
                    // Show skeleton placeholders
                    <div className="grid gap-6 grid-cols-2 lg:grid-cols-3">
                      {[1, 2, 3, 4].slice(0, isLargeScreen ? 3 : 4).map((i) => (
                        <ProductCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-6 grid-cols-2 lg:grid-cols-3">
                      {typeProducts.slice(0, isLargeScreen ? 3 : 4).map((product) => (
                        <ProductCard
                          key={product._id || product.id}
                          id={product._id || product.id}
                          slug={product.slug}
                          name={product.name}
                          category={product.category}
                          price={product.price}
                          originalPrice={product.originalPrice}
                          image={getImageUrl(Array.isArray(product.gallery) ? product.gallery[0]?.url || product.gallery[0] : product.gallery || product.image)}
                          accent={product.accent}
                          onView={() => {
                            const url = product.slug ? `/product/${product.slug}` : `/product/${product._id || product.id}`;
                            navigate(url);
                          }}
                          onAdd={() => {
                            const url = product.slug ? `/product/${product.slug}` : `/product/${product._id || product.id}`;
                            handleProtectedAction(url);
                          }}
                          onWishlist={() => handleWishlistNav()}
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      className="font-display rounded-full border-foreground px-8 py-3 tracking-[0.12em] bg-black text-white hover:bg-purple-600 hover:text-white"
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

        <div className="border-t border-border/50 my-6 sm:my-8 lg:my-12"></div>

        {/* Text Section - Made For You, Designed By You - Only visible on small screens (below md) */}
        <section className="md:hidden space-y-6 sm:space-y-8 rounded-[28px] sm:rounded-[40px] lg:rounded-[56px] border border-border dark:border-white/15 bg-white dark:bg-[var(--card)]/95 p-6 sm:p-8 lg:p-10 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col items-start justify-center space-y-4 sm:space-y-6">
            {/* Top Banner */}
            <div className="inline-flex w-fit items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 sm:px-4 sm:py-2 text-base sm:text-lg md:text-xl font-bold text-primary">
              Looklyn - Own The Look
            </div>

            {/* Headline */}
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              <span className="text-foreground">Made For You,</span>
              <br />
              <span className="text-primary">Designed By You!!</span>
            </h2>

            {/* Description */}
            <p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              Built by a young mind, driven by bold ideas.
              <br />
              Made for people who don't follow trends — they create them.
              <br />
              Your design. Your vibe. Your look.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 sm:gap-4 pt-2">
              <Button 
                size="lg" 
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft hover:shadow-elevated rounded-lg px-4 sm:px-6 py-3 sm:py-6 text-sm sm:text-base"
                onClick={() => navigate('/category/hoodies')}
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-primary text-foreground hover:bg-accent rounded-lg px-4 sm:px-6 py-3 sm:py-6 text-sm sm:text-base"
                onClick={() => document.getElementById('custom')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-4 sm:gap-6 pt-4 sm:pt-6 w-full">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-foreground">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">All Over India</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                  <Headphones className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-foreground">24/7 WhatsApp Support</p>
                  <p className="text-xs text-muted-foreground">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                  <Shirt className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-foreground">Printed After Order</p>
                  <p className="text-xs text-muted-foreground">Made just for you</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="border-t border-border/50 my-6 sm:my-8 lg:my-12"></div>

        <section id="custom" className="space-y-6 sm:space-y-8 rounded-[28px] sm:rounded-[40px] lg:rounded-[56px] border border-border dark:border-white/15 bg-purple-soft/50 dark:bg-gradient-to-r dark:from-[var(--card)] dark:via-[var(--muted)] dark:to-[var(--card)] p-4 sm:p-6 lg:p-10 shadow-[var(--shadow-soft)]">
          <div className="space-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-4">Why Choose Us</p>
              <h3 className="text-3xl font-black mb-8">Built for quality</h3>
            </div>
            
            <div className="flex flex-wrap gap-6 justify-center">
              <div className="flex flex-col items-center text-center gap-4 rounded-[28px] border border-border dark:border-white/20 bg-background/60 p-6 backdrop-blur hover:bg-background/80 transition-all min-w-[200px] flex-1 max-w-[250px]">
                <div className="rounded-2xl bg-primary/10 p-4 text-primary">
                  <Leaf className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Eco-Friendly Materials</h4>
                  <p className="text-sm text-muted-foreground">Eco pigment + puff + reflective inks for sustainable fashion.</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center gap-4 rounded-[28px] border border-border dark:border-white/20 bg-background/60 p-6 backdrop-blur hover:bg-background/80 transition-all min-w-[200px] flex-1 max-w-[250px]">
                <div className="rounded-2xl bg-primary/10 p-4 text-primary">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Lightning Fast</h4>
                  <p className="text-sm text-muted-foreground">Saved addresses & reorder within 30 seconds.</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center gap-4 rounded-[28px] border border-border dark:border-white/20 bg-background/60 p-6 backdrop-blur hover:bg-background/80 transition-all min-w-[200px] flex-1 max-w-[250px]">
                <div className="rounded-2xl bg-primary/10 p-4 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Seamless Sync</h4>
                  <p className="text-sm text-muted-foreground">Wishlist syncs everywhere after login.</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center gap-4 rounded-[28px] border border-border dark:border-white/20 bg-background/60 p-6 backdrop-blur hover:bg-background/80 transition-all min-w-[200px] flex-1 max-w-[250px]">
                <div className="rounded-2xl bg-primary/10 p-4 text-primary">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Premium Quality</h4>
                  <p className="text-sm text-muted-foreground">Color-calibrated proofs and stitch maps before production.</p>
                </div>
              </div>
            </div>
          </div>
        </section>


        <section id="support" className="rounded-[40px] border border-border dark:border-white/15 bg-[var(--card)]/95 p-8 shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.7em] text-muted-foreground">Support</p>
              <h3 className="text-3xl font-black">Talk to the creators</h3>
              <p className="mt-2 text-muted-foreground">
                Get instant support via WhatsApp or call us directly for personalized assistance.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://wa.me/917016925325"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] hover:text-black hover:scale-110 transition-all duration-300 cursor-pointer"
                aria-label="WhatsApp"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.372a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
              <a
                href="tel:+917016925325"
                className="text-foreground hover:scale-110 transition-transform duration-300 cursor-pointer"
                aria-label="Call"
              >
                <PhoneCall className="h-6 w-6" />
              </a>
              <a
                href="https://www.instagram.com/_looklyn_"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E4405F] hover:!text-black hover:scale-110 transition-all duration-300 cursor-pointer"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://www.facebook.com/looklyn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1877F2] hover:!text-black hover:scale-110 transition-all duration-300 cursor-pointer"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=looklynnn@gmail.com&su=Support%20Request"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500 hover:!text-black hover:scale-110 transition-all duration-300 cursor-pointer"
                aria-label="Email"
              >
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>
        </section>

        <footer className="py-6 sm:py-8 lg:py-10 text-center text-xs uppercase tracking-[0.5em] text-muted-foreground">
          © {new Date().getFullYear()} Looklyn — Own The Look
        </footer>
      </main>

    </div>
  );
};

export default Home;
