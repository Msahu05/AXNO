import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
  Home, 
  Package, 
  MessageCircle, 
  ShoppingBag, 
  User,
  Crown,
  X,
  Layers,
  Sparkles,
  TrendingUp,
  Flame,
  Star,
  Instagram,
  LogIn,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { useThemeMode } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const looklynLogoLight = "/looklyn-logo-white.jpg";
const looklynLogoDark = "/looklyn-logo-dark.jpg";

const categories = [
  { title: "Hoodies", url: "/category/hoodies", icon: Layers },
  { title: "T-Shirts", url: "/category/t-shirts", icon: Layers },
  { title: "Sweatshirts", url: "/category/sweatshirts", icon: Layers },
];

const navItems = [
  {
    title: "Navigation",
    items: [
      {
        title: "Home",
        url: "/",
        icon: Home,
        scrollTo: null,
      },
      {
        title: "My Orders",
        url: "/orders",
        icon: ShoppingBag,
        scrollTo: null,
      },
    ],
  },
  {
    title: "Filter by Gender",
    items: [
      {
        title: "Men",
        url: "/filter/all?filter=men",
        icon: User,
        scrollTo: null,
      },
      {
        title: "Women",
        url: "/filter/all?filter=women",
        icon: User,
        scrollTo: null,
      },
      {
        title: "Unisex",
        url: "/filter/all?filter=unisex",
        icon: User,
        scrollTo: null,
      },
    ],
  },
  {
    title: "Categories",
    items: [
      {
        title: "All Products",
        url: "/",
        icon: Package,
        scrollTo: "catalogue",
        queryParams: null, // Explicitly clear filter
      },
      ...categories.map(cat => ({
        title: cat.title,
        url: cat.url,
        icon: cat.icon,
        scrollTo: null,
      })),
      {
        title: "New Arrivals",
        url: "/filter/new",
        icon: Star,
        scrollTo: null,
      },
      {
        title: "Hot Products",
        url: "/filter/hot",
        icon: Flame,
        scrollTo: null,
      },
      {
        title: "Top Products",
        url: "/filter/top",
        icon: TrendingUp,
        scrollTo: null,
      },
      {
        title: "Customised Products",
        url: "/filter/custom",
        icon: Sparkles,
        scrollTo: null,
      },
      {
        title: "Looklyn Special",
        url: "/category/special",
        icon: Crown,
        scrollTo: null,
      },
    ],
  },
];

export function NavigationSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useThemeMode();
  const { isAuthenticated, user, logout } = useAuth();
  const { isMobile, setOpenMobile, setOpen, open, openMobile, toggleSidebar } = useSidebar();

  const handleNavClick = (e, item) => {
    // Close sidebar when clicking on navigation items (especially on mobile)
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }

    // For items with scrollTo (like "All Products" on home page)
    if (item.scrollTo) {
      e.preventDefault();
      if (location.pathname !== "/") {
        navigate(item.url);
        setTimeout(() => {
          const element = document.getElementById(item.scrollTo);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } else {
        const element = document.getElementById(item.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else if (item.title === "Home") {
      e.preventDefault();
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      // For regular navigation items (categories, filter pages, etc.)
      // Let the Link component handle navigation
      // No need to preventDefault or navigate manually
    }
  };

  const isActive = (item) => {
    // For "All Products", it's active when on home page with no filter
    if (item.url === "/" && item.queryParams === null) {
      return location.pathname === "/" && (!location.search || location.search === '');
    }
    // For filter pages (new, hot, top, custom), check if pathname matches
    if (item.url.startsWith("/filter/")) {
      return location.pathname === item.url || location.pathname.startsWith(item.url + "/");
    }
    // For category pages
    if (item.url.startsWith("/category/")) {
      return location.pathname === item.url || location.pathname.startsWith(item.url + "/");
    }
    // For other pages
    return location.pathname === item.url || location.pathname.startsWith(item.url + "/");
  };

  const getBaseCategoryPath = () => {
    if (location.pathname?.startsWith("/category/")) return location.pathname;
    return "/category/hoodies";
  };

  const currentGenderFilter = (() => {
    const filter = new URLSearchParams(location.search).get("filter");
    if (filter === "men" || filter === "women" || filter === "unisex") return filter;
    return "";
  })();


  return (
    <Sidebar variant="inset" collapsible="offcanvas" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center justify-start flex-1" onClick={(e) => e.stopPropagation()}>
            <img
              src={theme === "light" ? looklynLogoLight : looklynLogoDark}
              alt="LOOKLYN"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground relative z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Close the sidebar
              if (isMobile) {
                setOpenMobile(false);
              } else {
                setOpen(false);
              }
            }}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navItems.map((group) => {
          // Check if this is the Filter by Gender group
          const isGenderFilter = group.title === "Filter by Gender";
          
          if (isGenderFilter) {
            return (
              <SidebarGroup key={group.title}>
                <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70">
                  {group.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  {/* Selectbox (no <li>) so no bullet/dot on the left */}
                  <div className="px-2">
                    <Select
                      value={currentGenderFilter}
                      onValueChange={(value) => {
                        // Navigate to all products page with gender filter
                        navigate(`/filter/all?filter=${value}`);
                        if (isMobile) setOpenMobile(false);
                        else setOpen(false);
                      }}
                    >
                      <SelectTrigger className="h-9 rounded-md border border-sidebar-border bg-sidebar text-sidebar-foreground focus:ring-sidebar-ring">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="men">Men</SelectItem>
                        <SelectItem value="women">Women</SelectItem>
                        <SelectItem value="unisex">Unisex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }

          // Regular groups (non-collapsible)
          return (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70">
                {group.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item);

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.title}
                          className={cn(
                            "w-full",
                            active && "bg-sidebar-accent text-sidebar-accent-foreground"
                          )}
                        >
                          <Link
                            to={item.url}
                            onClick={(e) => handleNavClick(e, item)}
                            className="relative"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
        
        {/* Contact Us Section - Last in sidebar */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70">
            Contact Us
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="WhatsApp"
                  className="w-full"
                >
                  <a
                    href="https://wa.me/917016925325"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex items-center gap-2"
                    onClick={() => {
                      if (isMobile) {
                        setOpenMobile(false);
                      } else {
                        setOpen(false);
                      }
                    }}
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.372a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Instagram"
                  className="w-full"
                >
                  <a
                    href="https://instagram.com/_looklyn_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex items-center gap-2"
                    onClick={() => {
                      if (isMobile) {
                        setOpenMobile(false);
                      } else {
                        setOpen(false);
                      }
                    }}
                  >
                    <Instagram className="h-4 w-4" />
                    <span>Instagram</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-sidebar-foreground/70">Theme</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
              )}
            </Button>
          </div>

        {/* Login / Logout button directly after Theme */}
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-xs"
          onClick={() => {
            if (isAuthenticated) {
              logout();
              navigate("/");
            } else {
              navigate("/auth");
            }
            if (isMobile) {
              setOpenMobile(false);
            } else {
              setOpen(false);
            }
          }}
        >
          {isAuthenticated ? (
            <>
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </>
          ) : (
            <>
              <LogIn className="h-3.5 w-3.5" />
              <span>Login / Sign up</span>
            </>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
