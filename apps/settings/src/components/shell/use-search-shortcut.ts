import { useEffect, useEffectEvent } from "react";

export function useSearchShortcut(onOpen: () => void) {
  const onOpenEvent = useEffectEvent(onOpen);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenEvent();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
