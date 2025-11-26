import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UploadCloud, MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";

const savedAddresses = [
  {
    id: "default",
    label: "Home",
    name: "Aarya Patel",
    line1: "B-902, Skye Towers",
    city: "Hinjewadi, Pune",
    pin: "411057",
  },
  {
    id: "studio",
    label: "Studio",
    name: "AXNO Studio",
    line1: "48 Sunrise Arcade",
    city: "Indiranagar, Bengaluru",
    pin: "560038",
  },
];

const cartItems = [
  { id: "hoodie-01", name: "Prism Panel Hoodie", type: "Hoodie", price: 1099, original: 1999 },
  { id: "tee-01", name: "Luminous Core Tee", type: "T-Shirt", price: 599, original: 1099 },
];

const Checkout = () => {
  const [selectedAddress, setSelectedAddress] = useState("default");
  const [designFile, setDesignFile] = useState(null);
  const [notes, setNotes] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent("/checkout")}`);
      return;
    }
    navigate("/payment");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_70%)] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-10 rounded-[56px] border border-white/15 bg-[var(--card)]/95 p-8 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em]" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Back to designs
          </button>
          <p className="text-xs uppercase tracking-[0.5em] text-muted-foreground">Checkout</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <section className="rounded-[32px] border border-white/20 bg-background/70 p-6 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">Saved addresses</p>
              <div className="mt-4 grid gap-4">
                {savedAddresses.map((address) => (
                  <label key={address.id} className={`cursor-pointer rounded-[24px] border p-5 ${selectedAddress === address.id ? "border-primary bg-primary/5" : "border-white/20"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold">{address.label}</p>
                        <p className="text-sm text-muted-foreground">{address.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {address.line1}, {address.city} - {address.pin}
                        </p>
                      </div>
                      <Input type="radio" name="address" value={address.id} checked={selectedAddress === address.id} onChange={(event) => setSelectedAddress(event.target.value)} className="h-4 w-4" />
                    </div>
                  </label>
                ))}
                <div className="rounded-[24px] border border-dashed border-white/30 p-5 text-sm text-muted-foreground">Add new address</div>
              </div>
            </section>

            <section className="rounded-[32px] border border-dashed border-primary/40 bg-primary/5 p-6">
              <div className="flex items-center gap-3 text-primary">
                <UploadCloud className="h-6 w-6" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.4em]">Upload custom design</p>
                  <p className="text-xs text-muted-foreground">PSD · PDF · AI prompts · JPEG / PNG (max 30MB)</p>
                </div>
              </div>
              <label className="mt-4 block cursor-pointer rounded-[24px] border border-primary/40 bg-background/80 p-6 text-center">
                <Input type="file" accept=".psd,.pdf,.png,.jpg,.jpeg" className="hidden" onChange={(event) => setDesignFile(event.target.files?.[0] || null)} />
                <p className="text-sm font-semibold">{designFile ? designFile.name : "Drag & drop or click to upload"}</p>
              </label>
              <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add any specific placement instructions, Pantone codes, or links to references." className="mt-4 min-h-[120px]" />
              <p className="mt-3 text-xs text-muted-foreground">We will confirm every detail on WhatsApp within 12 hours before printing.</p>
            </section>

            <section className="rounded-[32px] border border-white/20 bg-background/70 p-6 text-sm text-muted-foreground">
              <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">Support</p>
              <div className="mt-4 space-y-4">
                <p className="flex items-center gap-2">
                  <MessageCircle className="text-[#25D366]" /> WhatsApp: <span className="font-semibold text-foreground">+91 88288 44110</span>
                </p>
                <p className="flex items-center gap-2">
                  <ShieldCheck className="text-primary" /> 100% approval guarantee. Unlimited mockups until you say perfect.
                </p>
              </div>
            </section>
          </div>

          <aside className="space-y-6 rounded-[32px] border border-white/20 bg-background/70 p-6 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">Order summary</p>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-[20px] border border-white/15 p-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">{item.type}</p>
                    <p className="font-semibold">{item.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{item.price}</p>
                    <p className="text-xs text-muted-foreground line-through">₹{item.original}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-[20px] border border-dashed border-primary/40 p-4 text-sm">
              <div className="flex justify-between font-semibold">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="mt-2 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{subtotal}</span>
              </div>
            </div>
            <Button className="w-full rounded-full bg-foreground px-6 py-4 text-xs font-semibold uppercase tracking-[0.4em] text-background" onClick={handlePlaceOrder}>
              Continue to payment
            </Button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

