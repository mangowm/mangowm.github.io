import { useState, useEffect, useEffectEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "../cn";
import { HeartSvg, XSvg, CheckSvg, CopySvg, ImageSvg, WalletSvg, AlertTriangleSvg } from "./icons";

const SPONSOR_DATA = {
  ADDRESS: "0xf9cda472f2556671d2504afc4c35340ec5615da1",
  QR_SRC: "/sponsor-qr.png",
  NETWORK: "BEP20 (BSC)",
  NETWORK_FULL: "BNB Smart Chain (BEP20)",
} as const;

type CopyType = "address" | "qr";

/* ─── SimpleDialog ─────────────────────────────────────────────────────── */

function SimpleDialog({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEscape = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  });

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-backdrop" />
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  );
}

/* ─── SimpleToast ──────────────────────────────────────────────────────── */

function SimpleToast({ message }: { message: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(<div className="toast">{message}</div>, document.body);
}

/* ─── SponsorButton ────────────────────────────────────────────────────── */

export function SponsorButton({
  size,
  className,
}: {
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [lastCopied, setLastCopied] = useState<CopyType | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }

  async function handleCopy(type: CopyType) {
    try {
      if (type === "address") {
        await navigator.clipboard.writeText(SPONSOR_DATA.ADDRESS);
        setLastCopied(type);
        showToast("Address copied to clipboard!");
        setTimeout(() => setLastCopied(null), 2000);
      } else {
        const res = await fetch(SPONSOR_DATA.QR_SRC);
        if (!res.ok) throw new Error("Failed to fetch QR code");
        const blob = await res.blob();

        if (navigator.clipboard && ClipboardItem) {
          await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
          setLastCopied(type);
          showToast("QR Code copied to clipboard!");
          setTimeout(() => setLastCopied(null), 2000);
        } else {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "sponsor-qr.png";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          showToast("QR Code downloaded!");
        }
      }
    } catch (err) {
      console.error("Copy failed:", err);
      showToast("Failed to copy. Please try manually.");
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Sponsor mango"
        onClick={() => setOpen(true)}
        className={cn("sponsor-btn", size === "lg" && "sponsor-btn-lg", className)}
      >
        <HeartSvg className="sponsor-btn-icon" />
        <span>Sponsor</span>
      </button>

      <SimpleDialog open={open} onClose={() => setOpen(false)}>
        <div
          style={{
            position: "relative",
            background:
              "linear-gradient(to bottom right, color-mix(in srgb, var(--color-primary) 5%, transparent), var(--color-background))",
          }}
        >
          <button onClick={() => setOpen(false)} className="modal-close" aria-label="Close">
            <XSvg className="w-5 h-5" />
          </button>

          <div className="modal-header">
            <h2 className="modal-title">Sponsor mango</h2>
            <p className="modal-subtitle">Help sustain open-source development.</p>
          </div>

          <div className="modal-body">
            <div className="modal-qr-col">
              <button
                onClick={() => handleCopy("qr")}
                aria-label="Copy QR Code"
                className={cn("modal-qr-btn", lastCopied === "qr" && "modal-qr-btn-copied")}
              >
                <img src={SPONSOR_DATA.QR_SRC} alt="BEP20 QR Code" className="modal-qr-img" />
                <div className="modal-qr-overlay">
                  {lastCopied === "qr" ? (
                    <CheckSvg className="w-8 h-8" style={{ color: "var(--color-primary)" }} />
                  ) : (
                    <>
                      <ImageSvg className="modal-qr-overlay-icon" />
                      <span className="modal-qr-overlay-text">Copy QR</span>
                    </>
                  )}
                </div>
              </button>
              <p className="modal-qr-hint">Tap to copy</p>
            </div>

            <div className="modal-address-col">
              <div>
                <div className="modal-address-header">
                  <label className="modal-address-label">
                    <WalletSvg className="w-3.5 h-3.5" />
                    Wallet Address
                  </label>
                  <span className="modal-network-badge">{SPONSOR_DATA.NETWORK}</span>
                </div>

                <div
                  onClick={async () => {
                    await handleCopy("address");
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      await handleCopy("address");
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Copy wallet address"
                  className={cn(
                    "modal-address-box",
                    lastCopied === "address" && "modal-address-box-copied",
                  )}
                >
                  <code className="modal-address-code" title={SPONSOR_DATA.ADDRESS}>
                    {SPONSOR_DATA.ADDRESS}
                  </code>
                  <div
                    className={cn(
                      "modal-copy-btn",
                      lastCopied === "address" && "modal-copy-btn-copied",
                    )}
                  >
                    {lastCopied === "address" ? (
                      <CheckSvg className="w-3.5 h-3.5" />
                    ) : (
                      <CopySvg className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-warning">
                <AlertTriangleSvg className="modal-warning-icon" />
                <div>
                  <p className="modal-warning-title">Verification</p>
                  <p className="modal-warning-text">
                    Only use the <span className="modal-warning-code">BEP20</span> network.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <p className="modal-footer-text">Thanks for your support</p>
          </div>
        </div>
      </SimpleDialog>

      {toast && <SimpleToast message={toast} />}
    </>
  );
}
