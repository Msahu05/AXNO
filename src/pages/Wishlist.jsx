import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { useCart } from "@/contexts/cart-context";
import { toast } from "@/hooks/use-toast";
import ProductCard from "@/components/ProductCard";
import { getImageUrl } from "@/lib/api";

const Wishlist = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { items: wishlistItems, removeItem } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToCart = (item) => {
    addItem({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      original: item.original,
      image: item.image,
      size: "M", // Default size
    });
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  const handleRemove = (id) => {
    removeItem(id);
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist.",
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_70%)]">
      <div className="px-4 py-10">
        <div className="mx-auto max-w-5xl space-y-10 rounded-[48px] border border-white/15 bg-[var(--card)]/95 p-8 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 sm:gap-2.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] transition-all duration-200 bg-transparent hover:bg-purple-200 hover:shadow-sm active:bg-purple-300" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> 
          </button>
          <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">Wishlist</p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="rounded-[32px] border border-white/20 bg-background/80 p-12 text-center">
            <p className="text-xl font-semibold mb-2">Your wishlist is empty</p>
            <p className="text-muted-foreground mb-6">Add some products to your wishlist to see them here.</p>
            <Button className="rounded-full bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-background" onClick={() => navigate("/")}>
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-3">
            {wishlistItems.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                slug={item.slug}
                name={item.name}
                category={item.category}
                price={item.price}
                originalPrice={item.original}
                image={getImageUrl(item.image)}
              />
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;

