import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import UserMenu from "@/components/UserMenu";
import ThemeToggle from "@/components/ThemeToggle";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated = false } = useAuth();
  const { itemCount = 0 } = useCart();
  const { itemCount: wishlistCount = 0 } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const requireAuth = (destination) => {
    if (isAuthenticated) {
      navigate(destination);
    } else {
      navigate(`/auth?redirect=${encodeURIComponent(destination)}`);
    }
  };

  const handleWishlistNav = () => {
    requireAuth("/wishlist");
  };

  const handleHomeNav = () => {
    setMobileMenuOpen(false);
    navigate("/");
  };

  const handleProductsNav = () => {
    setMobileMenuOpen(false);
    navigate("/");
    setTimeout(() => {
      document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCustomiseNav = () => {
    setMobileMenuOpen(false);
    navigate("/");
    setTimeout(() => {
      document.getElementById("custom")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <header className="sticky top-0 z-40 rounded-[24px] sm:rounded-[32px] lg:rounded-[48px] border border-transparent bg-[#5c3d8a] px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-white shadow-[0_20px_60px_rgba(92,61,138,0.35)] backdrop-blur dark:bg-[#120c1b]">
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 lg:gap-4">
        <div className="font-display text-[10px] sm:text-sm lg:text-xl xl:text-2xl uppercase tracking-[0.12em] sm:tracking-[0.15em] lg:tracking-[0.18em] truncate leading-tight pl-2 sm:pl-3 lg:pl-4">AXNO - Own The Look</div>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex flex-1 items-center justify-center gap-5 font-display text-lg tracking-[0.06em]">
          <button 
            className="hover:text-secondary transition-colors" 
            onClick={() => navigate("/")}
          >
            Home
          </button>
          <button 
            className="hover:text-secondary transition-colors" 
            onClick={() => {
              navigate("/");
              setTimeout(() => {
                document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          >
            Products
          </button>
          <button 
            className="hover:text-secondary transition-colors" 
            onClick={() => {
              navigate("/");
              setTimeout(() => {
                document.getElementById("custom")?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          >
            Customise
          </button>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            className="rounded-full border border-white/40 p-3 text-white hover:bg-white/10 relative transition-colors"
            aria-label="Wishlist"
            onClick={handleWishlistNav}
          >
            <Heart className="h-4 w-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-secondary text-xs font-bold flex items-center justify-center text-foreground">
                {wishlistCount}
              </span>
            )}
          </button>
          <button
            className="rounded-full border border-white/40 p-3 text-white hover:bg-white/10 relative transition-colors"
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
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Button className="rounded-full bg-white/90 px-4 sm:px-6 py-2 font-display text-sm sm:text-base tracking-[0.1em] text-[#5c3d8a]" onClick={() => navigate("/auth")}>
              Login
            </Button>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile Actions */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            className="rounded-full border border-white/40 p-2 text-white hover:bg-white/10 relative transition-colors"
            aria-label="Wishlist"
            onClick={handleWishlistNav}
          >
            <Heart className="h-4 w-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-secondary text-[10px] font-bold flex items-center justify-center text-foreground">
                {wishlistCount}
              </span>
            )}
          </button>
          <button
            className="rounded-full border border-white/40 p-2 text-white hover:bg-white/10 relative transition-colors"
            aria-label="Cart"
            onClick={() => requireAuth("/cart")}
          >
            <ShoppingCart className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-secondary text-[10px] font-bold flex items-center justify-center text-foreground">
                {itemCount}
              </span>
            )}
          </button>
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Button className="rounded-full bg-white/90 px-3 sm:px-4 py-1.5 sm:py-2 font-display text-xs sm:text-sm tracking-[0.1em] text-[#5c3d8a] flex-shrink-0" onClick={() => navigate("/auth")}>
              Login
            </Button>
          )}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="rounded-full border border-white/40 p-2 text-white hover:bg-white/10 transition-colors" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[400px] bg-[#5c3d8a] text-white border-white/20 [&>button]:hidden">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display uppercase tracking-[0.18em]">Menu</h2>
                  <SheetClose asChild>
                    <button className="rounded-full p-2 hover:bg-white/10 transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </SheetClose>
                </div>
                <nav className="flex flex-col gap-4 flex-1">
                  <button
                    className="text-left px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-display text-lg"
                    onClick={handleHomeNav}
                  >
                    Home
                  </button>
                  <button
                    className="text-left px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-display text-lg"
                    onClick={handleProductsNav}
                  >
                    Products
                  </button>
                  <button
                    className="text-left px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-display text-lg"
                    onClick={handleCustomiseNav}
                  >
                    Customise
                  </button>
                  <div className="border-t border-white/20 my-4"></div>
                  {isAuthenticated && (
                    <>
                      <button
                        className="text-left px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-display"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate("/account");
                        }}
                      >
                        Manage Account
                      </button>
                      <button
                        className="text-left px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-display"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate("/account?tab=addresses");
                        }}
                      >
                        My Addresses
                      </button>
                    </>
                  )}
                </nav>
                <div className="mt-auto pt-4 border-t border-white/20">
                  <ThemeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;

