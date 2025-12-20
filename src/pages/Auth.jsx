import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";
import { authAPI, userAPI } from "@/lib/api";
import TermsAndConditions from "@/components/TermsAndConditions";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", otp: "", newPassword: "", confirmPassword: "", termsAccepted: false });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [pendingGoogleSignIn, setPendingGoogleSignIn] = useState(null);
  const [pendingLogin, setPendingLogin] = useState(null); // Store login credentials when Terms required
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, googleLogin, isAuthenticated, refreshUser } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get("redirect") || "/";

  // Redirect if already authenticated (but not if phone modal is showing)
  useEffect(() => {
    // Only redirect if authenticated, not showing phone modal, and not already on target path
    if (isAuthenticated && !showPhoneModal && location.pathname === '/auth') {
      const targetPath = redirect.startsWith("/") ? redirect : "/";
      // Use replace to avoid adding to history and prevent loops
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, redirect, showPhoneModal, location.pathname, navigate]);

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
        
        // For new users, we need Terms acceptance
        // Try login first - if it fails with Terms error, show Terms dialog
        const result = await googleLogin(
          googleUser.sub,
          googleUser.email,
          googleUser.name,
          googleUser.picture,
          false // Don't send termsAccepted yet - backend will check if user exists
        );

        if (result.success) {
          // User exists - proceed normally
          if (!result.user?.phone || result.user.phone === '') {
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
            navigate(targetPath, { replace: true });
          }, 1000);
        } else if (result.error && result.error.includes('Terms')) {
          // New user - Terms required
          setPendingGoogleSignIn({
            googleId: googleUser.sub,
            email: googleUser.email,
            name: googleUser.name,
            image: googleUser.picture
          });
          setShowTermsDialog(true);
          setLoading(false);
        } else {
          toast({
            title: "Authentication Failed",
            description: result.error || "Please try again",
            variant: "destructive",
          });
          setLoading(false);
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
          try {
            const response = await authAPI.loginWithOtp(form.email, form.otp);
            if (response.token && response.user) {
              localStorage.setItem('authToken', response.token);
              result = { success: true };
            } else {
              result = { success: false, error: response.error || 'Login failed' };
            }
          } catch (error) {
            result = { success: false, error: error.message || 'Login failed' };
            // Check if Terms acceptance is required
            if (error.message && (error.message.includes('Terms') || error.message.includes('terms'))) {
              setPendingLogin({ email: form.email, otp: form.otp, mode: 'login-otp' });
              setShowTermsDialog(true);
              setLoading(false);
              return;
            }
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
          if (!form.termsAccepted) {
            toast({
              title: "Terms & Conditions Required",
              description: "You must accept the Terms & Conditions to create an account",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          const response = await authAPI.signupWithOtp(form.name, form.email, form.otp, form.phone, form.termsAccepted);
          if (response.token && response.user) {
            localStorage.setItem('authToken', response.token);
            result = { success: true };
          } else {
            result = { success: false, error: response.error || 'Signup failed' };
          }
        }
      } else if (mode === "login") {
        result = await login({ email: form.email, password: form.password });
        // Check if Terms acceptance is required
        if (!result.success && result.error && (result.error.includes('Terms') || result.error.includes('terms'))) {
          setPendingLogin({ email: form.email, password: form.password });
          setShowTermsDialog(true);
          setLoading(false);
          return;
        }
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
        if (!form.termsAccepted) {
          toast({
            title: "Terms & Conditions Required",
            description: "You must accept the Terms & Conditions to create an account",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        result = await signup({ name: form.name, email: form.email, password: form.password, phone: form.phone, termsAccepted: form.termsAccepted });
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
    <div className="min-h-screen bg-background width:1480px">
      <div className="px-4 sm:px-6 pb-8 sm:pb-12 pt-6 width:1480px">
        <Header />
      </div>
      <div className="flex items-center justify-center px-4 py-8 sm:py-12 width:1480px">
        <div className="w-full  auth-card" style={{width:"1480px"}}>
          <button 
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-1" 
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> 
            <span>Back</span>
          </button>
          <div 
            className="w-full bg-card rounded-[24px] border border-border shadow-soft"
            style={{ padding: '32px' }}
          >
          {/* Header Section */}
          <div className="text-center mb-6">
            <h1 className="font-heading text-h1 text-foreground mb-2">
              {mode === "login" || mode === "login-otp" ? "Welcome back" : 
               mode === "signup" || mode === "signup-otp" ? "Create account" :
               mode === "forgot-password" ? "Reset password" :
               "Authentication"}
            </h1>
            {(mode === "login" || mode === "login-otp") && (
              <p className="text-body text-muted-foreground font-normal">
                Sign in to continue to Looklyn
              </p>
            )}
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <style>{`
              .auth-card {
                width: 100% !important;
                max-width: 600px !important;
                margin: 0 auto !important;
                display: flex !important;
                flex-direction: column !important;
              }
              .auth-card > div {
                width: 100% !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
              }
              @media (max-width: 640px) {
                .auth-card {
                  max-width: 90% !important;
                }
                .auth-card > div {
                  padding: 28px 24px !important;
                }
                .auth-card input,
                .auth-card button[type="submit"] {
                  min-height: 48px;
                }
              }
            `}</style>
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label className="text-[0.85rem] font-medium text-foreground" style={{ lineHeight: '1.45' }}>Full name</label>
              <Input 
                value={form.name} 
                onChange={(event) => setForm({ ...form, name: event.target.value })} 
                placeholder="Aarya Patel" 
                required 
                className="border-border rounded-[12px] px-[18px] h-auto focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:border-primary transition-all duration-[200ms]"
                style={{ borderWidth: '1px', paddingTop: '12px', paddingBottom: '14px' }}
              />
            </div>
          )}
          
          {/* Email Input - for all modes except reset-password (which has its own page) */}
          {mode !== "reset-password" && (
            <div className="space-y-1.5">
              <label className="text-[0.85rem] font-medium text-foreground" style={{ lineHeight: '1.45' }}>Email</label>
              <Input 
                type="email" 
                value={form.email} 
                onChange={(event) => setForm({ ...form, email: event.target.value })} 
                placeholder="you@email.com" 
                required
                autoComplete="email"
                className="border-border rounded-[12px] px-[18px] h-auto focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:border-primary transition-all duration-[200ms]"
                style={{ borderWidth: '1px', paddingTop: '12px', paddingBottom: '14px' }}
              />
            </div>
          )}

          {/* Phone Number Input - required for signup */}
          {(mode === "signup" || mode === "signup-otp") && (
            <div className="space-y-1.5">
              <label className="text-[0.85rem] font-medium text-foreground" style={{ lineHeight: '1.45' }}>Phone Number <span className="text-red-500">*</span></label>
              <Input 
                type="tel" 
                value={form.phone} 
                onChange={(event) => setForm({ ...form, phone: event.target.value })} 
                placeholder="+91 9876543210" 
                required
                autoComplete="tel"
                className="border-border rounded-[12px] px-[18px] h-auto focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:border-primary transition-all duration-[200ms]"
                style={{ borderWidth: '1px', paddingTop: '12px', paddingBottom: '14px' }}
              />
              <p className="text-xs text-muted-foreground mt-1" style={{ lineHeight: '1.45' }}>Required for WhatsApp order confirmations</p>
            </div>
          )}

          {/* Password Input - only for password-based auth */}
          {(mode === "login" || mode === "signup") && (
            <div className="space-y-1.5">
              <label className="text-[0.85rem] font-medium text-foreground" style={{ lineHeight: '1.45' }}>Password</label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={form.password} 
                  onChange={(event) => setForm({ ...form, password: event.target.value })} 
                  placeholder="••••••••" 
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="border-[#efe8ff] dark:border-[#4a4a5a] rounded-[12px] px-[18px] pr-12 h-auto focus-visible:ring-2 focus-visible:ring-[#8d73e8] focus-visible:ring-offset-1 focus-visible:border-[#8d73e8] transition-all duration-[200ms]"
                  style={{ borderWidth: '1px', paddingTop: '12px', paddingBottom: '14px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-[200ms] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-md p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          {/* OTP Input for OTP modes */}
          {(mode === "login-otp" || mode === "signup-otp") && otpSent && (
            <div className="space-y-1.5">
              <label className="text-[0.85rem] font-medium text-foreground" style={{ lineHeight: '1.45' }}>OTP Code</label>
              <Input 
                type="text" 
                value={form.otp} 
                onChange={(event) => setForm({ ...form, otp: event.target.value })} 
                placeholder="Enter 6-digit OTP" 
                maxLength={6}
                required 
                className="border-border rounded-[12px] px-[18px] h-auto focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:border-primary transition-all duration-[200ms]"
                style={{ borderWidth: '1px', paddingTop: '12px', paddingBottom: '14px' }}
              />
            </div>
          )}

          {/* Auth Method Toggle - Compact Pill Tab Bar */}
          {((mode === "login" || mode === "login-otp") || (mode === "signup" || mode === "signup-otp")) && (
            <div className="flex flex-col gap-4" style={{ marginTop: '20px', marginBottom: '24px' }}>
              <div className="tab-buttons flex gap-2 justify-center w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (mode === "login-otp") {
                      setMode("login");
                      setAuthMethod("password");
                      setOtpSent(false);
                      setForm({ ...form, otp: "" });
                    } else if (mode === "signup-otp") {
                      setMode("signup");
                      setAuthMethod("password");
                      setOtpSent(false);
                      setForm({ ...form, otp: "" });
                    }
                  }}
                  className={`text-xs font-bold px-4 py-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    (mode === "login" || mode === "signup") 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "bg-background border-2 border-primary hover:bg-accent"
                  }`}
                  style={{
                    minHeight: '36px'
                  }}
                  aria-label="Switch to password authentication"
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (mode === "login") {
                      setMode("login-otp");
                      setAuthMethod("otp");
                      setOtpSent(false);
                      setForm({ ...form, password: "", otp: "" });
                    } else if (mode === "signup") {
                      setMode("signup-otp");
                      setAuthMethod("otp");
                      setOtpSent(false);
                      setForm({ ...form, password: "", otp: "" });
                    }
                  }}
                  className={`text-xs font-bold px-4 py-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    (mode === "login-otp" || mode === "signup-otp") 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "bg-background border-2 border-primary hover:bg-accent"
                  }`}
                  style={{
                    minHeight: '36px',
                    color: (mode === "login-otp" || mode === "signup-otp") ? '#2a2a3a' : '#2a2a3a',
                    fontWeight: (mode === "login-otp" || mode === "signup-otp") ? '700' : '600'
                  }}
                  aria-label="Switch to OTP authentication"
                >
                  OTP
                </button>
              </div>
              {mode === "login" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot-password");
                      setOtpSent(false);
                    }}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-[200ms] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-md px-1"
                    style={{ lineHeight: '1.45' }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Terms & Conditions Checkbox - only for signup modes */}
          {(mode === "signup" || mode === "signup-otp") && (
            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="terms"
                checked={form.termsAccepted}
                onCheckedChange={(checked) => setForm({ ...form, termsAccepted: checked === true })}
                className="mt-1"
                required
              />
              <label
                htmlFor="terms"
                className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
              >
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsDialog(true)}
                  className="text-primary hover:underline font-medium"
                >
                  Terms & Conditions
                </button>
              </label>
            </div>
          )}

          {/* Login CTA Button */}
          <div style={{ marginTop: '8px' }}>
          <Button 
            type="submit"
            className="w-full rounded-[20px] text-small font-body font-medium tracking-[0.5px] bg-primary text-primary-foreground transition-all duration-[200ms] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
            style={{
              height: '48px',
              maxWidth: '100%',
              margin: '0 auto'
            }}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
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
          </div>

          {/* Google Sign-In Button */}
          {(mode === "login" || mode === "login-otp" || mode === "signup" || mode === "signup-otp") && !otpSent && (
            <div className="space-y-4" style={{ marginTop: '32px' }}>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span 
                    className="px-2 text-muted-foreground bg-card"
                    style={{
                      lineHeight: '1.45'
                    }}
                  >
                    Or continue with
                  </span>
                </div>
              </div>
              <div 
                id="google-signin-button" 
                className="w-full flex justify-center rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                style={{ minHeight: '44px' }}
              ></div>
            </div>
          )}
        </form>
        <p 
          className="text-center text-sm text-muted-foreground mt-6"
          style={{ lineHeight: '1.45' }}
        >
          {(mode === "login" || mode === "login-otp") ? (
            <>
              New here?{" "}
              <button 
                className="font-semibold text-primary hover:text-primary/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-md px-1 hover:underline" 
                onClick={() => {
                  setMode("signup");
                  setAuthMethod("password");
                  setOtpSent(false);
                  setForm({ ...form, otp: "" });
                }}
              >
                Create account
              </button>
            </>
          ) : (mode === "signup" || mode === "signup-otp") ? (
            <>
              Already have an account?{" "}
              <button 
                className="font-semibold text-primary hover:text-primary/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-md px-1 hover:underline" 
                onClick={() => {
                  setMode("login");
                  setAuthMethod("password");
                  setOtpSent(false);
                  setForm({ ...form, otp: "" });
                }}
              >
                Log in
              </button>
            </>
          ) : mode === "forgot-password" ? (
            <>
              Remember your password?{" "}
              <button 
                className="font-semibold text-primary hover:text-primary/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-md px-1 hover:underline" 
                onClick={() => {
                  setMode("login");
                  setOtpSent(false);
                }}
              >
                Log in
              </button>
            </>
          ) : null}
        </p>
        </div>
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
              className="w-full rounded-[20px]"
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

      {/* Terms & Conditions Dialog */}
      <TermsAndConditions
        open={showTermsDialog}
        onAccept={async () => {
          if (pendingGoogleSignIn) {
            // Google sign-in flow - create account after Terms acceptance
            setShowTermsDialog(false);
            try {
              setLoading(true);
              const result = await googleLogin(
                pendingGoogleSignIn.googleId,
                pendingGoogleSignIn.email,
                pendingGoogleSignIn.name,
                pendingGoogleSignIn.image,
                true // Terms accepted
              );

              if (result.success) {
                if (!result.user?.phone || result.user.phone === '') {
                  setPendingGoogleUser({
                    googleId: pendingGoogleSignIn.googleId,
                    email: pendingGoogleSignIn.email,
                    name: pendingGoogleSignIn.name,
                    token: result.token,
                    user: result.user
                  });
                  setShowPhoneModal(true);
                  setPendingGoogleSignIn(null);
                  setLoading(false);
                } else {
                  toast({
                    title: "Login Successful",
                    description: `Welcome to Looklyn, ${pendingGoogleSignIn.name}!`,
                  });
                  const targetPath = redirect.startsWith("/") ? redirect : "/";
                  setPendingGoogleSignIn(null);
                  setTimeout(() => {
                    navigate(targetPath, { replace: true });
                  }, 1000);
                }
              } else {
                toast({
                  title: "Authentication Failed",
                  description: result.error || "Please try again",
                  variant: "destructive",
                });
                setLoading(false);
              }
            } catch (error) {
              toast({
                title: "Error",
                description: error.message || "Something went wrong",
                variant: "destructive",
              });
              setLoading(false);
            }
          } else if (pendingLogin) {
            // First-time login - accept Terms and retry login
            setShowTermsDialog(false);
            try {
              setLoading(true);
              // First accept Terms
              await authAPI.acceptTerms();
              
              // Then retry login
              if (pendingLogin.mode === 'login-otp') {
                // For OTP login, we need to verify OTP again
                const response = await authAPI.loginWithOtp(pendingLogin.email, pendingLogin.otp);
                if (response.token && response.user) {
                  localStorage.setItem('authToken', response.token);
                  await refreshUser();
                  toast({
                    title: "Login Successful",
                    description: `Welcome to Looklyn!`,
                  });
                  const targetPath = redirect.startsWith("/") ? redirect : "/";
                  setPendingLogin(null);
                  setTimeout(() => {
                    window.location.href = targetPath;
                  }, 1000);
                } else {
                  toast({
                    title: "Authentication Failed",
                    description: response.error || "Please try again",
                    variant: "destructive",
                  });
                  setPendingLogin(null);
                  setLoading(false);
                }
              } else {
                // Regular password login
                const result = await login({ email: pendingLogin.email, password: pendingLogin.password });
                if (result.success) {
                  toast({
                    title: "Login Successful",
                    description: `Welcome to Looklyn!`,
                  });
                  const targetPath = redirect.startsWith("/") ? redirect : "/";
                  setPendingLogin(null);
                  setTimeout(() => {
                    window.location.href = targetPath;
                  }, 1000);
                } else {
                  toast({
                    title: "Authentication Failed",
                    description: result.error || "Please try again",
                    variant: "destructive",
                  });
                  setPendingLogin(null);
                  setLoading(false);
                }
              }
            } catch (error) {
              toast({
                title: "Error",
                description: error.message || "Something went wrong",
                variant: "destructive",
              });
              setPendingLogin(null);
              setLoading(false);
            }
          } else {
            // Just viewing Terms (from checkbox link) - close dialog
            setShowTermsDialog(false);
          }
        }}
        onReject={() => {
          setShowTermsDialog(false);
          if (pendingGoogleSignIn) {
            setPendingGoogleSignIn(null);
            toast({
              title: "Terms & Conditions Required",
              description: "You must accept the Terms & Conditions to create an account",
              variant: "destructive",
            });
          } else if (pendingLogin) {
            setPendingLogin(null);
            toast({
              title: "Terms & Conditions Required",
              description: "You must accept the Terms & Conditions to continue",
              variant: "destructive",
            });
          }
        }}
      />
    </div>
  );
};

export default Auth;

