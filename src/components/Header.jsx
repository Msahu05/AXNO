import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Heart, ShoppingCart, Sun, Moon, Menu, X, Home, Sparkles, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { useThemeMode } from "@/contexts/theme-context";
import UserMenu from "@/components/UserMenu";
import CartFlyout from "@/components/CartFlyout";
import WishlistFlyout from "@/components/WishlistFlyout";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated = false, user } = useAuth();
  const { itemCount = 0 } = useCart();
  const { itemCount: wishlistCount = 0 } = useWishlist();
  const { theme, toggleTheme } = useThemeMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartFlyoutOpen, setCartFlyoutOpen] = useState(false);
  const [wishlistFlyoutOpen, setWishlistFlyoutOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);
  const [heartPop, setHeartPop] = useState(false);
  const prevCartCountRef = useRef(itemCount);
  const prevWishlistCountRef = useRef(wishlistCount);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cart badge pulse animation
  useEffect(() => {
    if (itemCount > prevCartCountRef.current) {
      setCartPulse(true);
      setTimeout(() => setCartPulse(false), 600);
    }
    prevCartCountRef.current = itemCount;
  }, [itemCount]);

  // Heart pop animation
  useEffect(() => {
    if (wishlistCount > prevWishlistCountRef.current) {
      setHeartPop(true);
      setTimeout(() => setHeartPop(false), 400);
    }
    prevWishlistCountRef.current = wishlistCount;
  }, [wishlistCount]);

  const requireAuth = (destination) => {
    if (isAuthenticated) {
      navigate(destination);
    } else {
      navigate(`/auth?redirect=${encodeURIComponent(destination)}`);
    }
  };

  // Determine active tab based on current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.includes('/category')) return 'category';
    // Features can be a section on home page or separate page
    if (path.includes('features') || path.includes('custom')) return 'features';
    return 'home';
  };

  const activeTab = getActiveTab();

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/',
      action: () => navigate('/'),
    },
    {
      id: 'features',
      label: 'Features',
      icon: Sparkles,
      path: '/',
      action: () => {
        navigate('/');
        setTimeout(() => {
          document.getElementById('custom')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
    },
    {
      id: 'category',
      label: 'Category',
      icon: Grid3x3,
      path: '/category/hoodies',
      action: () => navigate('/category/hoodies'),
    },
  ];

  const handleTabClick = (tab) => {
    setMobileMenuOpen(false);
    if (tab.action) {
      tab.action();
    } else {
      navigate(tab.path);
    }
  };

  return (
    <>
      <header 
        className="sticky top-0 z-50 w-full px-4 sm:px-6 py-4"
        role="banner"
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-[#2a2538] rounded-[16px] border border-[rgba(47,37,64,0.08)] dark:border-white/10 shadow-[0_4px_20px_rgba(47,37,64,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-sm">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6">
              {/* Left: Logo */}
              <button
                onClick={() => navigate("/")}
                className="flex items-center min-w-0 flex-shrink-0 group"
                aria-label="Go to homepage"
              >
                <span className="font-heading text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  LOOKLYN
                </span>
              </button>

              {/* Center: Tab Navigation - Desktop Only */}
              {!isMobile && (
                <nav className="flex-1 flex items-center justify-center gap-6" aria-label="Main navigation">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          isActive
                            ? 'text-purple-600 dark:text-purple-400 font-semibold'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        }`}
                        aria-label={`Navigate to ${tab.label}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.5} />
                        <span className="font-body text-sm font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              )}

              {/* Right: Actions */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Wishlist Icon */}
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      setWishlistFlyoutOpen(true);
                    } else {
                      requireAuth("/wishlist");
                    }
                  }}
                  className="relative rounded-full p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label={`Wishlist${wishlistCount > 0 ? ` (${wishlistCount} items)` : ''}`}
                >
                  <Heart 
                    className={`h-5 w-5 transition-all duration-200 ${heartPop ? 'scale-125' : ''}`}
                    strokeWidth={1.5}
                    fill={wishlistCount > 0 ? 'currentColor' : 'none'}
                  />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-purple-600 dark:bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center font-body">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </button>

                {/* Cart Icon */}
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      setCartFlyoutOpen(true);
                    } else {
                      requireAuth("/cart");
                    }
                  }}
                  className="relative rounded-full p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label={`Shopping cart${itemCount > 0 ? ` (${itemCount} items)` : ''}`}
                >
                  <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
                  {itemCount > 0 && (
                    <span
                      className={`absolute -top-1 -right-1 h-5 w-5 rounded-full bg-purple-600 dark:bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center font-body ${
                        cartPulse ? 'animate-pulse scale-110' : ''
                      } transition-all duration-300`}
                    >
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="relative rounded-full p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  <div className="relative h-5 w-5">
                    <Sun
                      className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                        theme === 'light' ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'
                      }`}
                      strokeWidth={1.5}
                    />
                    <Moon
                      className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                        theme === 'dark' ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
                      }`}
                      strokeWidth={1.5}
                    />
                  </div>
                </button>

                {/* Login / Profile Button */}
                {isAuthenticated ? (
                  <UserMenu />
                ) : (
                  <Button
                    onClick={() => navigate("/auth")}
                    className="rounded-lg bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-body font-medium px-4 sm:px-6 py-2 text-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label="Login"
                  >
                    Login
                  </Button>
                )}

                {/* Mobile Hamburger Menu */}
                {isMobile && (
                  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <button
                        className="rounded-full p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        aria-label="Open menu"
                      >
                        <Menu className="h-5 w-5" strokeWidth={1.5} />
                      </button>
                    </SheetTrigger>
                    <SheetContent
                      side="right"
                      className="w-[85vw] sm:w-[400px] bg-white dark:bg-[#2a2538] text-gray-900 dark:text-white border-gray-200 dark:border-white/10"
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="font-heading text-xl font-semibold">Menu</h2>
                          <SheetClose asChild>
                            <button
                              className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                              aria-label="Close menu"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </SheetClose>
                        </div>
                        <nav className="flex flex-col gap-2 flex-1" aria-label="Mobile navigation">
                          {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                              <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab)}
                                className={`flex items-center gap-3 text-left px-4 py-3 rounded-xl transition-colors font-body text-base focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                  isActive
                                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                                }`}
                              >
                                <Icon className="h-5 w-5" strokeWidth={1.5} />
                                {tab.label}
                              </button>
                            );
                          })}
                          {isAuthenticated && (
                            <>
                              <div className="border-t border-gray-200 dark:border-white/10 my-4" />
                              <button
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  navigate("/account");
                                }}
                                className="text-left px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors font-body text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                My Account
                              </button>
                              <button
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  navigate("/orders");
                                }}
                                className="text-left px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors font-body text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                My Orders
                              </button>
                            </>
                          )}
                        </nav>
                      </div>
                    </SheetContent>
                  </Sheet>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Flyout */}
      <CartFlyout isOpen={cartFlyoutOpen} onClose={() => setCartFlyoutOpen(false)} />

      {/* Wishlist Flyout */}
      <WishlistFlyout isOpen={wishlistFlyoutOpen} onClose={() => setWishlistFlyoutOpen(false)} />
    </>
  );
};

export default Header;
