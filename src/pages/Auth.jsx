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
      <div className="flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[360px] auth-card">
          <button 
            className="flex items-center gap-1.5 text-sm text-[#8b8794] hover:text-[#2f2540] transition-colors mb-4 focus:outline-none focus:ring-2 focus:ring-[#7b51f5] focus:ring-offset-2 rounded-md px-1" 
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> 
            <span>Back</span>
          </button>
          <div 
            className="w-full bg-white rounded-[24px] border border-[rgba(47,37,64,0.08)] shadow-[0_8px_20px_rgba(47,37,64,0.06)]"
            style={{ padding: '32px' }}
          >
          {/* Header Section */}
          <div className="text-center mb-6">
            <h1 className="font-heading text-h1 text-[#2f2540] mb-2">
              {mode === "login" || mode === "login-otp" ? "Welcome back" : 
               mode === "signup" || mode === "signup-otp" ? "Create account" :
               mode === "forgot-password" ? "Reset password" :
               "Authentication"}
            </h1>
            {(mode === "login" || mode === "login-otp") && (
              <p className="text-body text-[#8b8794] font-normal">
                Sign in to continue to Looklyn
              </p>
            )}
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <style>{`
              .auth-card {
                width: 100% !important;
                max-width: 360px !important;
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
              <label className="text-[0.85rem] font-medium text-[#6f6791] dark:text-[#87819a]" style={{ lineHeight: '1.45' }}>Full name</label>
              <Input 
                value={form.name} 
                onChange={(event) => setForm({ ...form, name: event.target.value })} 
                placeholder="Aarya Patel" 
                required 
                className="border-[#efe8ff] dark:border-[#4a4a5a] rounded-[12px] px-[18px] h-auto focus-visible:ring-2 focus-visible:ring-[#8d73e8] focus-visible:ring-offset-1 focus-visible:border-[#8d73e8] transition-all duration-[200ms]"
                style={{ borderWidth: '1px', paddingTop: '12px', paddingBottom: '14px' }}
              />
            </div>
          )}
          
          {/* Email Input - for all modes except reset-password (which has its own page) */}
          {mode !== "reset-password" && (
            <div className="space-y-1.5">
              <label className="text-[0.85rem] font-medium text-[#6f6791] dark:text-[#87819a]" style={{ lineHeight: '1.45' }}>Email</label>
              <Input 
                type="email" 
                value={form.email} 
                onChange={(event) => setForm({ ...form, email: event.target.value })} 
                placeholder="you@email.com" 
                required
                autoComplete="email"
                className="border-[#efe8ff] dark:border-[#4a4a5a] rounded-[12px] px-[18px] h-auto focus-visible:ring-2 focus-visible:ring-[#8d73e8] focus-visible:ring-offset-1 focus-visible:border-[#8d73e8] transition-all duration-[200ms]"
                style={{ borderWidth: '1px', paddingTop: '12px', paddingBottom: '14px' }}
              />
            </div>
          )}

          {/* Phone Number Input - required for signup */}
          {(mode === "signup" || mode === "signup-otp") && (
            <div className="space-y-1.5">
              <label className="text-[0.85rem] font-medium text-[#6f6791] dark:text-[#87819a]" style={{ lineHeight: '1.45' }}>Phone Number <span className="text-red-500">*</span></label>
              <Input 
                type="tel" 
                value={form.phone} 
                onChange={(event) => setForm({ ...form, phone: event.target.value })} 
                placeholder="+91 9876543210" 
                required
                autoComplete="tel"
                className="border-[#efe8ff] dark:border-[#4a4a5a] rounded-[12px] px-[18px] h-auto focus-visible:ring-2 focus-visible:ring-[#8d73e8] focus-visible:ring-offset-1 focus-visible:border-[#8d73e8] transition-all duration-[200ms]"
                style={{ borderWidth: '1px', paddingTop: '12px', paddingBottom: '14px' }}
              />
              <p className="text-xs text-[#87819a] dark:text-[#6f6791] mt-1" style={{ lineHeight: '1.45' }}>Required for WhatsApp order confirmations</p>
            </div>
          )}

          {/* Password Input - only for password-based auth */}
          {(mode === "login" || mode === "signup") && (
            <div className="space-y-1.5">
              <label className="text-[0.85rem] font-medium text-[#6f6791] dark:text-[#87819a]" style={{ lineHeight: '1.45' }}>Password</label>
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b8aee0] dark:text-[#9d8aea] hover:text-[#8d73e8] dark:hover:text-[#b59bff] transition-colors duration-[200ms] focus:outline-none focus:ring-2 focus:ring-[#8d73e8] focus:ring-offset-1 rounded-md p-1"
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
              <label className="text-[0.85rem] font-medium text-[#6f6791] dark:text-[#87819a]" style={{ lineHeight: '1.45' }}>OTP Code</label>
              <Input 
                type="text" 
                value={form.otp} 
                onChange={(event) => setForm({ ...form, otp: event.target.value })} 
                placeholder="Enter 6-digit OTP" 
                maxLength={6}
                required 
                className="border-[#efe8ff] dark:border-[#4a4a5a] rounded-[12px] px-[18px] h-auto focus-visible:ring-2 focus-visible:ring-[#8d73e8] focus-visible:ring-offset-1 focus-visible:border-[#8d73e8] transition-all duration-[200ms]"
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
                  className={`text-xs font-bold px-4 py-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8d73e8] focus:ring-offset-2 ${
                    (mode === "login" || mode === "signup") 
                      ? "bg-[#9d8aea] shadow-sm" 
                      : "bg-white dark:bg-[#2a2538] border-2 border-[#9d8aea] dark:border-[#b59bff] hover:bg-[#f0eaff] dark:hover:bg-[#3a3448]"
                  }`}
                  style={{
                    minHeight: '36px',
                    color: (mode === "login" || mode === "signup") ? '#2a2a3a' : '#2a2a3a',
                    fontWeight: (mode === "login" || mode === "signup") ? '700' : '600'
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
                  className={`text-xs font-bold px-4 py-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8d73e8] focus:ring-offset-2 ${
                    (mode === "login-otp" || mode === "signup-otp") 
                      ? "bg-[#9d8aea] shadow-sm" 
                      : "bg-white dark:bg-[#2a2538] border-2 border-[#9d8aea] dark:border-[#b59bff] hover:bg-[#f0eaff] dark:hover:bg-[#3a3448]"
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
                    className="text-sm text-[#87819a] dark:text-[#87819a] hover:text-[#8d73e8] dark:hover:text-[#9d8aea] transition-colors duration-[200ms] focus:outline-none focus:ring-2 focus:ring-[#8d73e8] focus:ring-offset-1 rounded-md px-1"
                    style={{ lineHeight: '1.45' }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Login CTA Button */}
          <div style={{ marginTop: '8px' }}>
          <Button 
            type="submit"
            className="w-full rounded-[20px] text-small font-body font-medium tracking-[0.5px] text-white transition-all duration-[200ms] focus:outline-none focus:ring-2 focus:ring-[#3a2c57] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(180deg, #3a2c57 0%, #4a3a6a 100%)',
              boxShadow: '0 8px 20px rgba(58, 44, 87, 0.12)',
              height: '48px',
              maxWidth: '100%',
              margin: '0 auto'
            }}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(58, 44, 87, 0.18)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(58, 44, 87, 0.12)';
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
                  <span className="w-full border-t border-[#ebe5ff] dark:border-[#4a4a5a]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span 
                    className="px-2 text-[#87819a] dark:text-[#6f6791]"
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #f7f3ff 100%)',
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
          className="text-center text-sm text-[#6f6791] dark:text-[#87819a] mt-6"
          style={{ lineHeight: '1.45' }}
        >
          {(mode === "login" || mode === "login-otp") ? (
            <>
              New here?{" "}
              <button 
                className="font-semibold text-[#8d73e8] dark:text-[#b59bff] hover:text-[#6e46c7] dark:hover:text-[#9d8aea] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8d73e8] focus:ring-offset-1 rounded-md px-1 hover:underline" 
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
                className="font-semibold text-[#8d73e8] dark:text-[#b59bff] hover:text-[#6e46c7] dark:hover:text-[#9d8aea] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8d73e8] focus:ring-offset-1 rounded-md px-1 hover:underline" 
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
                className="font-semibold text-[#8d73e8] dark:text-[#b59bff] hover:text-[#6e46c7] dark:hover:text-[#9d8aea] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8d73e8] focus:ring-offset-1 rounded-md px-1 hover:underline" 
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
    </div>
  );
};

export default Auth;

