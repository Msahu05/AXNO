import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, MapPin, Save, Edit2 } from "lucide-react";
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

const Account = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, refreshUser } = useAuth();
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
    if (!isAuthenticated) {
      navigate("/auth?redirect=/account");
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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Format phone number to ensure +91 prefix
      let formattedPhone = profileData.phone || '';
      if (formattedPhone && !formattedPhone.startsWith('+91')) {
        const cleaned = formattedPhone.replace(/^\+91\s*/, '').replace(/^91\s*/, '').trim();
        formattedPhone = '+91 ' + cleaned;
      }

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
        title: "Update Failed",
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
      // Format phone number to ensure +91 prefix
      let formattedPhone = addressData.phone || '';
      if (formattedPhone && !formattedPhone.startsWith('+91')) {
        const cleaned = formattedPhone.replace(/^\+91\s*/, '').replace(/^91\s*/, '').trim();
        formattedPhone = '+91 ' + cleaned;
      }
      addressData.phone = formattedPhone;

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
        title: "Failed",
        description: error.message || "Failed to save address",
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
                    onChange={(e) => {
                      let value = e.target.value;
                      // Auto-format to +91 if user types number
                      if (value && !value.startsWith('+91') && !value.startsWith('+')) {
                        // Remove any non-digit characters except + and space
                        const digits = value.replace(/\D/g, '');
                        if (digits) {
                          value = '+91 ' + digits;
                        }
                      }
                      setProfileData({ ...profileData, phone: value });
                    }}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingAddress(address)}
                          className="rounded-full"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>City</Label>
            <Input
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="City"
              required
            />
          </div>
          <div>
            <Label>State</Label>
            <Input
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="State"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Pincode</Label>
            <Input
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              placeholder="Pincode"
              required
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => {
                let value = e.target.value;
                // Auto-format to +91 if user types number
                if (value && !value.startsWith('+91') && !value.startsWith('+')) {
                  // Remove any non-digit characters except + and space
                  const digits = value.replace(/\D/g, '');
                  if (digits) {
                    value = '+91 ' + digits;
                  }
                }
                setFormData({ ...formData, phone: value });
              }}
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

