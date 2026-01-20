import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { authAPI } from "@/lib/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [valid, setValid] = useState(false);
  const [email, setEmail] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      toast({
        title: "Invalid Link",
        description: "No reset token provided",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // Verify token
    authAPI.verifyResetToken(token)
      .then((data) => {
        setValid(true);
        setEmail(data.email);
        setVerifying(false);
      })
      .catch((error) => {
        setValid(false);
        setVerifying(false);
        toast({
          title: "Invalid or Expired Link",
          description: error.message || "This password reset link is invalid or has expired",
          variant: "destructive",
        });
      });
  }, [token, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (form.newPassword !== form.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (form.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, form.newPassword);
      toast({
        title: "Password Reset Successful",
        description: "Your password has been reset. Please login with your new password.",
      });
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_70%)]">
        <div className="flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md space-y-6 rounded-[36px] border border-white/15 bg-[var(--card)]/95 p-8 shadow-[var(--shadow-soft)]">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
            <div className="space-y-4 mt-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_70%)]">
        <div className="flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md space-y-6 rounded-[36px] border border-white/15 bg-[var(--card)]/95 p-8 shadow-[var(--shadow-soft)] text-center">
            <h2 className="text-2xl font-bold">Invalid Reset Link</h2>
            <p className="text-gray-600">This password reset link is invalid or has expired.</p>
            <Button onClick={() => navigate("/auth")}>Go to Login</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_70%)]">
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6 rounded-[36px] border border-white/15 bg-[var(--card)]/95 p-8 shadow-[var(--shadow-soft)]">
          <button className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] transition-all duration-200 bg-transparent hover:bg-purple-200 hover:shadow-sm active:bg-purple-300" onClick={() => navigate("/auth")}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">Reset Password</p>
            <h1 className="text-3xl font-black">Looklyn</h1>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email" 
                value={email} 
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium">New Password</label>
              <div className="relative">
                <Input 
                  type={showNewPassword ? "text" : "password"} 
                  value={form.newPassword} 
                  onChange={(event) => setForm({ ...form, newPassword: event.target.value })} 
                  placeholder="••••••••" 
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Confirm New Password</label>
              <div className="relative">
                <Input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={form.confirmPassword} 
                  onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} 
                  placeholder="••••••••" 
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button 
              type="submit"
              className="w-full rounded-full bg-foreground py-4 text-xs font-semibold uppercase tracking-[0.4em] text-background"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

