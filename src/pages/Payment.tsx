import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, ShieldCheck, SmartphoneNfc } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    title: "Create Razorpay account",
    details: "Visit dashboard.razorpay.com, complete KYC, and generate API keys (Key ID & Key Secret).",
  },
  {
    title: "Add Razorpay script",
    details: "Include Razorpay checkout script in index.html or dynamically load before payment.",
  },
  {
    title: "Create order on backend",
    details: "Send cart total + currency to your backend. Use Razorpay Orders API to generate an order_id.",
  },
  {
    title: "Open Razorpay checkout",
    details: "Pass order_id, amount (in paise), customer info, and theme colors. Handle success & failure callbacks.",
  },
];

const Payment = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_70%)] px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-10 rounded-[48px] border border-white/15 bg-[var(--card)]/95 p-8 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em]" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">Payment</p>
        </div>

        <div className="rounded-[32px] border border-white/20 bg-background/70 p-6">
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.4em]">Razorpay ready</p>
              <p className="text-sm text-muted-foreground">Support for UPI · Cards · Netbanking</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            We recommend Razorpay for Indian payments. Below are the exact developer steps. Once your API keys are ready, connect them to our checkout button.
          </p>
        </div>

        <div className="grid gap-6">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-[28px] border border-white/20 bg-background/80 p-6">
              <div className="flex items-start gap-4">
                <div className="text-sm font-bold text-primary">0{index + 1}</div>
                <div>
                  <p className="text-lg font-semibold">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.details}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-[32px] border border-dashed border-primary/40 bg-primary/5 p-6 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4">
            <SmartphoneNfc className="h-6 w-6 text-primary" />
            <div>
              <p className="text-base font-semibold text-primary">Need help integrating?</p>
              <p>Run `npm install razorpay` in your backend, sign requests with Key Secret, and verify signatures on the client.</p>
            </div>
          </div>
          <pre className="mt-4 rounded-2xl bg-black/80 p-4 text-xs text-white">
{`const options = {
  key: "RAZORPAY_KEY_ID",
  amount: totalInPaise,
  currency: "INR",
  order_id,
  name: "AXNO",
  description: "Own The Look",
  handler: (response) => verifyPayment(response),
  theme: { color: "#6c42ff" },
};`}
          </pre>
          <p className="mt-4 text-xs">Hydrate this object when user taps “Complete payment”. After success, call your backend to verify `razorpay_signature`.</p>
        </div>

        <div className="rounded-[32px] border border-white/20 bg-background/70 p-6">
          <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">Security</p>
          <p className="mt-2 flex items-center gap-2">
            <ShieldCheck className="text-primary" /> Razorpay is PCI-DSS compliant. AXNO never stores card numbers. UPI + Wallets available for instant settlement.
          </p>
          <Button className="mt-6 rounded-full bg-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.4em] text-background" onClick={() => navigate("/")}>
            Back to home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Payment;

