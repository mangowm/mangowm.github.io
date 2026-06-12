import { useEffect, useRef, useCallback } from "react";

const HIGHLIGHT_DURATION_MS = 1800;
const HIGHLIGHT_CLASS = "ring-2 ring-ring/60 ring-offset-1 rounded-lg transition-all duration-500";

export function useFocusField(focusKey: string | undefined) {
  const registry = useRef<Map<string, HTMLElement>>(new Map());
  const focusKeyRef = useRef(focusKey);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Keep ref in sync without triggering re-renders
  focusKeyRef.current = focusKey;

  const highlight = useCallback((el: HTMLElement) => {
    el.scrollIntoView({ behavior: "instant", block: "nearest" });
    el.classList.add(...HIGHLIGHT_CLASS.split(" "));
    clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => {
      el.classList.remove(...HIGHLIGHT_CLASS.split(" "));
    }, HIGHLIGHT_DURATION_MS);
  }, []);

  useEffect(() => {
    if (!focusKey) return;

    const el = registry.current.get(focusKey);
    if (el) highlight(el);

    return () => {
      clearTimeout(highlightTimer.current);
      const prev = registry.current.get(focusKey);
      if (prev) prev.classList.remove(...HIGHLIGHT_CLASS.split(" "));
    };
  }, [focusKey, highlight]);

  const fieldRef = useCallback(
    (configKey: string) => (el: HTMLElement | null) => {
      if (el) {
        registry.current.set(configKey, el);
        if (configKey === focusKeyRef.current) highlight(el);
      } else {
        registry.current.delete(configKey);
      }
    },
    [highlight],
  );

  return fieldRef;
}
