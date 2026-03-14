import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ImageResponseOptions } from "@takumi-rs/image-response";
import type { ReactNode } from "react";

export interface GenerateProps {
  title: ReactNode;
  description?: ReactNode;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logoData = readFile(path.resolve(__dirname, "../../public/logo-64x64.png")).then(
  (data) => `data:image/png;base64,${data.toString("base64")}`,
);

const font = readFile(path.resolve(__dirname, "./JetBrainsMono-Regular.ttf")).then(
  (data) => ({
    name: "Mono",
    data,
    weight: 400,
  }),
);

const fontBold = readFile(path.resolve(__dirname, "./JetBrainsMono-Bold.ttf")).then(
  (data) => ({
    name: "Mono",
    data,
    weight: 600,
  }),
);

export async function getImageResponseOptions(): Promise<ImageResponseOptions> {
  return {
    width: 1200,
    height: 630,
    format: "webp",
    fonts: await Promise.all([font, fontBold]),
  };
}

export async function generate({ title, description }: GenerateProps) {
  const siteName = "MangoWC";
  const primaryTextColor = "rgb(240,240,240)";
  const logoSrc = await logoData;
  const logo = <img src={logoSrc} width="64" height="64" style={{ borderRadius: "8px" }} />;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        color: "white",
        backgroundColor: "rgb(10,10,10)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "4rem",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "76px" }}>{title}</span>
        <p style={{ fontSize: "48px", color: "rgba(240,240,240,0.7)" }}>
          {description}
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "24px",
            marginTop: "auto",
            color: primaryTextColor,
          }}
        >
          {logo}
          <span style={{ fontSize: "46px", fontWeight: 600 }}>{siteName}</span>
        </div>
      </div>
    </div>
  );
}
