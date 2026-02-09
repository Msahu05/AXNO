import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { productsAPI, getImageUrl } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { toast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 16;

const filterConfig = {
  all: {
    title: "All Products",
    description: "Browse all our products",
  },
  new: {
    title: "New Arrivals",
    description: "Check out our latest products",
  },
  hot: {
    title: "Hot Products",
    description: "Our most popular items",
  },
  top: {
    title: "Top Products",
    description: "Best selling products",
  },
  custom: {
    title: "Customised Products",
    description: "Products that can be customized with your design",
  },
};

const FilteredProducts = () => {
  const { filterType } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();
  const [searchParams] = useSearchParams();
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const config = filterConfig[filterType] || filterConfig.new;
  const displayTitle = config.title;
  const displayDescription = config.description;

  // Load products from API with filter
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        // Reset filter to 'all' when filterType changes (new page) - don't cache
        setAudienceFilter('all');
        // For "all" filter type, don't pass any filter to get all products
        const params = filterType === 'all' ? {} : { filter: filterType };
        const response = await productsAPI.getAll(params);
        const products = response.products || [];
        console.log('Loaded products:', products.length, 'for filter:', filterType);
        setAllProducts(products);
      } catch (error) {
        console.error('Error loading products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products',
          variant: 'destructive',
        });
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (filterType && filterConfig[filterType]) {
      loadProducts();
    }
  }, [filterType]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Always reset to 'all' when page/route changes, don't cache filter state
    const filter = searchParams.get("filter");
    if (filter && ["men", "women", "unisex"].includes(filter)) {
      setAudienceFilter(filter);
    } else {
      setAudienceFilter('all');
      // Remove filter from URL if it's not valid
      if (searchParams.get("filter")) {
        navigate(`/filter/${filterType}`, { replace: true });
      }
    }
  }, [searchParams, filterType, navigate]);

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];
    
    // If filtering by audience, filter the products
    if (audienceFilter !== "all") {
      products = products.filter((p) => {
        const productAudience = (p.audience || p.audienceType || '').toLowerCase();
        return productAudience === audienceFilter.toLowerCase();
      });
    }
    
    return products;
  }, [allProducts, audienceFilter]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filter changes
  }, [audienceFilter, filterType]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handleAddToWishlist = (productId) => {
    const product = allProducts.find((p) => p.id === productId);
    if (product && !isInWishlist(productId)) {
      addToWishlist({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        original: product.original || product.originalPrice,
        image: getImageUrl(Array.isArray(product.gallery) ? product.gallery[0] : product.gallery),
      });
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      });
    } else if (isInWishlist(productId)) {
      toast({
        title: "Already in wishlist",
        description: "This item is already in your wishlist.",
      });
    }
  };

  if (!filterType || !filterConfig[filterType]) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-[#f8f7ff] to-white dark:from-[#0f0a1a] dark:via-[#1a1526] dark:to-[#0f0a1a]">
        <div className="px-4 sm:px-6 py-10">
          <div className="mx-auto max-w-7xl">
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Invalid filter type.</p>
              <Button onClick={() => navigate("/")} className="mt-4">
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#f8f7ff] to-white dark:from-[#0f0a1a] dark:via-[#1a1526] dark:to-[#0f0a1a]">
      <div className="px-4 sm:px-6 py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex items-center gap-4 flex-wrap">
            <button 
              className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 bg-white dark:bg-[#2a2538] border border-gray-200 dark:border-white/10 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white">{displayTitle}</h1>
              {displayDescription && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{displayDescription}</p>
              )}
            </div>
          </div>

          <div className="flex flex-nowrap items-center gap-2 sm:gap-4 rounded-[16px] border border-[rgba(47,37,64,0.08)] dark:border-white/10 bg-white dark:bg-[#2a2538] p-2 sm:p-4 shadow-[0_4px_16px_rgba(47,37,64,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)] overflow-x-auto w-full max-w-full">
            <span className="font-body text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap flex-shrink-0">Filter</span>
            {['all', 'unisex', 'men', 'women'].map((filter) => (
              <Button
                key={filter}
                variant={audienceFilter === filter ? "default" : "outline"}
                className={`rounded-full font-body text-xs font-small px-2 sm:px-4 py-1.5 sm:py-2 transition-all flex-shrink-0 flex-1 min-w-0 ${
                  audienceFilter === filter 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-background dark:bg-[#2a2538] text-foreground dark:text-gray-300 border-border dark:border-white/20 hover:border-primary dark:hover:border-purple-500"
                }`}
                onClick={() => {
                  setAudienceFilter(filter);
                  // Update URL with filter parameter
                  if (filter === 'all') {
                    navigate(`/filter/${filterType}`, { replace: true });
                  } else {
                    navigate(`/filter/${filterType}?filter=${filter}`, { replace: true });
                  }
                }}
              >
                {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>

          {loading ? (
            // Show skeleton placeholders (mobile: 2 cols, desktop: 4 cols)
            <div className="catalogue-product-grid w-full grid gap-3 sm:gap-4 md:gap-4 lg:gap-5 grid-cols-2 md:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-[16px] border border-[rgba(47,37,64,0.08)] dark:border-white/10 bg-white dark:bg-[#2a2538] p-12 text-center shadow-[0_4px_16px_rgba(47,37,64,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
              <p className="text-gray-600 dark:text-gray-400">No products found.</p>
            </div>
          ) : (
            <>
              <div className="catalogue-product-grid w-full grid gap-3 sm:gap-4 md:gap-4 lg:gap-8 xl:gap-10 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:max-w-[1400px] lg:mx-auto">
                {paginatedProducts.map((product) => {
                  const productUrl = product.slug ? `/product/${product.slug}` : `/product/${product.id}`;
                  return (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      slug={product.slug}
                      name={product.name}
                      category={product.category}
                      price={product.price}
                      originalPrice={product.original || product.originalPrice}
                      image={getImageUrl(Array.isArray(product.gallery) ? product.gallery[0] : product.gallery)}
                      gallery={Array.isArray(product.gallery) && product.gallery.length > 0 ? product.gallery.map((g) => getImageUrl(g?.url ?? g)) : undefined}
                      accent={product.accent}
                      onView={() => navigate(productUrl)}
                      onAdd={() => {}}
                      onWishlist={() => handleAddToWishlist(product.id)}
                    />
                  );
                })}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 rounded-[16px] border border-[rgba(47,37,64,0.08)] dark:border-white/10 bg-white dark:bg-[#2a2538] p-4 shadow-[0_4px_16px_rgba(47,37,64,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
                  <Button
                    variant="outline"
                    className="rounded-full border-gray-300 dark:border-white/20"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages} ({filteredProducts.length} products)
                  </span>
                  <Button
                    variant="outline"
                    className="rounded-full border-gray-300 dark:border-white/20"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilteredProducts;

