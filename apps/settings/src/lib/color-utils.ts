import { colord } from "colord";

export function toHex(input: string, fallback: string): string {
  const parsed = colord(input);
  if (parsed.isValid()) {
    const hex = parsed.toHex();
    const stripped = hex.replace("#", "");
    const padded = stripped.length === 6 ? stripped + "ff" : stripped;
    return "0x" + padded.toLowerCase();
  }
  return fallback;
}

export function toCss(value: string): string {
  if (value.startsWith("0x") || value.startsWith("0X")) {
    return "#" + value.slice(2).toLowerCase();
  }
  return value;
}

export type ColorMode = "hex" | "rgb" | "hsl";

export function formatColor(value: string, mode: ColorMode): string {
  const css = toCss(value);
  const parsed = colord(css);
  if (!parsed.isValid()) return value;

  switch (mode) {
    case "hex":
      return value;
    case "rgb":
      return parsed.toRgbString();
    case "hsl":
      return parsed.toHslString();
  }
}
