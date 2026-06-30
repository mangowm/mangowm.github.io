import { useCallback, useState, useEffect, type ReactNode, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { cn } from "../cn";

const SPONSOR_DATA = {
  ADDRESS: "0xf9cda472f2556671d2504afc4c35340ec5615da1",
  QR_SRC: "/sponsor-qr.png",
  NETWORK: "BEP20 (BSC)",
  NETWORK_FULL: "BNB Smart Chain (BEP20)",
} as const;

type CopyType = "address" | "qr";

interface IconProps {
  className?: string;
  style?: CSSProperties;
}

/* ─── Inline SVGs ─────────────────────────────────────────────────────── */

const HeartSvg = ({ className, style }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const XSvg = ({ className, style }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const CheckSvg = ({ className, style }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const CopySvg = ({ className, style }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const ImageSvg = ({ className, style }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const WalletSvg = ({ className, style }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);

const AlertTriangleSvg = ({ className, style }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M12 9v4M12 17h.01M10.29 3.86l-8.2 14.2A1.5 1.5 0 0 0 3.3 20h17.4a1.5 1.5 0 0 0 1.31-1.94l-8.2-14.2a1.5 1.5 0 0 0-2.62 0Z" />
  </svg>
);

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

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

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

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const handleCopy = useCallback(
    async (type: CopyType) => {
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
    },
    [showToast],
  );

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
              "linear-gradient(to bottom right, color-mix(in srgb, var(--primary) 5%, transparent), var(--background))",
          }}
        >
          <button onClick={() => setOpen(false)} className="modal-close" aria-label="Close">
            <XSvg style={{ width: "1.25rem", height: "1.25rem" }} />
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
                    <CheckSvg style={{ width: "2rem", height: "2rem", color: "var(--primary)" }} />
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
                    <WalletSvg style={{ width: "0.875rem", height: "0.875rem" }} />
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
                      <CheckSvg style={{ width: "0.875rem", height: "0.875rem" }} />
                    ) : (
                      <CopySvg style={{ width: "0.875rem", height: "0.875rem" }} />
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
