import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { allProducts } from "@/data/products";
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
  const initialFilter = searchParams.get('filter') || 'all';
  const [audienceFilter, setAudienceFilter] = useState(initialFilter);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const filter = searchParams.get("filter");
    if (filter && ["all", "men", "women", "kids"].includes(filter)) {
      setAudienceFilter(filter);
    }
  }, [searchParams]);

  const categoryMap = {
    hoodies: "Hoodie",
    "t-shirts": "T-Shirt",
    sweatshirts: "Sweatshirt",
  };

  const categoryName = categoryMap[category || ''] || 'Hoodie';
  const displayName = category?.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Hoodies';

  const filteredProducts = useMemo(() => {
    let products = allProducts.filter((p) => p.category === categoryName);
    if (audienceFilter !== "all") {
      products = products.filter((p) => p.audience === audienceFilter);
    }
    return products;
  }, [categoryName, audienceFilter]);

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
        original: product.original,
        image: product.gallery[0],
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.1),_transparent_65%)]">
      <div className="px-4 sm:px-6 pb-8 sm:pb-12 pt-6">
        <Header />
      </div>
      <div className="px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] transition-all duration-200 bg-transparent hover:bg-purple-200 hover:shadow-sm active:bg-purple-300" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-4xl font-black">{displayName}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-[32px] border border-white/10 bg-[var(--card)]/90 p-4 shadow-[var(--shadow-soft)]">
          <span className="font-display text-sm uppercase tracking-[0.4em] text-muted-foreground">Filter by:</span>
          {['all', 'men', 'women', 'kids'].map((filter) => (
            <Button
              key={filter}
              variant={audienceFilter === filter ? "default" : "outline"}
              className={`rounded-full font-display text-sm tracking-[0.2em] ${audienceFilter === filter ? "bg-foreground text-background" : ""}`}
              onClick={() => setAudienceFilter(filter)}
            >
              {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-[32px] border border-white/10 bg-[var(--card)]/90 p-12 text-center">
            <p className="text-muted-foreground">No products found in this category.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  category={product.category}
                  price={product.price}
                  originalPrice={product.original}
                  image={product.gallery[0]}
                  accent={product.accent}
                  onView={() => navigate(`/product/${product.id}`)}
                  onAdd={() => requireAuth(`/product/${product.id}`)}
                  onWishlist={() => handleAddToWishlist(product.id)}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 rounded-[32px] border border-white/10 bg-[var(--card)]/90 p-4 shadow-[var(--shadow-soft)]">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-semibold">
                  Page {currentPage} of {totalPages} ({filteredProducts.length} products)
                </span>
                <Button
                  variant="outline"
                  className="rounded-full"
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

