import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import UserMenu from "@/components/UserMenu";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated = false } = useAuth();
  const { itemCount = 0 } = useCart();
  const { itemCount: wishlistCount = 0 } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const handleProductsNav = () => {
    setMobileMenuOpen(false);
    navigate("/");
    setTimeout(() => {
      document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <header className="sticky top-0 z-40 rounded-[24px] sm:rounded-[32px] lg:rounded-[48px] border border-transparent bg-[#5c3d8a] px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-white shadow-[0_20px_60px_rgba(92,61,138,0.35)] backdrop-blur dark:bg-[#120c1b]">
      <div className="flex items-center justify-between gap-2 sm:gap-4 min-w-0">
        <button 
          onClick={() => navigate("/")}
          className="cursor-pointer hover:opacity-80 transition-opacity flex items-center min-w-0 flex-shrink-0 p-0"
        >
          <Logo size="small" showTagline={false} className="text-white" />
        </button>
        
        {/* Desktop Navigation - Only render on desktop */}
        {!isMobile && (
          <nav className="flex flex-1 items-center justify-center gap-5 lg:gap-6 font-display text-base lg:text-lg tracking-[0.06em]">
            <button 
              className="hover:text-secondary transition-colors whitespace-nowrap" 
              onClick={() => navigate("/")}
            >
              Home
            </button>
            <button 
              className="hover:text-secondary transition-colors whitespace-nowrap" 
              onClick={handleProductsNav}
            >
              Products
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="hover:text-secondary transition-colors whitespace-nowrap flex items-center gap-1 outline-none">
                Category
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#5c3d8a] text-white border-white/20">
                <DropdownMenuItem 
                  className="cursor-pointer focus:bg-white/10 focus:text-white"
                  onClick={() => navigate("/category/hoodies")}
                >
                  Hoodies
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer focus:bg-white/10 focus:text-white"
                  onClick={() => navigate("/category/t-shirts")}
                >
                  T-Shirts
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer focus:bg-white/10 focus:text-white"
                  onClick={() => navigate("/category/sweatshirts")}
                >
                  Sweatshirts
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {isAuthenticated && (
              <button 
                className="hover:text-secondary transition-colors whitespace-nowrap" 
                onClick={() => navigate("/orders")}
              >
                My Orders
              </button>
            )}
          </nav>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          <button
            className="rounded-full border border-white/40 p-3 text-white hover:bg-white/10 relative transition-colors flex-shrink-0"
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
            className="rounded-full border border-white/40 p-3 text-white hover:bg-white/10 relative transition-colors flex-shrink-0"
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
            <Button className="flex rounded-full bg-white/90 px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 font-display text-xs sm:text-sm lg:text-base tracking-[0.1em] text-[#5c3d8a] flex-shrink-0" onClick={() => navigate("/auth")}>
              Login
            </Button>
          )}
          
          {/* Theme Toggle - Desktop only */}
          {!isMobile && (
            <ThemeToggle />
          )}
          
          {/* Mobile Hamburger Menu - Only render on mobile */}
          {isMobile && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="rounded-full border border-white/40 p-2 text-white hover:bg-white/10 transition-colors flex-shrink-0" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-[400px] bg-[#5c3d8a] text-white border-white/20 [&>button]:hidden overflow-y-auto">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6 flex-shrink-0">
                    <h2 className="text-xl font-display uppercase tracking-[0.18em]">Menu</h2>
                    <SheetClose asChild>
                      <button className="rounded-full p-2 hover:bg-white/10 transition-colors">
                        <X className="h-5 w-5" />
                      </button>
                    </SheetClose>
                  </div>
                  <nav className="flex flex-col gap-4 flex-1 overflow-y-auto min-h-0">
                  <button
                    className="text-left px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-display text-lg"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/");
                    }}
                  >
                    Home
                  </button>
                  <button
                    className="text-left px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-display text-lg"
                    onClick={handleProductsNav}
                  >
                    Products
                  </button>
                  <div className="px-4">
                    <p className="text-sm text-white/70 mb-2 font-display">Category</p>
                    <div className="flex flex-col gap-2">
                      <button
                        className="text-left px-4 py-2 rounded-lg hover:bg-white/10 transition-colors font-display"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate("/category/hoodies");
                        }}
                      >
                        Hoodies
                      </button>
                      <button
                        className="text-left px-4 py-2 rounded-lg hover:bg-white/10 transition-colors font-display"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate("/category/t-shirts");
                        }}
                      >
                        T-Shirts
                      </button>
                      <button
                        className="text-left px-4 py-2 rounded-lg hover:bg-white/10 transition-colors font-display"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate("/category/sweatshirts");
                        }}
                      >
                        Sweatshirts
                      </button>
                    </div>
                  </div>
                  {isAuthenticated && (
                    <button
                      className="text-left px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-display text-lg"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/orders");
                      }}
                    >
                      My Orders
                    </button>
                  )}
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
                  <div className="mt-auto pt-4 border-t border-white/20 flex-shrink-0">
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

