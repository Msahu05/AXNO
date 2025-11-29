import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get("redirect") || "/";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "login") {
      login({ email: form.email, password: form.password });
    } else {
      signup({ name: form.name, email: form.email, password: form.password });
    }
    navigate(redirect.startsWith("/") ? redirect : "/", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_70%)] px-4 py-10">
      <div className="w-full max-w-md space-y-6 rounded-[36px] border border-white/15 bg-[var(--card)]/95 p-8 shadow-[var(--shadow-soft)]">
        <button className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em]" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div>
          <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">{mode === "login" ? "Welcome back" : "Create account"}</p>
          <h1 className="text-3xl font-black">Looklyn</h1>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div>
              <label className="text-sm font-medium">Full name</label>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Aarya Patel" required />
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@email.com" required />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full rounded-full bg-foreground py-4 text-xs font-semibold uppercase tracking-[0.4em] text-background">
            {mode === "login" ? "Log in" : "Sign up"}
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
  );
};

export default Auth;

