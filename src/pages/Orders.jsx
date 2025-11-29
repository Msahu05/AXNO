import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Package, CheckCircle2, Clock, XCircle, Truck, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/auth-context";
import { ordersAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Orders = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent("/orders")}`);
      return;
    }

    loadOrders();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (orderId) {
      loadSingleOrder(orderId);
    }
  }, [orderId]);

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

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_70%)]">
        <div className="px-2 sm:px-4 lg:px-6 pb-4 sm:pb-8 lg:pb-12 pt-4 sm:pt-6">
          <Header />
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Show single order detail if orderId is in URL
  if (orderId && selectedOrder) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_70%)]">
        <div className="px-2 sm:px-4 lg:px-6 pb-4 sm:pb-8 lg:pb-12 pt-4 sm:pt-6">
          <Header />
        </div>
        <div className="px-2 sm:px-4 lg:px-6 py-6 sm:py-10">
          <div className="mx-auto max-w-4xl space-y-6">
            <button
              className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] transition-all duration-200 bg-transparent hover:bg-purple-200 hover:shadow-sm active:bg-purple-300"
              onClick={() => navigate("/orders")}
            >
              <ArrowLeft className="h-4 w-4" /> Back to Orders
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

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Order Items</h2>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex gap-4 p-4 rounded-lg border border-white/15 bg-background/70">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Size {item.size} × {item.quantity}</p>
                          <p className="text-sm font-semibold mt-1">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
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
      <div className="px-2 sm:px-4 lg:px-6 pb-4 sm:pb-8 lg:pb-12 pt-4 sm:pt-6">
        <Header />
      </div>
      <div className="px-2 sm:px-4 lg:px-6 py-6 sm:py-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] transition-all duration-200 bg-transparent hover:bg-purple-200 hover:shadow-sm active:bg-purple-300"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" /> Back
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
                  className="rounded-[32px] border border-white/15 bg-[var(--card)]/95 p-6 shadow-[var(--shadow-soft)] cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/orders/${order.orderId}`)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">Order #{order.orderId}</h3>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="font-semibold capitalize">{order.status}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {order.items?.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div>
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">Size {item.size} × {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <p className="text-sm text-muted-foreground self-center">
                            +{order.items.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="text-lg font-bold">₹{order.total?.toLocaleString('en-IN') || 0}</p>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
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
                          className="rounded-full"
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

