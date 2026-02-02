import { Link } from "react-router-dom";
import { User, Menu, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { useCart } from "@/contexts/cart-context";
import { useThemeMode } from "@/contexts/theme-context";
import UserMenu from "@/components/UserMenu";
// Logo images - place your images in public folder as:
// public/looklyn-logo-light.png and public/looklyn-logo-dark.png
const looklynLogoLight = "/looklyn-logo-white.jpg";
const looklynLogoDark = "/looklyn-logo-dark.jpg";

const Header = () => {
  const { isAuthenticated = false } = useAuth();
  const { theme } = useThemeMode();
  const { toggleSidebar } = useSidebar();
  const { itemCount: wishlistCount = 0 } = useWishlist();
  const { itemCount: cartCount = 0 } = useCart();

  return (
        <header className="fixed top-0 left-0 right-0 z-[100] w-full m-0 backdrop-blur-md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
          <nav className="container mx-auto flex h-20 sm:h-22 lg:h-24 items-center justify-between px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4">
            {/* Left side - Sidebar Trigger */}
            <div className="flex items-center flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-secondary-foreground hover:bg-secondary/40"
                onClick={toggleSidebar}
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-black stroke-[2.5]" style={{ color: '#000000' }} />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            </div>

            {/* Center - Logo */}
            <div className="flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
              <Link
                to="/"
                className="flex items-center"
              >
                <img
                  src={theme === "light" ? looklynLogoLight : looklynLogoDark}
                  alt="LOOKLYN"
                  className="h-10 sm:h-12 md:h-14 lg:h-12 xl:h-14 w-auto object-contain"
                />
              </Link>
            </div>

        {/* Right side - Icons */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-secondary-foreground hover:bg-secondary/40"
            aria-label="Wishlist"
            asChild
          >
            <Link to="/wishlist">
              <Heart className="h-5 w-5 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-black stroke-[2.5]" style={{ color: '#000000' }} />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-muted text-black h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10"
            aria-label="Cart"
            asChild
          >
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-black stroke-[2.5]" style={{ color: '#000000' }} />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 items-center justify-center rounded-full bg-background text-[9px] sm:text-[10px] lg:text-[11px] font-medium text-black border border-background">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          </Button>
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-secondary-foreground hover:bg-secondary/40" 
              aria-label="Login" 
              asChild
            >
              <Link to="/auth">
                <User className="h-5 w-5 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-black stroke-[2.5]" style={{ color: '#000000' }} />
              </Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
