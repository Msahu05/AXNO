import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, UploadCloud, MessageCircle, ShieldCheck, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { userAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Indian cities and states data
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const INDIAN_CITIES = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar"],
  "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar"],
  "Himachal Pradesh": ["Shimla", "Mandi", "Solan", "Dharamshala"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga"],
  "Kerala": ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Kollam"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Gwalior", "Jabalpur", "Ujjain"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur"],
  "Meghalaya": ["Shillong", "Tura", "Jowai"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur"],
  "Sikkim": ["Gangtok", "Namchi", "Mangan"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Allahabad", "Meerut"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"]
};

const Checkout = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [description, setDescription] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [designFiles, setDesignFiles] = useState([]);
  const [referenceLinks, setReferenceLinks] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [stateSuggestions, setStateSuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showStateSuggestions, setShowStateSuggestions] = useState(false);
  const [loadingPincode, setLoadingPincode] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveAddress, setSaveAddress] = useState(false);
  const descriptionRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { items: cartItems, total: cartTotal } = useCart();
  const { toast } = useToast();

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.startsWith("91")) {
      return `+91 ${digits.slice(2)}`;
    } else if (digits.startsWith("0")) {
      return `+91 ${digits.slice(1)}`;
    } else if (digits.length > 0) {
      return `+91 ${digits}`;
    }
    return "+91 ";
  };

  // Auto-resize textarea
  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = 'auto';
      descriptionRef.current.style.height = descriptionRef.current.scrollHeight + 'px';
    }
  }, [description]);

  // Load saved addresses
  useEffect(() => {
    if (isAuthenticated) {
      loadSavedAddresses();
    }
  }, [isAuthenticated]);

  const loadSavedAddresses = async () => {
    try {
      const data = await userAPI.getAddresses();
      setSavedAddresses(data.addresses || []);
      // Auto-select default address if available
      const defaultAddr = data.addresses?.find(addr => addr.isDefault);
      if (defaultAddr) {
        selectSavedAddress(defaultAddr);
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
    }
  };

  const selectSavedAddress = (addr) => {
    setSelectedAddressId(addr._id);
    const nameParts = (addr.name || "").split(" ");
    setFirstName(nameParts[0] || "");
    setLastName(nameParts.slice(1).join(" ") || "");
    setAddress(addr.address || "");
    setCity(addr.city || "");
    setState(addr.state || "");
    setZipCode(addr.pincode || "");
    setPhone(addr.phone ? formatPhone(addr.phone) : "+91 ");
  };

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user && !selectedAddressId) {
      const nameParts = (user.name || "").split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setEmail(user.email || "");
      setPhone(user.phone ? formatPhone(user.phone) : "+91 ");
    }
  }, [user, selectedAddressId]);

  // Fetch city and state from pincode
  const fetchPincodeDetails = async (pincode) => {
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      return;
    }

    setLoadingPincode(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
        // Only auto-fill if fields are empty
        if (!city) {
          setCity(postOffice.District || postOffice.Name || "");
        }
        if (!state) {
          setState(postOffice.State || "");
        }
      }
    } catch (error) {
      console.error("Error fetching pincode details:", error);
    } finally {
      setLoadingPincode(false);
    }
  };

  const handleZipCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setZipCode(value);
    if (value.length === 6) {
      fetchPincodeDetails(value);
    }
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setCity(value);
    if (value.length > 0) {
      const filtered = Object.values(INDIAN_CITIES)
        .flat()
        .filter(c => c.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
      setCitySuggestions(filtered);
      setShowCitySuggestions(true);
    } else {
      setShowCitySuggestions(false);
    }
  };

  const handleStateChange = (e) => {
    const value = e.target.value;
    setState(value);
    if (value.length > 0) {
      const filtered = INDIAN_STATES.filter(s => s.toLowerCase().includes(value.toLowerCase())).slice(0, 5);
      setStateSuggestions(filtered);
      setShowStateSuggestions(true);
    } else {
      setShowStateSuggestions(false);
    }
  };

  const selectCity = (selectedCity) => {
    setCity(selectedCity);
    setShowCitySuggestions(false);
    // Find state for the city
    for (const [stateName, cities] of Object.entries(INDIAN_CITIES)) {
      if (cities.includes(selectedCity)) {
        setState(stateName);
        break;
      }
    }
  };

  const selectState = (selectedState) => {
    setState(selectedState);
    setShowStateSuggestions(false);
  };

  const subtotal = cartTotal;
  const shipping = 0;
  const estimatedTaxes = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + estimatedTaxes;

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handlePlaceOrder = async () => {
    if (!firstName || !lastName || !email || !phone || !address || !city || !state || !zipCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return;
    }

    // Save address if requested
    if (saveAddress && isAuthenticated) {
      try {
        const addressData = {
          name: `${firstName} ${lastName}`,
          address: address,
          city: city,
          state: state,
          pincode: zipCode,
          phone: phone,
          isDefault: savedAddresses.length === 0
        };
        await userAPI.addAddress(addressData);
        toast({
          title: "Address Saved",
          description: "Your address has been saved for future use",
        });
      } catch (error) {
        console.error("Failed to save address:", error);
        // Continue with order even if address save fails
      }
    }

    const shippingAddress = {
      name: `${firstName} ${lastName}`,
      address: address,
      city: city,
      state: state,
      pincode: zipCode,
      phone: phone
    };

    const orderData = {
      items: cartItems.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        image: item.image
      })),
      shippingAddress,
      customDesign: {
        files: [],
        referenceLinks: referenceLinks,
        instructions: description
      },
      payment: {
        method: 'test',
        status: 'pending'
      },
      totals: {
        subtotal: subtotal,
        shipping: shipping,
        tax: estimatedTaxes,
        total: total
      }
    };

    // Validate orderData before storing
    if (!orderData.items || orderData.items.length === 0) {
      toast({
        title: "Order Error",
        description: "Order items are missing. Please try again.",
        variant: "destructive",
      });
      return;
    }

    sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));
    
    const fileData = designFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type
    }));
    sessionStorage.setItem('pendingOrderFiles', JSON.stringify(fileData));

    navigate("/payment", { 
      state: { 
        orderData,
        designFiles: Array.from(designFiles)
      } 
    });
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
      <div className="px-2 sm:px-4 lg:px-6 pb-4 sm:pb-8 lg:pb-12 pt-4 sm:pt-6">
        <Header />
      </div>
      <div className="px-2 sm:px-4 lg:px-6 py-6 sm:py-10">
        <div className="mx-auto max-w-7xl space-y-4 sm:space-y-8">
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
          <button className="hover:text-gray-900 cursor-pointer" onClick={() => navigate("/cart")}>Cart</button>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Shipping</span>
        </div>

        <div className="flex items-center justify-between">
          <button className="flex items-center gap-1 sm:gap-2 rounded-full px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] transition-all duration-200 bg-transparent hover:bg-purple-200 hover:shadow-sm active:bg-purple-300" onClick={() => navigate("/cart")}>
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-center flex-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Checkout</h1>
          <div className="w-12 sm:w-24"></div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            {/* Saved Addresses Section */}
            {savedAddresses.length > 0 && (
              <section className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Saved Addresses</h2>
                <div className="space-y-3">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAddressId === addr._id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => selectSavedAddress(addr)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {addr.isDefault && (
                            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1 block">
                              Default
                            </span>
                          )}
                          <p className="font-semibold">{addr.name}</p>
                          <p className="text-sm text-gray-600">{addr.address}</p>
                          <p className="text-sm text-gray-600">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          {addr.phone && (
                            <p className="text-sm text-gray-600">Phone: {addr.phone}</p>
                          )}
                        </div>
                        <MapPin className="h-5 w-5 text-purple-500" />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAddressId(null);
                    setFirstName("");
                    setLastName("");
                    setAddress("");
                    setCity("");
                    setState("");
                    setZipCode("");
                    setPhone("+91 ");
                  }}
                  className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  + Add New Address
                </button>
              </section>
            )}

            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6">
                {savedAddresses.length > 0 ? "Or Enter New Address" : "Shipping Address"}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">First Name</label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full"
                    placeholder="Divyansh"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Last Name</label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full"
                    placeholder="Agrawal"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-4">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    placeholder="divyansh@webyonsh.com"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-4">Phone Number</label>
                  <Input
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full"
                    placeholder="+91 8277588943"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-4">Address</label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full"
                    placeholder="Street address, apartment, suite, etc."
                  />
                </div>
                <div className="col-span-2 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Pincode {loadingPincode && <Loader2 className="inline h-3 w-3 animate-spin ml-2" />}
                  </label>
                  <Input
                    value={zipCode}
                    onChange={handleZipCodeChange}
                    className="w-full"
                    placeholder="560021"
                    maxLength={6}
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-4">City</label>
                  <Input
                    value={city}
                    onChange={handleCityChange}
                    onFocus={() => city && setShowCitySuggestions(true)}
                    onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                    className="w-full"
                    placeholder="Bangalore"
                  />
                  {showCitySuggestions && citySuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-auto">
                      {citySuggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => selectCity(suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-4">State</label>
                  <Input
                    value={state}
                    onChange={handleStateChange}
                    onFocus={() => state && setShowStateSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowStateSuggestions(false), 200)}
                    className="w-full"
                    placeholder="Karnataka"
                  />
                  {showStateSuggestions && stateSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-auto">
                      {stateSuggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => selectState(suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-4">Custom Design Instructions</label>
                  <Textarea
                    ref={descriptionRef}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full resize-none overflow-hidden"
                    placeholder="Enter any special instructions for your custom design..."
                    rows={3}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-4">Reference Links (Optional)</label>
                  <Input
                    value={referenceLinks}
                    onChange={(e) => setReferenceLinks(e.target.value)}
                    className="w-full"
                    placeholder="Paste links to design references, Pinterest, etc."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-4">Upload Design Files (Optional)</label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setDesignFiles(files);
                      }}
                      className="w-full"
                    />
                    {designFiles.length > 0 && (
                      <span className="text-sm text-gray-600">{designFiles.length} file(s) selected</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Upload images, PDFs, or documents (max 10MB each)</p>
                </div>
                {isAuthenticated && (
                  <div className="col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="saveAddress"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor="saveAddress" className="text-sm text-gray-700 cursor-pointer">
                      Save this address for future orders
                    </label>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="bg-white rounded-lg border border-gray-200 p-6 h-fit">
            <h2 className="text-xl font-semibold mb-6">Your Cart</h2>
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex gap-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.category} · Size {String(item.size).replace(/[\[\]"]/g, '').replace(/\\/g, '').trim()}</p>
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
            <button 
              className="w-full mt-6 font-semibold py-3 px-4 rounded-md transition-colors" 
              style={{ backgroundColor: '#111827', color: '#ffffff' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1f2937'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#111827'}
              onClick={handlePlaceOrder}
            >
              Continue to Payment
            </button>
          </aside>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
