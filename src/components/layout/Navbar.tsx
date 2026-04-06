"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Atom } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import { clearDevAuthClient } from "@/lib/devAuth.client";
import type { Session, User } from "@supabase/supabase-js";
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [user, setUser] = useState<User | null>(null);

  const navLinks = useMemo(
    () => [
      { label: "Features", id: "features" },
      { label: "Services", id: "services" },
      { label: "Process", id: "process" },
      { label: "Blogs", id: "blogs" },
      { label: "Pricing", id: "pricing" },
      { label: "Preview", id: "preview" },
      { label: "Contact", id: "contact" },
    ],
    [],
  );

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange(
      (_event, session: Session | null) => {
        setUser(session?.user ?? null);
      },
    );

    return () => data.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash && pathname === "/") {
      const id = hash.replace("#", "");
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [pathname]);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onNavClick(e: React.MouseEvent, id: string) {
    if (pathname !== "/") return;
    e.preventDefault();
    scrollToSection(id);
    setOpen(false);
  }

  async function onLogout() {
    clearDevAuthClient();
    if (!supabase) {
      toast.success("Signed out.");
      router.push("/");
      return;
    }
    try {
      await supabase.auth.signOut();
      toast.success("Signed out.");
      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign out failed.";
      toast.error(msg);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white transition-colors duration-300">
      <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-200 bg-emerald-50">
            <Atom className="h-5 w-5 text-emerald-700" />
          </div>
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-zinc-900 transition-colors hover:text-emerald-700 sm:text-2xl"
          >
            OQD
          </Link>
        </div>

        <nav className="hidden min-w-0 max-w-[min(100%,52rem)] items-center gap-3 overflow-x-auto py-1 md:flex md:gap-4 lg:gap-5 xl:gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {navLinks.map((item) => (
            <a
              key={item.id}
              href={`/#${item.id}`}
              onClick={(e) => onNavClick(e, item.id)}
              className="shrink-0 whitespace-nowrap text-xs font-medium text-gray-500 transition-colors hover:text-zinc-900 lg:text-sm"
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/dashboard"
            className="shrink-0 whitespace-nowrap text-xs font-medium text-gray-500 transition-colors hover:text-zinc-900 lg:text-sm"
          >
            Dashboard
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link href="/dashboard/admin">
                <Button variant="outline" size="sm">
                  Admin
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void onLogout()}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={
                open
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
      </div>

      {open && (
        <div className="max-h-[min(85vh,calc(100dvh-4rem))] overflow-y-auto overscroll-contain border-t border-gray-200 bg-white md:hidden">
          <div className="container mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
            {navLinks.map((item) => (
              <a
                key={item.id}
                href={`/#${item.id}`}
                className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={(e) => onNavClick(e, item.id)}
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/dashboard"
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              Dashboard
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard/admin"
                  className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  Admin
                </Link>
                <button
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setOpen(false);
                    void onLogout();
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/login"
                  className="block rounded-lg px-3 py-2 text-base font-medium text-emerald-600 hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
