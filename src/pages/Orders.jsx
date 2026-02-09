import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Package, CheckCircle2, Clock, XCircle, Truck, MapPin, Star, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { ordersAPI, reviewsAPI, getImageUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

const Orders = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({}); // { productId: { rating, comment, files } }
  const [submittingRatings, setSubmittingRatings] = useState({}); // { productId: true/false }

  useEffect(() => {
    // Wait for auth to finish loading before checking authentication
    if (authLoading) {
      return;
    }

    // If guest user and no orderId, redirect to tracking page
    if (!isAuthenticated && !orderId) {
      navigate("/tracking");
      return;
    }

    // If authenticated, load orders list
    if (isAuthenticated && !orderId) {
      loadOrders();
    }
  }, [isAuthenticated, authLoading, navigate, orderId]);

  useEffect(() => {
    if (orderId) {
      // If authenticated, use regular getOrder
      if (isAuthenticated) {
        loadSingleOrder(orderId);
      }
      // If guest user with orderId, redirect to tracking page
      else {
        navigate(`/tracking/${orderId}`);
      }
    }
  }, [orderId, isAuthenticated, navigate]);

  const loadSingleOrder = async (id) => {
    try {
      setLoading(true);
      const order = await ordersAPI.getOrder(id);
      setSelectedOrder(order.order || order);
    } catch (error) {
      console.error("Failed to load order:", error);
      toast({
        title: "Error",
        description: "Failed to load order details. Please try again.",
        variant: "destructive",
      });
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getOrders();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOrderDelivered = (order) => {
    return order?.status === 'delivered' || order?.tracking?.status === 'delivered';
  };

  const handleRatingChange = (productId, rating) => {
    setRatings(prev => ({
      ...prev,
      [productId]: {
        rating: rating,
        comment: prev[productId]?.comment || "",
        files: prev[productId]?.files || []
      }
    }));
  };

  const handleCommentChange = (productId, comment) => {
    setRatings(prev => ({
      ...prev,
      [productId]: {
        rating: prev[productId]?.rating || 0,
        comment: comment,
        files: prev[productId]?.files || []
      }
    }));
  };

  const handleFileSelect = (productId, e) => {
    const files = Array.from(e.target.files);
    setRatings(prev => ({
      ...prev,
      [productId]: {
        rating: prev[productId]?.rating || 0,
        comment: prev[productId]?.comment || "",
        files: files.slice(0, 5)
      }
    }));
  };

  const removeFile = (productId, index) => {
    setRatings(prev => {
      const newFiles = prev[productId]?.files?.filter((_, i) => i !== index) || [];
      return {
        ...prev,
        [productId]: {
          rating: prev[productId]?.rating || 0,
          comment: prev[productId]?.comment || "",
          files: newFiles
        }
      };
    });
  };

  const handleSubmitRating = async (productId, item, localComment = null) => {
    // Use localComment if provided, otherwise fall back to ratings state
    const ratingData = ratings[productId];
    const commentToSubmit = localComment !== null ? localComment : (ratingData?.comment || "");
    
    if (!ratingData || !ratingData.rating) {
      toast({
        title: "Rating required",
        description: "Please select a rating.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingRatings(prev => ({ ...prev, [productId]: true }));
    try {
      await reviewsAPI.addReview(
        productId,
        {
          rating: ratingData.rating,
          comment: commentToSubmit
        },
        ratingData.files || []
      );
      toast({
        title: "Rating submitted",
        description: "Thank you for your feedback! Your review will appear on the product page shortly.",
      });
      // Clear the rating form for this product
      setRatings(prev => {
        const newRatings = { ...prev };
        delete newRatings[productId];
        return newRatings;
      });
      // Note: Local state in ProductRatingSection will be cleared when component re-renders
      
      // Trigger a custom event to notify other components to refresh reviews
      window.dispatchEvent(new CustomEvent('reviewSubmitted', { detail: { productId } }));
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingRatings(prev => ({ ...prev, [productId]: false }));
    }
  };

  const ProductRatingSection = ({ item, productId }) => {
    // Use local state for textarea to prevent focus loss
    const textareaRef = useRef(null);
    const [localComment, setLocalComment] = useState(() => ratings[productId]?.comment || "");
    
    // Sync from parent only when productId changes (switching products) or when rating is cleared
    useEffect(() => {
      const parentComment = ratings[productId]?.comment || "";
      // If parent has no comment and we have one, clear it (rating was submitted)
      if (!parentComment && localComment) {
        setLocalComment("");
      } else if (parentComment && parentComment !== localComment && !localComment) {
        // Initialize from parent when switching products
        setLocalComment(parentComment);
      }
    }, [productId, ratings[productId]]); // When productId or parent rating changes
    
    // Maintain focus after state updates
    useEffect(() => {
      if (textareaRef.current && document.activeElement === textareaRef.current) {
        const cursorPosition = textareaRef.current.selectionStart;
        textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, [localComment]);
    
    const ratingData = useMemo(() => {
      return ratings[productId] || { rating: 0, comment: "", files: [] };
    }, [ratings, productId]);
    
    const isSubmitting = submittingRatings[productId] || false;
    const currentRating = ratingData.rating || 0;

    // Handle comment change with local state only
    const handleLocalCommentChange = (e) => {
      const value = e.target.value;
      setLocalComment(value);
    };
    
    // Sync to parent on blur to prevent focus loss during typing
    const handleBlur = () => {
      handleCommentChange(productId, localComment);
    };

    return (
      <div className="mt-4 p-3 sm:p-4 rounded-lg border border-purple-200 bg-purple-50/50 dark:bg-purple-900/20 overflow-hidden">
        <h3 className="text-sm font-semibold mb-3 text-purple-900 dark:text-purple-100">Rate this product</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(productId, star)}
                className="focus:outline-none flex-shrink-0"
                disabled={isSubmitting}
              >
                <Star
                  className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors ${
                    star <= currentRating
                      ? "fill-yellow-400 text-yellow-400 stroke-yellow-400"
                      : "fill-gray-200 text-gray-300 stroke-gray-300 hover:fill-yellow-200 hover:text-yellow-300"
                  }`}
                />
              </button>
            ))}
            {currentRating > 0 && (
              <span className="ml-2 text-sm text-purple-700 dark:text-purple-300 font-medium">
                {currentRating} out of 5
              </span>
            )}
          </div>
          <textarea
            ref={textareaRef}
            placeholder="Write your review (optional)..."
            value={localComment}
            onChange={handleLocalCommentChange}
            onBlur={handleBlur}
            className="w-full p-3 rounded-lg border border-purple-200 bg-white dark:bg-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-0"
            rows={3}
            disabled={isSubmitting}
          />
          <div className="flex items-center gap-2 flex-wrap">
            <label className="cursor-pointer flex-shrink-0">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(productId, e)}
                className="hidden"
                disabled={isSubmitting}
              />
              <span className="flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-200 bg-white dark:bg-gray-800 text-sm hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors">
                <Upload className="h-4 w-4" />
                Add Photos
              </span>
            </label>
            {ratingData.files && ratingData.files.length > 0 && (
              <div className="flex gap-2 flex-wrap min-w-0">
                {ratingData.files.map((file, index) => (
                  <div key={index} className="flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-gray-800 text-xs max-w-full">
                    <span className="truncate max-w-[80px] sm:max-w-[100px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(productId, index)}
                      className="text-red-500 hover:text-red-700 flex-shrink-0"
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button
            onClick={() => {
              // Sync local comment to parent before submitting
              handleCommentChange(productId, localComment);
              handleSubmitRating(productId, item, localComment);
            }}
            disabled={isSubmitting || currentRating === 0}
            className="w-full bg-black hover:bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            style={{ display: 'block' }}
          >
            {isSubmitting ? "Submitting..." : currentRating === 0 ? "Please select a rating" : "Submit Rating"}
          </Button>
        </div>
      </div>
    );
  };

  // Wait for auth to finish loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_70%)]">
        <div className="px-2 sm:px-4 lg:px-6 pb-4 sm:pb-8 lg:pb-12 pt-2">
          <Header />
        </div>
        <div className="px-2 sm:px-4 lg:px-6 py-6 sm:py-10">
          <div className="mx-auto max-w-6xl space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-[32px] border border-white/15 bg-[var(--card)]/95 p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_70%)]">
        <div className="px-2 sm:px-4 lg:px-6 pb-4 sm:pb-8 lg:pb-12 pt-2">
          <Header />
        </div>
        <div className="px-2 sm:px-4 lg:px-6 py-6 sm:py-10">
          <div className="mx-auto max-w-6xl space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-[32px] border border-white/15 bg-[var(--card)]/95 p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show single order detail if orderId is in URL
  if (orderId && selectedOrder) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_70%)]">
        <div className="px-2 sm:px-4 lg:px-6 pb-4 sm:pb-8 lg:pb-12 pt-2">
          <Header />
        </div>
        <div className="px-2 sm:px-4 lg:px-6 py-6 sm:py-10">
          <div className="mx-auto max-w-4xl space-y-6">
            <button
              className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] transition-all duration-200 bg-transparent hover:bg-purple-200 hover:shadow-sm active:bg-purple-300"
              onClick={() => navigate("/orders")}
            >
              <ArrowLeft className="h-4 w-4" /> 
            </button>

            <div className="rounded-[48px] border border-white/15 bg-[var(--card)]/95 p-6 sm:p-8 shadow-[var(--shadow-soft)] space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black mb-2">Order Details</h1>
                  <p className="text-muted-foreground">Order ID: {selectedOrder.orderId}</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                  <span className="font-semibold capitalize">{selectedOrder.status}</span>
                </div>
              </div>

              {/* Tracking Timeline */}
              {selectedOrder.tracking && (
                <div className="mb-6 rounded-lg border border-white/15 bg-background/70 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Tracking Status</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/tracking/${selectedOrder.orderId}`)}
                      className="rounded-full"
                    >
                      View Full Tracking
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {selectedOrder.tracking.updates?.slice(-3).map((update, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="rounded-full p-2 bg-primary/20 text-primary">
                            <Truck className="h-4 w-4" />
                          </div>
                          {index < selectedOrder.tracking.updates.length - 1 && (
                            <div className="w-0.5 h-full min-h-[40px] bg-primary/30" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-semibold text-sm capitalize">{update.status.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-muted-foreground mt-1">{update.message}</p>
                          {update.location && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {update.location}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(update.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedOrder.tracking.trackingNumber && (
                    <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-xs text-muted-foreground mb-1">Tracking Number</p>
                      <p className="font-semibold">{selectedOrder.tracking.trackingNumber}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2 overflow-hidden">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Order Items</h2>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item, index) => {
                      const productId = item.id || item.productId || item._id;
                      return (
                        <div key={index}>
                          <div className="flex gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border border-white/15 bg-background/70 overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm sm:text-base truncate">{item.name}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">Size {String(item.size).replace(/[\[\]"]/g, '').replace(/\\/g, '').trim()} × {item.quantity}</p>
                              <p className="text-xs sm:text-sm font-semibold mt-1">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                          {isOrderDelivered(selectedOrder) && productId && (
                            <ProductRatingSection item={item} productId={productId} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Shipping Address</h2>
                  <div className="p-4 rounded-lg border border-white/15 bg-background/70">
                    <p className="font-semibold">{selectedOrder.shippingAddress?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.shippingAddress?.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                    </p>
                    {selectedOrder.shippingAddress?.phone && (
                      <p className="text-sm text-muted-foreground mt-1">Phone: {selectedOrder.shippingAddress.phone}</p>
                    )}
                  </div>

                  {/* Customization Details */}
                  {selectedOrder.customDesign && (selectedOrder.customDesign.instructions || selectedOrder.customDesign.referenceLinks || (selectedOrder.customDesign.files && selectedOrder.customDesign.files.length > 0)) && (
                    <div className="space-y-4 pt-4 border-t">
                      <h2 className="text-lg font-semibold">Customization Details</h2>
                      <div className="p-4 rounded-lg border border-white/15 bg-background/70 space-y-3">
                        {selectedOrder.customDesign.instructions && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Instructions</p>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{selectedOrder.customDesign.instructions}</p>
                          </div>
                        )}
                        {selectedOrder.customDesign.referenceLinks && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Reference Links</p>
                            <p className="text-sm text-foreground break-all">{selectedOrder.customDesign.referenceLinks}</p>
                          </div>
                        )}
                        {selectedOrder.customDesign.files && selectedOrder.customDesign.files.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Uploaded Files</p>
                            <div className="space-y-2">
                              {selectedOrder.customDesign.files.map((file, index) => {
                                // Handle both string paths and file objects
                                const filePath = typeof file === 'string' ? file : (file.url || file.path || file);
                                const fileName = typeof file === 'string' 
                                  ? file.split('/').pop() || `File ${index + 1}`
                                  : (file?.name || file?.originalName || file?.filename || `File ${index + 1}`);
                                
                                // Validate and get file URL safely
                                let fileUrl = '';
                                if (typeof file === 'string') {
                                  fileUrl = filePath ? getImageUrl(filePath) : '';
                                } else {
                                  fileUrl = file?.url || (file?.path ? getImageUrl(file.path) : '');
                                }
                                
                                // Skip invalid URLs
                                if (!fileUrl || fileUrl === 'https://via.placeholder.com/500' || fileUrl === '/placeholder.svg' || fileUrl.includes('data:;base64,=')) {
                                  console.warn('Invalid file URL for order:', order.orderId, 'file:', file);
                                  return null;
                                }
                                
                                return (
                                  <div key={index} className="flex items-center gap-2 p-2 rounded border border-white/10 bg-background/50 hover:bg-background/70 transition-colors">
                                    <Upload className="h-4 w-4 text-primary flex-shrink-0" />
                                    <span className="text-sm text-foreground truncate flex-1" title={fileName}>{fileName}</span>
                                    <a
                                      href={fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                      className="text-xs text-primary hover:underline flex-shrink-0 px-2 py-1 rounded hover:bg-primary/10 transition-colors"
                                    >
                                      Download
                                    </a>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span className="font-semibold">₹{selectedOrder.subtotal?.toLocaleString('en-IN') || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span className="font-semibold">₹{selectedOrder.shipping?.toLocaleString('en-IN') || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span className="font-semibold">₹{selectedOrder.tax?.toLocaleString('en-IN') || 0}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                      <span>Total</span>
                      <span>₹{selectedOrder.total?.toLocaleString('en-IN') || 0}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Order Date: {formatDate(selectedOrder.createdAt)}</p>
                    {selectedOrder.payment?.paidAt && (
                      <p className="text-sm text-muted-foreground mt-1">Paid On: {formatDate(selectedOrder.payment.paidAt)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show orders list
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_70%)]">
      <div className="px-2 sm:px-4 lg:px-6 py-6 sm:py-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <br/>
          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] transition-all duration-200 bg-transparent hover:bg-purple-200 hover:shadow-sm active:bg-purple-300"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" /> 
            </button>
            <h1 className="text-2xl sm:text-3xl font-black">My Orders</h1>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-[48px] border border-white/15 bg-[var(--card)]/95 p-12 shadow-[var(--shadow-soft)] text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">Start shopping to see your orders here!</p>
              <Button
                className="rounded-full bg-foreground px-8 py-6 text-sm font-semibold uppercase tracking-[0.4em] text-background"
                onClick={() => navigate("/")}
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-[32px] border border-white/15 bg-[var(--card)]/95 p-4 sm:p-6 shadow-[var(--shadow-soft)] cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                  onClick={() => navigate(`/orders/${order.orderId}`)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-semibold truncate">Order #{order.orderId}</h3>
                        <div className={`flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full border text-xs flex-shrink-0 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="font-semibold capitalize">{order.status}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                      <div className="flex flex-wrap gap-2 overflow-hidden">
                        {order.items?.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center gap-2 min-w-0 max-w-full">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-medium truncate">{item.name}</p>
                              <p className="text-xs text-muted-foreground">Size {String(item.size).replace(/[\[\]"]/g, '').replace(/\\/g, '').trim()} × {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <p className="text-xs sm:text-sm text-muted-foreground self-center">
                            +{order.items.length - 3} more items
                          </p>
                        )}
                      </div>
                      {isOrderDelivered(order) && (
                        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full border-purple-300 text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/orders/${order.orderId}`);
                            }}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Rate your product
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="text-right space-y-2 flex-shrink-0">
                      <p className="text-base sm:text-lg font-bold">₹{order.total?.toLocaleString('en-IN') || 0}</p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs sm:text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tracking/${order.orderId}`);
                          }}
                        >
                          Track Order
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs sm:text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/orders/${order.orderId}`);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;

