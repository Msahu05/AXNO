import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, PhoneCall, UploadCloud, HeartHandshake, Truck, ArrowRight, Leaf, Sparkles, Zap, Award, Shield, Star } from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { productsAPI, userAPI, getImageUrl } from "@/lib/api";

const productTypes = [
  { key: "Hoodie", label: "Hoodies", route: "hoodies" },
  { key: "T-Shirt", label: "T-Shirts", route: "t-shirts" },
  { key: "Sweatshirt", label: "Sweatshirts", route: "sweatshirts" },
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const productsResponse = await productsAPI.getAll();
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
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-12 space-y-16">
        <HeroSection />

        <div className="border-t border-border/50 my-12"></div>

        <section id="catalogue" className="space-y-12">
          <div className="space-y-16">
            {productTypes.map((type) => {
              const typeProducts = allProducts.filter((p) => p.category === type.key);
              
              return (
                <div key={type.key} id={`${type.key.toLowerCase()}-section`} className="space-y-6">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="font-display text-2xl font-bold uppercase tracking-[0.16em] text-foreground">{type.label}</p>
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
                    {typeProducts.slice(0, 3).map((product) => (
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

        <div className="border-t border-border/50 my-12"></div>

        <section id="custom" className="space-y-8 rounded-[56px] border border-border dark:border-white/15 bg-purple-soft/50 dark:bg-gradient-to-r dark:from-[var(--card)] dark:via-[var(--muted)] dark:to-[var(--card)] p-10 shadow-[var(--shadow-soft)]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Custom studio</p>
            <h2 className="text-4xl font-black">Upload, confirm, conquer.</h2>
            <p className="text-muted-foreground">
              Start with our templates or drop your own artwork. Checkout collects your inspiration, Pinterest links or AI prompts. We ping you on WhatsApp within 12 hours to align colours, placements, and fit. Satisfaction over everything.
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
            {customizationSteps.map((step, index) => (
              <div key={step.title} className="flex items-center gap-4 md:gap-8">
                <div className="flex flex-col items-center justify-center text-center space-y-4 rounded-[28px] border border-border dark:border-white/20 bg-background/60 p-6 backdrop-blur w-[280px] h-[280px]">
                  <div className="rounded-2xl bg-primary/10 p-4 text-primary">{step.icon}</div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {index < customizationSteps.length - 1 && (
                  <ArrowRight className="h-8 w-8 text-primary flex-shrink-0 hidden md:block" />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-center">
            <Button className="rounded-full bg-primary px-8 py-6 text-xs font-semibold uppercase tracking-[0.4em]" onClick={() => navigate("/checkout")}>
              Start custom order
            </Button>
          </div>

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
            <div className="flex gap-4">
              <Button className="rounded-lg bg-[#25D366] px-6 py-4 text-sm font-semibold text-white shadow-lg flex items-center gap-2" onClick={() => window.open("https://wa.me/918828844110", "_blank")}>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.372a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </Button>
              <Button variant="outline" className="rounded-lg border border-border px-6 py-4 text-sm font-semibold text-foreground flex items-center gap-2" onClick={() => window.open("tel:+918828844110", "_self")}>
                <PhoneCall className="h-5 w-5" /> Call
              </Button>
            </div>
          </div>
        </section>

        <footer className="py-10 text-center text-xs uppercase tracking-[0.5em] text-muted-foreground">
          © {new Date().getFullYear()} Looklyn — Own The Look
        </footer>
      </main>
    </div>
  );
};

export default Home;
