import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const TermsAndConditions = ({ open, onAccept, onReject }) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        onReject();
      }
    }}>
      <DialogContent 
        className="!max-w-full sm:!max-w-lg md:!max-w-xl !w-full sm:!w-auto flex flex-col p-4 sm:p-6 gap-0 !left-0 sm:!left-[50%] !translate-x-0 sm:!translate-x-[-50%]" 
        style={{ maxHeight: '90vh', height: 'auto' }}
        onInteractOutside={(e) => {
          // Allow closing by clicking outside
        }}
      >
        <DialogHeader className="flex-shrink-0 mb-4 pr-8">
          <DialogTitle className="text-xl sm:text-2xl font-black text-center">Terms & Conditions</DialogTitle>
          <DialogDescription className="text-center">
            Welcome to Looklyn 🤍
          </DialogDescription>
        </DialogHeader>
        
        <div 
          className="overflow-y-auto flex-1 pr-2 sm:pr-4 -mr-2 sm:-mr-4" 
          style={{ 
            WebkitOverflowScrolling: 'touch',
            maxHeight: 'calc(90vh - 180px)',
            overflowX: 'hidden'
          }}
        >
          <div className="space-y-4 sm:space-y-5 text-xs sm:text-sm pr-2">
            <div>
              <p className="mb-4">
                By accessing or making a purchase on <strong>www.looklyn.in</strong>, you agree to the following terms.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-sm sm:text-base mb-1.5 sm:mb-2">Products</h3>
              <p className="text-muted-foreground leading-relaxed">
                Looklyn offers made-to-order customised upperwear such as hoodies, T-shirts, and sweatshirts. All products are created based on customer-selected or customer-uploaded designs.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-sm sm:text-base mb-1.5 sm:mb-2">Eligibility & Accounts</h3>
              <p className="text-muted-foreground leading-relaxed">
                Users must be 18+ or supervised by a guardian. You are responsible for maintaining the confidentiality of your account and all activity under it.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-sm sm:text-base mb-1.5 sm:mb-2">Customisation & Designs</h3>
              <p className="text-muted-foreground leading-relaxed">
                Once an order is placed, designs cannot be changed. Customers are responsible for the accuracy and legality of uploaded designs and must own or have permission to use them.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-sm sm:text-base mb-1.5 sm:mb-2">No Refund / No Exchange</h3>
              <p className="text-muted-foreground leading-relaxed">
                As all products are custom-made, all sales are final. No refunds, returns, or exchanges will be provided. Please review size charts and order details carefully before placing an order.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-sm sm:text-base mb-1.5 sm:mb-2">Payments</h3>
              <p className="text-muted-foreground leading-relaxed">
                Only online payments are accepted. Cash on Delivery is not available. Orders are processed after successful payment confirmation.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-sm sm:text-base mb-1.5 sm:mb-2">Delivery</h3>
              <p className="text-muted-foreground leading-relaxed">
                Delivery timelines are estimates and may vary due to production or courier delays.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-sm sm:text-base mb-1.5 sm:mb-2">Product Appearance</h3>
              <p className="text-muted-foreground leading-relaxed">
                Minor variations in colour or appearance may occur due to screen or lighting differences and do not qualify for refunds.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-sm sm:text-base mb-1.5 sm:mb-2">Cancellations</h3>
              <p className="text-muted-foreground leading-relaxed">
                Orders cannot be cancelled once confirmed.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-sm sm:text-base mb-1.5 sm:mb-2">User Conduct</h3>
              <p className="text-muted-foreground leading-relaxed">
                Offensive, illegal, or inappropriate content is not allowed. Looklyn reserves the right to cancel orders or suspend accounts if misuse is detected.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-sm sm:text-base mb-1.5 sm:mb-2">Legal</h3>
              <p className="text-muted-foreground leading-relaxed">
                These terms are governed by the laws of India. Any disputes shall be subject to Indian courts.
              </p>
            </div>

            <div className="pt-3 sm:pt-4 border-t">
              <p className="text-muted-foreground text-xs sm:text-sm">
                For support, please contact us via <strong>www.looklyn.in</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end pt-4 border-t flex-shrink-0 mt-4">
          <Button 
            variant="outline" 
            onClick={onReject} 
            className="w-full sm:w-auto order-2 sm:order-1"
            type="button"
          >
            Decline
          </Button>
          <Button 
            onClick={onAccept} 
            className="w-full sm:w-auto order-1 sm:order-2"
            type="button"
          >
            I Accept
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAndConditions;


