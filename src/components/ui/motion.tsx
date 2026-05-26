"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function FadeInSection({
  children,
  className,
  delay = 0,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const variants = {
    hidden: { opacity: 0, y: 24 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.55, delay }
    }
  };

  const [isForced, setIsForced] = useState(false);

  useEffect(() => {
    const checkHash = () => {
      if (id && typeof window !== "undefined" && window.location.hash === `#${id}`) {
        setIsForced(true);
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, [id]);

  return (
    <motion.section
      id={id}
      className={cn(className)}
      initial={isForced ? "show" : "hidden"}
      whileInView="show"
      animate={isForced ? "show" : undefined}
      viewport={{ once: true, margin: "200px" }}
      variants={variants}
    >
      {children}
    </motion.section>
  );
}

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const fadeItem = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45 },
  },
};

