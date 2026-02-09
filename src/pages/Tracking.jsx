import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, CheckCircle2, Clock, Truck, MapPin, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { ordersAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Tracking = () => {
  const { orderId: urlOrderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestOrderId, setGuestOrderId] = useState(urlOrderId || '');
  const [guestPhone, setGuestPhone] = useState('');
  const [trackingGuest, setTrackingGuest] = useState(false);

  useEffect(() => {
    // If authenticated and orderId in URL, load order
    if (isAuthenticated && urlOrderId) {
      loadOrder(urlOrderId);
      // Poll for updates every 30 seconds
      const interval = setInterval(() => loadOrder(urlOrderId), 30000);
      return () => clearInterval(interval);
    } else if (!isAuthenticated && urlOrderId) {
      // Guest user with orderId in URL - show form to enter phone
      setTrackingGuest(true);
      setLoading(false);
    } else if (!isAuthenticated) {
      // Guest user without orderId - show form
      setTrackingGuest(true);
      setLoading(false);
    }
  }, [urlOrderId, isAuthenticated]);

  const loadOrder = async (id) => {
    try {
      setLoading(true);
      const data = await ordersAPI.getOrder(id);
      setOrder(data.order || data);
    } catch (error) {
      console.error("Failed to load order:", error);
      toast({
        title: "Error",
        description: "Failed to load order details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const trackGuestOrder = async () => {
    if (!guestOrderId || !guestPhone) {
      toast({
        title: "Required fields",
        description: "Please enter both Order ID and phone number.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const data = await ordersAPI.trackOrder(guestOrderId, guestPhone);
      setOrder(data.order || data);
      setTrackingGuest(false);
      // Update URL without navigation
      window.history.replaceState({}, '', `/tracking/${guestOrderId}`);
      // Poll for updates every 30 seconds
      const interval = setInterval(() => {
        ordersAPI.trackOrder(guestOrderId, guestPhone)
          .then(data => setOrder(data.order || data))
          .catch(err => console.error('Failed to update order:', err));
      }, 30000);
      return () => clearInterval(interval);
    } catch (error) {
      console.error("Failed to track order:", error);
      toast({
        title: "Order not found",
        description: error.message || "Please check your Order ID and phone number.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrackingStatusInfo = (status) => {
    const statusMap = {
      'order_placed': { label: 'Order Placed', icon: Package, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
      'confirmed': { label: 'Confirmed', icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' },
      'processing': { label: 'Processing', icon: Loader2, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
      'shipped': { label: 'Shipped', icon: Truck, color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
      'in_transit': { label: 'In Transit', icon: Truck, color: 'text-indigo-500', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30' },
      'out_for_delivery': { label: 'Out for Delivery', icon: MapPin, color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
      'delivered': { label: 'Delivered', icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-200 dark:bg-green-800/50' }
    };
    return statusMap[status] || statusMap['order_placed'];
  };

  const trackingSteps = [
    'order_placed',
    'confirmed',
    'processing',
    'shipped',
    'in_transit',
    'out_for_delivery',
    'delivered'
  ];

  const getCurrentStepIndex = () => {
    if (!order?.tracking?.status) return 0;
    return trackingSteps.indexOf(order.tracking.status);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show guest order tracking form
  if (trackingGuest || (!order && !isAuthenticated && !loading)) {
    // Check if orderId is in URL (from successful payment)
    const isFromCheckout = urlOrderId && urlOrderId.length > 0;
    
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 sm:px-6 lg:px-16 max-w-2xl mx-auto py-8">
          <div className="rounded-[32px] border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
            {isFromCheckout ? (
              <>
                <div className="text-center space-y-4 mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black mb-2">Order Placed Successfully!</h1>
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-2">Your Order ID</p>
                    <p className="text-2xl font-bold text-primary">{urlOrderId}</p>
                  </div>
                  <p className="text-muted-foreground">
                    We've sent your Order ID to your email. Enter your phone number below to track your order.
                  </p>
                </div>
              </>
            ) : (
              <div>
                <h1 className="text-2xl sm:text-3xl font-black mb-2">Track Your Order</h1>
                <p className="text-muted-foreground">Enter your Order ID and phone number to track your order</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Order ID</label>
                <Input
                  type="text"
                  placeholder="e.g., ODR-001"
                  value={guestOrderId}
                  onChange={(e) => setGuestOrderId(e.target.value)}
                  className="w-full"
                  disabled={isFromCheckout}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="+91 1234567890"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">Enter the phone number used during checkout</p>
              </div>
              <Button
                onClick={trackGuestOrder}
                disabled={loading || !guestOrderId || !guestPhone}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? "Tracking..." : "Track Order"}
              </Button>
            </div>

            {isAuthenticated && (
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => navigate("/orders")}
                  className="w-full"
                >
                  View My Orders
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 sm:px-6 lg:px-16 max-w-4xl mx-auto py-8">
          <Skeleton className="h-10 w-32 mb-6" />
          <div className="rounded-[24px] sm:rounded-[32px] border border-border bg-card p-6 sm:p-8 space-y-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-64 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Order not found</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();
  const tracking = order.tracking || { status: 'order_placed', updates: [] };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_60%)]">
      <div className="px-4 sm:px-6 lg:px-16 max-w-4xl mx-auto pt-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/orders")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="rounded-[24px] sm:rounded-[32px] border border-white/15 bg-[var(--card)]/95 p-6 sm:p-8 shadow-[var(--shadow-soft)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black mb-2">Order Tracking</h1>
                <p className="text-muted-foreground">Order ID: {order.orderId}</p>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${getTrackingStatusInfo(tracking.status).bgColor} ${getTrackingStatusInfo(tracking.status).color}`}>
                {(() => {
                  const Icon = getTrackingStatusInfo(tracking.status).icon;
                  return <Icon className="h-5 w-5" />;
                })()}
                <span>{getTrackingStatusInfo(tracking.status).label}</span>
              </div>
            </div>

            {tracking.trackingNumber && (
              <div className="mb-4 p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
                <p className="text-lg font-semibold">{tracking.trackingNumber}</p>
              </div>
            )}

            {tracking.estimatedDelivery && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
                <p className="text-lg font-semibold text-primary">
                  {formatDate(tracking.estimatedDelivery)}
                </p>
              </div>
            )}
          </div>

          {/* Tracking Timeline */}
          <div className="rounded-[24px] sm:rounded-[32px] border border-white/15 bg-[var(--card)]/95 p-6 sm:p-8 shadow-[var(--shadow-soft)]">
            <h2 className="text-xl sm:text-2xl font-black mb-6">Tracking Timeline</h2>
            
            <div className="space-y-6">
              {trackingSteps.map((step, index) => {
                const stepInfo = getTrackingStatusInfo(step);
                const Icon = stepInfo.icon;
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const update = tracking.updates?.find(u => u.status === step);

                return (
                  <div key={step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`rounded-full p-3 ${isCompleted ? stepInfo.bgColor : 'bg-muted'} ${isCompleted ? stepInfo.color : 'text-muted-foreground'}`}>
                        <Icon className={`h-5 w-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                      </div>
                      {index < trackingSteps.length - 1 && (
                        <div className={`w-0.5 h-full min-h-[60px] ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={`font-semibold text-lg ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {stepInfo.label}
                          </p>
                          {update && (
                            <>
                              <p className="text-sm text-muted-foreground mt-1">{update.message}</p>
                              {update.location && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {update.location}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                        {update && (
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(update.timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details */}
          <div className="rounded-[24px] sm:rounded-[32px] border border-white/15 bg-[var(--card)]/95 p-6 sm:p-8 shadow-[var(--shadow-soft)]">
            <h2 className="text-xl sm:text-2xl font-black mb-6">Order Details</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Shipping Address</p>
                <p className="font-semibold">{order.shippingAddress?.name}</p>
                <p className="text-sm text-muted-foreground">{order.shippingAddress?.address}</p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
                </p>
                <p className="text-sm text-muted-foreground">{order.shippingAddress?.phone}</p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">Items</p>
                <div className="space-y-2">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Size: {item.size} × {item.quantity}</p>
                      </div>
                      <p className="font-semibold flex-shrink-0">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">₹{order.subtotal || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold">₹{order.shipping || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-semibold">₹{order.tax || 0}</span>
                </div>
                <div className="flex justify-between text-lg font-black border-t pt-2">
                  <span>Total</span>
                  <span>₹{order.total || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;

