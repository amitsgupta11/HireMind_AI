"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// The signature visual motif of HireMind AI: a radial "signal ring" —
// every score in the product (Resume, Match, Assessment, Interview, and
// the final Candidate Intelligence) is expressed as this same ring, so a
// recruiter learns one visual language for every number in the platform.
export default function ScoreRing({
  score = 0,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  colorClassName = "stroke-signal-violet",
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;

  return (
    <div ref={ref} className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="fill-none stroke-line-light dark:stroke-line-dark"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={cn("fill-none", colorClassName)}
            style={{ strokeDasharray: circumference }}
            initial={{ strokeDashoffset: circumference }}
            animate={inView ? { strokeDashoffset: offset } : {}}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedNumber value={score} inView={inView} />
        </div>
      </div>
      {label && (
        <div className="text-center">
          <p className="text-sm font-medium">{label}</p>
          {sublabel && (
            <p className="text-xs text-current/50">{sublabel}</p>
          )}
        </div>
      )}
    </div>
  );
}

function AnimatedNumber({ value, inView }) {
  return (
    <motion.span
      className="font-display text-2xl font-semibold"
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.4 }}
    >
      <Counter target={inView ? value : 0} />
    </motion.span>
  );
}

// Lightweight count-up without extra dependencies.
function Counter({ target }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setDisplay(0);
      return;
    }
    let frame;
    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return <span suppressHydrationWarning>{display}</span>;
}
