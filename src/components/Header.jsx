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
        <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
          <nav className="container mx-auto flex h-14 sm:h-16 lg:h-20 items-center justify-between px-2 sm:px-3 lg:px-8">
            {/* Left side - Sidebar Trigger */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-accent"
                onClick={toggleSidebar}
                aria-label="Open sidebar"
              >
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
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
                  className="h-8 sm:h-9 md:h-10 lg:h-8 xl:h-8 w-auto object-contain max-h-8 sm:max-h-10"
                />
              </Link>
            </div>

        {/* Right side - Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-accent h-8 w-8 sm:h-9 sm:w-9"
            aria-label="Wishlist"
            asChild
          >
            <Link to="/wishlist">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 sm:-right-1 sm:-top-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-primary text-[9px] sm:text-[10px] font-medium text-primary-foreground">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-accent h-8 w-8 sm:h-9 sm:w-9"
            aria-label="Cart"
            asChild
          >
            <Link to="/cart">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 sm:-right-1 sm:-top-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-primary text-[9px] sm:text-[10px] font-medium text-primary-foreground">
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
              className="hover:bg-accent h-8 w-8 sm:h-9 sm:w-9" 
              aria-label="Login" 
              asChild
            >
              <Link to="/auth">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
