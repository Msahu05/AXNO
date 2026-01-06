import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { ordersAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PromoBanner = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isClosed, setIsClosed] = useState(false);
  const [hasOrders, setHasOrders] = useState(false);
  const [checkingOrders, setCheckingOrders] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  // Check if banner was previously closed
  useEffect(() => {
    const closed = localStorage.getItem('promoBannerClosed');
    if (closed === 'true') {
      setIsClosed(true);
    }
  }, []);

  // Check if user has orders
  useEffect(() => {
    const checkUserOrders = async () => {
      if (!isAuthenticated || authLoading) {
        setShouldShow(!isClosed);
        return;
      }

      setCheckingOrders(true);
      try {
        const response = await ordersAPI.getOrders();
        const orders = response.orders || [];
        const hasAnyOrders = orders.length > 0;
        setHasOrders(hasAnyOrders);
        // Show banner if user has no orders and banner is not closed
        setShouldShow(!hasAnyOrders && !isClosed);
      } catch (error) {
        console.error('Error checking orders:', error);
        // On error, show banner if not closed (to be safe)
        setShouldShow(!isClosed);
      } finally {
        setCheckingOrders(false);
      }
    };

    checkUserOrders();
  }, [isAuthenticated, authLoading, isClosed]);

  // Show banner for logged out users if not closed
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      setShouldShow(!isClosed);
    }
  }, [isAuthenticated, authLoading, isClosed]);

  const handleClose = () => {
    setIsClosed(true);
    setShouldShow(false);
    localStorage.setItem('promoBannerClosed', 'true');
    // Remove data attribute and padding from body
    document.body.removeAttribute('data-banner-visible');
    document.body.style.paddingBottom = '';
  };

  // Add/remove data attribute to body when banner is visible for content padding
  useEffect(() => {
    if (shouldShow && !checkingOrders) {
      document.body.setAttribute('data-banner-visible', 'true');
      // Add padding to body to account for banner height
      document.body.style.paddingBottom = '48px';
    } else {
      document.body.removeAttribute('data-banner-visible');
      document.body.style.paddingBottom = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.removeAttribute('data-banner-visible');
      document.body.style.paddingBottom = '';
    };
  }, [shouldShow, checkingOrders]);

  // Don't show if checking orders or if shouldn't show
  if (checkingOrders || !shouldShow) {
    return null;
  }

  return (
    <div className={cn(
      "fixed left-0 right-0 bottom-0 z-[100] bg-primary text-primary-foreground",
      "flex items-center justify-center px-4 py-2 sm:py-3",
      "shadow-lg"
    )}>
      <div className="container mx-auto flex items-center justify-center gap-2 sm:gap-3 text-center">
        <p className="text-xs sm:text-sm font-medium">
          <span className="font-bold">15% OFF</span> for first 20 customers, use code{' '}
          <span className="font-bold bg-primary-foreground/20 px-1.5 py-0.5 rounded">2026</span> to redeem
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 sm:right-4 h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground hover:bg-primary-foreground/20"
        onClick={handleClose}
        aria-label="Close banner"
      >
        <X className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
};

export default PromoBanner;

