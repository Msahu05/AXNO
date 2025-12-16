import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { adminAPI, getImageUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, XCircle, Package, Truck, MapPin, DollarSign, User, Mail, Phone, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

const OrderManagement = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState(null);
  
  // Form states
  const [orderStatus, setOrderStatus] = useState('');
  const [trackingStatus, setTrackingStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingMessage, setTrackingMessage] = useState('');
  const [trackingLocation, setTrackingLocation] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=/admin/orders/' + orderId);
      return;
    }

    if (!user?.isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    loadOrder();
  }, [orderId, isAuthenticated, user]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getOrder(orderId);
      const orderData = data.order || data;
      setOrder(orderData);
      setOrderStatus(orderData.status || 'pending');
      setTrackingStatus(orderData.tracking?.status || 'order_placed');
      setTrackingNumber(orderData.tracking?.trackingNumber || '');
      setShippingAddress(orderData.shippingAddress || {
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: ''
      });
    } catch (error) {
      console.error('Failed to load order:', error);
      toast({
        title: 'Error',
        description: 'Failed to load order details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setSaving(true);
      await adminAPI.updateOrderStatus(orderId, orderStatus);
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
      loadOrder();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTracking = async () => {
    if (!trackingStatus) {
      toast({
        title: 'Error',
        description: 'Please select a tracking status',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      await adminAPI.updateTrackingStatus(orderId, trackingStatus, trackingNumber, trackingMessage, trackingLocation);
      toast({
        title: 'Success',
        description: 'Tracking status updated successfully',
      });
      setTrackingMessage('');
      setTrackingLocation('');
      loadOrder();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update tracking status',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAddress = async () => {
    try {
      setSaving(true);
      await adminAPI.updateOrder(orderId, { shippingAddress });
      toast({
        title: 'Success',
        description: 'Shipping address updated successfully',
      });
      loadOrder();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update address',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_60%)]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Package className="h-8 w-8 animate-pulse mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_60%)]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Order not found</p>
            <Button onClick={() => navigate('/admin')} className="mt-4">
              Back to Admin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_60%)]">
      <Header />
      <div className="px-4 sm:px-6 lg:px-16 py-6 sm:py-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">Order Management</h1>
              <p className="text-muted-foreground">Order ID: {order.orderId}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Order Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <Button
                    onClick={handleUpdateStatus}
                    disabled={saving || orderStatus === order.status}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Update Status
                  </Button>
                </CardContent>
              </Card>

              {/* Tracking Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Tracking Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tracking Status</label>
                    <select
                      value={trackingStatus}
                      onChange={(e) => setTrackingStatus(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md"
                    >
                      <option value="order_placed">Order Placed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="in_transit">In Transit</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tracking Number</label>
                    <Input
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message (Optional)</label>
                    <Input
                      value={trackingMessage}
                      onChange={(e) => setTrackingMessage(e.target.value)}
                      placeholder="Custom message"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Location (Optional)</label>
                    <Input
                      value={trackingLocation}
                      onChange={(e) => setTrackingLocation(e.target.value)}
                      placeholder="Current location"
                    />
                  </div>
                  <Button
                    onClick={handleUpdateTracking}
                    disabled={saving || !trackingStatus}
                    className="w-full"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Update Tracking
                  </Button>
                  
                  {/* Current Tracking Info */}
                  {order.tracking && (
                    <div className="mt-4 p-4 rounded-lg border bg-muted/50">
                      <p className="font-semibold mb-2">Current: {order.tracking.status?.replace(/_/g, ' ').toUpperCase()}</p>
                      {order.tracking.trackingNumber && (
                        <p className="text-sm text-muted-foreground">Tracking: {order.tracking.trackingNumber}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input
                      value={shippingAddress.name}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <Input
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      <Input
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">State</label>
                      <Input
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Pincode</label>
                      <Input
                        value={shippingAddress.pincode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <Input
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleUpdateAddress}
                    disabled={saving}
                    className="w-full"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Update Address
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{order.userId?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{order.userId?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{order.userId?.phone || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex gap-4 p-3 border rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Size: {String(item.size).replace(/[\[\]"]/g, '').replace(/\\/g, '').trim()} × {item.quantity}</p>
                          <p className="text-sm font-semibold mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Customization Details */}
              {order.customDesign && (order.customDesign.instructions || order.customDesign.referenceLinks || (order.customDesign.files && order.customDesign.files.length > 0)) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Customization Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {order.customDesign.instructions && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Instructions</label>
                        <div className="p-3 rounded-lg border bg-muted/50">
                          <p className="text-sm whitespace-pre-wrap">{order.customDesign.instructions}</p>
                        </div>
                      </div>
                    )}
                    {order.customDesign.referenceLinks && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Reference Links</label>
                        <div className="p-3 rounded-lg border bg-muted/50">
                          <p className="text-sm break-all">{order.customDesign.referenceLinks}</p>
                        </div>
                      </div>
                    )}
                    {order.customDesign.files && order.customDesign.files.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Uploaded Files</label>
                        <div className="space-y-2">
                          {order.customDesign.files.map((file, index) => {
                            // Handle both string paths and file objects
                            const filePath = typeof file === 'string' ? file : (file.url || file.path || file);
                            const fileName = typeof file === 'string' 
                              ? file.split('/').pop() || `File ${index + 1}`
                              : (file.name || file.originalName || file.filename || `File ${index + 1}`);
                            const fileUrl = typeof file === 'string' 
                              ? getImageUrl(filePath)
                              : (file.url || getImageUrl(file.path || file));
                            
                            return (
                              <div key={index} className="flex items-center gap-2 p-2 rounded border bg-muted/50 hover:bg-muted transition-colors">
                                <Upload className="h-4 w-4 text-primary flex-shrink-0" />
                                <span className="text-sm truncate flex-1" title={fileName}>{fileName}</span>
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
                  </CardContent>
                </Card>
              )}

              {/* Payment Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className={order.payment?.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}>
                      {order.payment?.status || 'pending'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Method:</span>
                    <span>{order.payment?.method || 'N/A'}</span>
                  </div>
                  {order.payment?.transactionId && (
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>
                      <span className="text-xs font-mono">{order.payment.transactionId}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Amount:</span>
                    <span>₹{order.payment?.amount?.toLocaleString() || order.total?.toLocaleString() || 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{order.subtotal?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>₹{order.shipping?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>₹{order.tax?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{order.total?.toLocaleString() || 0}</span>
                  </div>
                  <div className="pt-2 border-t text-sm text-muted-foreground">
                    <p>Order Date: {new Date(order.createdAt).toLocaleString()}</p>
                    {order.updatedAt && (
                      <p>Last Updated: {new Date(order.updatedAt).toLocaleString()}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;

