import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

const wishlistItems = [
  {
    id: "hoodie-02",
    title: "Night Pulse Hoodie",
    type: "Hoodie",
    price: 1099,
    original: 1999,
    image: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "sweat-02",
    title: "Mono Sculpt Sweatshirt",
    type: "Sweatshirt",
    price: 999,
    original: 1799,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=80",
  },
];

const Wishlist = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent("/wishlist")}`);
    }
  }, [isAuthenticated, navigate]);

  const handleMoveToCart = (id) => {
    if (isAuthenticated) {
      navigate(`/product/${id}`);
    } else {
      navigate(`/auth?redirect=${encodeURIComponent(`/product/${id}`)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_70%)] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-10 rounded-[48px] border border-white/15 bg-[var(--card)]/95 p-8 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em]" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">Wishlist</p>
        </div>

        <div className="grid gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="grid gap-6 rounded-[32px] border border-white/20 bg-background/80 p-6 text-sm sm:grid-cols-[180px_1fr_auto]">
              <img src={item.image} alt={item.title} className="h-48 w-full rounded-[24px] object-cover" />
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">{item.type}</p>
                <h3 className="text-2xl font-semibold">{item.title}</h3>
                <div className="flex items-baseline gap-3">
                  <p className="text-2xl font-bold">₹{item.price}</p>
                  <p className="text-muted-foreground line-through">₹{item.original}</p>
                </div>
                <p className="text-muted-foreground">Save this look or move it to cart to customise.</p>
              </div>
              <div className="flex flex-col gap-3">
                <Button className="rounded-full bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-background" onClick={() => handleMoveToCart(item.id)}>
                  <ShoppingBag className="mr-2 h-4 w-4" /> Move to cart
                </Button>
                <Button variant="ghost" className="rounded-full border border-transparent text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground hover:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;

