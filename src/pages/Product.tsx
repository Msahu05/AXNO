import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Heart, Star, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

const catalogue = [
  {
    id: "hoodie-01",
    name: "Prism Panel Hoodie",
    type: "Hoodie",
    price: 1099,
    original: 1999,
    image: "https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?auto=format&fit=crop&w=1000&q=80",
    palette: ["#fef2ff", "#d3b0ff", "#b088ff"],
  },
  {
    id: "hoodie-02",
    name: "Night Pulse Hoodie",
    type: "Hoodie",
    price: 1099,
    original: 1999,
    image: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=1000&q=80",
    palette: ["#0b0f19", "#101a2c", "#1f2838"],
  },
  {
    id: "tee-01",
    name: "Luminous Core Tee",
    type: "T-Shirt",
    price: 599,
    original: 1099,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80",
    palette: ["#fff", "#f2ebff", "#d9c8ff"],
  },
  {
    id: "sweat-01",
    name: "Neo Circuit Sweatshirt",
    type: "Sweatshirt",
    price: 999,
    original: 1799,
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
    palette: ["#ffe5d4", "#ffc2ac", "#ffb299"],
  },
];

const sizes = ["S", "M", "L", "XL"];

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openAuth } = useAuth();
  const product = catalogue.find((item) => item.id === id) ?? catalogue[0];
  const related = catalogue.filter((item) => item.id !== product.id).slice(0, 3);
  const [size, setSize] = useState("M");

  const handleProtected = (destination: string) => {
    openAuth(() => navigate(destination));
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.1),_transparent_65%)] px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-10 rounded-[56px] border border-white/10 bg-[var(--card)]/90 p-8 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em]" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">Product details</p>
          <Button variant="ghost" className="gap-2 text-xs font-semibold uppercase tracking-[0.4em]" onClick={() => navigate("/checkout")}>
            Checkout <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="relative rounded-[40px] border border-white/15 bg-[var(--gradient-card)] p-10 shadow-[var(--shadow-soft)]">
              <img src={product.image} alt={product.name} className="h-[420px] w-full rounded-[32px] object-cover object-top" />
              <button className="absolute right-8 top-8 rounded-full bg-background/70 p-3 text-foreground backdrop-blur" onClick={() => handleProtected("/wishlist")}>
                <Heart className="h-5 w-5" />
              </button>
            </div>
            <div className="flex gap-3">
              {product.palette.map((color) => (
                <span key={color} className="h-12 flex-1 rounded-3xl border border-white/30" style={{ background: color }} />
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
              <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">Select size</p>
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
                Want your own art? Continue with AXNO design or upload your concept at checkout. You can attach AI prompts, PSDs, or references there. We confirm on WhatsApp within 12 hours to deliver exactly what you want.
              </p>
              <Button variant="outline" className="mt-4 rounded-full border-primary text-primary hover:bg-primary/10" onClick={() => navigate("/checkout")}>
                Upload later at checkout
              </Button>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button className="flex-1 rounded-full bg-foreground px-8 py-6 text-sm font-semibold uppercase tracking-[0.4em] text-background" onClick={() => handleProtected("/checkout")}>
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
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <div key={item.id} className="rounded-[28px] border border-white/15 bg-background/80 p-4 shadow-inner">
                <img src={item.image} alt={item.name} className="h-48 w-full rounded-2xl object-cover" />
                <p className="mt-3 text-sm uppercase tracking-[0.4em] text-muted-foreground">{item.type}</p>
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
