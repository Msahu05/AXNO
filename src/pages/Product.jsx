import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Heart, Star, Sparkles, Wand2, X, Menu, Camera, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Header from "@/components/Header";
import ProductReviews from "@/components/ProductReviews";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { productsAPI, getImageUrl, sizeChartsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const sizes = ["S", "M", "L", "XL"];

// Default size guide data (fallback)
const defaultSizeGuideData = {
  inches: {
    S: { chest: 46, toFitChest: 38, shoulder: 24, length: 26.5 },
    M: { chest: 48, toFitChest: 40, shoulder: 25, length: 27.5 },
    L: { chest: 50, toFitChest: 42, shoulder: 26, length: 28.5 },
    XL: { chest: 52, toFitChest: 44, shoulder: 27, length: 29 },
    XXL: { chest: 54, toFitChest: 46, shoulder: 28, length: 29.5 },
    XXXL: { chest: 56, toFitChest: 48, shoulder: 29, length: 30 },
  },
  cms: {
    S: { chest: 117, toFitChest: 97, shoulder: 61, length: 67 },
    M: { chest: 122, toFitChest: 102, shoulder: 64, length: 70 },
    L: { chest: 127, toFitChest: 107, shoulder: 66, length: 72 },
    XL: { chest: 132, toFitChest: 112, shoulder: 69, length: 74 },
    XXL: { chest: 137, toFitChest: 117, shoulder: 71, length: 75 },
    XXXL: { chest: 142, toFitChest: 122, shoulder: 74, length: 76 },
  },
};

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState("M");
  const [imageIndex, setImageIndex] = useState(0);
  const [pincode, setPincode] = useState("");
  const [pincodeValid, setPincodeValid] = useState(null);
  const [deliveryEstimate, setDeliveryEstimate] = useState("");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeUnit, setSizeUnit] = useState("inches");
  const [sizeGuideData, setSizeGuideData] = useState(defaultSizeGuideData);
  const [fitDescription, setFitDescription] = useState('Oversized Fit');
  const [fitDetails, setFitDetails] = useState('Falls loosely on the body');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const touchStartX = useRef(null);

  // Load product from API
  useEffect(() => {
    const loadProduct = async () => {
      if (!id || id === 'undefined' || id === 'null') {
        toast({
          title: 'Error',
          description: 'Invalid product ID',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }
      
      try {
        setLoading(true);
        const productData = await productsAPI.getById(id);
        setProduct(productData);
        
        // Load size chart for this product category
        if (productData.category) {
          try {
            const sizeChart = await sizeChartsAPI.getByCategory(productData.category);
            if (sizeChart.measurements) {
              setSizeGuideData(sizeChart.measurements);
            }
            if (sizeChart.fitDescription) {
              setFitDescription(sizeChart.fitDescription);
            }
            if (sizeChart.fitDetails) {
              setFitDetails(sizeChart.fitDetails);
            }
          } catch (error) {
            console.warn('Error loading size chart, using defaults:', error);
          }
        }
        
        // Load related products
        if (productData.audience) {
          const relatedData = await productsAPI.getAll({ 
            audience: productData.audience, 
            limit: 4 
          });
          const filtered = relatedData.products.filter(item => item.id !== id).slice(0, 3);
          setRelated(filtered);
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

  const galleryLength = product?.gallery?.length || 1;
  const currentImage = getImageUrl(product?.gallery?.[imageIndex % galleryLength] || product?.gallery?.[0] || '');

  // Helper functions - MUST be before early returns
  const showNextImage = () => setImageIndex((prev) => (prev + 1) % (product?.gallery?.length || 1));
  const showPrevImage = () => setImageIndex((prev) => {
    const length = product?.gallery?.length || 1;
    return (prev - 1 + length) % length;
  });

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0]?.clientX || null;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const diff = event.changedTouches[0]?.clientX - touchStartX.current;
    touchStartX.current = null;
    if (!diff || Math.abs(diff) < 40) return;
    if (diff > 0) {
      showPrevImage();
    } else {
      showNextImage();
    }
  };

  // Reset image index when product changes - MUST be before early returns
  useEffect(() => {
    if (product?.id) {
      setImageIndex(0);
    }
  }, [product?.id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Early returns AFTER all hooks
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Product not found</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  // Ahmedabad and Gandhinagar pincode ranges
  const isValidPincode = (pin) => {
    const pincodeNum = parseInt(pin);
    if (isNaN(pincodeNum) || pin.length !== 6) return false;
    return (pincodeNum >= 380001 && pincodeNum <= 380061) || 
           (pincodeNum >= 382001 && pincodeNum <= 382481);
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(value);
    
    if (value.length === 6) {
      if (isValidPincode(value)) {
        setPincodeValid(true);
        setDeliveryEstimate("Delivery in 7-8 days");
      } else {
        setPincodeValid(false);
        setDeliveryEstimate("");
      }
    } else {
      setPincodeValid(null);
      setDeliveryEstimate("");
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent(`/product/${product.id}`)}`);
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      original: product.original,
      image: getImageUrl(product.gallery?.[0]),
      size,
    });
    navigate("/checkout");
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent(`/product/${product.id}`)}`);
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      original: product.original,
      image: getImageUrl(product.gallery?.[0]),
      size,
    });
    toast({
      title: "Item added to cart",
      description: `${product.name} (Size ${size}) has been added to your cart.`,
    });
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent(`/product/${product.id}`)}`);
      return;
    }
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        original: product.original,
        image: getImageUrl(product.gallery?.[0]),
      });
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      });
    }
  };

  // Get color options from product
  const colorOptions = product.colorOptions || [];
  const defaultColors = [
    { name: 'Brown', hexCode: '#8B4513' },
    { name: 'Beige', hexCode: '#F5F5DC' },
    { name: 'Black', hexCode: '#000000' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)`
        }}></div>
      </div>

      {/* Minimal Header */}
      <div className="relative z-10 px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="text-sm uppercase tracking-wider text-gray-600 hover:text-gray-900"
          >
            CONTACT
          </button>
          <div className="text-2xl font-serif italic text-gray-900">Mimosa</div>
          <button className="text-gray-600 hover:text-gray-900">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      <div className="relative z-10 px-6 py-3 bg-white/50 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={() => navigate('/')}
            className="text-xs uppercase tracking-wider text-gray-500 hover:text-gray-900 flex items-center gap-2"
          >
            COLLECTIONS <ChevronRight className="h-3 w-3" /> {product.category.toUpperCase()}S
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Product Info */}
          <div className="space-y-6">
            {/* Product Title */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-serif font-light text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>
              
              {/* Color Swatches */}
              {colorOptions.length > 0 ? (
                <div className="flex items-center gap-3 mb-6">
                  {colorOptions.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(index)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === index ? 'border-gray-900 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.hexCode || defaultColors[index]?.hexCode || '#8B4513' }}
                      title={color.name || defaultColors[index]?.name}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-6">
                  {defaultColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(index)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === index ? 'border-gray-900 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.hexCode }}
                      title={color.name}
                    />
                  ))}
                </div>
              )}

              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-4">
                {product.description || "If you need added protection from the elements, our timeless full-length trench coat is perfect for you. Classic single-breasted style with front gun flaps also includes a removable hood for the most inclement weather."}
              </p>

              {/* Details Link */}
              <button
                onClick={() => setDetailsOpen(true)}
                className="text-sm uppercase tracking-wider text-amber-700 underline underline-offset-4 hover:text-amber-900 transition-colors"
              >
                DETAILS
              </button>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4 pt-4 border-t border-gray-200">
              <span className="text-3xl font-light text-gray-900">₹{product.price}</span>
              {product.original && product.original > product.price && (
                <span className="text-xl text-gray-400 line-through">₹{product.original}</span>
              )}
            </div>

            {/* Size Selection */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-4">SIZE</p>
              <div className="flex flex-wrap gap-3">
                {sizes.map((item) => (
                  <button
                    key={item}
                    onClick={() => setSize(item)}
                    className={`px-6 py-2 border-2 text-sm uppercase tracking-wider transition-all ${
                      item === size
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 text-gray-700 hover:border-gray-900"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSizeGuideOpen(true)}
                className="mt-4 text-xs uppercase tracking-wider text-gray-500 underline underline-offset-4 hover:text-gray-900"
              >
                Size Guide
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-gray-900 text-white hover:bg-gray-800 rounded-none py-6 text-sm uppercase tracking-wider"
              >
                Add to Cart
              </Button>
              <Button
                onClick={handleBuyNow}
                variant="outline"
                className="w-full border-2 border-gray-900 text-gray-900 hover:bg-gray-50 rounded-none py-6 text-sm uppercase tracking-wider"
              >
                Buy Now
              </Button>
            </div>
          </div>

          {/* Right Side - Product Images */}
          <div className="relative">
            <div
              className="relative aspect-[3/4] bg-white"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                key={currentImage}
                src={currentImage}
                alt={product.name}
                loading="eager"
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              <button
                onClick={showPrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                aria-label="Previous image"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                onClick={showNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                aria-label="Next image"
              >
                <ArrowRight className="h-5 w-5" />
              </button>

              {/* Wishlist Button */}
              <button
                onClick={handleToggleWishlist}
                className={`absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-all ${
                  isInWishlist(product.id) ? "text-red-500" : "text-gray-600"
                }`}
              >
                <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
              </button>

              {/* Camera Icon (AR/Try-on) */}
              <button className="absolute bottom-4 left-4 p-3 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all">
                <Camera className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            {/* Thumbnail Gallery */}
            {product.gallery && product.gallery.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-4">
                {product.gallery.map((photo, index) => (
                  <button
                    key={photo}
                    onClick={() => setImageIndex(index)}
                    className={`aspect-square overflow-hidden border-2 transition-all ${
                      index === imageIndex ? "border-gray-900" : "border-transparent"
                    }`}
                  >
                    <img
                      src={getImageUrl(photo)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <ProductReviews productId={product.id} />
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-serif font-light mb-8">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {related.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/product/${item.id}`)}
                  className="cursor-pointer group"
                >
                  <div className="aspect-[3/4] bg-white mb-3 overflow-hidden">
                    <img
                      src={getImageUrl(item.gallery?.[0])}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{item.category}</p>
                  <h3 className="font-serif text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-gray-700">₹{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Details Sidebar */}
      {detailsOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/20 backdrop-blur-sm"
            onClick={() => setDetailsOpen(false)}
          />
          <div className="w-full max-w-md bg-white shadow-2xl overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-serif font-light">{product.name.toUpperCase()}</h2>
              <button
                onClick={() => setDetailsOpen(false)}
                className="text-gray-500 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              <div>
                <h3 className="text-3xl font-serif font-light mb-6">Product Details</h3>
                
                {/* Color Swatches */}
                {colorOptions.length > 0 ? (
                  <div className="flex items-center gap-3 mb-6">
                    {colorOptions.map((color, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.hexCode || defaultColors[index]?.hexCode || '#8B4513' }}
                        title={color.name || defaultColors[index]?.name}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mb-6">
                    {defaultColors.map((color, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.hexCode }}
                        title={color.name}
                      />
                    ))}
                  </div>
                )}

                {/* Size Info */}
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">SIZE</p>
                  <p className="text-sm text-gray-700">
                    The model is 177cm/5'10" and wears a size {size}.
                  </p>
                </div>

                {/* Composition */}
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">COMPOSITION</p>
                  <p className="text-sm text-gray-700">
                    Shell, Lining: Polyester 100%
                  </p>
                </div>

                {/* Assistance */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-4">NEED ASSISTANCE?</p>
                  <Button
                    onClick={() => {
                      window.open('https://wa.me/919876543210', '_blank');
                    }}
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white rounded-none py-6 text-sm uppercase tracking-wider"
                  >
                    CONTACT US
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      <Dialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-serif font-light">Size Guide</DialogTitle>
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </DialogHeader>
          
          <div className="px-6 py-4">
            <div className="mb-6">
              <p className="text-base font-semibold text-gray-900 mb-1">{fitDescription}</p>
              <p className="text-sm text-gray-600">{fitDetails}</p>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setSizeUnit("inches")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  sizeUnit === "inches"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Inches
              </button>
              <button
                onClick={() => setSizeUnit("cms")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  sizeUnit === "cms"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Cms
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Size</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Chest</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">To Fit Chest</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Shoulder</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Length</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(sizeGuideData[sizeUnit] || {}).map(([sizeKey, measurements]) => (
                    <tr
                      key={sizeKey}
                      className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        size === sizeKey ? "bg-gray-50" : ""
                      }`}
                      onClick={() => {
                        if (sizes.includes(sizeKey)) {
                          setSize(sizeKey);
                        }
                      }}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="size-guide"
                            checked={size === sizeKey}
                            onChange={() => {
                              if (sizes.includes(sizeKey)) {
                                setSize(sizeKey);
                              }
                            }}
                            className="w-4 h-4 text-gray-900 focus:ring-gray-900"
                            disabled={!sizes.includes(sizeKey)}
                          />
                          <span className="text-sm font-medium text-gray-900">{sizeKey}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{measurements.chest}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{measurements.toFitChest}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{measurements.shoulder}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{measurements.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-2 border-gray-900 text-gray-900 hover:bg-gray-50 rounded-none"
              onClick={() => {
                handleAddToCart();
                setSizeGuideOpen(false);
              }}
            >
              Add to Cart
            </Button>
            <Button
              className="flex-1 bg-gray-900 text-white hover:bg-gray-800 rounded-none"
              onClick={() => {
                handleBuyNow();
                setSizeGuideOpen(false);
              }}
            >
              Buy Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Product;
