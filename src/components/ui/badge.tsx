"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-emerald-600 text-white",
        secondary: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
        outline: "bg-transparent text-zinc-900 ring-1 ring-zinc-200",
        success: "bg-emerald-600 text-white",
        warning: "bg-amber-500 text-black",
        danger: "bg-red-600 text-white",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

