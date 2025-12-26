import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { productsAPI, getImageUrl, sizeChartsAPI, reviewsAPI } from "@/lib/api";
import { Heart, Minus, Plus, ShoppingBag, Star, Truck, Zap, Upload, X, Image as ImageIcon, ArrowLeft, ArrowRight, Ruler } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { useToast } from "@/hooks/use-toast";
import { cn, getProductUrl } from "@/lib/utils";

const Product = () => {
  const { slug } = useParams();
  const id = slug; // Keep id for backward compatibility in code
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addItem } = useCart();
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [checkingPincode, setCheckingPincode] = useState(false);
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
    userName: ""
  });
  const [reviewFiles, setReviewFiles] = useState([]);
  const [reviewFilePreviews, setReviewFilePreviews] = useState([]);
  const [selectedImageModal, setSelectedImageModal] = useState({ open: false, url: null });
  
  // Size chart state
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [sizeChartData, setSizeChartData] = useState(null);
  const [loadingSizeChart, setLoadingSizeChart] = useState(false);
  
  // Touch/swipe state for image navigation
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSliding, setIsSliding] = useState(false);
  const [slideDirection, setSlideDirection] = useState(null);
  const [prevImageIndex, setPrevImageIndex] = useState(0);
  
  // Fetch location from pincode using API
  const fetchLocationFromPincode = async (pin) => {
    try {
      // Using postpincode.in API
      const response = await fetch(`https://www.postpincode.in/api/getCityName.php?pincode=${pin}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const locationData = data[0];
        const city = locationData.City?.toLowerCase() || '';
        const district = locationData.District?.toLowerCase() || '';
        
        // Check if city or district matches Ahmedabad or Gandhinagar
        if (city.includes('ahmedabad') || district.includes('ahmedabad')) {
          return 'Ahmedabad';
        }
        if (city.includes('gandhinagar') || district.includes('gandhinagar')) {
          return 'Gandhinagar';
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching pincode data:', error);
      // Fallback: Try alternative API
      try {
        const altResponse = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const altData = await altResponse.json();
        
        if (altData && altData[0] && altData[0].PostOffice) {
          const postOffice = altData[0].PostOffice[0];
          const district = postOffice.District?.toLowerCase() || '';
          const state = postOffice.State?.toLowerCase() || '';
          
          if (district.includes('ahmedabad') || (state.includes('gujarat') && district.includes('ahmedabad'))) {
            return 'Ahmedabad';
          }
          if (district.includes('gandhinagar') || (state.includes('gujarat') && district.includes('gandhinagar'))) {
            return 'Gandhinagar';
          }
        }
      } catch (altError) {
        console.error('Error fetching from alternative API:', altError);
      }
      return null;
    }
  };
  
  // Handle pincode submission
  const handlePincodeSubmit = async (e) => {
    e.preventDefault();
    if (pincode.length !== 6) {
      toast({
        title: "Invalid Pincode",
        description: "Please enter a valid 6-digit pincode",
        variant: "destructive",
      });
      return;
    }
    
    setCheckingPincode(true);
    setPincodeChecked(false);
    setDetectedLocation(null);
    
    try {
      const location = await fetchLocationFromPincode(pincode);
      setDetectedLocation(location);
      setPincodeChecked(true);
      
      if (location) {
        toast({
          title: "Delivery Available",
          description: `Free shipping available for ${location}`,
        });
      } else {
        toast({
          title: "Delivery Not Available",
          description: "Currently only delivering to Ahmedabad and Gandhinagar",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to verify pincode. Please try again.",
        variant: "destructive",
      });
      setPincodeChecked(true);
    } finally {
      setCheckingPincode(false);
    }
  };

  // Load reviews function (defined outside useEffect to be accessible)
  const loadReviews = async (productId) => {
    if (!productId) return;
    setLoadingReviews(true);
    try {
      const data = await reviewsAPI.getReviews(productId);
      // Format reviews for display
      const formattedReviews = (data.reviews || []).map(review => ({
        id: review._id || review.id,
        userName: review.userName || 'Anonymous',
        rating: review.rating,
        comment: review.comment,
        date: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently',
        verified: false, // Can be set based on order verification
        createdAt: review.createdAt,
        attachments: review.attachments || []
      }));
      // Sort by date (newest first)
      formattedReviews.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
      setReviews(formattedReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Listen for review submission events and refresh reviews
  useEffect(() => {
    if (!product) return;
    
    const productId = product.id || product._id;
    if (!productId) return;
    
    const handleReviewSubmitted = (event) => {
      if (event.detail.productId === productId) {
        loadReviews(productId);
      }
    };
    
    window.addEventListener('reviewSubmitted', handleReviewSubmitted);
    
    // Poll for new reviews every 10 seconds
    const interval = setInterval(() => {
      loadReviews(productId);
    }, 10000);
    
    return () => {
      window.removeEventListener('reviewSubmitted', handleReviewSubmitted);
      clearInterval(interval);
    };
  }, [product?.id, product?._id]);

  // Load product from API
  useEffect(() => {
    const loadProduct = async () => {
      if (!id || id === 'undefined' || id === 'null') {
        toast({
          title: 'Error',
          description: 'Invalid product',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }
      
      try {
        setLoading(true);
        // Use getBySlug which works with both slug and ID (backend handles both)
        const productData = await productsAPI.getBySlug(id);
        setProduct(productData);
        
        // Update URL to use slug if available and current URL uses ID
        // This ensures URLs always show product name instead of ID
        if (productData.slug) {
          // Check if current URL parameter is an ObjectId (24 char hex string)
          const isObjectId = /^[a-f0-9]{24}$/i.test(id);
          if (isObjectId && productData.slug !== id) {
            // Replace ID with slug in URL
            window.history.replaceState({}, '', `/product/${productData.slug}`);
          }
        }
        
        // Set default size
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
    } else {
          setSelectedSize("M");
        }
        
        // Set default color based on product ID
        // Find color whose productId matches current product ID, otherwise use first color
        if (productData.colorOptions && productData.colorOptions.length > 0) {
          const currentProductId = productData.id || productData._id?.toString();
          // Find color that matches current product ID
          const matchingColor = productData.colorOptions.find(color => {
            const colorProductId = color.productId?.toString() || color.productId;
            return colorProductId === currentProductId;
          });
          
          if (matchingColor) {
            setSelectedColor(matchingColor.name || matchingColor.hex || null);
          } else {
            // Fallback to first color
            const firstColor = productData.colorOptions[0];
            setSelectedColor(firstColor.name || firstColor.hex || null);
          }
        } else if (productData.colors && productData.colors.length > 0) {
          const currentProductId = productData.id || productData._id?.toString();
          // Find color that matches current product ID
          const matchingColor = productData.colors.find(color => {
            const colorProductId = color.productId?.toString() || color.productId;
            return colorProductId === currentProductId;
          });
          
          if (matchingColor) {
            setSelectedColor(matchingColor.name || matchingColor.hex || null);
          } else {
            // Fallback to first color
            const firstColor = productData.colors[0];
            setSelectedColor(firstColor.name || firstColor.hex || null);
          }
        }
        
        // Load related products
        if (productData.category) {
          const currentProductId = productData.id || productData._id?.toString() || id;
          const currentPrice = productData.price || 0;
          const currentAudience = productData.audience || null;
          
          // Helper function to shuffle array randomly
          const shuffleArray = (array) => {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
          };
          
          let relatedProducts = [];
          
          // Step 1: Fetch products with same category and audience
          if (currentAudience) {
            const sameCategoryAudienceData = await productsAPI.getAll({ 
              category: productData.category,
              audience: currentAudience,
              limit: 20 // Fetch more to have options for randomization
            });
            relatedProducts = sameCategoryAudienceData.products.filter(
              item => (item.id || item._id?.toString()) !== currentProductId
            );
          }
          
          // Step 2: If we have less than 3 products, fetch more from same category
          if (relatedProducts.length < 3) {
            // Fetch all products from same category (without audience filter)
            const allCategoryData = await productsAPI.getAll({ 
              category: productData.category,
              limit: 50 // Fetch more to have options for randomization
            });
            
            // Filter out current product and already added products
            const existingIds = new Set([
              currentProductId,
              ...relatedProducts.map(p => p.id || p._id?.toString())
            ]);
            
            const availableProducts = allCategoryData.products.filter(
              item => !existingIds.has(item.id || item._id?.toString())
            );
            
            // Shuffle available products randomly instead of sorting by price
            const shuffledProducts = shuffleArray(availableProducts);
            
            // Add products until we have 3 total
            relatedProducts = [...relatedProducts, ...shuffledProducts].slice(0, 3);
          } else {
            // If we have 3 or more, shuffle and take first 3 randomly
            const shuffled = shuffleArray(relatedProducts);
            relatedProducts = shuffled.slice(0, 3);
          }
          
          setRelated(relatedProducts);
        }
        
        // Load reviews for this product
        const productId = productData.id || productData._id?.toString() || id;
        if (productId) {
          loadReviews(productId);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load product. Please try again.',
          variant: 'destructive',
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-4">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 w-20 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
          <p className="text-muted-foreground">Product not found</p>
        </div>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  
  // Extract images from gallery array
  const getProductImages = () => {
    if (Array.isArray(product.gallery) && product.gallery.length > 0) {
      return product.gallery.map(img => {
        if (typeof img === 'string') return img;
        if (img.url) return img.url;
        return img;
      });
    }
    if (product.gallery && typeof product.gallery === 'string') {
      return [product.gallery];
    }
    if (product.image) {
      return [product.image];
    }
    return [];
  };
  
  const productImages = getProductImages();
  
  // Image navigation functions
  const nextImage = () => {
    if (productImages.length > 0 && !isSliding) {
      setPrevImageIndex(selectedImage);
      setIsSliding(true);
      setSlideDirection('left');
      setTimeout(() => {
        setSelectedImage((prev) => (prev + 1) % productImages.length);
        setTimeout(() => {
          setIsSliding(false);
          setSlideDirection(null);
        }, 50);
      }, 500);
    }
  };
  
  const prevImage = () => {
    if (productImages.length > 0 && !isSliding) {
      setPrevImageIndex(selectedImage);
      setIsSliding(true);
      setSlideDirection('right');
      setTimeout(() => {
        setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length);
        setTimeout(() => {
          setIsSliding(false);
          setSlideDirection(null);
        }, 50);
      }, 500);
    }
  };
  
  // Touch/swipe handlers for mobile
  const minSwipeDistance = 50;
  
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isSliding) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      setPrevImageIndex(selectedImage);
      setIsSliding(true);
      setSlideDirection('left');
      setTimeout(() => {
        setSelectedImage((prev) => (prev + 1) % productImages.length);
        setTimeout(() => {
          setIsSliding(false);
          setSlideDirection(null);
        }, 50);
      }, 500);
    }
    if (isRightSwipe) {
      setPrevImageIndex(selectedImage);
      setIsSliding(true);
      setSlideDirection('right');
      setTimeout(() => {
        setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length);
        setTimeout(() => {
          setIsSliding(false);
          setSlideDirection(null);
        }, 50);
      }, 500);
    }
  };
  
  // Clean and format sizes - remove brackets, quotes, and extra characters
  const productSizes = (() => {
    // Define correct size order
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    
    if (!product || !product.sizes || !Array.isArray(product.sizes) || product.sizes.length === 0) {
      return sizeOrder;
    }
    
    const cleanedSizes = product.sizes.map(size => {
      // Convert to string and remove brackets, quotes, backslashes, and whitespace
      let cleanedSize = String(size)
        .replace(/[\[\]"]/g, '') // Remove brackets and quotes
        .replace(/\\/g, '') // Remove backslashes
        .replace(/^['"]|['"]$/g, '') // Remove leading/trailing quotes
        .trim(); // Remove whitespace
      
      return cleanedSize || size; // Return cleaned size or original if empty
    }).filter(size => size); // Remove empty values
    
    // If after cleaning we have no sizes, return default sizes
    if (cleanedSizes.length === 0) {
      return sizeOrder;
    }
    
    // Sort sizes according to the correct order
    return cleanedSizes.sort((a, b) => {
      const indexA = sizeOrder.indexOf(a.toUpperCase());
      const indexB = sizeOrder.indexOf(b.toUpperCase());
      
      // If both sizes are in the order array, sort by their index
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      // If only one is in the order array, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      // If neither is in the order array, maintain original order
      return 0;
    });
  })();
  
  // Helper function to get hex code from color name
  const getHexFromColorName = (name) => {
    if (!name) return '#000000';
    const colorMap = {
      'black': '#000000',
      'white': '#FFFFFF',
      'brown': '#8B4513',
      'beige': '#F5F5DC',
      'red': '#FF0000',
      'blue': '#0000FF',
      'green': '#008000',
      'yellow': '#FFFF00',
      'orange': '#FFA500',
      'purple': '#800080',
      'pink': '#FFC0CB',
      'grey': '#808080',
      'gray': '#808080',
      'navy': '#000080',
      'maroon': '#800000',
      'olive': '#808000',
      'lime': '#00FF00',
      'aqua': '#00FFFF',
      'teal': '#008080',
      'silver': '#C0C0C0',
      'gold': '#FFD700'
    };
    return colorMap[name.toLowerCase()] || '#000000';
  };

  // Extract and format colors from product data
  const productColors = (() => {
    if (!product) return [];
    
    console.log('Product data:', product);
    console.log('Product colorOptions:', product.colorOptions);
    console.log('Product colors:', product.colors);
    
    // Check for colorOptions array
    if (product.colorOptions && Array.isArray(product.colorOptions) && product.colorOptions.length > 0) {
      const formattedColors = product.colorOptions.map(color => {
        // Handle both object and string formats
        if (typeof color === 'string') {
          return { name: '', hex: color };
        }
        const colorName = color.name || '';
        const colorHex = color.hex || color.hexCode || getHexFromColorName(colorName);
        console.log('Color mapping:', { name: colorName, hex: colorHex, original: color });
        return {
          name: colorName,
          hex: colorHex,
          productId: color.productId || null
        };
      });
      console.log('Formatted colors from colorOptions:', formattedColors);
      return formattedColors;
    }
    
    // Check for colors array (alternative format)
    if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
      const formattedColors = product.colors.map(color => {
        // Handle both object and string formats
        if (typeof color === 'string') {
          return { name: '', hex: color, productId: null };
        }
        const colorName = color.name || '';
        const colorHex = color.hex || color.hexCode || getHexFromColorName(colorName);
        console.log('Color mapping:', { name: colorName, hex: colorHex, original: color });
        return {
          name: colorName,
          hex: colorHex,
          productId: color.productId || null
        };
      });
      console.log('Formatted colors from colors:', formattedColors);
      return formattedColors;
    }
    
    console.log('No colors found, using defaults');
    // Default colors if none found - always show at least these
    return [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' }
    ];
  })();

  const handleWishlist = () => {
    if (!isAuthenticated) {
      const productUrl = getProductUrl(product);
      navigate(`/auth?redirect=${encodeURIComponent(productUrl)}`);
      return;
    }
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast({ title: "Removed from wishlist" });
    } else {
      addToWishlist({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
        original: product.original || product.originalPrice,
        image: getImageUrl(productImages[0]),
      });
      toast({ title: "Added to wishlist" });
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      const productUrl = getProductUrl(product);
      navigate(`/auth?redirect=${encodeURIComponent(productUrl)}`);
      return;
    }
    if (!selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" });
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      original: product.original || product.originalPrice,
      image: getImageUrl(productImages[0]),
      size: selectedSize,
      quantity,
    });
    toast({
      title: "Added to cart!", 
      description: `${product.name} x ${quantity}` 
    });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      const productUrl = getProductUrl(product);
      navigate(`/auth?redirect=${encodeURIComponent(productUrl)}`);
      return;
    }
    if (!selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" });
      return;
    }
    // Don't add to cart - buy now is separate
    const buyNowProduct = {
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      original: product.original || product.originalPrice,
      image: getImageUrl(productImages[0]),
      size: selectedSize,
      quantity,
    };
    
    // Store buy now product in sessionStorage (separate from cart)
    sessionStorage.setItem('buyNowProduct', JSON.stringify(buyNowProduct));
    
    // Navigate to checkout with buyNow flag
    navigate('/checkout', { 
      state: { 
        buyNow: true
      } 
    });
  };

  return (
    <div className="min-h-screen bg-background">
        <Header />
      <main className="container mx-auto px-4 py-2 sm:py-4 lg:py-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-6 lg:mb-8 text-xs sm:text-sm text-muted-foreground">
          <button onClick={() => navigate('/')} className="hover:text-foreground">Home</button>
          <span className="mx-1 sm:mx-2">/</span>
          <button onClick={() => navigate('/category/hoodies')} className="hover:text-foreground">Products</button>
          <span className="mx-1 sm:mx-2">/</span>
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid gap-6 sm:gap-8 lg:gap-12 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-3 sm:space-y-4">
            {/* Main Image */}
            <div 
              className="relative aspect-square overflow-hidden rounded-xl sm:rounded-2xl bg-secondary shadow-soft group"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="relative h-full w-full overflow-hidden">
                {/* Previous image sliding out */}
                {isSliding && (
                  <div 
                    className="absolute inset-0 transition-transform duration-500 ease-in-out"
                    style={{
                      transform: slideDirection === 'left' 
                        ? 'translateX(-100%)' 
                        : 'translateX(100%)',
                      zIndex: 1
                    }}
                  >
                    <img
                      src={getImageUrl(productImages[prevImageIndex] || productImages[0])}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                
                {/* Current/New image sliding in */}
                <div 
                  className="absolute inset-0 transition-transform duration-500 ease-in-out"
                  style={{
                    transform: isSliding 
                      ? slideDirection === 'left' 
                        ? 'translateX(0)' 
                        : slideDirection === 'right'
                        ? 'translateX(0)'
                        : 'translateX(0)'
                      : 'translateX(0)',
                    zIndex: 2,
                    animation: isSliding 
                      ? slideDirection === 'left' 
                        ? 'slideInFromRight 0.5s ease-in-out' 
                        : slideDirection === 'right'
                        ? 'slideInFromLeft 0.5s ease-in-out'
                        : 'none'
                      : 'none'
                  }}
                >
                  <img
                    key={selectedImage}
                    src={getImageUrl(productImages[selectedImage] || productImages[0])}
                    alt={product.name}
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <style>{`
                @keyframes slideInFromRight {
                  from {
                    transform: translateX(100%);
                  }
                  to {
                    transform: translateX(0);
                  }
                }
                @keyframes slideInFromLeft {
                  from {
                    transform: translateX(-100%);
                  }
                  to {
                    transform: translateX(0);
                  }
                }
              `}</style>
              
              {/* Navigation Arrows - Only show if more than 1 image */}
              {productImages.length > 1 && (
                <>
                  {/* Left Arrow */}
                  <button
                    onClick={prevImage}
                    className="absolute left-2 sm:left-4 bg-white/80 hover:bg-white/90 active:bg-white text-gray-800 rounded-full p-2 sm:p-3 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 z-10 shadow-lg backdrop-blur-sm flex items-center justify-center"
                    style={{ 
                      top: '50%',
                      transform: 'translateY(-50%)',
                      height: 'fit-content'
                    }}
                    aria-label="Previous image"
                  >
                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  
                  {/* Right Arrow */}
                  <button
                    onClick={nextImage}
                    className="absolute right-2 sm:right-4 bg-white/80 hover:bg-white/90 active:bg-white text-gray-800 rounded-full p-2 sm:p-3 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 z-10 shadow-lg backdrop-blur-sm flex items-center justify-center"
                    style={{ 
                      top: '50%',
                      transform: 'translateY(-50%)',
                      height: 'fit-content'
                    }}
                    aria-label="Next image"
                  >
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full">
                    {selectedImage + 1} / {productImages.length}
                  </div>
                </>
              )}
        </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-1.5 sm:gap-2 justify-center overflow-x-auto pb-2">
              {productImages.length > 0 ? (
                productImages.map((image, index) => (
              <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "relative h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all cursor-pointer",
                      selectedImage === index
                        ? "border-primary shadow-soft"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/80";
                      }}
                    />
              </button>
                ))
              ) : (
                <div className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 rounded-md border-2 border-border bg-secondary flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">No images</span>
            </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-primary">
                {product.category}
              </p>
              <div className="flex items-center justify-between gap-4 mt-1 sm:mt-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground lg:text-4xl">
                  {product.name}
                </h1>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn("flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12", inWishlist && "border-primary text-primary")}
                  onClick={handleWishlist}
                >
                  <Heart
                    className={cn("h-5 w-5 sm:h-6 sm:w-6", inWishlist && "fill-primary")}
                  />
                </Button>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.floor(reviews.length > 0 
                        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                        : 0)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                  : "0.0"
                }
              </span>
              <span className="text-sm text-muted-foreground">
                ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
              </span>
            </div>

            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-foreground">
                ₹{product.price}
              </span>
              {(product.original || product.originalPrice) && (
                <span className="text-lg sm:text-xl text-muted-foreground line-through">
                  ₹{product.original || product.originalPrice}
                </span>
              )}
              {(product.original || product.originalPrice) && (
                <span className="rounded-full bg-primary/10 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-primary">
                  {Math.round(((product.original || product.originalPrice) - product.price) / (product.original || product.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{product.description || "Premium quality product with elegant design."}</p>

            {/* Colors */}
            {productColors.length > 0 && (
              <div className="space-y-2 sm:space-y-3">
                <p className="font-medium text-sm sm:text-base text-foreground">Color</p>
                <div className="flex gap-3 sm:gap-4 flex-wrap items-center">
                  {productColors.map((color, index) => {
                    const colorKey = color.name || color.hex || `color-${index}`;
                    // Use the hex from the formatted color object, with fallback to color name mapping
                    const colorHex = color.hex || getHexFromColorName(color.name) || '#000000';
                    const isSelected = selectedColor === color.name || selectedColor === color.hex || selectedColor === colorKey;
                    console.log('Rendering color:', { name: color.name, hex: colorHex, color });
                    return (
                      <div key={colorKey} className="flex flex-col items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            console.log('Color clicked:', color);
                            setSelectedColor(color.name || color.hex || colorKey);
                            // If color has a productId, navigate to that product
                            // We'll fetch the product to get its slug, or use ID as fallback
                            if (color.productId) {
                              // Try to get product slug, but navigate immediately with ID
                              // The product page will update the URL to slug if available
                              navigate(`/product/${color.productId}`);
                            }
                          }}
                          className={cn(
                            "relative rounded-full border-2 transition-all hover:scale-110 shadow-md flex-shrink-0",
                            "h-12 w-12",
                            isSelected
                              ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                              : "border-border hover:border-primary/50"
                          )}
                          style={{ 
                            backgroundColor: colorHex || '#000000',
                            width: '48px',
                            height: '48px',
                            display: 'inline-block'
                          }}
                          title={color.name || `Color ${index + 1}`}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="h-2.5 w-2.5 rounded-full bg-white shadow-sm"></div>
                  </div>
                )}
                        </button>
                        {color.name && (
                          <span className="text-xs font-medium text-foreground">{color.name}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {selectedColor && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {productColors.find(c => c.name === selectedColor || c.hex === selectedColor)?.name || selectedColor}
                  </p>
                )}
                  </div>
                )}

            {/* Sizes */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm sm:text-base text-foreground">Size</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs sm:text-sm text-primary hover:text-primary/80 h-auto py-1 px-2"
                  onClick={async () => {
                    setShowSizeChart(true);
                    if (!sizeChartData && product?.category) {
                      setLoadingSizeChart(true);
                      try {
                        const chart = await sizeChartsAPI.getByCategory(product.category);
                        setSizeChartData(chart);
                      } catch (error) {
                        console.error('Error fetching size chart:', error);
                        toast({
                          title: "Error",
                          description: "Failed to load size chart",
                          variant: "destructive",
                        });
                      } finally {
                        setLoadingSizeChart(false);
                      }
                    }
                  }}
                >
                  <Ruler className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Size Chart
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {productSizes.map((size) => {
                  // Clean the size value for display (remove brackets, quotes, and backslashes)
                  const cleanSize = String(size).replace(/[\[\]"]/g, '').replace(/\\/g, '').trim();
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(cleanSize)}
                      className={cn(
                        "flex h-10 sm:h-12 min-w-[50px] sm:min-w-[60px] px-3 sm:px-4 items-center justify-center rounded-lg border-2 text-xs sm:text-sm font-medium transition-all",
                        selectedSize === cleanSize || selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:border-primary"
                      )}
                    >
                      {cleanSize}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2 sm:space-y-3">
              <p className="font-medium text-sm sm:text-base text-foreground">Quantity</p>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center rounded-lg border border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 sm:h-10 sm:w-10"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <span className="w-10 sm:w-12 text-center text-sm sm:text-base font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 sm:h-10 sm:w-10"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <Button
                size="lg"
                className="flex-1 gap-2 shadow-soft hover:shadow-elevated text-sm sm:text-base h-12 sm:h-auto py-3 sm:py-0"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft hover:shadow-elevated text-sm sm:text-base h-12 sm:h-auto py-3 sm:py-0"
                onClick={handleBuyNow}
              >
                <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                Buy Now
              </Button>
            </div>

            {/* Shipping Info */}
            <div className="space-y-3 rounded-lg bg-accent/50 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  {pincodeChecked && detectedLocation ? (
                    <>
                      <p className="font-medium text-sm sm:text-base text-foreground">Free Shipping to {detectedLocation}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Estimated delivery:  Assured Delivery by 8-10 days
                      </p>
                    </>
                  ) : pincodeChecked && !detectedLocation ? (
                    <>
                      <p className="font-medium text-sm sm:text-base text-foreground">Delivery Not Available</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Currently only delivering to Ahmedabad and Gandhinagar
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-sm sm:text-base text-foreground">Check Delivery</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Enter your pincode to check delivery availability
                      </p>
                    </>
                  )}
                </div>
              </div>
              <form onSubmit={handlePincodeSubmit} className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="text"
                  placeholder="Enter pincode"
                  value={pincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setPincode(value);
                    setPincodeChecked(false);
                    setDetectedLocation(null);
                  }}
                  className="flex-1 text-sm sm:text-base"
                  maxLength={6}
                  disabled={checkingPincode}
                />
                <Button type="submit" size="default" className="px-4 sm:px-6 text-sm sm:text-base whitespace-nowrap" disabled={checkingPincode || pincode.length !== 6}>
                  {checkingPincode ? "Checking..." : "Check"}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Ratings and Reviews */}
        <section className="mt-32 sm:mt-52 lg:mt-72">
          <div className="max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl sm:text-2xl font-black text-foreground">
                Ratings & <span className="text-gradient">Reviews</span>
              </h2>
              {isAuthenticated && (
                <Dialog open={showAddReview} onOpenChange={setShowAddReview}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Star className="h-4 w-4" />
                      Add Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Write a Review</DialogTitle>
                      <DialogDescription>
                        Share your experience with this product
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Rating</label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setNewReview({ ...newReview, rating })}
                              className="focus:outline-none"
                            >
                              <Star
                                className={cn(
                                  "h-8 w-8 transition-colors cursor-pointer",
                                  rating <= newReview.rating
                                    ? "fill-primary text-primary"
                                    : "fill-muted text-muted"
                                )}
                              />
                            </button>
                          ))}
                          <span className="ml-2 text-sm text-muted-foreground">
                            {newReview.rating} out of 5
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Your Review</label>
                        <Textarea
                          placeholder="Share your thoughts about this product..."
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          className="min-h-[120px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Upload Images (Optional)</label>
                        <div className="flex flex-col gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              const newFiles = [...reviewFiles, ...files].slice(0, 5); // Max 5 images
                              setReviewFiles(newFiles);
                              
                              // Create previews
                              const newPreviews = [];
                              newFiles.forEach((file, index) => {
                                if (file.type.startsWith('image/')) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    newPreviews[index] = { type: 'image', url: event.target.result, file };
                                    if (newPreviews.filter(p => p).length === newFiles.length) {
                                      setReviewFilePreviews([...newPreviews]);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              });
                            }}
                            className="cursor-pointer"
                          />
                          {reviewFilePreviews.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {reviewFilePreviews.map((preview, index) => (
                                <div key={index} className="relative">
                                  {preview.type === 'image' && (
                                    <img
                                      src={preview.url}
                                      alt={`Preview ${index + 1}`}
                                      className="h-20 w-20 object-cover rounded-md border border-border"
                                    />
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newFiles = reviewFiles.filter((_, i) => i !== index);
                                      const newPreviews = reviewFilePreviews.filter((_, i) => i !== index);
                                      setReviewFiles(newFiles);
                                      setReviewFilePreviews(newPreviews);
                                    }}
                                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            You can upload up to 5 images. Selected: {reviewFiles.length}/5
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowAddReview(false);
                            setNewReview({ rating: 5, comment: "", userName: "" });
                            setReviewFiles([]);
                            setReviewFilePreviews([]);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={async () => {
                            if (!newReview.comment.trim()) {
                              toast({
                                title: "Error",
                                description: "Please write a review",
                                variant: "destructive",
                              });
                              return;
                            }
                            
                            try {
                              const productId = product.id || product._id?.toString();
                              if (!productId) {
                                toast({
                                  title: "Error",
                                  description: "Product ID not found",
                                  variant: "destructive",
                                });
                                return;
                              }
                              
                              // Submit review with files using API
                              await reviewsAPI.addReview(productId, {
                                rating: newReview.rating,
                                comment: newReview.comment
                              }, reviewFiles);
                              
                              // Reload reviews to get the latest data
                              const productIdForReviews = product.id || product._id?.toString() || id;
                              if (productIdForReviews) {
                                await loadReviews(productIdForReviews);
                              }
                              
                              setNewReview({ rating: 5, comment: "", userName: "" });
                              setReviewFiles([]);
                              setReviewFilePreviews([]);
                              setShowAddReview(false);
                              toast({
                                title: "Success",
                                description: "Your review has been added!",
                              });
                            } catch (error) {
                              console.error('Error submitting review:', error);
                              toast({
                                title: "Error",
                                description: error.message || "Failed to submit review. Please try again.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Submit Review
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            {(() => {
              const avgRating = reviews.length > 0
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : "0.0";
              const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
                rating,
                count: reviews.filter(r => r.rating === rating).length,
                percentage: reviews.length > 0
                  ? Math.round((reviews.filter(r => r.rating === rating).length / reviews.length) * 100)
                  : 0
              }));
              const recentReviews = reviews.slice(0, 3);
              
              return (
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Rating Summary */}
                  <div className="space-y-6 rounded-lg border border-border bg-card p-4 sm:p-6 w-full md:w-64 md:max-w-64 flex-shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-4xl font-black text-foreground">{avgRating}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i <= parseFloat(avgRating) ? "fill-primary text-primary" : "fill-muted text-muted"
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    
                    {/* Rating Breakdown */}
                    <div className="space-y-2">
                      {ratingCounts.map(({ rating, percentage }) => (
                        <div key={rating} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-foreground w-8">{rating}</span>
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-10 text-right">
                            {percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Reviews */}
                  <div className="space-y-6 flex-1">
                    <h3 className="text-lg font-semibold text-foreground">Recent Reviews</h3>
                    
                    {recentReviews.length > 0 ? (
                      <>
                        {recentReviews.map((review) => (
                          <div key={review.id} className="space-y-3 rounded-lg border border-border bg-card p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-foreground">{review.userName}</p>
                                {review.verified && (
                                  <p className="text-xs text-muted-foreground">Verified Purchase</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "h-3 w-3",
                                      i <= review.rating ? "fill-primary text-primary" : "fill-muted text-muted"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-foreground">{review.comment}</p>
                            {review.attachments && review.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {review.attachments.map((attachment, idx) => (
                                  attachment.type === 'image' ? (
                                    <img
                                      key={idx}
                                      src={getImageUrl(attachment.url)}
                                      alt={`Review image ${idx + 1}`}
                                      className="h-12 w-12 object-cover rounded-md border border-border cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => setSelectedImageModal({ open: true, url: getImageUrl(attachment.url) })}
                                    />
                                  ) : null
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">{review.date}</p>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No reviews yet. Be the first to review!</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
          </div>
        </section>

        {/* Image Modal for Review Images */}
        <Dialog open={selectedImageModal.open} onOpenChange={(open) => setSelectedImageModal({ open, url: selectedImageModal.url })}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-transparent border-none">
            {selectedImageModal.url && (
              <div className="relative w-full flex items-center justify-center">
                <img
                  src={selectedImageModal.url}
                  alt="Review image"
                  className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Size Chart Dialog */}
        <Dialog open={showSizeChart} onOpenChange={setShowSizeChart}>
          <DialogContent className="max-w-4xl max-h-[70vh] sm:max-h-[75vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader className="pb-2 sm:pb-4">
              <DialogTitle className="text-lg sm:text-xl">Size Chart - {product?.category}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {sizeChartData?.fitDescription || "Measurements guide"}
              </DialogDescription>
            </DialogHeader>
            {loadingSizeChart ? (
              <div className="flex items-center justify-center py-4 sm:py-8">
                <p className="text-sm text-muted-foreground">Loading size chart...</p>
              </div>
            ) : sizeChartData ? (
              <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
                {sizeChartData.fitDetails && (
                  <p className="text-xs sm:text-sm text-muted-foreground">{sizeChartData.fitDetails}</p>
                )}
                
                {/* Get all measurements from all sizes to ensure complete header */}
                {(() => {
                  const inchesData = sizeChartData.measurements?.inches || {};
                  const cmsData = sizeChartData.measurements?.cms || {};
                  const allMeasurements = new Set();
                  
                  // Collect all measurement types from all sizes
                  Object.values(inchesData).forEach(sizeData => {
                    if (sizeData && typeof sizeData === 'object') {
                      Object.keys(sizeData).forEach(measurement => allMeasurements.add(measurement));
                    }
                  });
                  
                  const measurementsArray = Array.from(allMeasurements);
                  
                  return (
                    <>
                      {/* Inches Measurements */}
                      {Object.keys(inchesData).length > 0 && (
                        <div>
                          <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">Measurements (Inches)</h3>
                          <div className="overflow-x-auto -mx-2 sm:mx-0">
                            <table className="w-full border-collapse border border-border text-xs sm:text-sm">
                              <thead>
                                <tr className="bg-muted">
                                  <th className="border border-border px-2 py-1.5 sm:px-3 sm:py-2 text-left font-semibold sticky left-0 bg-muted z-10">Size</th>
                                  {measurementsArray.map(measurement => (
                                    <th key={measurement} className="border border-border px-2 py-1.5 sm:px-3 sm:py-2 text-left font-semibold capitalize whitespace-nowrap">
                                      {measurement === 'toFitChest' ? 'To Fit Chest' : measurement}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {Object.keys(inchesData).map(size => (
                                  <tr key={size}>
                                    <td className="border border-border px-2 py-1.5 sm:px-3 sm:py-2 font-semibold sticky left-0 bg-background z-10">{size}</td>
                                  {measurementsArray.map(measurement => (
                                    <td key={measurement} className="border border-border px-2 py-1.5 sm:px-3 sm:py-2 text-center">
                                      {inchesData[size]?.[measurement] ?? '-'}
                                    </td>
                                  ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Centimeters Measurements */}
                      {Object.keys(cmsData).length > 0 && (
                        <div>
                          <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">Measurements (Centimeters)</h3>
                          <div className="overflow-x-auto -mx-2 sm:mx-0">
                            <table className="w-full border-collapse border border-border text-xs sm:text-sm">
                              <thead>
                                <tr className="bg-muted">
                                  <th className="border border-border px-2 py-1.5 sm:px-3 sm:py-2 text-left font-semibold sticky left-0 bg-muted z-10">Size</th>
                                  {measurementsArray.map(measurement => (
                                    <th key={measurement} className="border border-border px-2 py-1.5 sm:px-3 sm:py-2 text-left font-semibold capitalize whitespace-nowrap">
                                      {measurement === 'toFitChest' ? 'To Fit Chest' : measurement}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {Object.keys(cmsData).map(size => (
                                  <tr key={size}>
                                    <td className="border border-border px-2 py-1.5 sm:px-3 sm:py-2 font-semibold sticky left-0 bg-background z-10">{size}</td>
                                    {measurementsArray.map(measurement => (
                                      <td key={measurement} className="border border-border px-2 py-1.5 sm:px-3 sm:py-2 text-center">
                                        {cmsData[size]?.[measurement] ?? '-'}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="flex items-center justify-center py-4 sm:py-8">
                <p className="text-sm text-muted-foreground">Size chart not available for this category.</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-12 sm:mt-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <h2 className="font-display text-xl sm:text-2xl font-black text-foreground">
                Related <span className="text-gradient">Products</span>
              </h2>
              <Button
                variant="ghost"
                className="text-primary hover:text-primary/80 text-sm sm:text-base"
                onClick={() => {
                  const categoryMap = {
                    'Hoodie': 'hoodies',
                    'T-Shirt': 't-shirts',
                    'Sweatshirt': 'sweatshirts'
                  };
                  const route = categoryMap[product.category] || 'hoodies';
                  navigate(`/category/${route}`);
                }}
              >
                View All
            </Button>
          </div>
            {/* Mobile: Carousel (one at a time) */}
            <div className="block md:hidden">
              <Carousel
                opts={{
                  align: "start",
                  loop: false,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {related.map((item, index) => (
                    <CarouselItem key={item.id} className="basis-full">
                      <div className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <ProductCard
                          id={item.id}
                          name={item.name}
                          category={item.category}
                          price={item.price}
                          originalPrice={item.original || item.originalPrice}
                          image={getImageUrl(Array.isArray(item.gallery) ? item.gallery[0] : item.gallery || item.image)}
                          rating={4.8}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
            {/* Desktop: Grid (3 items side by side) */}
            <div className="hidden md:flex md:flex-row md:justify-center md:items-start" style={{ gap: '64px', alignItems: 'stretch' }}>
              {related.map((item, index) => (
                <div
                  key={item.id}
                  className="animate-fade-in flex-shrink-0"
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    width: '320px',
                    minWidth: '320px',
                    maxWidth: '320px',
                    display: 'flex'
                  }}
                >
                  <ProductCard
                    id={item.id}
                    name={item.name}
                    category={item.category}
                    price={item.price}
                    originalPrice={item.original || item.originalPrice}
                    image={getImageUrl(Array.isArray(item.gallery) ? item.gallery[0] : item.gallery || item.image)}
                    rating={4.8}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Product;
