import { useEffect, useRef, useCallback } from "react";

const HIGHLIGHT_DURATION_MS = 1800;
const HIGHLIGHT_CLASS = "ring-2 ring-ring/60 ring-offset-1 rounded-lg transition-all duration-500";

export function useFocusField(focusKey: string | undefined) {
  const registry = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    if (!focusKey) return;

    const el = registry.current.get(focusKey);
    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "instant", block: "center" });
    });
    el.classList.add(...HIGHLIGHT_CLASS.split(" "));

    const timer = setTimeout(() => {
      el.classList.remove(...HIGHLIGHT_CLASS.split(" "));
    }, HIGHLIGHT_DURATION_MS);

    return () => {
      clearTimeout(timer);
      el.classList.remove(...HIGHLIGHT_CLASS.split(" "));
    };
  }, [focusKey]);

  const fieldRef = useCallback(
    (configKey: string) => (el: HTMLElement | null) => {
      if (el) {
        registry.current.set(configKey, el);
      } else {
        registry.current.delete(configKey);
      }
    },
    [],
  );

  return fieldRef;
}
