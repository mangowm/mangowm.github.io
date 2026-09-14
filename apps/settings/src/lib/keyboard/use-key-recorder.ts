import { useState, useCallback, useRef } from "react";
import { captureKey, type CapturedCombo } from "./capture-key";

export type RecorderStatus = "idle" | "recording";

export type CaptureHandler = (combo: CapturedCombo) => void;

export function useKeyRecorder(onCapture: CaptureHandler) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const onCaptureRef = useRef(onCapture);
  onCaptureRef.current = onCapture;

  const start = useCallback(() => {
    setStatus("recording");
  }, []);

  const cancel = useCallback(() => {
    setStatus("idle");
  }, []);

  const handleKeyEvent = useCallback((event: KeyboardEvent) => {
    const result = captureKey(event);

    switch (result.kind) {
      case "cancel":
        event.preventDefault();
        event.stopPropagation();
        setStatus("idle");
        break;
      case "skip":
        break;
      case "captured":
        event.preventDefault();
        event.stopPropagation();
        setStatus("idle");
        onCaptureRef.current(result.combo);
        break;
    }
  }, []);

  return { status, start, cancel, handleKeyEvent } as const;
}
