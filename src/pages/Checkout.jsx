import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UploadCloud, MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";

const Checkout = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { items: cartItems, total: cartTotal } = useCart();

  const formatPhone = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Ensure it starts with +91
    if (digits.startsWith("91")) {
      return `+91 ${digits.slice(2)}`;
    } else if (digits.startsWith("0")) {
      return `+91 ${digits.slice(1)}`;
    } else if (digits.length > 0) {
      return `+91 ${digits}`;
    }
    return "+91 ";
  };

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      const nameParts = (user.name || "").split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setEmail(user.email || "");
      setPhone(user.phone ? formatPhone(user.phone) : "+91 ");
    }
  }, [user]);

  const subtotal = cartTotal;
  const shipping = 0; // Free shipping only
  const estimatedTaxes = Math.round(subtotal * 0.05); // 5% tax estimate
  const total = subtotal + shipping + estimatedTaxes;

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handlePlaceOrder = () => {
    navigate("/payment");
  };

  if (!isAuthenticated) {
    navigate(`/auth?redirect=${encodeURIComponent("/checkout")}`);
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_70%)]">
        <div className="px-4 sm:px-6 pb-8 sm:pb-12 pt-6">
          <Header />
        </div>
        <div className="px-4 py-10">
          <div className="mx-auto max-w-5xl rounded-[56px] border border-white/15 bg-[var(--card)]/95 p-8 shadow-[var(--shadow-soft)] text-center">
            <h2 className="text-3xl font-black mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Add some products to checkout!</p>
            <Button className="rounded-full bg-foreground px-8 py-6 text-sm font-semibold uppercase tracking-[0.4em] text-background" onClick={() => navigate("/")}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 pb-8 sm:pb-12 pt-6">
        <Header />
      </div>
      <div className="px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button className="hover:text-gray-900 cursor-pointer" onClick={() => navigate("/cart")}>Cart</button>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Shipping</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] transition-all duration-200 bg-transparent hover:bg-purple-200 hover:shadow-sm active:bg-purple-300" onClick={() => navigate("/cart")}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-4xl font-bold text-center flex-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Checkout</h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            {/* Shipping Address Section */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full"
                    placeholder="Divyansh"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full"
                    placeholder="Agrawal"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    placeholder="divyansh@webyonsh.com"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <Input
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full"
                    placeholder="+91 8277588943"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full"
                    placeholder="Bangalore"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <Input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full"
                    placeholder="Karnataka"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                  <Input
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full"
                    placeholder="560021"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full"
                    placeholder="Enter a description..."
                    rows={3}
                  />
                </div>
              </div>
            </section>

          </div>

          {/* Cart Summary */}
          <aside className="bg-white rounded-lg border border-gray-200 p-6 h-fit">
            <h2 className="text-xl font-semibold mb-6">Your Cart</h2>
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex gap-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.category} · Size {item.size}</p>
                    <p className="text-sm font-semibold mt-1">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-6">
              <div className="flex gap-2 mb-4">
                <Input
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Discount code"
                  className="flex-1"
                />
                <Button variant="outline">Apply</Button>
              </div>
            </div>
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-semibold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span className="font-semibold">₹{shipping}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Estimated taxes</span>
                <span className="font-semibold">₹{estimatedTaxes}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
            <Button className="w-full mt-6 bg-black text-white hover:bg-gray-800" onClick={handlePlaceOrder}>
              Continue to Payment
            </Button>
          </aside>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

