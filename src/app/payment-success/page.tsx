"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100"
      >
        <CheckCircle2 className="h-14 w-14 text-emerald-600" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          Payment Successful!
        </h1>
        <p className="mx-auto max-w-lg text-lg text-gray-600">
          Thank you for subscribing to OQD. Your account has been upgraded and you
          now have full access to all professional research tools.
        </p>

        {sessionId && (
          <p className="text-xs font-mono text-gray-400">
            Session ID: {sessionId}
          </p>
        )}

        <div className="pt-8">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-emerald-600 px-8 py-6 text-lg hover:bg-emerald-700"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Decorative floating icons */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-[15%] top-[20%] hidden lg:block"
      >
        <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-600 shadow-sm">
          <PartyPopper className="h-8 w-8" />
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
