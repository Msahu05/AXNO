import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Plus, Minus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Wait for auth to finish loading before checking
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.1),_transparent_65%)]">
        <div className="px-4 sm:px-6 pb-8 sm:pb-12 pt-6">
          <Header />
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Only redirect if not already on auth page to prevent loops
    if (window.location.pathname !== '/auth') {
      navigate(`/auth?redirect=${encodeURIComponent("/cart")}`, { replace: true });
    }
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.1),_transparent_65%)]">
        <div className="px-4 sm:px-6 pb-8 sm:pb-12 pt-6">
          <Header />
        </div>
        <div className="px-4 py-6 sm:py-10">
          <div className="mx-auto max-w-4xl rounded-[32px] sm:rounded-[56px] border border-white/10 bg-[var(--card)]/90 p-6 sm:p-12 shadow-[var(--shadow-soft)] text-center">
            <h2 className="text-2xl sm:text-3xl font-black mb-3 sm:mb-4">Your cart is empty</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">Add some products to get started!</p>
            <div className="flex justify-center">
              <Button className="rounded-full bg-foreground px-6 py-3 sm:px-8 sm:py-6 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-background" onClick={() => navigate("/")}>
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.1),_transparent_65%)]">
      <div className="px-2 sm:px-4 lg:px-6 pb-4 sm:pb-8 lg:pb-12 pt-4 sm:pt-6">
        <Header />
      </div>
      <div className="px-2 sm:px-4 lg:px-6 py-6 sm:py-10">
        <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="flex items-center gap-1 sm:gap-2 rounded-full px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] transition-all duration-200 bg-transparent hover:bg-purple-200 hover:shadow-sm active:bg-purple-300" onClick={() => navigate("/")}>
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black">Shopping Cart</h1>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3 sm:space-y-4 rounded-[24px] sm:rounded-[32px] border border-white/10 bg-[var(--card)]/90 p-4 sm:p-6 shadow-[var(--shadow-soft)]">
            {items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex flex-row gap-3 sm:gap-4 rounded-[16px] sm:rounded-[24px] border border-white/15 bg-background/70 p-3 sm:p-4">
                <img src={item.image} alt={item.name} className="h-12 w-12 sm:h-16 sm:w-16 rounded-md sm:rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm sm:text-base">{item.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{item.category} · Size {String(item.size).replace(/[\[\]"]/g, '').replace(/\\/g, '').trim()}</p>
                    <div className="mt-2 sm:mt-2 flex items-center gap-4 sm:gap-6">
                      <div className="flex items-center gap-1 sm:gap-2 rounded-full border border-white/20 bg-background/50">
                        <button className="p-1.5 sm:p-2 hover:bg-white/20" onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}>
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <span className="px-2 sm:px-3 text-xs sm:text-sm font-semibold">{item.quantity}</span>
                        <button className="p-1.5 sm:p-2 hover:bg-white/20" onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}>
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                      <button className="p-1.5 sm:p-2 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id, item.size)}>
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-left sm:text-right flex sm:block items-center justify-between sm:justify-end">
                    <div className="sm:block">
                      <p className="font-bold text-base sm:text-lg">₹{item.price * item.quantity}</p>
                      <p className="text-xs text-muted-foreground line-through">₹{item.original * item.quantity}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[24px] sm:rounded-[32px] border border-white/10 bg-[var(--card)]/90 p-4 sm:p-6 shadow-[var(--shadow-soft)] h-fit">
            <h2 className="text-lg sm:text-xl font-black mb-3 sm:mb-4">Order Summary</h2>
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Subtotal</span>
                <span className="font-semibold">₹{total}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t border-white/20 pt-2 sm:pt-3 flex justify-between text-base sm:text-lg font-black">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
            <Button className="w-full rounded-full bg-foreground px-4 sm:px-8 py-3 sm:py-6 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-background mb-3 sm:mb-4" onClick={() => {
              // Clear buy now product when checking out from cart
              sessionStorage.removeItem('buyNowProduct');
              sessionStorage.removeItem('isBuyNowOrder');
              navigate("/checkout");
            }}>
              Proceed to Checkout
            </Button>
            <Button variant="outline" className="w-full rounded-full border-foreground text-xs sm:text-sm py-2 sm:py-3 mt-2" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

