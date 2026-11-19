import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { z } from "zod";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const emailSchema = z.string().trim().email("Please enter a valid email").max(255);
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(72);
const nameSchema = z.string().trim().min(1, "Please enter your name").max(80);

function GoogleLogo() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" className="!size-[18px]">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

export function AuthCard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    const em = emailSchema.safeParse(email);
    const pw = passwordSchema.safeParse(password);
    if (!em.success) {
      toast.error(em.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    if (!pw.success) {
      toast.error(pw.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: em.data, password: pw.data });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/explore" });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const nm = nameSchema.safeParse(name);
    const em = emailSchema.safeParse(email);
    const pw = passwordSchema.safeParse(password);
    if (!nm.success) {
      toast.error(nm.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    if (!em.success) {
      toast.error(em.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    if (!pw.success) {
      toast.error(pw.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: em.data,
      password: pw.data,
      options: { emailRedirectTo: window.location.origin, data: { display_name: nm.data } },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      navigate({ to: "/explore" });
    } else {
      setCheckEmail(true);
    }
  }

  async function handleForgot() {
    const em = emailSchema.safeParse(email);
    if (!em.success) {
      toast.error("Type your email above first, then tap “Forgot password”.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(em.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("We've emailed you a link to reset your password.");
  }

  async function handleOAuth(provider: "google" | "lovable") {
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message ?? "Sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/explore" });
  }

  if (checkEmail) {
    return (
      <div className="postcard p-8 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-accent text-2xl">
          ✉️
        </div>
        <h2 className="text-2xl font-semibold">Check your inbox</h2>
        <p className="mt-2 text-muted-foreground">
          We sent a confirmation link to{" "}
          <span className="font-semibold text-foreground">{email}</span>. Click it to start
          exploring.
        </p>
        <Button variant="link" className="mt-4" onClick={() => setCheckEmail(false)}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="postcard p-6 sm:p-8">
      <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign in</TabsTrigger>
          <TabsTrigger value="signup">Create account</TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          <form onSubmit={handleSignIn} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="si-email">Email</Label>
              <Input
                id="si-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="si-password">Password</Label>
                <button
                  type="button"
                  onClick={handleForgot}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="si-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={handleSignUp} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="su-name">Your name</Label>
              <Input
                id="su-name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Priya Sharma"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="su-email">Email</Label>
              <Input
                id="su-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="su-password">Password</Label>
              <Input
                id="su-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
              {busy ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid gap-2.5">
        <Button
          type="button"
          variant="google"
          size="lg"
          className="w-full"
          onClick={() => handleOAuth("google")}
        >
          <GoogleLogo />
          Continue with Google
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => handleOAuth("lovable")}
        >
          <LovableMark />
          Continue with Lovable
        </Button>
      </div>
    </div>
  );
}
