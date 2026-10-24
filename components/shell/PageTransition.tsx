"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

// The first page of a visit renders without animation (no hidden server HTML);
// every page reached by navigation slides and fades in (specification 5.2).
let hasMounted = false;

export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [animate] = useState(() => hasMounted);

  useEffect(() => {
    hasMounted = true;
  }, []);

  return (
    <motion.div
      initial={animate && !reduce ? { opacity: 0, x: 32 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
