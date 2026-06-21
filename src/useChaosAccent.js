import { useEffect, useState, useCallback } from "react";

const KEY = "site-chaos-palette";

function readAccent() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const palette = JSON.parse(raw);
    return palette["--color-accent"] || null;
  } catch {
    return null;
  }
}

/**
 * Returns the live chaos palette accent color from localStorage.
 * Refreshes on the "chaos:changed" event, the storage event, and a
 * short interval so the value is always in sync with the chaos toggle.
 * Returns null when chaos is off.
 */
export function useChaosAccent() {
  const [accent, setAccent] = useState(readAccent);

  const refresh = useCallback(() => setAccent(readAccent()), []);

  useEffect(() => {
    window.addEventListener("storage", refresh);
    window.addEventListener("chaos:changed", refresh);
    const id = window.setInterval(refresh, 100);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("chaos:changed", refresh);
      window.clearInterval(id);
    };
  }, [refresh]);

  return accent;
}