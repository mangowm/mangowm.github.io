import { useState, type CSSProperties, type ReactNode } from "react";
import { Download } from "lucide-react";
import { cn } from "cn";
import { Button } from "@mangowm/ui/components/button";
import { RadioGroup, RadioGroupItem } from "@mangowm/ui/components/radio-group";
import { Separator } from "@mangowm/ui/components/separator";
import { Slider } from "@mangowm/ui/components/slider";
import { toast } from "@mangowm/ui/components/toast";
import {
  LOGO_BACKGROUNDS,
  LOGO_RATIOS,
  LOGO_SIZES,
  buildLogoFilename,
  buildLogoSvg,
  downloadBlob,
  getLogoDimensions,
  renderLogoPng,
  type LogoBackground,
  type LogoFormat,
  type LogoRatio,
} from "./logo-export";

const FORMAT_KEYS = ["svg", "png"] as const;
const BACKGROUND_KEYS = Object.keys(LOGO_BACKGROUNDS) as LogoBackground[];
const RATIO_KEYS = Object.keys(LOGO_RATIOS) as LogoRatio[];
const SIZE_KEYS = LOGO_SIZES.map((value) => String(value));

const PREVIEW_MAX_REM = 28;

function Option({
  id,
  value,
  title,
  className,
  children,
}: {
  id: string;
  value: string;
  title?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={id} title={title} className={cn("brand-option", className)}>
      <RadioGroupItem id={id} value={value} className="brand-option-input absolute size-px" />
      {children}
    </label>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
      <legend className="flex w-full items-baseline justify-between gap-2 p-0">
        <span className="text-[0.8125rem] font-semibold text-foreground">{label}</span>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </legend>
      {children}
    </fieldset>
  );
}

function setOption<T extends string>(options: readonly T[], set: (value: T) => void) {
  return (value: string) => {
    const next = options.find((option) => option === value);
    if (next !== undefined) set(next);
  };
}

export function BrandPage() {
  const [format, setFormat] = useState<LogoFormat>("svg");
  const [background, setBackground] = useState<LogoBackground>("transparent");
  const [ratio, setRatio] = useState<LogoRatio>("square");
  const [size, setSize] = useState(1024);
  const [padding, setPadding] = useState(8);
  const [busy, setBusy] = useState(false);

  const { width, height } = getLogoDimensions(ratio, size);
  const svg = buildLogoSvg({ width, height, background, padding });
  const ratioMeta = LOGO_RATIOS[ratio];

  const previewStyle: CSSProperties = {
    aspectRatio: `${ratioMeta.width} / ${ratioMeta.height}`,
    width: `min(100%, calc(${PREVIEW_MAX_REM}rem * ${ratioMeta.width} / ${ratioMeta.height}))`,
  };

  const handleDownload = async () => {
    const filename = buildLogoFilename({ ratio, background, format, width, height });
    try {
      setBusy(true);
      if (format === "svg") {
        downloadBlob(new Blob([svg], { type: "image/svg+xml" }), filename);
      } else {
        const blob = await renderLogoPng(svg, { width, height });
        downloadBlob(blob, filename);
      }
      toast.add({ type: "success", description: `Downloaded ${filename}` });
    } catch (error) {
      console.error("Logo export failed:", error);
      toast.add({ type: "error", description: "Export failed. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-5 py-16 lg:px-8">
      <div className="mx-auto w-full max-w-[var(--container)]">
        <h1 className="sr-only">Brand</h1>

        <section aria-label="Logo export">
          <div className="grid overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_30px_70px_-55px_oklch(0_0_0_/_0.55)] lg:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="brand-stage">
              <div
                className="brand-canvas"
                data-background={background}
                style={previewStyle}
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>

            <div className="flex flex-col border-t border-border p-5 lg:border-t-0 lg:border-l">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-base font-bold tracking-[-0.01em] text-foreground">
                  Export
                </h2>
                <p className="font-mono text-xs text-muted-foreground">
                  {width} × {height} px
                </p>
              </div>

              <Separator className="my-4" />

              <div className="flex flex-col gap-4">
                <Field label="Format">
                  <RadioGroup
                    value={format}
                    onValueChange={setOption(FORMAT_KEYS, setFormat)}
                    className="grid grid-cols-2 gap-1.5"
                  >
                    {FORMAT_KEYS.map((value) => (
                      <Option key={value} id={`brand-format-${value}`} value={value}>
                        {value.toUpperCase()}
                      </Option>
                    ))}
                  </RadioGroup>
                </Field>

                <Field label="Background">
                  <RadioGroup
                    value={background}
                    onValueChange={setOption(BACKGROUND_KEYS, setBackground)}
                    className="grid grid-cols-3 gap-1.5"
                  >
                    {BACKGROUND_KEYS.map((value) => {
                      const meta = LOGO_BACKGROUNDS[value];
                      return (
                        <Option
                          key={value}
                          id={`brand-background-${value}`}
                          value={value}
                          title={meta.label}
                          className="p-1.5"
                        >
                          <span
                            className={cn(
                              "brand-chip",
                              value === "transparent" && "brand-chip-transparent",
                            )}
                            style={meta.color ? { backgroundColor: meta.color } : undefined}
                            aria-hidden="true"
                          />
                          <span className="sr-only">{meta.label}</span>
                        </Option>
                      );
                    })}
                  </RadioGroup>
                </Field>

                <Field label="Ratio">
                  <RadioGroup
                    value={ratio}
                    onValueChange={setOption(RATIO_KEYS, setRatio)}
                    className="flex flex-wrap justify-center gap-1.5"
                  >
                    {RATIO_KEYS.map((value) => (
                      <Option
                        key={value}
                        id={`brand-ratio-${value}`}
                        value={value}
                        title={LOGO_RATIOS[value].label}
                        className="basis-[calc((100%-1.125rem)/4)]"
                      >
                        {LOGO_RATIOS[value].ratio}
                      </Option>
                    ))}
                  </RadioGroup>
                </Field>

                <Field label="Size">
                  <RadioGroup
                    value={String(size)}
                    onValueChange={setOption(SIZE_KEYS, (value) => setSize(Number(value)))}
                    className="grid grid-cols-5 gap-1.5"
                  >
                    {LOGO_SIZES.map((value) => (
                      <Option key={value} id={`brand-size-${value}`} value={String(value)}>
                        {value}
                      </Option>
                    ))}
                  </RadioGroup>
                </Field>

                <Field label="Padding" hint={`${padding}%`}>
                  <Slider
                    id="brand-padding"
                    value={padding}
                    onValueChange={(value) =>
                      setPadding(Array.isArray(value) ? (value[0] ?? 0) : value)
                    }
                    min={0}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                </Field>
              </div>

              <div className="mt-auto flex flex-col gap-4 pt-5">
                <Separator />

                <Button
                  size="lg"
                  onClick={handleDownload}
                  disabled={busy}
                  className="h-10 w-full rounded-full text-sm font-semibold"
                >
                  <Download className="size-4" />
                  {busy ? "Exporting…" : `Download ${format.toUpperCase()}`}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
