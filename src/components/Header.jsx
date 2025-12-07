import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Heart, Moon, Sun, User, Menu, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { useCart } from "@/contexts/cart-context";
import { useThemeMode } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";
import UserMenu from "@/components/UserMenu";

const navLinks = [
  { name: "Home", path: "/", scrollTo: null, id: "home" },
  { name: "Products", path: "/", scrollTo: "catalogue", id: "products" },
  { name: "Contact Us", path: "/", scrollTo: "support", id: "contact" },
  { name: "My Orders", path: "/orders", scrollTo: null, id: "orders" },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated = false, user } = useAuth();
  const { itemCount: wishlistCount = 0 } = useWishlist();
  const { itemCount: cartCount = 0 } = useCart();
  const { theme, toggleTheme } = useThemeMode();
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("home");

  // Set default active link based on location
  useEffect(() => {
    if (location.pathname === "/orders") {
      setActiveLink("orders");
    } else if (location.pathname === "/") {
      setActiveLink("home");
    }
  }, [location.pathname]);

  // Determine active link
  const isActive = (link) => {
    return activeLink === link.id;
  };

  const handleNavClick = (e, link) => {
    setActiveLink(link.id);
    
    if (link.scrollTo) {
      e.preventDefault();
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const element = document.getElementById(link.scrollTo);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } else {
        const element = document.getElementById(link.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else if (link.id === "home") {
      e.preventDefault();
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <nav className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
        {/* Left side - Logo */}
        <Link
          to="/"
          className="font-display text-2xl font-bold tracking-tight text-foreground"
        >
          <span className="text-gradient">Looklyn</span>
        </Link>

        {/* Center - Navigation in rounded container */}
        <div className="hidden md:flex items-center justify-center">
          <div className="flex items-center gap-1 rounded-full bg-muted/50 px-2 py-1.5 border border-border/50">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                to={link.path}
                onClick={(e) => handleNavClick(e, link)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium transition-all rounded-full",
                  isActive(link)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side - Icons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-accent"
            aria-label="Wishlist"
            asChild
          >
            <Link to="/wishlist">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-accent"
            aria-label="Cart"
            asChild
          >
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          </Button>
          {/* Theme toggle - hidden on mobile, shown in menu */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden md:flex hover:bg-accent"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-accent" 
              aria-label="Login" 
              asChild
            >
              <Link to="/auth">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-16 border-b border-border bg-background p-4 md:hidden animate-fade-in">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                to={link.path}
                onClick={(e) => {
                  setIsOpen(false);
                  handleNavClick(e, link);
                }}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                  isActive(link)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
            {/* Theme toggle in mobile menu */}
            <button
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors rounded-lg text-muted-foreground hover:text-foreground"
            >
              {theme === "light" ? (
                <>
                  <Moon className="h-5 w-5" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="h-5 w-5" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
