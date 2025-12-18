import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft, UploadCloud, MessageCircle, ShieldCheck, Loader2, MapPin, Plus, Minus, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { userAPI, couponsAPI, paymentsAPI } from "@/lib/api";
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
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
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
  const [isValidPincode, setIsValidPincode] = useState(true);
  const [isShippingOpen, setIsShippingOpen] = useState(true);
  const [isCustomDesignOpen, setIsCustomDesignOpen] = useState(false);
  const descriptionRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { items: cartItems, total: cartTotal, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();
  
  // Check if this is a buy now flow (from location state or sessionStorage)
  const [isBuyNow, setIsBuyNow] = useState(location.state?.buyNow || false);
  
  // Get buy now product from sessionStorage (separate from cart)
  const [buyNowProduct, setBuyNowProduct] = useState(null);
  const [buyNowLoading, setBuyNowLoading] = useState(true);
  
  useEffect(() => {
    // Check if coming from cart (not buy now) - clear buy now product
    if (!location.state?.buyNow) {
      sessionStorage.removeItem('buyNowProduct');
      sessionStorage.removeItem('isBuyNowOrder');
      setBuyNowProduct(null);
      setIsBuyNow(false);
      setBuyNowLoading(false);
      return;
    }
    
    // Check sessionStorage for buy now product (in case location.state is lost)
    const stored = sessionStorage.getItem('buyNowProduct');
    if (stored) {
      try {
        const product = JSON.parse(stored);
        setBuyNowProduct(product);
        setIsBuyNow(true); // Set buy now flag if product exists in sessionStorage
      } catch (e) {
        console.error('Error parsing buyNowProduct:', e);
      }
    }
    setBuyNowLoading(false);
  }, [location.state]); // Run when location.state changes
  
  // Cleanup: Clear buy now product when user navigates away via back button
  useEffect(() => {
    const handlePopState = () => {
      // Clear buy now product when user clicks back button
      sessionStorage.removeItem('buyNowProduct');
      sessionStorage.removeItem('isBuyNowOrder');
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  // Function to update buy now product quantity
  const updateBuyNowQuantity = (newQuantity) => {
    if (newQuantity < 1) return; // Don't allow quantity less than 1
    setBuyNowProduct(prev => {
      if (!prev) return prev;
      const updated = { ...prev, quantity: newQuantity };
      // Update sessionStorage
      sessionStorage.setItem('buyNowProduct', JSON.stringify(updated));
      return updated;
    });
  };

  // Use buy now product if available, otherwise use cart items
  const displayItems = isBuyNow && buyNowProduct 
    ? [buyNowProduct] // Only the buy now product, not from cart
    : cartItems;
  
  // Shipping cost (always 0 for free shipping)
  const shipping = 0;
  
  // Calculate totals based on display items
  const displaySubtotal = displayItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const displayEstimatedTaxes = 0; // No taxes
  const displayTotal = displaySubtotal - couponDiscount + shipping + displayEstimatedTaxes;

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

  // Load available coupons
  useEffect(() => {
    const loadAvailableCoupons = async () => {
      try {
        setLoadingCoupons(true);
        const response = await couponsAPI.getAllPublic();
        setAvailableCoupons(response.coupons || []);
      } catch (error) {
        console.error('Error loading coupons:', error);
      } finally {
        setLoadingCoupons(false);
      }
    };
    
    if (isAuthenticated) {
      loadAvailableCoupons();
    }
  }, [isAuthenticated]);

  // Auto-apply coupon from sessionStorage or based on quantity
  useEffect(() => {
    const autoApplyCouponCode = sessionStorage.getItem('autoApplyCoupon');
    if (autoApplyCouponCode) {
      setDiscountCode(autoApplyCouponCode);
      applyCoupon(autoApplyCouponCode);
      sessionStorage.removeItem('autoApplyCoupon'); // Clear after applying
    } else {
      // Auto-apply coupon based on quantity
      autoApplyCouponByQuantity();
    }
  }, [displayItems]);

  const autoApplyCouponByQuantity = async () => {
    try {
      // Get all active coupons
      const response = await couponsAPI.getAllPublic();
      const coupons = response.coupons || [];
      
      // Get total quantity
      const totalQuantity = displayItems.reduce((sum, item) => sum + item.quantity, 0);
      
      // Find matching coupon based on quantity and category
      const matchingCoupon = coupons.find(coupon => {
        if (!coupon.isActive) return false;
        
        // Check if quantity matches
        if (coupon.minQuantity && totalQuantity >= coupon.minQuantity) {
          // Check if category matches
          if (coupon.category === 'All') return true;
          
          // Check if any item matches the category
          return displayItems.some(item => item.category === coupon.category);
        }
        
        return false;
      });
      
      if (matchingCoupon && (!appliedCoupon || appliedCoupon.code !== matchingCoupon.code)) {
        setDiscountCode(matchingCoupon.code);
        applyCoupon(matchingCoupon.code);
      }
    } catch (error) {
      console.error('Error auto-applying coupon:', error);
      // Silently fail - don't show error to user
    }
  };

  const applyCoupon = async (code, silent = false, couponObject = null) => {
    if (!code) return;
    
    try {
      // Use provided coupon object if available, otherwise fetch it
      let coupon = couponObject;
      
      if (!coupon) {
      const response = await couponsAPI.getCoupon(code);
        coupon = response.coupon;
      }
      
      if (!coupon) {
        toast({
          title: "Invalid Coupon",
          description: "This coupon code does not exist",
          variant: "destructive",
        });
        return;
      }
      
      if (!coupon.isActive) {
        toast({
          title: "Invalid Coupon",
          description: "This coupon code is inactive",
          variant: "destructive",
        });
        return;
      }

      // Validate coupon conditions
      let isValid = true;
      let discount = 0;

      // Check category filter
      if (coupon.category && coupon.category !== 'All') {
        const hasMatchingCategory = displayItems.some(item => 
          item.category === coupon.category
        );
        if (!hasMatchingCategory) {
          isValid = false;
          toast({
            title: "Invalid Coupon",
            description: `This coupon is only valid for ${coupon.category} category`,
            variant: "destructive",
          });
          return;
        }
      }

      // Check minimum quantity
      if (coupon.minQuantity) {
        const totalQuantity = displayItems.reduce((sum, item) => sum + item.quantity, 0);
        if (totalQuantity < coupon.minQuantity) {
          isValid = false;
          toast({
            title: "Coupon Not Applicable",
            description: `Minimum quantity of ${coupon.minQuantity} required`,
            variant: "destructive",
          });
          return;
        }
      }

      // Check minimum price
      if (coupon.minPrice) {
        if (displaySubtotal < coupon.minPrice) {
          isValid = false;
          toast({
            title: "Coupon Not Applicable",
            description: `Minimum order value of ₹${coupon.minPrice} required`,
            variant: "destructive",
          });
          return;
        }
      }

      if (!isValid) {
        return;
      }

      // Calculate discount based on type
      console.log('Calculating discount for coupon:', {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        category: coupon.category,
        price: coupon.price,
        minQuantity: coupon.minQuantity,
        displayItems: displayItems.map(i => ({ category: i.category, price: i.price, quantity: i.quantity }))
      });
      
      if (coupon.discountType === 'price_override') {
        // For price override, discountValue is the discount amount per item
        // Match by category and quantity only - price field is for reference only
        // The discountValue is what gets deducted, regardless of exact price match
        let itemsToUse = displayItems;
        
        // Filter by category if specified
        if (coupon.category && coupon.category !== 'All') {
          itemsToUse = displayItems.filter(item => item.category === coupon.category);
          console.log('Filtered by category:', coupon.category, 'Items:', itemsToUse.map(i => ({ category: i.category, price: i.price, quantity: i.quantity })));
        } else {
          console.log('No category filter, using all items:', itemsToUse.map(i => ({ category: i.category, price: i.price, quantity: i.quantity })));
        }
        
        if (itemsToUse.length > 0) {
          // Calculate total matching quantity
          const totalMatchingQuantity = itemsToUse.reduce((sum, item) => sum + item.quantity, 0);
          
          console.log('Total matching quantity:', totalMatchingQuantity, 'Min required:', coupon.minQuantity);
          
          // Check if minimum quantity requirement is met
          if (!coupon.minQuantity || totalMatchingQuantity >= coupon.minQuantity) {
            // Apply discountValue per matching item
            // discountValue is the discount amount to deduct per item
            const discountValue = parseFloat(coupon.discountValue) || 0;
            discount = discountValue * totalMatchingQuantity;
            console.log('Discount calculated:', discount, '= discountValue', discountValue, '* quantity', totalMatchingQuantity);
          } else {
            console.log('Min quantity not met');
            discount = 0;
          }
        } else {
          console.log('No matching items found');
          discount = 0;
        }
      } else if (coupon.discountType === 'percentage') {
        const discountValue = parseFloat(coupon.discountValue) || 0;
        discount = Math.round((displaySubtotal * discountValue) / 100);
        console.log('Percentage discount:', discount, '= subtotal', displaySubtotal, '*', discountValue, '%');
      } else if (coupon.discountType === 'fixed') {
        const discountValue = parseFloat(coupon.discountValue) || 0;
        if (coupon.applyTo === 'item') {
          discount = discountValue * displayItems.reduce((sum, item) => sum + item.quantity, 0);
        } else {
          discount = discountValue;
        }
        console.log('Fixed discount:', discount);
      }

      // Round discount to 2 decimal places
      discount = Math.round(discount * 100) / 100;
      console.log('Final discount after rounding:', discount);

      console.log('Setting coupon discount:', discount, 'for coupon:', coupon.code);
      setAppliedCoupon(coupon);
      setCouponDiscount(discount);
      if (!silent) {
        toast({
          title: "Coupon Applied",
          description: `${coupon.title || coupon.code} has been applied${discount > 0 ? ` - Discount: ₹${discount.toFixed(2)}` : ''}`,
        });
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast({
        title: "Invalid Coupon",
        description: error.message || "This coupon code is not valid",
        variant: "destructive",
      });
    }
  };

  // Check if coupon is applicable based on current cart
  const isCouponApplicable = (coupon) => {
    if (!coupon.isActive) return false;
    
    // Check category
    if (coupon.category && coupon.category !== 'All') {
      const hasMatchingCategory = displayItems.some(item => item.category === coupon.category);
      if (!hasMatchingCategory) return false;
    }
    
    // Check minimum quantity
    if (coupon.minQuantity) {
      const totalQuantity = displayItems.reduce((sum, item) => sum + item.quantity, 0);
      if (totalQuantity < coupon.minQuantity) return false;
    }
    
    // Check minimum price
    if (coupon.minPrice) {
      if (displaySubtotal < coupon.minPrice) return false;
    }
    
    return true;
  };

  // Calculate discount amount for display
  const calculateCouponDiscount = (coupon) => {
    if (coupon.discountType === 'percentage') {
      const discountValue = parseFloat(coupon.discountValue) || 0;
      return Math.round((displaySubtotal * discountValue) / 100);
    } else if (coupon.discountType === 'fixed') {
      const discountValue = parseFloat(coupon.discountValue) || 0;
      if (coupon.applyTo === 'item') {
        return discountValue * displayItems.reduce((sum, item) => sum + item.quantity, 0);
      }
      return discountValue;
    } else if (coupon.discountType === 'price_override') {
      const discountValue = parseFloat(coupon.discountValue) || 0;
      let itemsToUse = displayItems;
      if (coupon.category && coupon.category !== 'All') {
        itemsToUse = displayItems.filter(item => item.category === coupon.category);
      }
      if (itemsToUse.length > 0) {
        const totalMatchingQuantity = itemsToUse.reduce((sum, item) => sum + item.quantity, 0);
        if (!coupon.minQuantity || totalMatchingQuantity >= coupon.minQuantity) {
          return discountValue * totalMatchingQuantity;
        }
      }
      return 0;
    }
    return 0;
  };

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

  // Validate pincode for Ahmedabad and Gandhinagar
  // Ahmedabad pincodes start with 380 (380001-380999)
  // Gandhinagar pincodes start with 382 (382010-382999)
  const validatePincode = (pincode) => {
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      return false;
    }
    
    // Check if pincode starts with 380 (Ahmedabad) or 382 (Gandhinagar)
    return pincode.startsWith('380') || pincode.startsWith('382');
  };

  // Fetch city and state from pincode
  const fetchPincodeDetails = async (pincode) => {
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      setIsValidPincode(true); // Reset validation if incomplete
      return;
    }

    // Validate pincode first
    const isValid = validatePincode(pincode);
    setIsValidPincode(isValid);
    
    if (!isValid) {
      toast({
        title: "Invalid Pincode",
        description: "We currently deliver only to Ahmedabad and Gandhinagar. Please enter a valid pincode from these cities.",
        variant: "destructive",
      });
      return;
    }

    setLoadingPincode(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
        // Check all post offices to find Ahmedabad or Gandhinagar
        let foundValidCity = false;
        let validCity = "";
        let validState = "";
        
        for (const postOffice of data[0].PostOffice) {
          const district = (postOffice.District || "").toLowerCase();
          const name = (postOffice.Name || "").toLowerCase();
          const state = (postOffice.State || "").toLowerCase();
          
          // Check if it's Ahmedabad or Gandhinagar
          if (district.includes('ahmedabad') || name.includes('ahmedabad') || 
              (state.includes('gujarat') && (district.includes('ahmedabad') || name.includes('ahmedabad')))) {
            foundValidCity = true;
            validCity = postOffice.District || postOffice.Name || "Ahmedabad";
            validState = postOffice.State || "Gujarat";
            break;
          }
          
          if (district.includes('gandhinagar') || name.includes('gandhinagar') ||
              (state.includes('gujarat') && (district.includes('gandhinagar') || name.includes('gandhinagar')))) {
            foundValidCity = true;
            validCity = postOffice.District || postOffice.Name || "Gandhinagar";
            validState = postOffice.State || "Gujarat";
            break;
          }
        }
        
        if (!foundValidCity) {
          setIsValidPincode(false);
          toast({
            title: "Invalid Location",
            description: "We currently deliver only to Ahmedabad and Gandhinagar. Please enter a valid pincode from these cities.",
            variant: "destructive",
          });
          return;
        }
        
        // Mark as valid and auto-fill if fields are empty
        setIsValidPincode(true);
        if (!city) {
          setCity(validCity);
        }
        if (!state) {
          setState(validState);
        }
      } else {
        // If API fails but pincode starts with 380 or 382, assume it's valid
        if (pincode.startsWith('380') || pincode.startsWith('382')) {
          setIsValidPincode(true);
          if (!city) {
            setCity(pincode.startsWith('380') ? 'Ahmedabad' : 'Gandhinagar');
          }
          if (!state) {
            setState('Gujarat');
          }
        } else {
          setIsValidPincode(false);
        }
      }
    } catch (error) {
      console.error("Error fetching pincode details:", error);
      // If API fails but pincode starts with 380 or 382, assume it's valid
      if (pincode.startsWith('380') || pincode.startsWith('382')) {
        setIsValidPincode(true);
        if (!city) {
          setCity(pincode.startsWith('380') ? 'Ahmedabad' : 'Gandhinagar');
        }
        if (!state) {
          setState('Gujarat');
        }
      } else {
        setIsValidPincode(false);
      }
    } finally {
      setLoadingPincode(false);
    }
  };

  const handleZipCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setZipCode(value);
    // Reset validation if pincode is incomplete
    if (value.length < 6) {
      setIsValidPincode(true);
    }
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

    // Validate pincode before proceeding
    if (!validatePincode(zipCode)) {
      toast({
        title: "Invalid Pincode",
        description: "We currently deliver only to Ahmedabad and Gandhinagar. Please enter a valid pincode from these cities.",
        variant: "destructive",
      });
      return;
    }

    // Verify pincode is valid (from API check)
    if (!isValidPincode) {
      toast({
        title: "Invalid Pincode",
        description: "We currently deliver only to Ahmedabad and Gandhinagar. Please enter a valid pincode from these cities.",
        variant: "destructive",
      });
      return;
    }

    // Verify city is Ahmedabad or Gandhinagar (case-insensitive)
    const cityLower = (city || "").toLowerCase();
    if (cityLower && !cityLower.includes('ahmedabad') && !cityLower.includes('gandhinagar')) {
      toast({
        title: "Invalid Location",
        description: "We currently deliver only to Ahmedabad and Gandhinagar. Please enter a valid address from these cities.",
        variant: "destructive",
      });
      return;
    }

    if (displayItems.length === 0) {
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
      items: displayItems.map(item => ({
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
      couponCode: appliedCoupon?.code || discountCode || null,
      payment: {
        method: 'test',
        status: 'pending'
      },
      totals: {
        subtotal: displaySubtotal,
        shipping: shipping,
        tax: displayEstimatedTaxes,
        total: displayTotal
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
    
    // Keep buyNow flag in sessionStorage
    if (isBuyNow) {
      sessionStorage.setItem('isBuyNowOrder', 'true');
    }

    // Directly initiate Razorpay payment
    await initiatePayment(orderData, Array.from(designFiles));
  };

  const initiatePayment = async (orderData, designFiles) => {
    try {
      const totalAmount = orderData.totals.total || 0;
      const tempOrderId = `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      // Check if Razorpay is available (production mode)
      const isRazorpayAvailable = window.Razorpay && typeof window.Razorpay === 'function';

      if (isRazorpayAvailable) {
        // Create Razorpay order
        const razorpayOrder = await paymentsAPI.createRazorpayOrder(
          totalAmount,
          'INR',
          tempOrderId
        );

        if (!razorpayOrder.success || !razorpayOrder.orderId) {
          throw new Error('Failed to create payment order');
        }

        // Configure Razorpay options
        const options = {
          key: razorpayOrder.key,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          order_id: razorpayOrder.orderId,
          name: 'Looklyn',
          description: `Order ${tempOrderId}`,
          prefill: {
            name: orderData.shippingAddress.name || user?.name || '',
            email: user?.email || '',
            contact: orderData.shippingAddress.phone || user?.phone || ''
          },
          theme: {
            color: '#7C5AFF'
          },
          handler: async function (response) {
            try {
              // Verify payment
              const verifyResult = await paymentsAPI.verifyPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );

              if (verifyResult.success) {
                // Create order
                const orderDataToSend = {
                  items: orderData.items || [],
                  shippingAddress: orderData.shippingAddress || {},
                  customDesign: orderData.customDesign || {},
                  totals: orderData.totals || {}
                };

                if (!orderDataToSend.items || orderDataToSend.items.length === 0) {
                  throw new Error('Order items are required');
                }

                const result = await paymentsAPI.confirmPayment(
                  response.razorpay_order_id,
                  response.razorpay_payment_id,
                  orderDataToSend,
                  designFiles
                );

                if (result.success) {
                  const isBuyNowOrder = sessionStorage.getItem('isBuyNowOrder') === 'true';
                  if (!isBuyNowOrder) {
                    clearCart();
                  }
                  
                  sessionStorage.removeItem('pendingOrder');
                  sessionStorage.removeItem('pendingOrderFiles');
                  sessionStorage.removeItem('buyNowProduct');
                  sessionStorage.removeItem('isBuyNowOrder');

                  toast({
                    title: "Payment Successful!",
                    description: `Order ${result.order.orderId} has been placed successfully.`,
                  });

                  setTimeout(() => {
                    navigate(`/orders/${result.order.orderId}`);
                  }, 2000);
                } else {
                  throw new Error(result.error || 'Failed to create order');
                }
              } else {
                throw new Error(verifyResult.error || 'Payment verification failed');
              }
            } catch (err) {
              const errorMessage = err.message || 'Payment processing failed';
              toast({
                title: "Payment Error",
                description: errorMessage,
                variant: "destructive",
              });
            }
          },
          modal: {
            ondismiss: function() {
              // User closed the payment modal
              toast({
                title: "Payment Cancelled",
                description: "You can complete the payment later.",
              });
            }
          }
        };

        // Open Razorpay checkout
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        // Fallback to test mode if Razorpay is not available
        const paymentResult = await paymentsAPI.testPayment(
          totalAmount,
          tempOrderId,
          'success'
        );

        if (paymentResult.success && paymentResult.paymentStatus === 'PAID') {
          const verifyResult = await paymentsAPI.verifyPayment(
            paymentResult.orderId,
            paymentResult.transactionId
          );

          if (verifyResult.success) {
            const orderDataToSend = {
              items: orderData.items || [],
              shippingAddress: orderData.shippingAddress || {},
              customDesign: orderData.customDesign || {},
              totals: orderData.totals || {}
            };

            if (!orderDataToSend.items || orderDataToSend.items.length === 0) {
              throw new Error('Order items are required');
            }

            const result = await paymentsAPI.confirmPayment(
              paymentResult.orderId,
              paymentResult.transactionId,
              orderDataToSend,
              designFiles
            );

            if (result.success) {
              const isBuyNowOrder = sessionStorage.getItem('isBuyNowOrder') === 'true';
              if (!isBuyNowOrder) {
                clearCart();
              }
              
              sessionStorage.removeItem('pendingOrder');
              sessionStorage.removeItem('pendingOrderFiles');
              sessionStorage.removeItem('buyNowProduct');
              sessionStorage.removeItem('isBuyNowOrder');

              toast({
                title: "Payment Successful!",
                description: `Order ${result.order.orderId} has been placed successfully.`,
              });

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
          toast({
            title: "Payment Failed",
            description: paymentResult.message || 'Payment failed. Please try again.',
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      const errorMessage = err.message || 'Payment processing failed';
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Wait for auth to finish loading before checking
  if (authLoading) {
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

  if (!isAuthenticated) {
    // Only redirect if not already on auth page to prevent loops
    if (location.pathname !== '/auth') {
      navigate(`/auth?redirect=${encodeURIComponent("/checkout")}`, { replace: true });
    }
    return null;
  }

  // Show loading if buy now product is being loaded
  if (isBuyNow && buyNowLoading) {
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

  if (displayItems.length === 0) {
    // If buy now but product not found, clear and redirect
    if (isBuyNow) {
      sessionStorage.removeItem('buyNowProduct');
      sessionStorage.removeItem('isBuyNowOrder');
      // Redirect to home if buy now product is missing
      navigate("/");
      return null;
    }
    
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_70%)]">
      <div className="px-2 sm:px-4 lg:px-6 pb-4 sm:pb-8 lg:pb-12 pt-4 sm:pt-6">
        <Header />
      </div>
      <div className="px-2 sm:px-4 lg:px-6 py-6 sm:py-10">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
            <button className="hover:text-gray-900 cursor-pointer" onClick={() => {
              // Clear buy now product when navigating away
              sessionStorage.removeItem('buyNowProduct');
              sessionStorage.removeItem('isBuyNowOrder');
              navigate("/");
            }}>Home</button>
            <span>/</span>
          <button className="hover:text-gray-900 cursor-pointer" onClick={() => {
              // Clear buy now product when navigating away
              sessionStorage.removeItem('buyNowProduct');
              sessionStorage.removeItem('isBuyNowOrder');
              navigate("/cart");
            }}>Cart</button>
          <span>/</span>
            <span className="text-gray-900 font-semibold">Checkout</span>
        </div>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Checkout</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Shipping Address Section */}
              <section className="bg-white rounded-lg border border-purple-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setIsShippingOpen(!isShippingOpen)}
                  className="w-full flex items-center justify-between p-6 hover:bg-purple-50 transition-colors"
                >
                  <h2 className="text-lg font-semibold text-gray-800">Shipping address</h2>
                  {isShippingOpen ? (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  )}
                </button>
                {isShippingOpen && (
                  <div className="px-6 pb-6">
                    {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Saved Addresses</h3>
                <div className="space-y-3">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAddressId === addr._id
                          ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 hover:border-purple-200'
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
                                  <p className="font-semibold text-gray-900">{addr.name}</p>
                          <p className="text-sm text-gray-600">{addr.address}</p>
                          <p className="text-sm text-gray-600">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          {addr.phone && (
                            <p className="text-sm text-gray-600">Phone: {addr.phone}</p>
                          )}
                        </div>
                                <MapPin className="h-5 w-5 text-purple-500 flex-shrink-0 ml-2" />
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
                      </div>
            )}

                    {/* Address Form */}
                    <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">FIRST NAME</label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full"
                        placeholder=""
                  />
                </div>
                <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">LAST NAME</label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full"
                        placeholder=""
                  />
                </div>
                <div className="col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">ADDRESS 1 - STREET OR P.O. BOX</label>
                  <Input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    className="w-full"
                        placeholder=""
                  />
                </div>
                <div className="col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">
                        ADDRESS 2 - APT, SUITE, FLOOR
                        <span className="text-xs font-normal text-gray-500 ml-2">(Leave blank if P.O. Box in Address 1)</span>
                      </label>
                  <Input
                    className="w-full"
                        placeholder=""
                  />
                </div>
                <div className="col-span-2 relative">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">
                        ZIP CODE
                        {loadingPincode && <Loader2 className="inline h-3 w-3 animate-spin ml-2" />}
                        <span className="text-xs font-normal text-gray-500 ml-2">(Ahmedabad/Gandhinagar only)</span>
                  </label>
                  <Input
                    value={zipCode}
                    onChange={handleZipCodeChange}
                    className={`w-full ${!isValidPincode && zipCode.length === 6 ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder=""
                    maxLength={6}
                  />
                  {!isValidPincode && zipCode.length === 6 && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      We deliver only to Ahmedabad and Gandhinagar
                    </p>
                  )}
                </div>
                <div className="relative">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">CITY</label>
                  <Input
                    value={city}
                    onChange={handleCityChange}
                    onFocus={() => city && setShowCitySuggestions(true)}
                    onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                    className="w-full"
                        placeholder=""
                  />
                  {showCitySuggestions && citySuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-auto">
                      {citySuggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                              className="px-4 py-2 hover:bg-purple-50 cursor-pointer"
                          onClick={() => selectCity(suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">STATE</label>
                      <select
                    value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select...</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">EMAIL</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                        placeholder=""
                  />
                        </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">PHONE NUMBER</label>
                      <Input
                        value={phone}
                        onChange={handlePhoneChange}
                        className="w-full"
                        placeholder=""
                      />
                    </div>
                    {isAuthenticated && (
                      <div className="col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="saveAddress"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="saveAddress" className="text-sm text-gray-700 cursor-pointer">
                          Save this address for future orders
                        </label>
                    </div>
                  )}
                </div>
                  </div>
                </div>
                )}
              </section>

              {/* Custom Design Section */}
              <section className="bg-white rounded-lg border border-purple-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setIsCustomDesignOpen(!isCustomDesignOpen)}
                  className="w-full flex items-center justify-between p-6 hover:bg-purple-50 transition-colors"
                >
                  <h2 className="text-lg font-semibold text-gray-800">Custom Design</h2>
                  {isCustomDesignOpen ? (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  )}
                </button>
                {isCustomDesignOpen && (
                  <div className="px-6 pb-6">
                    <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">DESCRIPTION / INSTRUCTIONS</label>
                  <Textarea
                    ref={descriptionRef}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                      className="w-full resize-none"
                    placeholder="Enter any special instructions for your custom design..."
                      rows={4}
                  />
                </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">REFERENCE LINKS (OPTIONAL)</label>
                  <Input
                    value={referenceLinks}
                    onChange={(e) => setReferenceLinks(e.target.value)}
                    className="w-full"
                    placeholder="Paste links to design references, Pinterest, etc."
                  />
                </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">UPLOAD DESIGN FILES (OPTIONAL)</label>
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
                        <span className="text-sm text-gray-600 whitespace-nowrap">{designFiles.length} file(s) selected</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Upload images, PDFs, or documents (max 10MB each)</p>
                </div>
                  </div>
              </div>
                )}
            </section>
          </div>

            {/* Right Column */}
            <aside className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-lg border border-purple-100 p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                  Order subtotal ({displayItems.reduce((sum, item) => sum + item.quantity, 0)} {displayItems.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'item' : 'items'}): ₹{displaySubtotal.toLocaleString()}
                </h2>
                
                {/* Available Coupons Section */}
                {availableCoupons.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-3">AVAILABLE COUPONS</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableCoupons.map((coupon) => {
                        const isApplicable = isCouponApplicable(coupon);
                        const discountAmount = calculateCouponDiscount(coupon);
                        const isApplied = appliedCoupon?.code === coupon.code;
                        
                        return (
                          <button
                            key={coupon._id || coupon.code}
                            onClick={() => {
                              if (isApplied) {
                                setAppliedCoupon(null);
                                setCouponDiscount(0);
                                setDiscountCode('');
                              } else if (isApplicable) {
                                setDiscountCode(coupon.code);
                                applyCoupon(coupon.code, false, coupon);
                              } else {
                                toast({
                                  title: "Coupon Not Applicable",
                                  description: coupon.minPrice 
                                    ? `Minimum order value of ₹${coupon.minPrice} required`
                                    : coupon.minQuantity
                                    ? `Minimum quantity of ${coupon.minQuantity} required`
                                    : coupon.category && coupon.category !== 'All'
                                    ? `This coupon is only valid for ${coupon.category} category`
                                    : "This coupon is not applicable to your cart",
                                  variant: "destructive",
                                });
                              }
                            }}
                            disabled={!isApplicable && !isApplied}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                              isApplied
                                ? 'border-purple-500 bg-purple-50'
                                : isApplicable
                                ? 'border-purple-200 bg-white hover:border-purple-400 hover:bg-purple-50 cursor-pointer'
                                : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900">{coupon.code}</span>
                                  {isApplied && (
                                    <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded">Applied</span>
                                  )}
                                  {!isApplicable && !isApplied && (
                                    <span className="text-xs bg-gray-400 text-white px-2 py-0.5 rounded">Not Applicable</span>
                                  )}
                                </div>
                                {coupon.title && (
                                  <p className="text-sm text-gray-700 mb-1">{coupon.title}</p>
                                )}
                                <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                                  {coupon.discountType === 'percentage' && (
                                    <span>{coupon.discountValue}% OFF</span>
                                  )}
                                  {coupon.discountType === 'fixed' && (
                                    <span>₹{coupon.discountValue} OFF</span>
                                  )}
                                  {coupon.discountType === 'price_override' && (
                                    <span>₹{coupon.discountValue} OFF per item</span>
                                  )}
                                  {coupon.minPrice && (
                                    <span>• Min ₹{coupon.minPrice}</span>
                                  )}
                                  {coupon.minQuantity && (
                                    <span>• Min {coupon.minQuantity} items</span>
                                  )}
                                  {coupon.category && coupon.category !== 'All' && (
                                    <span>• {coupon.category} only</span>
                                  )}
                                </div>
                              </div>
                              {isApplicable && discountAmount > 0 && (
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-purple-600">
                                    Save ₹{discountAmount.toLocaleString()}
                                  </div>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Summary Box */}
                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="mb-4">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-3">PROMO CODE</label>
                    <div className="flex gap-2">
                <Input
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder="Enter code"
                  className="flex-1"
                />
                      <Button 
                        variant="outline" 
                        className="whitespace-nowrap"
                        onClick={() => {
                          if (appliedCoupon) {
                            setAppliedCoupon(null);
                            setCouponDiscount(0);
                            setDiscountCode('');
                          } else {
                            applyCoupon(discountCode);
                          }
                        }}
                      >
                        {appliedCoupon ? 'Remove' : 'Apply'}
                      </Button>
              </div>
            </div>
                  <div className="space-y-2 pt-4 border-t">
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-600 mb-2">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Subtotal</span>
                      <span className="font-semibold">₹{displaySubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Shipping</span>
                      <span className="font-semibold text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">₹{displayTotal.toLocaleString()}</span>
              </div>
            </div>
                </div>

                <p className="text-sm text-purple-600 font-medium mb-6 text-center">
                  Assured delivery by 1-12 days
                </p>

            <button 
                  className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-md transition-colors"
              onClick={handlePlaceOrder}
                  style={{ backgroundColor: '#000000' }}
            >
                  Continue to payment
            </button>
              </div>

              {/* Cart Items */}
              <div className="bg-white rounded-lg border border-purple-100 p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                  Cart ({displayItems.reduce((sum, item) => sum + item.quantity, 0)} {displayItems.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'Item' : 'Items'})
                </h2>
                <div className="space-y-3">
                  {displayItems.map((item) => {
                    // Extract color from product name if it's in parentheses, or use item.color
                    const colorMatch = item.name.match(/\(([^)]+)\)/);
                    const displayColor = item.color || (colorMatch ? colorMatch[1] : null);
                    // Remove color from name for display
                    const nameWithoutColor = item.name.replace(/\s*\([^)]+\)\s*$/, '').trim();
                    // Get product URL - use slug if available, otherwise use id
                    const productUrl = item.slug ? `/product/${item.slug}` : `/product/${item.id}`;
                    
                    return (
                    <div key={`${item.id}-${item.size}`} className="flex gap-2 items-center">
                      <Link 
                        to={productUrl}
                        className="flex-shrink-0"
                        onClick={(e) => {
                          // Don't navigate if clicking on quantity buttons
                          if (e.target.closest('button')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-12 h-12 object-cover rounded flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={productUrl}
                          className="block hover:text-purple-600 transition-colors"
                        >
                          <p className="font-semibold text-xs text-gray-900 mb-0.5 leading-tight">{nameWithoutColor}</p>
                        </Link>
                        <p className="text-xs text-gray-600 mb-1 leading-tight">
                          {item.category} · Size {String(item.size).replace(/[\[\]"]/g, '').replace(/\\/g, '').trim()}
                        </p>
                        {displayColor && (
                          <p className="text-xs text-purple-600 font-medium mb-1.5">
                            Color: {displayColor}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 border border-gray-200 rounded">
                            <button 
                              className="p-1.5 hover:bg-gray-100 transition-colors"
                              onClick={() => {
                                if (isBuyNow && buyNowProduct && item.id === buyNowProduct.id) {
                                  updateBuyNowQuantity(item.quantity - 1);
                                } else {
                                  updateQuantity(item.id, item.size, item.quantity - 1);
                                }
                              }}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="px-2 text-sm font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                            <button 
                              className="p-1.5 hover:bg-gray-100 transition-colors"
                              onClick={() => {
                                if (isBuyNow && buyNowProduct && item.id === buyNowProduct.id) {
                                  updateBuyNowQuantity(item.quantity + 1);
                                } else {
                                  updateQuantity(item.id, item.size, item.quantity + 1);
                                }
                              }}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="font-semibold text-xs text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
          </aside>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
