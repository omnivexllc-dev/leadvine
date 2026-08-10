import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Grape } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const searchSchema = z.object({ next: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — LeadVine" },
      { name: "description", content: "Sign in or create your LeadVine account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: next ?? "/app", replace: true });
    });
  }, [navigate, next]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Account created — you're in!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: next ?? "/app", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw new Error(String(result.error));
      if (result.redirected) return;
      navigate({ to: next ?? "/app", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Grape className="h-8 w-8 text-vine" />
          <span className="font-display text-3xl">LeadVine</span>
        </Link>
        <div className="rounded-2xl border border-border bg-card p-8">
          <h1 className="font-display text-3xl mb-1">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "signup" ? "Start finding leads in seconds." : "Sign in to your dashboard."}
          </p>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 border border-border rounded-md py-2.5 hover:bg-secondary text-sm font-medium mb-4"
          >
            <GoogleIcon /> Continue with Google
          </button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
            <div className="flex-1 h-px bg-border" /> or email{" "}
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            {mode === "signup" && (
              <input
                type="text"
                required
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-vine"
              />
            )}
            <input
              type="email"
              required
              placeholder="you@agency.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-vine"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-vine"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-vine text-primary-foreground rounded-md py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "…" : mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Have an account? " : "New here? "}
            <button
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="text-vine hover:underline"
            >
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .5 4.2 1.6l3.1-3.1C17.5 1.7 15 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.6 2.8C6.1 7.2 8.8 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23 12c0-.8-.1-1.5-.2-2.3H12v4.4h6.2c-.3 1.4-1.1 2.6-2.3 3.4l3.5 2.7c2.1-1.9 3.6-4.8 3.6-8.2z"
      />
      <path
        fill="#FBBC05"
        d="M5.2 14.2c-.2-.6-.3-1.4-.3-2.2s.1-1.5.3-2.2L1.6 7.4C.6 9 0 10.9 0 12s.6 3 1.6 4.6l3.6-2.4z"
      />
      <path
        fill="#34A853"
        d="M12 23c3 0 5.6-1 7.4-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.9 1.1-3.2 0-5.9-2.2-6.8-5.1L1.6 16.6C3.5 20.4 7.4 23 12 23z"
      />
    </svg>
  );
}
