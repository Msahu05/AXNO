import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Flame, PhoneCall, ShieldHalf, Star, UploadCloud, Waves, HeartHandshake } from "lucide-react";
import LandingAnimation from "@/components/LandingAnimation";
import ThemeToggle from "@/components/ThemeToggle";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

const heroProducts = [
  {
    id: "hoodie-a",
    name: "Aurora Gradient Hoodie",
    category: "Hoodies",
    description: "Hand-painted gradients layered on plush, breathable fleece.",
    image: "https://images.unsplash.com/photo-1503342250614-ca4407868a5b?auto=format&fit=crop&w=900&q=80",
    accent: "linear-gradient(135deg,#f9d9ff,#b088ff)",
  },
  {
    id: "tee-a",
    name: "Orbit Drop Shoulder Tee",
    category: "T-Shirts",
    description: "Structured oversized fit with premium bio-washed cotton.",
    image: "https://images.unsplash.com/photo-1503342296413-28a6ec376304?auto=format&fit=crop&w=900&q=80",
    accent: "linear-gradient(135deg,#c6f2ff,#97c9ff)",
  },
  {
    id: "sweat-a",
    name: "Gravity Loop Sweatshirt",
    category: "Sweatshirts",
    description: "3D puff-print loops that react beautifully to neon lighting.",
    image: "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80",
    accent: "linear-gradient(135deg,#ffd6c4,#ffb299)",
  },
];

const catalogue = [
  {
    id: "hoodie-01",
    name: "Prism Panel Hoodie",
    category: "Hoodies",
    price: 1099,
    original: 1999,
    image: "https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?auto=format&fit=crop&w=900&q=80",
    accent: "linear-gradient(135deg,#ffe1f7,#d3b0ff)",
  },
  {
    id: "hoodie-02",
    name: "Night Pulse Hoodie",
    category: "Hoodies",
    price: 1099,
    original: 1999,
    image: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=900&q=80",
    accent: "linear-gradient(135deg,#252525,#000)",
  },
  {
    id: "tee-01",
    name: "Luminous Core Tee",
    category: "T-Shirts",
    price: 599,
    original: 1099,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    accent: "linear-gradient(135deg,#ffffff,#e1d8ff)",
  },
  {
    id: "tee-02",
    name: "Vanta Line Tee",
    category: "T-Shirts",
    price: 599,
    original: 1099,
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    accent: "linear-gradient(135deg,#222831,#0b0f19)",
  },
  {
    id: "sweat-01",
    name: "Neo Circuit Sweatshirt",
    category: "Sweatshirts",
    price: 999,
    original: 1799,
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
    accent: "linear-gradient(135deg,#ffe5d4,#ffc2ac)",
  },
  {
    id: "sweat-02",
    name: "Mono Sculpt Sweatshirt",
    category: "Sweatshirts",
    price: 999,
    original: 1799,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80",
    accent: "linear-gradient(135deg,#dbe9ff,#7f9dff)",
  },
];

const wishlistPicks = [
  {
    id: "wish-1",
    title: "Shadowline Hoodie",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "wish-2",
    title: "Pixel Wave Tee",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
  },
];

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
  const { openAuth } = useAuth();
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroProducts.length);
    }, 4200);
    return () => window.clearInterval(interval);
  }, []);

  const handleProtectedAction = (destination: string) => {
    openAuth(() => navigate(destination));
  };

  const activeHero = heroProducts[heroIndex];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_60%)]">
      <LandingAnimation />
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 py-10 sm:px-6 lg:px-0">
        <header className="flex flex-wrap items-center justify-between gap-6 rounded-[48px] border border-white/20 bg-gradient-to-r from-[var(--card)]/80 via-[var(--muted)]/80 to-[var(--card)]/80 px-6 py-4 shadow-[var(--shadow-soft)] backdrop-blur dark:border-white/5 dark:shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
          <div className="text-2xl font-black tracking-[0.8em] text-primary">AXNO</div>
          <nav className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.5em] text-muted-foreground">
            <button className="text-foreground hover:text-primary">Home</button>
            <button className="hover:text-primary" onClick={() => document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" })}>
              Products
            </button>
            <button className="hover:text-primary" onClick={() => document.getElementById("custom")?.scrollIntoView({ behavior: "smooth" })}>
              Customise
            </button>
            <button className="hover:text-primary" onClick={() => navigate("/wishlist")}>
              Wishlist
            </button>
            <button className="hover:text-primary" onClick={() => navigate("/checkout")}>
              Checkout
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <Button className="rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-2 text-xs font-semibold uppercase tracking-[0.4em] shadow-[var(--shadow-soft)]">
              Own the look
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[56px] border border-white/20 bg-[var(--gradient-hero)] p-10 shadow-[var(--shadow-soft)] backdrop-blur dark:border-white/5 dark:shadow-[var(--shadow-strong)]">
            <p className="text-sm uppercase tracking-[0.9em] text-muted-foreground">Custom Upperwear Studio</p>
            <h1 className="mt-6 text-4xl font-black leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Build your <span className="text-primary">signature</span> drop. Hoodies, tees, sweatshirts crafted for India.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Browse our in-house drops or upload your art. Every stitch is mapped, proofed, and confirmed with you on WhatsApp within 12 hours.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                className="rounded-full bg-foreground px-8 py-6 text-sm font-semibold uppercase tracking-[0.4em] text-background"
                onClick={() => handleProtectedAction(`/product/${activeHero.id}`)}
              >
                Buy now
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-foreground px-8 py-6 text-sm font-semibold uppercase tracking-[0.4em]"
                onClick={() => document.getElementById("custom")?.scrollIntoView({ behavior: "smooth" })}
              >
                Custom flow
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6 text-secondary" />
                <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
                  4.9/5<br />Community rated
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Flame className="h-6 w-6 text-secondary" />
                <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
                  48h<br />Production
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Waves className="h-6 w-6 text-secondary" />
                <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
                  Zero<br />Cracking ink
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[56px] border border-white/15 bg-[var(--card)]/90 p-8 shadow-[var(--shadow-soft)] backdrop-blur dark:border-white/5">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.5em] text-muted-foreground">
              <span>Top drops</span>
              <span>{heroIndex + 1} / {heroProducts.length}</span>
            </div>
            <div className="mt-6 overflow-hidden rounded-[32px] bg-[var(--gradient-card)] p-4 shadow-inner">
              <img src={activeHero.image} alt={activeHero.name} className="h-72 w-full rounded-[28px] object-cover object-top" />
            </div>
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.5em] text-muted-foreground">{activeHero.category}</p>
              <h3 className="text-2xl font-semibold">{activeHero.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{activeHero.description}</p>
            </div>
            <div className="mt-6 flex gap-2">
              {heroProducts.map((_, index) => (
                <button key={index} className={`h-1 flex-1 rounded-full ${index === heroIndex ? "bg-foreground" : "bg-muted"}`} onClick={() => setHeroIndex(index)} />
              ))}
            </div>
          </div>
        </section>

        <section id="catalogue" className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">Top products</p>
              <h2 className="text-4xl font-black">Layer up in AXNO</h2>
            </div>
            <Button variant="ghost" className="gap-2 text-xs font-semibold uppercase tracking-[0.4em]" onClick={() => navigate("/wishlist")}>
              Wishlist <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {catalogue.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                category={product.category}
                price={product.price}
                originalPrice={product.original}
                image={product.image}
                accent={product.accent}
                onView={() => navigate(`/product/${product.id}`)}
                onAdd={() => handleProtectedAction(`/product/${product.id}`)}
                onWishlist={() => navigate("/wishlist")}
              />
            ))}
          </div>
        </section>

        <section id="custom" className="grid gap-8 rounded-[56px] border border-white/15 bg-gradient-to-r from-[var(--card)] via-[var(--muted)] to-[var(--card)] p-10 shadow-[var(--shadow-soft)] lg:grid-cols-2">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.7em] text-muted-foreground">Custom studio</p>
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
              <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">Why AXNO</p>
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
              <Button variant="outline" className="rounded-full border-foreground px-6 py-2 text-xs font-semibold uppercase tracking-[0.4em]" onClick={() => handleProtectedAction("/wishlist")}>
                View all
              </Button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {wishlistPicks.map((pick) => (
                <div key={pick.id} className="rounded-[28px] border border-white/20 bg-background/70 p-4 shadow-inner backdrop-blur">
                  <img src={pick.image} alt={pick.title} className="h-40 w-full rounded-2xl object-cover" />
                  <p className="mt-3 font-semibold">{pick.title}</p>
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
              <div className="rounded-[24px] border border-white/30 bg-background/80 p-5">
                <p className="text-lg font-semibold text-foreground">Aarya Patel</p>
                <p>B-902, Skye Towers</p>
                <p>Hinjewadi, Pune 411057</p>
                <p className="text-xs uppercase tracking-[0.4em] text-primary">Default</p>
              </div>
              <div className="rounded-[24px] border border-dashed border-white/40 p-5">
                <p className="font-semibold text-foreground">Add new address</p>
                <p>Save once, skip typing forever.</p>
              </div>
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
          © {new Date().getFullYear()} AXNO — Own The Look
          <div className="mt-2 flex justify-center gap-4 text-[10px] text-muted-foreground">
            <span>Hoodies @₹1099 (MRP 1999)</span>
            <span>Tees @₹599 (MRP 1099)</span>
            <span>Sweatshirts @₹999 (MRP 1799)</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;

