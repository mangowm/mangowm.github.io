import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "@takumi-rs/image-response";

const __dirname = dirname(fileURLToPath(import.meta.url));

const logoPaths: Array<{ fill: string; d: string }> = (() => {
  const raw = readFileSync(resolve(__dirname, "../src/assets/mangowm-logo.svg"), "utf-8");
  const result: Array<{ fill: string; d: string }> = [];
  const re = /<path\s+fill="([^"]*)"[^>]*d="([^"]*)"/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    result.push({ fill: m[1], d: m[2].replace(/\n\s*/g, " ") });
  }
  return result;
})();

async function main() {
  const OUT = resolve(__dirname, "../public/og/home");
  mkdirSync(OUT, { recursive: true });

  const image = new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgb(10,10,10)",
        overflow: "hidden",
        position: "relative",
        fontFamily: "Geist",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -120,
          top: 40,
          width: 760,
          height: 760,
          background: "radial-gradient(circle, rgba(245,166,35,0.10) 0%, transparent 62%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 320,
          background: "linear-gradient(to left, rgb(10,10,10) 0%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 160,
          background: "linear-gradient(to bottom, rgb(10,10,10) 0%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 160,
          background: "linear-gradient(to top, rgb(10,10,10) 0%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 620,
          background:
            "linear-gradient(to right, rgb(10,10,10) 55%, rgba(10,10,10,0.7) 78%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <svg width="44" height="44" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            {logoPaths.map((p, i) => (
              <path key={i} fill={p.fill} d={p.d} />
            ))}
          </svg>
          <span
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            mangowm
          </span>
        </div>
        <div
          style={{
            marginTop: "auto",
            marginBottom: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 3,
                height: 18,
                background: "#F5A623",
                borderRadius: 2,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase",
              }}
            >
              GUI Settings
            </span>
          </div>
          <p
            style={{
              fontWeight: 800,
              fontSize: 80,
              letterSpacing: "-0.04em",
              margin: 0,
              lineHeight: 1.1,
              color: "#fff",
            }}
          >
            mangowm settings
          </p>
          <p
            style={{
              fontSize: 28,
              color: "rgba(240,240,240,0.38)",
              letterSpacing: "-0.02em",
              margin: 0,
              marginTop: 20,
              fontWeight: 400,
            }}
          >
            a gui for configuring mangowm
          </p>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630, format: "webp" },
  );

  writeFileSync(resolve(OUT, "image.webp"), Buffer.from(await image.arrayBuffer()));
  console.log("Generated public/og/home/image.webp");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
