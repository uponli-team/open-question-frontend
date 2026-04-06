"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  createBrowserSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabaseClient";
import { setDevAuthClient } from "@/lib/devAuth.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function getErrorMessage(err: unknown): string | null {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null) {
    const maybe = (err as { message?: unknown }).message;
    if (typeof maybe === "string") return maybe;
  }
  return null;
}

function isGoogleProviderDisabled(err: unknown): boolean {
  const msg = getErrorMessage(err)?.toLowerCase() ?? "";
  return (
    msg.includes("unsupported provider") ||
    msg.includes("provider is not enabled")
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleVerifyFlow, setGoogleVerifyFlow] = useState(false);
  const autoOtpTriggeredRef = useRef(false);

  const supabase = createBrowserSupabaseClient();

  function loginTemporarily() {
    setDevAuthClient(email);
    toast.success("Temporary local login enabled.");
    router.push("/dashboard");
  }

  async function onGoogleLogin() {
    if (!isSupabaseConfigured() || !supabase) {
      toast.error("Supabase is not configured yet.");
      return;
    }

    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) throw error;
      toast.success("Redirecting to Google sign-in…");
    } catch (err: unknown) {
      if (isGoogleProviderDisabled(err)) {
        toast.error(
          "Google auth is disabled in Supabase. Enable Google in Auth > Providers, then set client ID/secret and callback URL.",
        );
        return;
      }
      toast.error(getErrorMessage(err) ?? "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function onEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured() || !supabase) {
      loginTemporarily();
      return;
    }
    if (!emailVerified) {
      toast.error("Verify your email first using the code we send.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success("Signed in.");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) ?? "Email sign-in failed.");
      loginTemporarily();
    } finally {
      setLoading(false);
    }
  }

  async function sendEmailVerificationCode() {
    if (!isSupabaseConfigured() || !supabase) {
      toast.error("Supabase is not configured yet.");
      return;
    }
    if (!email.trim()) {
      toast.error("Enter your email first.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setOtpSent(true);
      setEmailVerified(false);
      toast.success("Verification code sent to your email.");
    } catch (err: unknown) {
      toast.error(
        getErrorMessage(err) ??
          "Could not send verification code. Check Supabase Auth logs and SMTP settings.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function sendEmailVerificationCodeFor(targetEmail: string) {
    if (!isSupabaseConfigured() || !supabase) return;
    const cleaned = targetEmail.trim();
    if (!cleaned) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleaned,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setOtpSent(true);
      setEmailVerified(false);
      toast.success("We sent an email to verify your email.");
    } catch (err: unknown) {
      toast.error(
        getErrorMessage(err) ??
          "Could not send verification email. Check Supabase Auth logs and SMTP settings.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyEmailCode() {
    if (!isSupabaseConfigured() || !supabase) {
      toast.error("Supabase is not configured yet.");
      return;
    }
    if (!email.trim() || !otpCode.trim()) {
      toast.error("Enter both email and verification code.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode.trim(),
        type: "email",
      });
      if (error) throw error;
      setEmailVerified(true);
      toast.success("Email verified.");
      if (googleVerifyFlow) {
        router.push(searchParams.get("next") || "/dashboard");
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) ?? "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (autoOtpTriggeredRef.current) return;
    const shouldVerifyGoogle = searchParams.get("google_verify") === "1";
    const emailFromGoogle = searchParams.get("email") ?? "";
    if (!shouldVerifyGoogle || !emailFromGoogle) return;
    autoOtpTriggeredRef.current = true;
    setGoogleVerifyFlow(true);
    setEmail(emailFromGoogle);
    void sendEmailVerificationCodeFor(emailFromGoogle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
      <div>
        <div className="text-sm font-semibold text-indigo-700">
          OQD Authentication
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Use Google or email login. Dashboard routes are protected when
          Supabase is configured.
        </p>
      </div>

      {googleVerifyFlow && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
          We sent a verification email. Verify your email to complete Google sign in.
        </div>
      )}

      {!isSupabaseConfigured() && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Supabase env vars are missing. Login buttons will show a warning and
          dashboard will fall back to mock data.
        </div>
      )}

      <div className="rounded-2xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur">
        <form className="grid gap-3" onSubmit={onEmailLogin}>
          <label className="text-sm font-medium text-zinc-900" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailVerified(false);
            }}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
          <Button
            type="button"
            onClick={sendEmailVerificationCode}
            disabled={loading}
            size="sm"
            variant="secondary"
          >
            {otpSent ? "Resend verification code" : "Send verification code"}
          </Button>

          {otpSent && (
            <>
              <label className="text-sm font-medium text-zinc-900" htmlFor="otpCode">
                Verification code
              </label>
              <Input
                id="otpCode"
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter code from email"
                required={!emailVerified}
              />
              <Button
                type="button"
                onClick={verifyEmailCode}
                disabled={loading}
                size="sm"
                variant="secondary"
              >
                Verify email
              </Button>
            </>
          )}
          {emailVerified && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Email verified successfully.
            </div>
          )}

          <label className="text-sm font-medium text-zinc-900" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          <Button type="submit" disabled={loading} size="lg" variant="outline">
            Sign in with Email
          </Button>
        </form>

        <div className="mt-5 border-t border-black/10 pt-5">
          <Button
            onClick={onGoogleLogin}
            disabled={loading}
            size="lg"
            variant="default"
            className="w-full"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <path
                fill="#EA4335"
                d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.9-5.4 3.9-3.2 0-5.8-2.7-5.8-6s2.6-6 5.8-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.6 2.5 12 2.5 6.9 2.5 2.8 6.7 2.8 12s4.1 9.5 9.2 9.5c5.3 0 8.8-3.7 8.8-8.9 0-.6-.1-1-.1-1.4H12Z"
              />
              <path
                fill="#34A853"
                d="M3.9 7.5 7 9.8c.8-2.3 2.9-3.8 5-3.8 1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.6 2.5 12 2.5c-3.5 0-6.5 2-8.1 5Z"
              />
              <path
                fill="#FBBC05"
                d="M12 21.5c2.5 0 4.6-.8 6.2-2.3l-2.9-2.4c-.8.6-1.9 1.2-3.3 1.2-3.7 0-5.2-2.6-5.4-3.9l-3.1 2.4c1.6 3.1 4.8 5 8.5 5Z"
              />
              <path
                fill="#4285F4"
                d="M21.8 12.6c0-.6-.1-1-.1-1.4H12v3.9h5.4c-.2 1-.9 2.2-2.1 3l2.9 2.4c1.7-1.6 2.7-4 2.7-7.9Z"
              />
            </svg>
            Continue with Google
          </Button>
          <Button
            type="button"
            onClick={loginTemporarily}
            disabled={loading}
            size="lg"
            variant="ghost"
            className="mt-2 w-full"
          >
            Continue with temporary login
          </Button>
        </div>
      </div>
    </main>
  );
}

