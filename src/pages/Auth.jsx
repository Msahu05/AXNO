import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, isAuthenticated } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get("redirect") || "/";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const targetPath = redirect.startsWith("/") ? redirect : "/";
      // Use window.location for a full page reload to avoid white screen
      window.location.href = targetPath;
    }
  }, [isAuthenticated, redirect]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      let result;
      if (mode === "login") {
        result = await login({ email: form.email, password: form.password });
      } else {
        result = await signup({ name: form.name, email: form.email, password: form.password });
      }

      if (result.success) {
        toast({
          title: mode === "login" ? "Login Successful" : "Account Created",
          description: `Welcome to AXNO!`,
        });
        // Use window.location for a full page reload to avoid white screen
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
          <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">{mode === "login" ? "Welcome back" : "Create account"}</p>
          <h1 className="text-3xl font-black">AXNO</h1>
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
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input 
              type="email" 
              value={form.email} 
              onChange={(event) => setForm({ ...form, email: event.target.value })} 
              placeholder="you@email.com" 
              required 
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input 
              type="password" 
              value={form.password} 
              onChange={(event) => setForm({ ...form, password: event.target.value })} 
              placeholder="••••••••" 
              required 
            />
          </div>
          <Button 
            type="submit"
            className="w-full rounded-full bg-foreground py-4 text-xs font-semibold uppercase tracking-[0.4em] text-background"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "login" ? "Logging in..." : "Creating account..."}
              </>
            ) : (
              mode === "login" ? "Log in" : "Sign up"
            )}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              New here?{" "}
              <button className="font-semibold text-primary" onClick={() => setMode("signup")}>
                Create account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button className="font-semibold text-primary" onClick={() => setMode("login")}>
                Log in
              </button>
            </>
          )}
        </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;

