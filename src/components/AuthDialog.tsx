import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";

type Mode = "login" | "signup";

const AuthDialog = () => {
  const { isDialogOpen, closeAuth, login, signup } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "login") {
      login({ email: form.email, password: form.password });
    } else {
      signup({ name: form.name, email: form.email, password: form.password });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={closeAuth}>
      <DialogContent className="max-w-md rounded-3xl border-none bg-gradient-to-b from-background via-background to-muted p-8 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {mode === "login" ? "Log in to Looklyn" : "Create your Looklyn account"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Access your wishlist, saved addresses, and checkout faster.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div>
              <label className="text-sm font-medium text-foreground">Full name</label>
              <Input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Aarya Patel"
                required
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-foreground">Email address</label>
            <Input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="you@email.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Password</label>
            <Input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90">
            {mode === "login" ? "Log in" : "Sign up"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button className="font-semibold text-primary" onClick={() => setMode("signup")}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already a member?{" "}
              <button className="font-semibold text-primary" onClick={() => setMode("login")}>
                Log in
              </button>
            </>
          )}
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;

