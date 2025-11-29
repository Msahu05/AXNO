import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CreditCard, ShieldCheck, Loader2, CheckCircle2, XCircle, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { paymentsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { clearCart } = useCart();
  const { toast } = useToast();

  const [orderData, setOrderData] = useState(null);
  const [designFiles, setDesignFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending', 'processing', 'success', 'failed'

  // Load order data from location state or sessionStorage
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent("/payment")}`);
      return;
    }

    let data = null;
    let files = [];

    // Try to get data from location state first
    if (location.state?.orderData) {
      data = location.state.orderData;
      files = location.state.designFiles || [];
    } else {
      // Try to get from sessionStorage
      try {
        const stored = sessionStorage.getItem('pendingOrder');
        if (stored) {
          data = JSON.parse(stored);
          console.log('Loaded order data from sessionStorage:', data);
        }
        const storedFiles = sessionStorage.getItem('pendingOrderFiles');
        if (storedFiles) {
          // Files can't be stored in sessionStorage, so we'll need to handle this differently
          // For now, files will be empty if coming from sessionStorage
        }
      } catch (error) {
        console.error('Error parsing order data from sessionStorage:', error);
      }
    }

    if (!data) {
      toast({
        title: "No order data found",
        description: "Please complete checkout first",
        variant: "destructive",
      });
      navigate("/checkout");
      return;
    }

    // Validate that orderData has required fields
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      console.error('Invalid order data - missing items:', {
        hasItems: !!data.items,
        isArray: Array.isArray(data.items),
        itemsLength: data.items?.length,
        fullData: data
      });
      toast({
        title: "Invalid order data",
        description: "Order items are missing. Please go back to checkout.",
        variant: "destructive",
      });
      navigate("/checkout");
      return;
    }

    // Ensure items array is properly formatted
    if (data.items && Array.isArray(data.items)) {
      data.items = data.items.filter(item => item && item.productId && item.name);
      if (data.items.length === 0) {
        console.error('All items filtered out - invalid item structure:', data.items);
        toast({
          title: "Invalid order data",
          description: "Order items are invalid. Please go back to checkout.",
          variant: "destructive",
        });
        navigate("/checkout");
        return;
      }
    }

    console.log('Setting order data with items:', data.items.length);
    setOrderData(data);
    setDesignFiles(files);
  }, [isAuthenticated, location, navigate, toast]);

  const handlePayNow = async () => {
    if (!orderData) {
      setError('Order data is missing');
      return;
    }

    // Validate order data
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      setError('Order items are required');
      toast({
        title: "Payment Error",
        description: "Order items are required. Please go back to checkout.",
        variant: "destructive",
      });
      return;
    }

    if (!orderData.shippingAddress) {
      setError('Shipping address is required');
      toast({
        title: "Payment Error",
        description: "Shipping address is missing. Please go back to checkout.",
        variant: "destructive",
      });
      return;
    }

    if (!orderData.totals) {
      setError('Order totals are required');
      toast({
        title: "Payment Error",
        description: "Order totals are missing. Please go back to checkout.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setPaymentStatus('processing');

    try {
      // Generate a temporary order ID for payment
      const tempOrderId = `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      // Simulate payment (test mode)
      const paymentResult = await paymentsAPI.testPayment(
        orderData.totals.total || 0,
        tempOrderId,
        'success' // Always success in test mode
      );

      if (paymentResult.success && paymentResult.paymentStatus === 'PAID') {
        setPaymentStatus('success');

        // Verify payment
        const verifyResult = await paymentsAPI.verifyPayment(
          paymentResult.orderId,
          paymentResult.transactionId
        );

        if (verifyResult.success) {
          // Create order - ensure all required data is present
          const orderDataToSend = {
            items: orderData.items || [],
            shippingAddress: orderData.shippingAddress || {},
            customDesign: orderData.customDesign || {},
            totals: orderData.totals || {}
          };

          // Final validation before sending
          if (!orderDataToSend.items || orderDataToSend.items.length === 0) {
            console.error('Order items are empty before sending to API:', orderDataToSend);
            throw new Error('Order items are required');
          }

          console.log('Sending order data to confirmPayment:', {
            itemsCount: orderDataToSend.items.length,
            hasShippingAddress: !!orderDataToSend.shippingAddress,
            hasTotals: !!orderDataToSend.totals
          });

          const result = await paymentsAPI.confirmPayment(
            paymentResult.orderId,
            paymentResult.transactionId,
            orderDataToSend,
            designFiles
          );

          if (result.success) {
            setSuccess(true);
            clearCart();
            sessionStorage.removeItem('pendingOrder');
            sessionStorage.removeItem('pendingOrderFiles');

            toast({
              title: "Payment Successful!",
              description: `Order ${result.order.orderId} has been placed successfully.`,
            });

            // Redirect to orders page after 2 seconds
            setTimeout(() => {
              navigate(`/orders/${result.order.orderId}`);
            }, 2000);
          } else {
            throw new Error(result.error || 'Failed to create order');
          }
        } else {
          throw new Error(verifyResult.error || 'Payment verification failed');
        }
      } else {
        setPaymentStatus('failed');
        setError(paymentResult.message || 'Payment failed');
        toast({
          title: "Payment Failed",
          description: paymentResult.message || 'Payment failed. Please try again.',
          variant: "destructive",
        });
      }
    } catch (err) {
      setPaymentStatus('failed');
      const errorMessage = err.message || 'Payment processing failed';
      setError(errorMessage);
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_70%)]">
        <div className="px-4 sm:px-6 pb-8 sm:pb-12 pt-6">
          <Header />
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const subtotal = orderData?.totals?.subtotal || 0;
  const shipping = orderData?.totals?.shipping || 0;
  const tax = orderData?.totals?.tax || 0;
  const total = orderData?.totals?.total || 0;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_70%)]">
      <div className="px-2 sm:px-4 lg:px-6 pb-4 sm:pb-8 lg:pb-12 pt-4 sm:pt-6">
        <Header />
      </div>
      <div className="px-2 sm:px-4 lg:px-6 py-6 sm:py-10">
        <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
            <button className="hover:text-gray-900 cursor-pointer" onClick={() => navigate("/cart")}>Cart</button>
            <span>/</span>
            <button className="hover:text-gray-900 cursor-pointer" onClick={() => navigate("/checkout")}>Shipping</button>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Payment</span>
          </div>

          <div className="flex items-center justify-between">
            <button
              className="flex items-center gap-1 sm:gap-2 rounded-full px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] transition-all duration-200 bg-transparent hover:bg-purple-200 hover:shadow-sm active:bg-purple-300"
              onClick={() => navigate("/checkout")}
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Back</span>
            </button>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] sm:tracking-[0.6em] text-muted-foreground">Payment</p>
          </div>

          {success ? (
            <div className="rounded-[48px] border border-white/15 bg-[var(--card)]/95 p-8 shadow-[var(--shadow-soft)] text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold">Payment Successful!</h2>
              <p className="text-muted-foreground">Your order has been placed successfully. Redirecting...</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              {/* Payment Info */}
              <div className="rounded-[48px] border border-white/15 bg-[var(--card)]/95 p-8 shadow-[var(--shadow-soft)] space-y-6">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.4em]">Test Payment Mode</p>
                    <p className="text-sm text-muted-foreground">Simulated payment for development</p>
                  </div>
                </div>

                {/* Test Mode Banner */}
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 flex items-start gap-3">
                  <TestTube className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-900">Test Mode Active</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      This is a simulated payment. No real money will be charged. Perfect for testing the complete order flow!
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {paymentStatus === 'processing' && (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-2 text-blue-600">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm">Processing payment...</span>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-600">
                      <XCircle className="h-5 w-5" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  <div className="rounded-lg border border-white/20 bg-background/70 p-4">
                    <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground mb-2">Security</p>
                    <p className="text-sm flex items-center gap-2">
                      <ShieldCheck className="text-primary h-4 w-4" />
                      In production, your payment will be secured by a real payment gateway.
                    </p>
                  </div>

                  <Button
                    onClick={handlePayNow}
                    disabled={loading || processing || paymentStatus === 'processing'}
                    className="w-full rounded-full bg-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.4em] text-background"
                  >
                    {loading || processing || paymentStatus === 'processing' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      `Complete Payment (Test) - ₹${total.toLocaleString('en-IN')}`
                    )}
                  </Button>
                </div>

                {/* Info Box */}
                <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 text-xs">
                  <p className="font-semibold mb-2">How Test Mode Works:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Click "Complete Payment" to simulate a successful payment</li>
                    <li>• Payment is processed instantly (simulated)</li>
                    <li>• Order is created automatically after payment</li>
                    <li>• No real money is charged</li>
                    <li>• Perfect for testing the complete order flow</li>
                  </ul>
                </div>
              </div>

              {/* Order Summary */}
              <div className="rounded-[48px] border border-white/15 bg-[var(--card)]/95 p-8 shadow-[var(--shadow-soft)] h-fit space-y-6">
                <h2 className="text-xl font-semibold">Order Summary</h2>

                <div className="space-y-4">
                  {orderData?.items?.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Size {item.size} × {item.quantity}
                        </p>
                        <p className="text-sm font-semibold mt-1">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="font-semibold">₹{shipping.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span className="font-semibold">₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold mb-2">Shipping Address</p>
                  <p className="text-sm text-muted-foreground">
                    {orderData?.shippingAddress?.name}<br />
                    {orderData?.shippingAddress?.address}<br />
                    {orderData?.shippingAddress?.city}, {orderData?.shippingAddress?.state} {orderData?.shippingAddress?.pincode}<br />
                    {orderData?.shippingAddress?.phone}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;
