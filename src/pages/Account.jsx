import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, MapPin, Save, Edit2, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/auth-context";
import { userAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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

const Account = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, refreshUser, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile");
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) {
      return;
    }
    
    if (!isAuthenticated) {
      // Only redirect if not already on auth page to prevent loops
      if (window.location.pathname !== '/auth') {
        navigate("/auth?redirect=/account", { replace: true });
      }
      return;
    }

    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }

    loadAddresses();
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const loadAddresses = async () => {
    try {
      const data = await userAPI.getAddresses();
      setAddresses(data.addresses || []);
    } catch (error) {
      console.error("Failed to load addresses:", error);
      setAddresses([]);
    }
  };

  // Helper function to format and validate phone number
  const formatPhoneNumber = (phone) => {
    if (!phone || phone.trim() === '') {
      throw new Error('Phone number is required');
    }

    // Check if phone starts with +91
    if (phone.trim().startsWith('+91')) {
      // Extract digits after +91
      const afterPrefix = phone.replace(/^\+91\s*/, '');
      const digits = afterPrefix.replace(/\D/g, '');
      
      if (digits.length !== 10) {
        throw new Error('Phone number must have exactly 10 digits after +91');
      }
      
      return '+91 ' + digits;
    } else {
      // Extract all digits
      const digits = phone.replace(/\D/g, '');
      let cleanedDigits = digits;
      
      // Remove leading 91 if present
      if (cleanedDigits.startsWith('91') && cleanedDigits.length > 10) {
        cleanedDigits = cleanedDigits.substring(2);
      }
      
      if (cleanedDigits.length !== 10) {
        throw new Error('Phone number must have exactly 10 digits');
      }
      
      return '+91 ' + cleanedDigits;
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Format and validate phone number
      const formattedPhone = formatPhoneNumber(profileData.phone);

      const updatedUser = await userAPI.updateProfile({
        name: profileData.name,
        phone: formattedPhone,
      });

      // Update local state
      setProfileData({
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
      });

      // Refresh user in auth context
      await refreshUser();

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      toast({
        title: error.message?.includes('10 digits') ? "Invalid Phone Number" : "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress({
      name: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      isDefault: addresses.length === 0,
    });
  };

  const handleSaveAddress = async (addressData) => {
    setLoading(true);
    try {
      // Format and validate phone number
      if (addressData.phone) {
        addressData.phone = formatPhoneNumber(addressData.phone);
      }

      if (editingAddress._id) {
        await userAPI.updateAddress(editingAddress._id, addressData);
        toast({
          title: "Address Updated",
          description: "Address has been updated successfully",
        });
      } else {
        await userAPI.addAddress(addressData);
        toast({
          title: "Address Added",
          description: "New address has been added successfully",
        });
      }
      setEditingAddress(null);
      await loadAddresses();
    } catch (error) {
      toast({
        title: error.message?.includes('10 digits') ? "Invalid Phone Number" : "Failed",
        description: error.message || "Failed to save address",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    setLoading(true);
    try {
      await userAPI.deleteAddress(addressId);
      toast({
        title: "Address Deleted",
        description: "Address has been deleted successfully",
      });
      await loadAddresses();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete address",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_60%)]">
      <div className="px-4 sm:px-6 pb-8 sm:pb-12 pt-6">
        <Header />
      </div>
      <div className="px-4 py-10">
        <div className="mx-auto max-w-4xl space-y-6">
        <button
          className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground transition-all duration-200 bg-transparent hover:bg-purple-200 hover:shadow-sm active:bg-purple-300 hover:text-foreground"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div>
          <h1 className="text-4xl font-black font-display">Account Settings</h1>
          <p className="mt-2 text-muted-foreground">Manage your account details and addresses</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          setSearchParams({ tab: value });
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-full bg-[var(--card)]/90 p-1">
            <TabsTrigger value="profile" className="rounded-full font-display">Profile</TabsTrigger>
            <TabsTrigger value="addresses" className="rounded-full font-display">Addresses</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="rounded-[36px] border border-white/15 bg-[var(--card)]/95 p-8 shadow-[var(--shadow-soft)]">
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="mt-2"
                    required
                    disabled
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="mt-2"
                    placeholder="+91 1234567890"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Phone number must start with +91</p>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-full bg-foreground py-6 text-sm font-semibold uppercase tracking-[0.2em] text-background"
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="addresses" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold font-display">Saved Addresses</h2>
                <Button
                  onClick={handleAddAddress}
                  className="rounded-full bg-foreground px-6 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-background"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Add Address
                </Button>
              </div>

              {editingAddress && (
                <AddressForm
                  address={editingAddress}
                  onSave={handleSaveAddress}
                  onCancel={() => setEditingAddress(null)}
                  loading={loading}
                />
              )}

              {addresses.length === 0 && !editingAddress ? (
                <div className="rounded-[36px] border border-white/15 bg-[var(--card)]/95 p-12 text-center">
                  <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">No addresses saved yet</p>
                  <Button
                    onClick={handleAddAddress}
                    className="mt-4 rounded-full bg-foreground px-6 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-background"
                  >
                    Add Your First Address
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {addresses.map((address, index) => (
                    <div
                      key={index}
                      className="rounded-[28px] border border-white/15 bg-[var(--card)]/95 p-6 shadow-[var(--shadow-soft)]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {address.isDefault && (
                            <span className="mb-2 inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                              Default
                            </span>
                          )}
                          <p className="font-semibold">{address.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{address.address}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          {address.phone && (
                            <p className="mt-1 text-sm text-muted-foreground">Phone: {address.phone}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingAddress(address)}
                            className="rounded-full"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAddress(address._id)}
                            className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
};

const AddressForm = ({ address, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState(address);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [stateSuggestions, setStateSuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showStateSuggestions, setShowStateSuggestions] = useState(false);
  const [loadingPincode, setLoadingPincode] = useState(false);

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
        if (!formData.city) {
          setFormData({ ...formData, city: postOffice.District || postOffice.Name || "" });
        }
        if (!formData.state) {
          setFormData({ ...formData, state: postOffice.State || "" });
        }
      }
    } catch (error) {
      console.error("Error fetching pincode details:", error);
    } finally {
      setLoadingPincode(false);
    }
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData({ ...formData, pincode: value });
    if (value.length === 6) {
      fetchPincodeDetails(value);
    }
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, city: value });
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
    setFormData({ ...formData, state: value });
    if (value.length > 0) {
      const filtered = INDIAN_STATES.filter(s => s.toLowerCase().includes(value.toLowerCase())).slice(0, 5);
      setStateSuggestions(filtered);
      setShowStateSuggestions(true);
    } else {
      setShowStateSuggestions(false);
    }
  };

  const selectCity = (selectedCity) => {
    setFormData({ ...formData, city: selectedCity });
    setShowCitySuggestions(false);
    // Find state for the city
    for (const [stateName, cities] of Object.entries(INDIAN_CITIES)) {
      if (cities.includes(selectedCity)) {
        setFormData({ ...formData, city: selectedCity, state: stateName });
        break;
      }
    }
  };

  const selectState = (selectedState) => {
    setFormData({ ...formData, state: selectedState });
    setShowStateSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="rounded-[36px] border border-white/15 bg-[var(--card)]/95 p-6 shadow-[var(--shadow-soft)]">
      <h3 className="mb-4 text-lg font-semibold font-display">
        {address._id ? "Edit Address" : "Add New Address"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Full Name"
            required
          />
        </div>
        <div>
          <Label>Address</Label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Street address"
            required
          />
        </div>
        <div className="relative">
          <Label>
            Pincode {loadingPincode && <Loader2 className="inline h-3 w-3 animate-spin ml-2" />}
          </Label>
          <Input
            value={formData.pincode}
            onChange={handlePincodeChange}
            placeholder="Pincode"
            maxLength={6}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <Label>City</Label>
            <Input
              value={formData.city}
              onChange={handleCityChange}
              onFocus={() => formData.city && setShowCitySuggestions(true)}
              onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
              placeholder="City"
              required
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
            <Label>State</Label>
            <Input
              value={formData.state}
              onChange={handleStateChange}
              onFocus={() => formData.state && setShowStateSuggestions(true)}
              onBlur={() => setTimeout(() => setShowStateSuggestions(false), 200)}
              placeholder="State"
              required
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
        </div>
        <div>
          <div>
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 1234567890"
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">Phone number must start with +91</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isDefault"
            checked={formData.isDefault}
            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="isDefault" className="cursor-pointer">
            Set as default address
          </Label>
        </div>
        <div className="flex gap-3">
          <Button
            type="submit"
            className="flex-1 rounded-full bg-foreground py-3 text-sm font-semibold uppercase tracking-[0.2em] text-background"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Address"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-full py-3"
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Account;

