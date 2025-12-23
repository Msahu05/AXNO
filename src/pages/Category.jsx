import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { productsAPI, getImageUrl } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { toast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 12;

const Category = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();
  const [searchParams] = useSearchParams();
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryMap = {
    hoodies: "Hoodie",
    "t-shirts": "T-Shirt",
    sweatshirts: "Sweatshirt",
  };

  const reverseCategoryMap = {
    "Hoodie": "hoodies",
    "T-Shirt": "t-shirts",
    "Sweatshirt": "sweatshirts",
  };

  const categories = [
    { value: "hoodies", label: "Hoodies" },
    { value: "t-shirts", label: "T-Shirts" },
    { value: "sweatshirts", label: "Sweatshirts" },
  ];

  const categoryName = categoryMap[category || ''] || 'Hoodie';
  const displayName = category?.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Hoodies';

  const handleCategoryChange = (newCategory) => {
    // Preserve the current filter if any
    const currentFilter = searchParams.get("filter");
    const filterParam = currentFilter ? `?filter=${currentFilter}` : '';
    navigate(`/category/${newCategory}${filterParam}`);
  };

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll({ category: categoryName });
        const products = response.products || [];
        console.log('Loaded products:', products.length, 'for category:', categoryName);
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
    loadProducts();
  }, [categoryName]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const filter = searchParams.get("filter");
    if (filter && ["men", "women", "kids"].includes(filter)) {
      setAudienceFilter(filter);
    } else {
      setAudienceFilter('all');
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    // API already filters by category, so allProducts contains only this category's products
    let products = [...allProducts];
    
    // If filtering by audience, filter the category products
    if (audienceFilter !== "all") {
      products = products.filter((p) => {
        const productAudience = p.audience || p.audienceType;
        return productAudience === audienceFilter;
      });
    }
    
    // If "all" is selected, return all products for this category (no filtering needed)
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
  }, [audienceFilter, categoryName]);

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

  const handleAddToWishlist = (productId) => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent(`/category/${category}`)}`);
      return;
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#f8f7ff] to-white dark:from-[#0f0a1a] dark:via-[#1a1526] dark:to-[#0f0a1a]">
      <div className="px-4 sm:px-6 pb-8 sm:pb-12 pt-6">
        <Header />
      </div>
      <div className="px-4 sm:px-6 py-10">
        <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center gap-4 flex-wrap">
          <button 
            className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 bg-white dark:bg-[#2a2538] border border-gray-200 dark:border-white/10 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white">{displayName}</h1>
          <div className="ml-auto">
            <Select value={category || 'hoodies'} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-[#2a2538] border border-gray-200 dark:border-white/10">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-[16px] border border-[rgba(47,37,64,0.08)] dark:border-white/10 bg-white dark:bg-[#2a2538] p-4 sm:p-6 shadow-[0_4px_16px_rgba(47,37,64,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
          <span className="font-body text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Filter by:</span>
          {['all', 'men', 'women', 'kids', 'unisex'].map((filter) => (
            <Button
              key={filter}
              variant={audienceFilter === filter ? "default" : "outline"}
              className={`rounded-full font-body text-sm font-medium px-6 py-2 transition-all ${
                audienceFilter === filter 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-background dark:bg-[#2a2538] text-foreground dark:text-gray-300 border-border dark:border-white/20 hover:border-primary dark:hover:border-purple-500"
              }`}
              onClick={() => setAudienceFilter(filter)}
            >
              {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>

        {loading ? (
          // Show skeleton placeholders
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-[16px] border border-[rgba(47,37,64,0.08)] dark:border-white/10 bg-white dark:bg-[#2a2538] p-12 text-center shadow-[0_4px_16px_rgba(47,37,64,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
            <p className="text-gray-600 dark:text-gray-400">No products found in this category.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  category={product.category}
                  price={product.price}
                  originalPrice={product.original}
                  image={getImageUrl(Array.isArray(product.gallery) ? product.gallery[0] : product.gallery)}
                  accent={product.accent}
                  onView={() => navigate(`/product/${product.id}`)}
                  onAdd={() => requireAuth(`/product/${product.id}`)}
                  onWishlist={() => handleAddToWishlist(product.id)}
                />
              ))}
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

export default Category;

