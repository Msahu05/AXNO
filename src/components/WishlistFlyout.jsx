import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Heart } from "lucide-react";
import { useWishlist } from "@/contexts/wishlist-context";
import { Button } from "@/components/ui/button";

const WishlistFlyout = ({ isOpen, onClose }) => {
  const { items } = useWishlist();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const latestItems = items.slice(-3).reverse();

  if (!isOpen) return null;

  const handleViewWishlist = () => {
    onClose();
    navigate("/wishlist");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Flyout Panel */}
      <div
        className={`fixed ${
          isMobile
            ? "bottom-0 left-0 right-0 rounded-t-2xl"
            : "top-16 right-4 w-96 rounded-2xl"
        } bg-white dark:bg-[#2a2538] border border-[rgba(47,37,64,0.08)] dark:border-white/20 shadow-2xl z-50 max-h-[80vh] flex flex-col`}
        role="dialog"
        aria-modal="true"
        aria-label="Wishlist"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[rgba(47,37,64,0.08)] dark:border-white/10">
          <h3 className="font-heading text-lg font-semibold text-[#2f2540] dark:text-white">
            Wishlist
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-[#f6f1f8] dark:hover:bg-white/10 transition-colors"
            aria-label="Close wishlist"
          >
            <X className="h-5 w-5 text-[#8b8794] dark:text-white/70" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {latestItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Heart className="h-12 w-12 text-[#8b8794] dark:text-white/40 mb-4" />
              <p className="text-sm text-[#8b8794] dark:text-white/70 font-body">
                Your wishlist is empty
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {latestItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-xl hover:bg-[#f6f1f8] dark:hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => {
                    onClose();
                    navigate(`/product/${item.id}`);
                  }}
                >
                  <img
                    src={item.image || item.gallery?.[0]}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-body text-sm font-medium text-[#2f2540] dark:text-white truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-[#8b8794] dark:text-white/70 font-body">
                      {item.category}
                    </p>
                    <p className="text-sm font-semibold text-[#2f2540] dark:text-white mt-1 font-body">
                      ₹{item.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {latestItems.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-[rgba(47,37,64,0.08)] dark:border-white/10">
            <Button
              onClick={handleViewWishlist}
              variant="outline"
              className="w-full rounded-[12px] border-2 border-[#7b51f5] text-[#7b51f5] hover:bg-[#f6f1f8] dark:hover:bg-white/10 font-body font-medium tracking-[0.5px]"
            >
              View Wishlist
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default WishlistFlyout;

