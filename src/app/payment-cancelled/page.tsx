"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancelledPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-red-100"
      >
        <XCircle className="h-14 w-14 text-red-600" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          Payment Cancelled
        </h1>
        <p className="mx-auto max-w-lg text-lg text-gray-600">
          Your checkout session was cancelled. No charges were made to your account.
          If you encountered an issue, please try again or contact our support.
        </p>

        <div className="flex flex-col items-center gap-4 pt-8 sm:flex-row sm:justify-center">
          <Link href="/#pricing">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gray-200 px-8 py-6 text-lg hover:bg-gray-50"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Pricing
            </Button>
          </Link>
          <Link href="/#pricing">
            <Button
              size="lg"
              className="bg-gray-900 px-8 py-6 text-lg text-white hover:bg-gray-800"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Try Again
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
