import Link from "next/link";
import { Brain } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Brain className="h-6 w-6 text-emerald-600" />
                <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-600" />
              </div>
              <span className="text-xl font-bold text-emerald-600">OQD</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-600">
              Open Questions Database — structure hard problems, search across
              fields, and stay ready for realtime collaboration.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900">Explore</h4>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
              <Link href="/" className="hover:text-emerald-600">
                Home
              </Link>
              <Link href="/#about" className="hover:text-emerald-600">
                About
              </Link>
              <Link href="/#features" className="hover:text-emerald-600">
                Features
              </Link>
              <Link href="/#process" className="hover:text-emerald-600">
                Process
              </Link>
              <Link href="/#preview" className="hover:text-emerald-600">
                Preview
              </Link>
              <Link href="/dashboard" className="hover:text-emerald-600">
                Dashboard
              </Link>
              <Link href="/auth/login" className="hover:text-emerald-600">
                Login
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900">Product</h4>
            <p className="text-sm text-gray-600">
              Built with Next.js, Supabase-ready auth and realtime hooks, and mock
              APIs for fast iteration.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 pt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} OQD. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
