'use client';

import { useEffect, useRef, useState } from 'react';

/** Smoothly animates a number toward `value` over `durationMs`. */
export function useCountUp(value: number, durationMs = 700, enabled = true): number {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);

  useEffect(() => {
    displayRef.current = display;
  }, [display]);

  useEffect(() => {
    if (!enabled || !Number.isFinite(value)) {
      setDisplay(value);
      displayRef.current = value;
      return;
    }

    const from = displayRef.current;
    const delta = value - from;
    if (Math.abs(delta) < 1e-12) {
      setDisplay(value);
      displayRef.current = value;
      return;
    }

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + delta * eased;
      setDisplay(next);
      displayRef.current = next;
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs, enabled]);

  return display;
}
