import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";
import { authAPI, userAPI } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Auth = () => {
  const [mode, setMode] = useState("login"); // "login", "signup", "forgot-password", "reset-password", "login-otp", "signup-otp"
  const [authMethod, setAuthMethod] = useState("password"); // "password" or "otp"
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", otp: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, googleLogin, isAuthenticated, refreshUser } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get("redirect") || "/";

  // Redirect if already authenticated (but not if phone modal is showing)
  useEffect(() => {
    if (isAuthenticated && !showPhoneModal) {
      const targetPath = redirect.startsWith("/") ? redirect : "/";
      // Use window.location for a full page reload to avoid white screen
      window.location.href = targetPath;
    }
  }, [isAuthenticated, redirect, showPhoneModal]);

  // Google Sign-In handler
  useEffect(() => {
    const handleGoogleSignIn = async (response) => {
      try {
        setLoading(true);
        const { credential } = response;
        
        // Decode JWT token to get user info
        const base64Url = credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const googleUser = JSON.parse(jsonPayload);
        
        // Call backend with Google user info
        const result = await googleLogin(
          googleUser.sub,
          googleUser.email,
          googleUser.name,
          googleUser.picture
        );

        if (result.success) {
          // Check if user has phone number
          if (!result.user?.phone || result.user.phone === '') {
            // Show phone collection modal
            setPendingGoogleUser({ 
              ...googleUser, 
              token: result.token, 
              user: result.user,
              name: googleUser.name 
            });
            setShowPhoneModal(true);
            setLoading(false);
            return;
          }
          
          toast({
            title: "Login Successful",
            description: `Welcome to Looklyn, ${googleUser.name}!`,
          });
          const targetPath = redirect.startsWith("/") ? redirect : "/";
          setTimeout(() => {
            window.location.href = targetPath;
          }, 1000);
        } else {
          toast({
            title: "Authentication Failed",
            description: result.error || "Please try again",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // Initialize Google Sign-In when Google API is loaded
    const initGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
          console.warn('Google Client ID not configured. Add VITE_GOOGLE_CLIENT_ID to .env');
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleSignIn,
        });

        // Render button
        const buttonContainer = document.getElementById('google-signin-button');
        if (buttonContainer && (mode === "login" || mode === "login-otp" || mode === "signup" || mode === "signup-otp") && !otpSent) {
          window.google.accounts.id.renderButton(buttonContainer, {
            type: 'standard',
            size: 'large',
            theme: 'outline',
            text: mode.includes("login") ? 'signin_with' : 'signup_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: '100%'
          });
        }
      }
    };

    // Wait for Google API to load
    if (window.google && window.google.accounts) {
      initGoogleSignIn();
    } else {
      // Check periodically if Google API is loaded
      const checkInterval = setInterval(() => {
        if (window.google && window.google.accounts) {
          initGoogleSignIn();
          clearInterval(checkInterval);
        }
      }, 100);

      // Cleanup after 10 seconds
      setTimeout(() => clearInterval(checkInterval), 10000);
    }

    return () => {
      const buttonContainer = document.getElementById('google-signin-button');
      if (buttonContainer) {
        buttonContainer.innerHTML = '';
      }
    };
  }, [googleLogin, redirect, toast, mode, otpSent]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      let result;
      
      if (mode === "forgot-password") {
        // Send password reset link
        const response = await authAPI.forgotPassword(form.email);
        toast({
          title: "Reset Link Sent",
          description: response.message || "Check your email for the password reset link",
        });
        setLoading(false);
        return;
      } else if (mode === "login-otp") {
        if (!otpSent) {
          // Send OTP
          await authAPI.sendLoginOtp(form.email);
          setOtpSent(true);
          toast({
            title: "OTP Sent",
            description: "Check your email for the OTP code",
          });
          setLoading(false);
          return;
        } else {
          // Verify OTP and login
          const response = await authAPI.loginWithOtp(form.email, form.otp);
          if (response.token && response.user) {
            localStorage.setItem('authToken', response.token);
            result = { success: true };
          } else {
            result = { success: false, error: response.error || 'Login failed' };
          }
        }
      } else if (mode === "signup-otp") {
        if (!otpSent) {
          // Send OTP (with phone if provided)
          await authAPI.sendOtp(form.email, "signup", form.phone || null);
          setOtpSent(true);
          toast({
            title: "OTP Sent",
            description: form.phone ? "Check your email and WhatsApp for the OTP code" : "Check your email for the OTP code",
          });
          setLoading(false);
          return;
        } else {
          // Verify OTP and signup
          if (!form.phone) {
            toast({
              title: "Phone Number Required",
              description: "Phone number is required for WhatsApp order confirmations",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          const response = await authAPI.signupWithOtp(form.name, form.email, form.otp, form.phone);
          if (response.token && response.user) {
            localStorage.setItem('authToken', response.token);
            result = { success: true };
          } else {
            result = { success: false, error: response.error || 'Signup failed' };
          }
        }
      } else if (mode === "login") {
        result = await login({ email: form.email, password: form.password });
      } else if (mode === "signup") {
        if (!form.phone) {
          toast({
            title: "Phone Number Required",
            description: "Phone number is required for WhatsApp order confirmations",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        result = await signup({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      }

      if (result && result.success) {
        toast({
          title: (mode === "login" || mode === "login-otp") ? "Login Successful" : "Account Created",
          description: `Welcome to Looklyn!`,
        });
        // Use window.location for a full page reload to avoid white screen
        const targetPath = redirect.startsWith("/") ? redirect : "/";
        setTimeout(() => {
          window.location.href = targetPath;
        }, 1000);
      } else if (result) {
        toast({
          title: "Authentication Failed",
          description: result.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_70%)]">
      <div className="px-4 sm:px-6 pb-8 sm:pb-12 pt-6">
        <Header />
      </div>
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6 rounded-[36px] border border-white/15 bg-[var(--card)]/95 p-8 shadow-[var(--shadow-soft)]">
        <button className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] transition-all duration-200 bg-transparent hover:bg-purple-200 hover:shadow-sm active:bg-purple-300" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div>
          <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">
            {mode === "login" || mode === "login-otp" ? "Welcome back" : 
             mode === "signup" || mode === "signup-otp" ? "Create account" :
             mode === "forgot-password" ? "Reset password" :
             "Authentication"}
          </p>
          <h1 className="text-3xl font-black">Looklyn</h1>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div>
              <label className="text-sm font-medium">Full name</label>
              <Input 
                value={form.name} 
                onChange={(event) => setForm({ ...form, name: event.target.value })} 
                placeholder="Aarya Patel" 
                required 
              />
            </div>
          )}
          
          {/* Email Input - for all modes except reset-password (which has its own page) */}
          {mode !== "reset-password" && (
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email" 
                value={form.email} 
                onChange={(event) => setForm({ ...form, email: event.target.value })} 
                placeholder="you@email.com" 
                required
                autoComplete="email"
              />
            </div>
          )}

          {/* Phone Number Input - required for signup */}
          {(mode === "signup" || mode === "signup-otp") && (
            <div>
              <label className="text-sm font-medium">Phone Number <span className="text-red-500">*</span></label>
              <Input 
                type="tel" 
                value={form.phone} 
                onChange={(event) => setForm({ ...form, phone: event.target.value })} 
                placeholder="+91 9876543210" 
                required
                autoComplete="tel"
              />
              <p className="text-xs text-muted-foreground mt-1">Required for WhatsApp order confirmations</p>
            </div>
          )}

          {/* Password Input - only for password-based auth */}
          {(mode === "login" || mode === "signup") && (
            <div>
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={form.password} 
                  onChange={(event) => setForm({ ...form, password: event.target.value })} 
                  placeholder="••••••••" 
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* OTP Input for OTP modes */}
          {(mode === "login-otp" || mode === "signup-otp") && otpSent && (
            <div>
              <label className="text-sm font-medium">OTP Code</label>
              <Input 
                type="text" 
                value={form.otp} 
                onChange={(event) => setForm({ ...form, otp: event.target.value })} 
                placeholder="Enter 6-digit OTP" 
                maxLength={6}
                required 
              />
            </div>
          )}

          {/* Auth Method Toggle */}
          {(mode === "login" || mode === "login-otp") && (
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setAuthMethod("password");
                    setOtpSent(false);
                    setForm({ ...form, otp: "" });
                  }}
                  className={`text-xs px-3 py-1 rounded-full ${mode === "login" ? "bg-primary text-white" : "bg-gray-200 text-gray-700"}`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("login-otp");
                    setAuthMethod("otp");
                    setOtpSent(false);
                    setForm({ ...form, password: "", otp: "" });
                  }}
                  className={`text-xs px-3 py-1 rounded-full ${mode === "login-otp" ? "bg-primary text-white" : "bg-gray-200 text-gray-700"}`}
                >
                  OTP
                </button>
              </div>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot-password");
                    setOtpSent(false);
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
          )}

          {(mode === "signup" || mode === "signup-otp") && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setAuthMethod("password");
                  setOtpSent(false);
                  setForm({ ...form, otp: "" });
                }}
                className={`text-xs px-3 py-1 rounded-full ${mode === "signup" ? "bg-primary text-white" : "bg-gray-200 text-gray-700"}`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup-otp");
                  setAuthMethod("otp");
                  setOtpSent(false);
                  setForm({ ...form, password: "", otp: "" });
                }}
                className={`text-xs px-3 py-1 rounded-full ${mode === "signup-otp" ? "bg-primary text-white" : "bg-gray-200 text-gray-700"}`}
              >
                OTP
              </button>
            </div>
          )}

          <Button 
            type="submit"
            className="w-full rounded-full bg-foreground py-4 text-xs font-semibold uppercase tracking-[0.4em] text-background"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "login" || mode === "login-otp" ? "Logging in..." : 
                 mode === "signup" || mode === "signup-otp" ? "Creating account..." :
                 mode === "forgot-password" ? "Sending reset link..." :
                 "Processing..."}
              </>
            ) : (
              mode === "login" || mode === "login-otp" ? (otpSent ? "Verify OTP" : "Log in") : 
              mode === "signup" || mode === "signup-otp" ? (otpSent ? "Verify OTP" : "Sign up") :
              mode === "forgot-password" ? "Send Reset Link" :
              "Submit"
            )}
          </Button>

          {/* Google Sign-In Button */}
          {(mode === "login" || mode === "login-otp" || mode === "signup" || mode === "signup-otp") && !otpSent && (
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[var(--card)] px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <div id="google-signin-button" className="w-full flex justify-center"></div>
            </div>
          )}
        </form>
        <p className="text-center text-sm text-muted-foreground">
          {(mode === "login" || mode === "login-otp") ? (
            <>
              New here?{" "}
              <button className="font-semibold text-primary" onClick={() => {
                setMode("signup");
                setAuthMethod("password");
                setOtpSent(false);
                setForm({ ...form, otp: "" });
              }}>
                Create account
              </button>
            </>
          ) : (mode === "signup" || mode === "signup-otp") ? (
            <>
              Already have an account?{" "}
              <button className="font-semibold text-primary" onClick={() => {
                setMode("login");
                setAuthMethod("password");
                setOtpSent(false);
                setForm({ ...form, otp: "" });
              }}>
                Log in
              </button>
            </>
          ) : mode === "forgot-password" ? (
            <>
              Remember your password?{" "}
              <button className="font-semibold text-primary" onClick={() => {
                setMode("login");
                setOtpSent(false);
              }}>
                Log in
              </button>
            </>
          ) : null}
        </p>
        </div>
      </div>

      {/* Phone Number Collection Modal for Google OAuth */}
      <Dialog open={showPhoneModal} onOpenChange={(open) => {
        // Prevent closing without phone number
        if (!open && (!form.phone || form.phone.trim() === '')) {
          toast({
            title: "Phone Number Required",
            description: "You must provide a phone number to continue",
            variant: "destructive",
          });
          return;
        }
        setShowPhoneModal(open);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Phone Number Required</DialogTitle>
            <DialogDescription>
              We need your phone number to contact you via WhatsApp for order confirmations. This is required to complete your account setup.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!form.phone || form.phone.trim() === '') {
                toast({
                  title: "Phone Number Required",
                  description: "Please enter your phone number",
                  variant: "destructive",
                });
                return;
              }

              try {
                setLoading(true);
                // Update user profile with phone number
                await userAPI.updateProfile({ phone: form.phone });
                
                // Refresh user data to get updated profile and set authenticated
                if (pendingGoogleUser?.token) {
                  localStorage.setItem('authToken', pendingGoogleUser.token);
                  // Refresh user data which will set authenticated state
                  await refreshUser();
                  
                  toast({
                    title: "Account Setup Complete",
                    description: `Welcome to Looklyn, ${pendingGoogleUser?.name || 'User'}!`,
                  });
                  
                  const targetPath = redirect.startsWith("/") ? redirect : "/";
                  // Use window.location for full reload to ensure auth state is updated
                  setTimeout(() => {
                    window.location.href = targetPath;
                  }, 1000);
                }
              } catch (error) {
                toast({
                  title: "Error",
                  description: error.message || "Failed to save phone number. Please try again.",
                  variant: "destructive",
                });
                setLoading(false);
              }
            }}
            className="space-y-4 mt-4"
          >
            <div>
              <label className="text-sm font-medium">Phone Number <span className="text-red-500">*</span></label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                placeholder="+91 9876543210"
                required
                autoComplete="tel"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1">Required for WhatsApp order confirmations</p>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;

