import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, PhoneCall, UploadCloud, HeartHandshake, Truck, ArrowRight, Leaf, Sparkles, Zap, Award, Shield, Star, Instagram, Mail, Facebook, Headphones, Shirt } from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { productsAPI, userAPI, getImageUrl, categoryImagesAPI } from "@/lib/api";

const productTypes = [
  { key: "T-Shirt", label: "T-Shirts", route: "t-shirts" },
  { key: "Hoodie", label: "Hoodies", route: "hoodies" },
  { key: "Sweatshirt", label: "Sweatshirts", route: "sweatshirts" },
];

const customizationSteps = [
  {
    icon: <UploadCloud className="h-6 w-6" />,
    title: "Upload art",
    description: "Drop your own chosen design",
  },
  {
    icon: <HeartHandshake className="h-6 w-6" />,
    title: "WhatsApp confirmation",
    description: "We hop on a WhatsApp call within 12 hours to finesse the details.",
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: "Quick delivery",
    description: "Fast and reliable shipping to your doorstep.",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const [allProducts, setAllProducts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isMediumScreen, setIsMediumScreen] = useState(false);
  const [categoryProducts, setCategoryProducts] = useState({
    men: null,
    women: null,
    unisex: null
  });
  const [filterCategoryProducts, setFilterCategoryProducts] = useState({
    hot: null,
    top: null,
    new: null,
    custom: null,
    special: null
  });
  const [categoryImages, setCategoryImages] = useState({
    men: '',
    women: '',
    unisex: '',
    new: '',
    top: '',
    special: ''
  });
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMediumScreen(width >= 768 && width < 1024); // md breakpoint (medium screens)
      setIsLargeScreen(width >= 1024); // lg breakpoint (large screens)
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all products without any filter
        const productsResponse = await productsAPI.getAll({});
        const allProds = productsResponse.products || [];
        setAllProducts(allProds);
        
        // Get distinct products for each category by filtering by audience
        const getProductByAudience = (audience) => {
          const filtered = allProds.filter((p) => {
            const productAudience = (p.audience || p.audienceType || '').toLowerCase();
            return productAudience === audience.toLowerCase();
          });
          // Get first product with a valid image
          return filtered.find(p => {
            const hasImage = p.image || 
              (Array.isArray(p.gallery) && p.gallery.length > 0) || 
              p.gallery;
            return hasImage;
          }) || filtered[0] || null;
        };
        
        // Get different products for each category
        const menProduct = getProductByAudience('men');
        const womenProduct = getProductByAudience('women');
        const unisexProduct = getProductByAudience('unisex');
        
        // If we don't have distinct products, use different categories
        let finalMen = menProduct;
        let finalWomen = womenProduct;
        let finalUnisex = unisexProduct;
        
        // Ensure all three are different
        if (!finalMen || !finalWomen || !finalUnisex || 
            (finalMen._id === finalWomen._id) || 
            (finalMen._id === finalUnisex._id) || 
            (finalWomen._id === finalUnisex._id)) {
          // Use different product categories as fallback
          const hoodieProducts = allProds.filter(p => p.category === 'Hoodie');
          const tshirtProducts = allProds.filter(p => p.category === 'T-Shirt');
          const sweatshirtProducts = allProds.filter(p => p.category === 'Sweatshirt');
          
          if (!finalMen && hoodieProducts.length > 0) finalMen = hoodieProducts[0];
          if (!finalWomen && tshirtProducts.length > 0) finalWomen = tshirtProducts[0];
          if (!finalUnisex && sweatshirtProducts.length > 0) finalUnisex = sweatshirtProducts[0];
          
          // Ensure uniqueness
          if (finalMen && finalWomen && finalMen._id === finalWomen._id && tshirtProducts.length > 0) {
            finalWomen = tshirtProducts[0];
          }
          if (finalMen && finalUnisex && finalMen._id === finalUnisex._id && sweatshirtProducts.length > 0) {
            finalUnisex = sweatshirtProducts[0];
          }
          if (finalWomen && finalUnisex && finalWomen._id === finalUnisex._id && sweatshirtProducts.length > 0) {
            finalUnisex = sweatshirtProducts[0];
          }
        }
        
        setCategoryProducts({
          men: finalMen,
          women: finalWomen,
          unisex: finalUnisex
        });

        // Fetch top products for each filter category
        const fetchFilterCategoryProducts = async () => {
          const filters = ['hot', 'top', 'new', 'custom', 'special'];
          const filterProducts = {};
          
          for (const filter of filters) {
            try {
              const response = await productsAPI.getAll({ filter, limit: 1 });
              const products = response.products || [];
              if (products.length > 0) {
                const product = products[0];
                // Get product image
                const hasImage = product.image || 
                  (Array.isArray(product.gallery) && product.gallery.length > 0) || 
                  product.gallery;
                if (hasImage) {
                  filterProducts[filter] = product;
                }
              }
            } catch (error) {
              console.error(`Error loading ${filter} products:`, error);
            }
          }
          
          setFilterCategoryProducts(filterProducts);
        };
        
        fetchFilterCategoryProducts();
      } catch (error) {
        console.error('Error loading products:', error);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      userAPI.getAddresses()
        .then((data) => setAddresses(data.addresses || []))
        .catch(() => setAddresses([]));
    } else {
      setAddresses([]);
    }
  }, [isAuthenticated, user]);

  // Load category background images
  useEffect(() => {
    const loadCategoryImages = async () => {
      try {
        try {
          const response = await categoryImagesAPI.getCategoryImages();
          if (response && response.categoryImages) {
            setCategoryImages(response.categoryImages);
            // Also save to localStorage as backup
            localStorage.setItem('categoryImages', JSON.stringify(response.categoryImages));
            return;
          }
        } catch (apiError) {
          console.warn('Backend API not available, loading from localStorage:', apiError);
        }
        
        // Fallback to localStorage if API fails
        const stored = localStorage.getItem('categoryImages');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setCategoryImages(parsed);
            return;
          } catch (e) {
            console.error('Error parsing stored category images:', e);
          }
        }
      } catch (error) {
        console.error('Error loading category images:', error);
        // If API fails, use empty images (will fall back to product images)
      }
    };
    loadCategoryImages();
  }, []);

  const handleProtectedAction = (destination) => {
    if (isAuthenticated) {
      navigate(destination);
    } else {
      navigate(`/auth?redirect=${encodeURIComponent(destination)}`);
    }
  };

  const handleWishlistNav = () => {
    handleProtectedAction("/wishlist");
  };

  const wishlistPicks = wishlistItems.slice(0, 4);

  const categories = [
    {
      name: 'Men',
      filter: 'men',
      product: categoryProducts.men,
      route: '/category/hoodies?filter=men'
    },
    {
      name: 'Women',
      filter: 'women',
      product: categoryProducts.women,
      route: '/category/hoodies?filter=women'
    },
    {
      name: 'Unisex',
      filter: 'unisex',
      product: categoryProducts.unisex,
      route: '/category/hoodies?filter=unisex'
    }
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <br/>
      
      <HeroSection className="sm:mt-20"></HeroSection>
      
      {/* Combined Category and Product Boxes */}
      <section className="w-full py-6 sm:py-10 md:py-12 lg:py-8 xl:py-10 relative flex justify-center">
        <div className="w-full px-2 sm:px-3 md:px-4 lg:px-8 xl:px-12">
          <div className="max-w-6xl mx-auto">
            {/* Mobile/Tablet Layout: Original 2-column grid */}
            <div className="block lg:hidden">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              {/* Left Column: Men and Women (stacked vertically) */}
              <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
                {/* Men Box */}
                {(() => {
                  const menCategory = categories.find(c => c.name === 'Men');
                  const menImageUrl = categoryImages.men 
                    ? (categoryImages.men.startsWith('data:') ? categoryImages.men : getImageUrl(categoryImages.men))
                    : (menCategory?.product 
                        ? getImageUrl(Array.isArray(menCategory.product.gallery) 
                            ? menCategory.product.gallery[0]?.url || menCategory.product.gallery[0] 
                            : menCategory.product.gallery || menCategory.product.image)
                        : "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80");
                  
                  return (
                    <div
                      className="relative group cursor-pointer rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden bg-card shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 border-gray-200 dark:border-gray-700"
                      onClick={() => navigate(menCategory?.route || '/category/hoodies?filter=men')}
                      style={{
                        height: '120px',
                        minHeight: '120px',
                        backgroundImage: `url(${menImageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-wide drop-shadow-lg">
                          {menCategory?.name || 'Men'}
                        </h3>
                      </div>
                    </div>
                  );
                })()}

                {/* Women Box */}
                {(() => {
                  const womenCategory = categories.find(c => c.name === 'Women');
                  const womenImageUrl = categoryImages.women 
                    ? (categoryImages.women.startsWith('data:') ? categoryImages.women : getImageUrl(categoryImages.women))
                    : (womenCategory?.product 
                        ? getImageUrl(Array.isArray(womenCategory.product.gallery) 
                            ? womenCategory.product.gallery[0]?.url || womenCategory.product.gallery[0] 
                            : womenCategory.product.gallery || womenCategory.product.image)
                        : "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80");
                  
                  return (
                    <div
                      className="relative group cursor-pointer rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden bg-card shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 border-gray-200 dark:border-gray-700"
                      onClick={() => navigate(womenCategory?.route || '/category/hoodies?filter=women')}
                      style={{
                        height: '120px',
                        minHeight: '120px',
                        backgroundImage: `url(${womenImageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-wide drop-shadow-lg">
                          {womenCategory?.name || 'Women'}
                        </h3>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Right Column: Unisex (vertical, full height) */}
              {(() => {
                const unisexCategory = categories.find(c => c.name === 'Unisex');
                const unisexImageUrl = categoryImages.unisex 
                  ? (categoryImages.unisex.startsWith('data:') ? categoryImages.unisex : getImageUrl(categoryImages.unisex))
                  : (unisexCategory?.product 
                      ? getImageUrl(Array.isArray(unisexCategory.product.gallery) 
                          ? unisexCategory.product.gallery[0]?.url || unisexCategory.product.gallery[0] 
                          : unisexCategory.product.gallery || unisexCategory.product.image)
                      : "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80");
                
                return (
                  <div
                    className="relative group cursor-pointer rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden bg-card shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 border-gray-200 dark:border-gray-700"
                    onClick={() => navigate(unisexCategory?.route || '/category/hoodies?filter=unisex')}
                    style={{
                      height: '100%',
                      minHeight: '250px',
                      backgroundImage: `url(${unisexImageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-wide drop-shadow-lg" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                        {unisexCategory?.name || 'Unisex'}
                      </h3>
                    </div>
                  </div>
              );
            })()}
              </div>
            </div>

            {/* Large Screen Layout: 3 columns - Left (Men/Women), Middle (Unisex), Right (2x2 grid) */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-3 gap-4 xl:gap-5">
              {/* Left Column: Men and Women (stacked vertically) */}
              <div className="flex flex-col gap-3 xl:gap-4">
                {/* Men Box */}
                {(() => {
                  const menCategory = categories.find(c => c.name === 'Men');
                  const menImageUrl = categoryImages.men 
                    ? (categoryImages.men.startsWith('data:') ? categoryImages.men : getImageUrl(categoryImages.men))
                    : (menCategory?.product 
                        ? getImageUrl(Array.isArray(menCategory.product.gallery) 
                            ? menCategory.product.gallery[0]?.url || menCategory.product.gallery[0] 
                            : menCategory.product.gallery || menCategory.product.image)
                        : "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80");
                  
                  return (
                    <div
                      className="relative group cursor-pointer rounded-2xl overflow-hidden bg-card shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 border-gray-200 dark:border-gray-700"
                      onClick={() => navigate(menCategory?.route || '/category/hoodies?filter=men')}
                      style={{
                        height: '120px',
                        minHeight: '120px',
                        backgroundImage: `url(${menImageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <h3 className="text-2xl xl:text-3xl font-black text-white uppercase tracking-wide drop-shadow-lg">
                          {menCategory?.name || 'Men'}
                        </h3>
                      </div>
                    </div>
                  );
                })()}

                {/* Women Box */}
                {(() => {
                  const womenCategory = categories.find(c => c.name === 'Women');
                  const womenImageUrl = categoryImages.women 
                    ? (categoryImages.women.startsWith('data:') ? categoryImages.women : getImageUrl(categoryImages.women))
                    : (womenCategory?.product 
                        ? getImageUrl(Array.isArray(womenCategory.product.gallery) 
                            ? womenCategory.product.gallery[0]?.url || womenCategory.product.gallery[0] 
                            : womenCategory.product.gallery || womenCategory.product.image)
                        : "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80");
                  
                  return (
                    <div
                      className="relative group cursor-pointer rounded-2xl overflow-hidden bg-card shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 border-gray-200 dark:border-gray-700"
                      onClick={() => navigate(womenCategory?.route || '/category/hoodies?filter=women')}
                      style={{
                        height: '120px',
                        minHeight: '120px',
                        backgroundImage: `url(${womenImageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <h3 className="text-2xl xl:text-3xl font-black text-white uppercase tracking-wide drop-shadow-lg">
                          {womenCategory?.name || 'Women'}
                        </h3>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Middle Column: Unisex (tall, full height) */}
              {(() => {
                const unisexCategory = categories.find(c => c.name === 'Unisex');
                const unisexImageUrl = categoryImages.unisex 
                  ? (categoryImages.unisex.startsWith('data:') ? categoryImages.unisex : getImageUrl(categoryImages.unisex))
                  : (unisexCategory?.product 
                      ? getImageUrl(Array.isArray(unisexCategory.product.gallery) 
                          ? unisexCategory.product.gallery[0]?.url || unisexCategory.product.gallery[0] 
                          : unisexCategory.product.gallery || unisexCategory.product.image)
                      : "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80");
                
                return (
                  <div
                    className="relative group cursor-pointer rounded-2xl overflow-hidden bg-card shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 border-gray-200 dark:border-gray-700"
                    onClick={() => navigate(unisexCategory?.route || '/category/hoodies?filter=unisex')}
                    style={{
                      height: '100%',
                      minHeight: '260px',
                      backgroundImage: `url(${unisexImageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <h3 className="text-2xl xl:text-3xl font-black text-white uppercase tracking-wide drop-shadow-lg" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                        {unisexCategory?.name || 'Unisex'}
                      </h3>
                    </div>
                  </div>
                );
              })()}

              {/* Right Column: Product Categories 2x2 Grid */}
              <div className="grid grid-cols-2 gap-3 xl:gap-4">
                {/* New Products */}
                {(() => {
                  const newProduct = filterCategoryProducts.new;
                  const newImageUrl = categoryImages.new 
                    ? (categoryImages.new.startsWith('data:') ? categoryImages.new : getImageUrl(categoryImages.new))
                    : (newProduct 
                        ? getImageUrl(Array.isArray(newProduct.gallery) 
                            ? newProduct.gallery[0]?.url || newProduct.gallery[0] 
                            : newProduct.gallery || newProduct.image)
                        : null);
                  
                  return (
                    <div
                      onClick={() => navigate('/filter/new')}
                      className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] flex items-center justify-center border-2 border-gray-200 dark:border-gray-700"
                      style={{
                        height: '120px',
                        minHeight: '120px',
                        backgroundColor: newImageUrl ? 'transparent' : '#d1d5db',
                        backgroundImage: newImageUrl ? `url(${newImageUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      {newImageUrl && (
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                      )}
                      <div className="text-center p-4 sm:p-6 z-10 relative">
                        <h3 className="text-xl xl:text-2xl font-black text-white group-hover:text-black uppercase tracking-wide drop-shadow-lg">
                          New Products
                        </h3>
                      </div>
                    </div>
                  );
                })()}

                {/* Top Products */}
                {(() => {
                  const topProduct = filterCategoryProducts.top;
                  const topImageUrl = categoryImages.top 
                    ? (categoryImages.top.startsWith('data:') ? categoryImages.top : getImageUrl(categoryImages.top))
                    : (topProduct 
                        ? getImageUrl(Array.isArray(topProduct.gallery) 
                            ? topProduct.gallery[0]?.url || topProduct.gallery[0] 
                            : topProduct.gallery || topProduct.image)
                        : null);
                  
                  return (
                    <div
                      onClick={() => navigate('/filter/top')}
                      className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] flex items-center justify-center border-2 border-gray-200 dark:border-gray-700"
                      style={{
                        height: '120px',
                        minHeight: '120px',
                        backgroundColor: topImageUrl ? 'transparent' : '#d1d5db',
                        backgroundImage: topImageUrl ? `url(${topImageUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      {topImageUrl && (
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                      )}
                      <div className="text-center p-4 sm:p-6 z-10 relative">
                        <h3 className="text-xl xl:text-2xl font-black text-white group-hover:text-black uppercase tracking-wide drop-shadow-lg">
                          Top Products
                        </h3>
                      </div>
                    </div>
                  );
                })()}

                {/* Customised Products */}
                {(() => {
                  const customProduct = filterCategoryProducts.custom;
                  const customImageUrl = customProduct 
                    ? getImageUrl(Array.isArray(customProduct.gallery) 
                        ? customProduct.gallery[0]?.url || customProduct.gallery[0] 
                        : customProduct.gallery || customProduct.image)
                    : null;
                  
                  return (
                    <div
                      onClick={() => navigate('/filter/custom')}
                      className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] flex items-center justify-center border-2 border-gray-200 dark:border-gray-700"
                      style={{
                        height: '120px',
                        minHeight: '120px',
                        backgroundColor: customImageUrl ? 'transparent' : '#d1d5db',
                        backgroundImage: customImageUrl ? `url(${customImageUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      {customImageUrl && (
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                      )}
                      <div className="text-center p-4 sm:p-6 z-10 relative">
                        <h3 className="text-xl xl:text-2xl font-black text-white uppercase tracking-wide drop-shadow-lg">
                          Customised Products
                        </h3>
                      </div>
                    </div>
                  );
                })()}

                {/* Looklyn Special */}
                {(() => {
                  const specialProduct = filterCategoryProducts.special;
                  const specialImageUrl = categoryImages.special 
                    ? (categoryImages.special.startsWith('data:') ? categoryImages.special : getImageUrl(categoryImages.special))
                    : (specialProduct 
                        ? getImageUrl(Array.isArray(specialProduct.gallery) 
                            ? specialProduct.gallery[0]?.url || specialProduct.gallery[0] 
                            : specialProduct.gallery || specialProduct.image)
                        : null);
                  
                  return (
                    <div
                      onClick={() => navigate('/category/special')}
                      className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] flex items-center justify-center border-2 border-gray-200 dark:border-gray-700"
                      style={{
                        height: '120px',
                        minHeight: '120px',
                        backgroundColor: specialImageUrl ? 'transparent' : '#d1d5db',
                        backgroundImage: specialImageUrl ? `url(${specialImageUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      {specialImageUrl && (
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                      )}
                      <div className="text-center p-4 sm:p-6 z-10 relative">
                        <h3 className="text-xl xl:text-2xl font-black text-white uppercase tracking-wide drop-shadow-lg">
                          Looklyn Special
                        </h3>
                      </div>
                    </div>
                  );
                })()}
              </div>
              </div>
            </div>

            {/* Product Category Grid - Below on mobile/tablet */}
            <div className="w-full grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:hidden mt-3 sm:mt-4 md:mt-6">
              {/* New Products */}
              {(() => {
                const newProduct = filterCategoryProducts.new;
                const newImageUrl = categoryImages.new 
                  ? (categoryImages.new.startsWith('data:') ? categoryImages.new : getImageUrl(categoryImages.new))
                  : (newProduct 
                      ? getImageUrl(Array.isArray(newProduct.gallery) 
                          ? newProduct.gallery[0]?.url || newProduct.gallery[0] 
                          : newProduct.gallery || newProduct.image)
                      : null);
                
                return (
                  <div
                    onClick={() => navigate('/filter/new')}
                    className="group relative rounded-2xl sm:rounded-3xl md:rounded-[2rem] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700"
                    style={{
                      height: '140px',
                      minHeight: '140px',
                      backgroundColor: newImageUrl ? 'transparent' : '#d1d5db',
                      backgroundImage: newImageUrl ? `url(${newImageUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {newImageUrl && (
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                    )}
                    <div className="text-center p-4 sm:p-6 z-10 relative">
                      <h3 className="text-base sm:text-lg md:text-xl font-black text-white group-hover:text-black uppercase tracking-wide drop-shadow-lg">
                        New Products
                      </h3>
                    </div>
                  </div>
                );
              })()}

              {/* Top Products */}
              {(() => {
                const topProduct = filterCategoryProducts.top;
                const topImageUrl = categoryImages.top 
                  ? (categoryImages.top.startsWith('data:') ? categoryImages.top : getImageUrl(categoryImages.top))
                  : (topProduct 
                      ? getImageUrl(Array.isArray(topProduct.gallery) 
                          ? topProduct.gallery[0]?.url || topProduct.gallery[0] 
                          : topProduct.gallery || topProduct.image)
                      : null);
                
                return (
                  <div
                    onClick={() => navigate('/filter/top')}
                    className="group relative rounded-2xl sm:rounded-3xl md:rounded-[2rem] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700"
                    style={{
                      height: '140px',
                      minHeight: '140px',
                      backgroundColor: topImageUrl ? 'transparent' : '#d1d5db',
                      backgroundImage: topImageUrl ? `url(${topImageUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {topImageUrl && (
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                    )}
                    <div className="text-center p-4 sm:p-6 z-10 relative">
                      <h3 className="text-base sm:text-lg md:text-xl font-black text-white group-hover:text-black uppercase tracking-wide drop-shadow-lg">
                        Top Products
                      </h3>
                    </div>
                  </div>
                );
              })()}

              {/* Customised Products */}
              {(() => {
                const customProduct = filterCategoryProducts.custom;
                const customImageUrl = customProduct 
                  ? getImageUrl(Array.isArray(customProduct.gallery) 
                      ? customProduct.gallery[0]?.url || customProduct.gallery[0] 
                      : customProduct.gallery || customProduct.image)
                  : null;
                
                return (
                  <div
                    onClick={() => navigate('/filter/custom')}
                    className="group relative rounded-2xl sm:rounded-3xl md:rounded-[2rem] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700"
                    style={{
                      height: '140px',
                      minHeight: '140px',
                      backgroundColor: customImageUrl ? 'transparent' : '#d1d5db',
                      backgroundImage: customImageUrl ? `url(${customImageUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {customImageUrl && (
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                    )}
                    <div className="text-center p-4 sm:p-6 z-10 relative">
                      <h3 className="text-base sm:text-lg md:text-xl font-black text-white group-hover:text-black uppercase tracking-wide drop-shadow-lg">
                        Customised Products
                      </h3>
                    </div>
                  </div>
                );
              })()}

              {/* Looklyn Special */}
              {(() => {
                const specialProduct = filterCategoryProducts.special;
                const specialImageUrl = categoryImages.special 
                  ? (categoryImages.special.startsWith('data:') ? categoryImages.special : getImageUrl(categoryImages.special))
                  : (specialProduct 
                      ? getImageUrl(Array.isArray(specialProduct.gallery) 
                          ? specialProduct.gallery[0]?.url || specialProduct.gallery[0] 
                          : specialProduct.gallery || specialProduct.image)
                      : null);
                
                return (
                  <div
                    onClick={() => navigate('/category/special')}
                    className="group relative rounded-2xl sm:rounded-3xl md:rounded-[2rem] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700"
                    style={{
                      height: '140px',
                      minHeight: '140px',
                      backgroundColor: specialImageUrl ? 'transparent' : '#d1d5db',
                      backgroundImage: specialImageUrl ? `url(${specialImageUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {specialImageUrl && (
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                    )}
                    <div className="text-center p-4 sm:p-6 z-10 relative">
                      <h3 className="text-base sm:text-lg md:text-xl font-black text-white uppercase tracking-wide drop-shadow-lg">
                        The Looklyn Special
                      </h3>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>
      
      <main className="w-full px-2 sm:px-3 md:px-4 lg:px-8 xl:px-12 pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16 lg:pb-20 space-y-4 sm:space-y-16 lg:space-y-8">
        
        <div className="border-t border-border/50 my-4 sm:my-6"></div>

        <section id="catalogue" className="space-y-6 sm:space-y-8 lg:space-y-12">
          <div className="space-y-8 sm:space-y-8 lg:space-y-16 max-w-[1400px] lg:mx-auto">
            {productTypes.map((type) => {
              const typeProducts = allProducts.filter((p) => p.category === type.key);
              
              return (
                <div key={type.key} id={`${type.key.toLowerCase()}-section`} className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-lg sm:text-xl lg:text-2xl font-bold uppercase tracking-[0.05em] sm:tracking-[0.08em] text-foreground">{type.label}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                      <Button
                        variant="outline"
                        className="font-display rounded-md border-primary text-primary bg-[#9ca3af] hover:bg-primary/10 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm tracking-normal"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          navigate(`/category/${type.route}?filter=unisex`);
                        }}
                      >
                        Unisex
                      </Button>
                      <Button
                        variant="outline"
                        className="font-display rounded-md border-primary text-primary bg-[#9ca3af] hover:bg-primary/10 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm tracking-normal"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          navigate(`/category/${type.route}?filter=men`);
                        }}
                      >
                        Men
                      </Button>
                      <Button
                        variant="outline"
                        className="font-display rounded-md border-primary text-primary bg-[#9ca3af] hover:bg-primary/10 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm tracking-normal"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          navigate(`/category/${type.route}?filter=women`);
                        }}
                      >
                        Women
                      </Button>
                    </div>
                  </div>
                  {loading ? (
                    // Mobile: 2 cols, 4 products. Medium (md): 3 cols, 9 products. Large (lg+): 4 cols, 12 products
                    <div className="catalogue-product-grid w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-4 lg:gap-8 xl:gap-10 lg:max-w-[1400px] lg:mx-auto" style={{ maxWidth: '100%' }}>
                      {Array.from({ length: isLargeScreen ? 12 : isMediumScreen ? 9 : 4 }, (_, i) => i).map((i) => (
                        <ProductCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : (
                    <div className="catalogue-product-grid w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-4 lg:gap-8 xl:gap-10 lg:max-w-[1400px] lg:mx-auto" style={{ maxWidth: '100%' }}>
                      {typeProducts.slice(0, isLargeScreen ? 12 : isMediumScreen ? 9 : 4).map((product) => (
                        <ProductCard
                          key={product._id || product.id}
                          id={product._id || product.id}
                          slug={product.slug}
                          name={product.name}
                          category={product.category}
                          price={product.price}
                          originalPrice={product.originalPrice}
                          image={getImageUrl(Array.isArray(product.gallery) ? product.gallery[0]?.url || product.gallery[0] : product.gallery || product.image)}
                          gallery={Array.isArray(product.gallery) && product.gallery.length > 0 ? product.gallery.map((g) => getImageUrl(g?.url ?? g)) : undefined}
                          accent={product.accent}
                          onView={() => {
                            const url = product.slug ? `/product/${product.slug}` : `/product/${product._id || product.id}`;
                            navigate(url);
                          }}
                          onAdd={() => {
                            const url = product.slug ? `/product/${product.slug}` : `/product/${product._id || product.id}`;
                            handleProtectedAction(url);
                          }}
                          onWishlist={() => handleWishlistNav()}
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      className="font-display rounded-full bg-black text-white hover:bg-black/90 border border-black px-8 py-3 tracking-[0.12em]"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        navigate(`/category/${type.route}`);
                      }}
                    >
                      View All {type.label}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>


        <section id="custom" className="space-y-4 sm:space-y-6 rounded-[28px] sm:rounded-[40px] lg:rounded-[56px] border border-border dark:border-white/15 bg-[#9ca3af] p-4 sm:p-5 lg:p-10 shadow-[var(--shadow-soft)]">
          <div className="space-y-5">
            <div>
              <h4 className="text-2xl font-black mb-6 text-center">Why Choose Us</h4>
              {/* <h3 className="text-3xl font-black mb-8">Built for quality</h3> */}
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="flex flex-col items-center text-center gap-4 rounded-[28px] border border-border dark:border-white/20 bg-[#9ca3af] p-4 sm:p-6 transition-all">
                <div className="rounded-2xl bg-secondary p-4 text-secondary-foreground">
                  <Leaf className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-lg mb-1 text-foreground">Eco-Friendly Materials</h4>
                  {/* <p className="text-sm text-muted-foreground">Eco pigment + puff + reflective inks for sustainable fashion.</p> */}
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center gap-4 rounded-[28px] border border-border dark:border-white/20 bg-[#9ca3af] p-4 sm:p-6 transition-all">
                <div className="rounded-2xl bg-secondary p-4 text-secondary-foreground">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-lg mb-1 text-foreground">Lightning Fast</h4>
                  {/* <p className="text-sm text-muted-foreground">Saved addresses & reorder within 30 seconds.</p> */}
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center gap-4 rounded-[28px] border border-border dark:border-white/20 bg-[#9ca3af] p-4 sm:p-6 transition-all">
                <div className="rounded-2xl bg-secondary p-4 text-secondary-foreground">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-lg mb-1 text-foreground">High Quality DTF Stickers</h4>
                  {/* <p className="text-sm text-muted-foreground">Wishlist syncs everywhere after login.</p> */}
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center gap-4 rounded-[28px] border border-border dark:border-white/20 bg-[#9ca3af] p-4 sm:p-6 transition-all">
                <div className="rounded-2xl bg-secondary p-4 text-secondary-foreground">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-lg mb-1 text-foreground">Premium Quality</h4>
                  {/* <p className="text-sm text-muted-foreground">Color-calibrated proofs and stitch maps before production.</p> */}
                </div>
              </div>
            </div>
          </div>
        </section>


        <section id="support" className="rounded-[40px] border border-border dark:border-white/15 bg-[#9ca3af] p-8 shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              {/* <p className="text-xs uppercase tracking-[0.7em] text-muted-foreground">Support</p> */}
              <h3 className="text-3xl font-black">Talk to the creators</h3>
              <p className="mt-2 text-muted-foreground">
                Get instant support via WhatsApp or call us directly for personalized assistance.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://wa.me/917016925325"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-all duration-300 cursor-pointer"
                aria-label="WhatsApp"
                style={{ color: '#25D366' }}
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.372a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
              <a
                href="tel:+917016925325"
                className="hover:scale-110 transition-transform duration-300 cursor-pointer"
                aria-label="Call"
                style={{ color: '#000000' }}
              >
                <PhoneCall className="h-6 w-6" />
              </a>
              <a
                href="https://www.instagram.com/_looklyn_"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-all duration-300 cursor-pointer"
                aria-label="Instagram"
                style={{ color: '#FF69B4' }}
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://www.facebook.com/looklyn"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-all duration-300 cursor-pointer"
                aria-label="Facebook"
                style={{ color: '#1877F2' }}
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=looklynnn@gmail.com&su=Support%20Request"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-all duration-300 cursor-pointer"
                aria-label="Email"
                style={{ color: '#EA4335' }}
              >
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
};

export default Home;
