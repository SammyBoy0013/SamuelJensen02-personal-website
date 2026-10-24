"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * Gentle parallax for a slide photo: the photo drifts a little slower than the
 * page. It fills its positioned parent; reduced motion keeps it still.
 */
export function Parallax({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.div style={reduce ? undefined : { y }} className="absolute -inset-y-[8%] inset-x-0">
        {children}
      </motion.div>
    </div>
  );
}
