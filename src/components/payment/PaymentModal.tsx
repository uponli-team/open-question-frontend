"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Plan {
  name: string;
  price: string;
  cadence: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
}

// ─── Google Pay declaration ───────────────────────────────────────────────────
declare global {
  interface Window {
    google?: {
      payments: {
        api: {
          PaymentsClient: new (config: object) => {
            isReadyToPay: (req: object) => Promise<{ result: boolean }>;
            createButton: (opts: object) => HTMLElement;
            loadPaymentData: (req: object) => Promise<object>;
          };
        };
      };
    };
  }
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PaymentModal({ isOpen, onClose, plan }: PaymentModalProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [gpayReady, setGpayReady] = useState(false);
  const gpayContainerRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<any>(null);
  const scriptLoadedRef = useRef(false);

  // ── Google Pay setup ────────────────────────────────────────────────────────
  const mountGpayButton = useCallback(() => {
    if (!gpayContainerRef.current || !window.google) return;

    const client = new window.google.payments.api.PaymentsClient({
      environment: "TEST",
    });
    clientRef.current = client;

    const baseRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
    };

    const allowedPaymentMethods = [
      {
        type: "CARD",
        parameters: {
          allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
          allowedCardNetworks: ["AMEX", "DISCOVER", "JCB", "MASTERCARD", "VISA"],
        },
        tokenizationSpecification: {
          type: "PAYMENT_GATEWAY",
          parameters: {
            gateway: "example",
            gatewayMerchantId: "exampleGatewayMerchantId",
          },
        },
      },
    ];

    client
      .isReadyToPay({ ...baseRequest, allowedPaymentMethods })
      .then(({ result }) => {
        if (!result) return;
        setGpayReady(true);

        // Clear previous button if any
        if (gpayContainerRef.current) {
          gpayContainerRef.current.innerHTML = "";
        }

        const button = client.createButton({
          buttonColor: "black",
          buttonType: "subscribe",
          buttonSizeMode: "fill",
          onClick: () => {
            const paymentDataRequest = {
              ...baseRequest,
              allowedPaymentMethods,
              merchantInfo: {
                merchantId: "BCR2DN4TR2LLLLLL",
                merchantName: "OQD",
              },
              transactionInfo: {
                totalPriceStatus: "FINAL",
                totalPriceLabel: "Subscription",
                totalPrice: plan?.price?.replace("$", "") ?? "29",
                currencyCode: "USD",
                countryCode: "US",
              },
            };

            client
              .loadPaymentData(paymentDataRequest)
              .then(() => {
                setStatus("success");
              })
              .catch((err: { statusCode?: string }) => {
                if (err.statusCode !== "CANCELED") setStatus("error");
              });
          },
        });

        gpayContainerRef.current?.appendChild(button);
      })
      .catch(() => {
        // GPay not available
      });
  }, [plan]);

  useEffect(() => {
    if (!isOpen) return;

    if (window.google) {
      mountGpayButton();
      return;
    }

    if (scriptLoadedRef.current) return;
    scriptLoadedRef.current = true;

    const script = document.createElement("script");
    script.src = "https://pay.google.com/gp/p/js/pay.js";
    script.async = true;
    script.onload = mountGpayButton;
    document.body.appendChild(script);
  }, [isOpen, mountGpayButton]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStatus("idle");
    }
  }, [isOpen]);

  const priceNum =
    plan?.price && plan.price !== "Custom" ? plan.price : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal card */}
          <motion.div
            className="relative z-10 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            {/* Header gradient bar */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-7 py-5 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-100">
                    Subscribe
                  </p>
                  <h2 className="mt-0.5 text-xl font-bold text-white">
                    {plan?.name} Plan
                  </h2>
                </div>
                <div className="text-right">
                  {priceNum && (
                    <span className="text-3xl font-bold text-white">
                      {plan?.price}
                    </span>
                  )}
                  <p className="text-xs text-emerald-100">{plan?.cadence}</p>
                </div>
              </div>

              {/* Mini visual credit card placeholder */}
              <div className="mt-5 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-red-400/80" />
                    <span className="-ml-2 h-5 w-5 rounded-full bg-yellow-300/80" />
                  </div>
                  <svg viewBox="0 0 40 24" className="h-5 w-auto fill-white/60">
                    <rect width="40" height="24" rx="3" />
                  </svg>
                </div>
                <div className="mt-3 font-mono text-sm tracking-widest text-white/80">
                  •••• •••• •••• ••••
                </div>
                <div className="mt-1.5 flex justify-between text-xs text-white/60">
                  <span>SECURE CHECKOUT</span>
                  <span></span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-7 py-6 flex-1 overflow-y-auto">
              {status === "success" ? (
                <motion.div
                  className="flex flex-col items-center gap-3 py-6 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-9 w-9 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Payment successful!</h3>
                  <p className="text-sm text-gray-500">
                    Welcome to <span className="font-semibold text-emerald-700">{plan?.name}</span>. A receipt has been sent to your email.
                  </p>
                  <Button
                    className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={onClose}
                  >
                    Continue to Dashboard
                  </Button>
                </motion.div>
              ) : status === "error" ? (
                <motion.div
                  className="flex flex-col items-center gap-3 py-4 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Payment failed</h3>
                  <p className="text-sm text-gray-500">Something went wrong. Please try again.</p>
                  <Button
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={() => setStatus("idle")}
                  >
                    Try again
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-4 pt-2 pb-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">Checkout</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Fast, secure checkout with your Google account.
                    </p>
                  </div>

                  {/* Google Pay button rendered by the API */}
                  <div
                    id="google-pay-container"
                    ref={gpayContainerRef}
                    className="flex justify-center min-h-[48px] w-full [&>button]:!w-full [&>button]:!rounded-xl mt-4"
                  />

                  {!gpayReady && (
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm text-gray-400">
                      <svg viewBox="0 0 20 20" className="h-4 w-4 animate-spin" aria-hidden>
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="25 50" />
                      </svg>
                      Checking Google Pay availability…
                    </div>
                  )}
                </div>
              )}

              {/* Security badge */}
              {status === "idle" && (
                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <Lock className="h-3.5 w-3.5" />
                  256-bit SSL encrypted · PCI DSS compliant
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              id="close-payment-modal"
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
